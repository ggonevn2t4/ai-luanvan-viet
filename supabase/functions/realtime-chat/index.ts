import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.error('OpenAI API key not configured');
    socket.close(1011, 'Server error: API key not configured');
    return response;
  }

  let openAISocket: WebSocket | null = null;

  socket.onopen = () => {
    console.log('[REALTIME] Client connected');
    
    // Connect to OpenAI Realtime API
    openAISocket = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01", {
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "OpenAI-Beta": "realtime=v1"
      }
    });

    openAISocket.onopen = () => {
      console.log('[REALTIME] Connected to OpenAI');
    };

    openAISocket.onmessage = (event) => {
      console.log('[REALTIME] OpenAI message:', event.data);
      socket.send(event.data);
    };

    openAISocket.onerror = (error) => {
      console.error('[REALTIME] OpenAI error:', error);
      socket.send(JSON.stringify({ 
        type: 'error', 
        message: 'OpenAI connection error' 
      }));
    };

    openAISocket.onclose = () => {
      console.log('[REALTIME] OpenAI disconnected');
      socket.close();
    };
  };

  socket.onmessage = (event) => {
    console.log('[REALTIME] Client message:', event.data);
    if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.send(event.data);
    }
  };

  socket.onclose = () => {
    console.log('[REALTIME] Client disconnected');
    if (openAISocket) {
      openAISocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error('[REALTIME] Client error:', error);
    if (openAISocket) {
      openAISocket.close();
    }
  };

  return response;
});