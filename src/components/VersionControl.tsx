import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  GitBranch, 
  Clock, 
  Eye, 
  RotateCcw, 
  GitCompare, 
  Save,
  FileText,
  Calendar,
  User,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Version {
  id: string;
  version_number: number;
  title: string;
  content: string;
  changes_summary: string;
  word_count: number;
  is_current: boolean;
  created_at: string;
  user_id: string;
}

interface VersionControlProps {
  thesisId: string;
  currentContent: string;
  currentTitle: string;
  onVersionRestore: (content: string, title: string) => void;
}

export const VersionControl: React.FC<VersionControlProps> = ({
  thesisId,
  currentContent,
  currentTitle,
  onVersionRestore
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState<[Version | null, Version | null]>([null, null]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [thesisId]);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('thesis_versions')
        .select('*')
        .eq('thesis_id', thesisId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error loading versions:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách phiên bản",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createVersion = async (changesSummary: string = 'Tự động lưu') => {
    if (!user) return;

    try {
      // Mark current version as not current
      await supabase
        .from('thesis_versions')
        .update({ is_current: false })
        .eq('thesis_id', thesisId);

      // Create new version
      const newVersion = {
        thesis_id: thesisId,
        user_id: user.id,
        version_number: versions.length + 1,
        title: currentTitle,
        content: currentContent,
        changes_summary: changesSummary,
        word_count: currentContent.split(/\s+/).length,
        is_current: true
      };

      const { data, error } = await supabase
        .from('thesis_versions')
        .insert(newVersion)
        .select()
        .single();

      if (error) throw error;

      setVersions(prev => [data, ...prev]);
      
      toast({
        title: "Đã lưu phiên bản",
        description: `Phiên bản ${data.version_number} đã được tạo thành công`,
      });
    } catch (error) {
      console.error('Error creating version:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo phiên bản mới",
        variant: "destructive",
      });
    }
  };

  const restoreVersion = async (version: Version) => {
    try {
      // Mark all versions as not current
      await supabase
        .from('thesis_versions')
        .update({ is_current: false })
        .eq('thesis_id', thesisId);

      // Mark selected version as current
      await supabase
        .from('thesis_versions')
        .update({ is_current: true })
        .eq('id', version.id);

      // Update the main thesis record
      await supabase
        .from('theses')
        .update({
          title: version.title,
          content: version.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', thesisId);

      onVersionRestore(version.content, version.title);
      await loadVersions();
      
      toast({
        title: "Đã khôi phục",
        description: `Đã khôi phục về phiên bản ${version.version_number}`,
      });
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: "Lỗi",
        description: "Không thể khôi phục phiên bản",
        variant: "destructive",
      });
    }
  };

  const compareVersions = (version1: Version, version2: Version) => {
    setSelectedVersions([version1, version2]);
    setCompareDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateDiff = (text1: string, text2: string): Array<{type: 'added' | 'removed' | 'unchanged', content: string}> => {
    // Simple diff algorithm for demonstration
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    const diff = [];
    
    let i = 0, j = 0;
    
    while (i < words1.length || j < words2.length) {
      if (i >= words1.length) {
        diff.push({ type: 'added', content: words2[j] });
        j++;
      } else if (j >= words2.length) {
        diff.push({ type: 'removed', content: words1[i] });
        i++;
      } else if (words1[i] === words2[j]) {
        diff.push({ type: 'unchanged', content: words1[i] });
        i++;
        j++;
      } else {
        // Find next common word
        let foundCommon = false;
        for (let k = j + 1; k < Math.min(j + 10, words2.length); k++) {
          if (words1[i] === words2[k]) {
            // Add words before common word as additions
            for (let l = j; l < k; l++) {
              diff.push({ type: 'added', content: words2[l] });
            }
            diff.push({ type: 'unchanged', content: words1[i] });
            i++;
            j = k + 1;
            foundCommon = true;
            break;
          }
        }
        
        if (!foundCommon) {
          diff.push({ type: 'removed', content: words1[i] });
          i++;
        }
      }
    }
    
    return diff;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              <CardTitle>Quản lý phiên bản</CardTitle>
            </div>
            <Button onClick={() => createVersion('Lưu thủ công')}>
              <Save className="h-4 w-4 mr-2" />
              Tạo phiên bản mới
            </Button>
          </div>
          <CardDescription>
            Theo dõi và quản lý các phiên bản của luận văn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="compare">So sánh</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Đang tải phiên bản...</p>
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Chưa có phiên bản nào</p>
                  <Button onClick={() => createVersion('Phiên bản đầu tiên')} className="mt-4">
                    Tạo phiên bản đầu tiên
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {versions.map((version, index) => (
                      <Card key={version.id} className={`${version.is_current ? 'ring-2 ring-primary' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={version.is_current ? 'default' : 'secondary'}>
                                  v{version.version_number}
                                </Badge>
                                {version.is_current && (
                                  <Badge variant="outline">Hiện tại</Badge>
                                )}
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(version.created_at)}
                                </span>
                              </div>
                              
                              <h4 className="font-medium mb-1">{version.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {version.changes_summary}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {version.word_count.toLocaleString()} từ
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  Bạn
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh]">
                                  <DialogHeader>
                                    <DialogTitle>Phiên bản {version.version_number} - {version.title}</DialogTitle>
                                    <DialogDescription>
                                      Tạo lúc {formatDate(version.created_at)} • {version.word_count.toLocaleString()} từ
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="h-[60vh] w-full">
                                    <div className="p-4 whitespace-pre-wrap font-mono text-sm">
                                      {version.content}
                                    </div>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                              
                              {!version.is_current && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => restoreVersion(version)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {index < versions.length - 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => compareVersions(version, versions[index + 1])}
                                >
                                  <GitCompare className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="compare" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1].map((index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Phiên bản {index === 0 ? 'A' : 'B'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        {versions.map((version) => (
                          <div
                            key={version.id}
                            className={`p-2 cursor-pointer rounded mb-2 hover:bg-muted ${
                              selectedVersions[index]?.id === version.id ? 'bg-primary/10' : ''
                            }`}
                            onClick={() => {
                              const newSelected = [...selectedVersions] as [Version | null, Version | null];
                              newSelected[index] = version;
                              setSelectedVersions(newSelected);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">v{version.version_number}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(version.created_at)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {selectedVersions[0] && selectedVersions[1] && (
                <Button 
                  onClick={() => setCompareDialogOpen(true)}
                  className="w-full"
                >
                  <GitCompare className="h-4 w-4 mr-2" />
                  So sánh v{selectedVersions[0].version_number} và v{selectedVersions[1].version_number}
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Compare Dialog */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              So sánh phiên bản {selectedVersions[0]?.version_number} và {selectedVersions[1]?.version_number}
            </DialogTitle>
            <DialogDescription>
              Xem sự khác biệt giữa các phiên bản
            </DialogDescription>
          </DialogHeader>
          
          {selectedVersions[0] && selectedVersions[1] && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ArrowLeft className="h-4 w-4" />
                  <Badge>v{selectedVersions[0].version_number}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(selectedVersions[0].created_at)}
                  </span>
                </div>
                <ScrollArea className="h-[60vh] border rounded p-4">
                  <div className="text-sm whitespace-pre-wrap">
                    {generateDiff(selectedVersions[1].content, selectedVersions[0].content).map((chunk, index) => (
                      <span
                        key={index}
                        className={
                          chunk.type === 'added' ? 'bg-green-100 text-green-800' :
                          chunk.type === 'removed' ? 'bg-red-100 text-red-800 line-through' :
                          ''
                        }
                      >
                        {chunk.content} 
                      </span>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ArrowRight className="h-4 w-4" />
                  <Badge>v{selectedVersions[1].version_number}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(selectedVersions[1].created_at)}
                  </span>
                </div>
                <ScrollArea className="h-[60vh] border rounded p-4">
                  <div className="text-sm whitespace-pre-wrap">
                    {generateDiff(selectedVersions[0].content, selectedVersions[1].content).map((chunk, index) => (
                      <span
                        key={index}
                        className={
                          chunk.type === 'added' ? 'bg-green-100 text-green-800' :
                          chunk.type === 'removed' ? 'bg-red-100 text-red-800 line-through' :
                          ''
                        }
                      >
                        {chunk.content} 
                      </span>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};