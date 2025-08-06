import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  MessageCircle, 
  Phone, 
  PhoneOff,
  Users,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type: 'text' | 'audio';
  audioUrl?: string;
}

interface RealTimeVoiceChatProps {
  thesisId?: string;
  className?: string;
}

// Audio processing utilities
class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Audio encoding utility
const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

// WAV creation utility
const createWavFromPCM = (pcmData: Uint8Array) => {
  const int16Data = new Int16Array(pcmData.length / 2);
  for (let i = 0; i < pcmData.length; i += 2) {
    int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
  }
  
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + int16Data.byteLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, int16Data.byteLength, true);

  const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
  wavArray.set(new Uint8Array(wavHeader), 0);
  wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
  
  return wavArray;
};

// Audio queue for sequential playback
class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const wavData = createWavFromPCM(audioData);
      const audioBuffer = await this.audioContext.decodeAudioData(wavData.buffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext();
    }
  }
}

export const RealTimeVoiceChat = ({ thesisId, className }: RealTimeVoiceChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const connect = async () => {
    if (connectionStatus !== 'disconnected') return;

    setConnectionStatus('connecting');
    
    try {
      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current);

      // Connect to WebSocket
      const wsUrl = `wss://kqudukheyahowyukigxt.functions.supabase.co/realtime-chat`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        setIsConnected(true);
        
        toast({
          title: "Đã kết nối",
          description: "Trợ lý AI đã sẵn sàng để hỗ trợ bạn!",
        });
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);

        if (data.type === 'session.created') {
          // Send session configuration
          const sessionConfig = {
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: `Bạn là một trợ lý AI chuyên về viết luận văn tiếng Việt. Hãy giúp người dùng:
              - Tư vấn về cấu trúc luận văn
              - Giải đáp thắc mắc về phương pháp nghiên cứu
              - Hỗ trợ viết nội dung chuyên nghiệp
              - Kiểm tra ngữ pháp và từ vựng
              - Đưa ra gợi ý cải thiện
              
              Hãy trả lời bằng tiếng Việt và giữ giọng điệu thân thiện, chuyên nghiệp.`,
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1'
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              temperature: 0.8,
              max_response_output_tokens: 'inf'
            }
          };
          wsRef.current?.send(JSON.stringify(sessionConfig));
        } else if (data.type === 'response.audio.delta') {
          // Play audio response
          if (audioQueueRef.current && !isMuted) {
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await audioQueueRef.current.addToQueue(bytes);
          }
        } else if (data.type === 'response.audio_transcript.delta') {
          // Update AI message transcript
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && !lastMessage.isUser && lastMessage.type === 'text') {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  content: lastMessage.content + data.delta
                }
              ];
            } else {
              return [
                ...prev,
                {
                  id: Date.now().toString(),
                  content: data.delta,
                  isUser: false,
                  timestamp: new Date(),
                  type: 'text'
                }
              ];
            }
          });
        } else if (data.type === 'response.created') {
          console.log('AI response started');
        } else if (data.type === 'response.done') {
          console.log('AI response completed');
        } else if (data.type === 'input_audio_buffer.speech_started') {
          console.log('User speech detected');
        } else if (data.type === 'input_audio_buffer.speech_stopped') {
          console.log('User speech ended');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
        setIsConnected(false);
        
        toast({
          title: "Lỗi kết nối",
          description: "Không thể kết nối đến trợ lý AI. Vui lòng thử lại.",
          variant: "destructive",
        });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        setIsConnected(false);
        setIsRecording(false);
      };

    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('disconnected');
      
      toast({
        title: "Lỗi",
        description: "Không thể khởi tạo kết nối audio.",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setConnectionStatus('disconnected');
    setIsConnected(false);
    setIsRecording(false);
  };

  const startRecording = async () => {
    if (!isConnected || isRecording) return;

    try {
      audioRecorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const base64Audio = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: base64Audio
          }));
        }
      });

      await audioRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Đang ghi âm",
        description: "Hãy nói câu hỏi của bạn...",
      });
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Lỗi ghi âm",
        description: "Không thể truy cập microphone.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  const sendTextMessage = () => {
    if (!textInput.trim() || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textInput,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: textInput
            }
          ]
        }
      }));

      wsRef.current.send(JSON.stringify({
        type: 'response.create'
      }));
    }

    setTextInput('');
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Đã kết nối</Badge>;
      case 'connecting':
        return <Badge variant="secondary">Đang kết nối...</Badge>;
      default:
        return <Badge variant="destructive">Chưa kết nối</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Trợ lý AI Voice Chat
          </div>
          <div className="flex items-center gap-2">
            {getConnectionStatusBadge()}
            {isConnected ? (
              <Button variant="outline" size="sm" onClick={disconnect}>
                <PhoneOff className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={connect}>
                <Phone className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Messages */}
        <ScrollArea className="h-64 w-full border rounded-lg p-4">
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Kết nối để bắt đầu trò chuyện với trợ lý AI</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.isUser ? (user?.email?.[0]?.toUpperCase() || 'U') : 'AI'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`rounded-lg p-3 ${
                    message.isUser 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-2">
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Nhập câu hỏi hoặc sử dụng voice chat..."
              disabled={!isConnected}
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendTextMessage();
                }
              }}
            />
            <Button 
              onClick={sendTextMessage} 
              disabled={!isConnected || !textInput.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Voice Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isConnected}
            className="rounded-full w-16 h-16"
          >
            {isRecording ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsMuted(!isMuted)}
            disabled={!isConnected}
            className="rounded-full w-16 h-16"
          >
            {isMuted ? (
              <VolumeX className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Status */}
        <div className="text-center text-sm text-muted-foreground">
          {connectionStatus === 'connecting' && "Đang kết nối đến trợ lý AI..."}
          {connectionStatus === 'connected' && !isRecording && "Nhấn nút mic để bắt đầu nói"}
          {isRecording && "Đang nghe... Nhấn lại để dừng"}
          {connectionStatus === 'disconnected' && "Nhấn nút điện thoại để kết nối"}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeVoiceChat;