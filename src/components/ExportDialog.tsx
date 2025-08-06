import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { FileText, Download, Settings, FileType, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LoadingStates from './LoadingStates';
import ErrorHandler from './ErrorHandler';
import { exportThesis, ExportOptions, ThesisData } from '@/utils/HighQualityExporter';

interface ExportDialogProps {
  thesis: ThesisData;
  trigger?: React.ReactNode;
}

export const ExportDialog = ({ thesis, trigger }: ExportDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeTableOfContents: true,
    includeReferences: true,
    fontSize: 12,
    pageMargins: '2.5cm',
    citationStyle: 'APA',
    fontFamily: 'Times New Roman',
    lineSpacing: 1.5,
    pageHeader: '',
    pageFooter: ''
  });

  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      await exportThesis(thesis, options);
      
      toast({
        title: "Xuất thành công!",
        description: `Luận văn đã được xuất định dạng ${options.format.toUpperCase()}`,
      });

      setIsOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xuất luận văn';
      setError(errorMessage);
      
      toast({
        title: "Lỗi xuất file",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleExport();
  };

  const formatOptions = [
    { value: 'pdf', label: 'PDF - Portable Document Format', icon: FileText },
    { value: 'docx', label: 'DOCX - Microsoft Word Document', icon: FileType },
    { value: 'latex', label: 'LaTeX - Academic Publishing Format', icon: Printer }
  ];

  const fontOptions = [
    { value: 'Times New Roman', label: 'Times New Roman (Khuyến nghị)' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Calibri', label: 'Calibri' },
    { value: 'Georgia', label: 'Georgia' }
  ];

  const citationOptions = [
    { value: 'APA', label: 'APA (American Psychological Association)' },
    { value: 'MLA', label: 'MLA (Modern Language Association)' },
    { value: 'Chicago', label: 'Chicago Manual of Style' },
    { value: 'Harvard', label: 'Harvard Referencing' },
    { value: 'IEEE', label: 'IEEE (Institute of Electrical and Electronics Engineers)' }
  ];

  if (isExporting) {
    return (
      <LoadingStates 
        type="exporting"
        message={`Đang xuất luận văn định dạng ${options.format.toUpperCase()}...`}
        progress={undefined}
        steps={[
          'Đang chuẩn bị nội dung',
          'Đang định dạng tài liệu',
          'Đang tạo file xuất',
          'Hoàn thành xuất file'
        ]}
      />
    );
  }

  if (error) {
    return (
      <ErrorHandler
        error={new Error(error)}
        onRetry={handleRetry}
        context="Xuất luận văn"
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Xuất luận văn
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cài đặt xuất luận văn
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Định dạng xuất</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {formatOptions.map((format) => {
                  const IconComponent = format.icon;
                  return (
                    <div
                      key={format.value}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        options.format === format.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setOptions(prev => ({ ...prev, format: format.value as 'pdf' | 'docx' | 'latex' }))}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{format.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {format.value === 'pdf' && 'Định dạng phổ biến nhất, dễ chia sẻ và in'}
                            {format.value === 'docx' && 'Có thể chỉnh sửa trong Microsoft Word'}
                            {format.value === 'latex' && 'Định dạng chuyên nghiệp cho xuất bản học thuật'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Basic Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tùy chọn cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTableOfContents"
                  checked={options.includeTableOfContents}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeTableOfContents: !!checked }))
                  }
                />
                <Label htmlFor="includeTableOfContents">Bao gồm mục lục</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeReferences"
                  checked={options.includeReferences}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeReferences: !!checked }))
                  }
                />
                <Label htmlFor="includeReferences">Bao gồm tài liệu tham khảo</Label>
              </div>
            </CardContent>
          </Card>

          {/* Typography Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cài đặt định dạng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Font chữ</Label>
                  <Select 
                    value={options.fontFamily} 
                    onValueChange={(value) => setOptions(prev => ({ ...prev, fontFamily: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Định dạng trích dẫn</Label>
                  <Select 
                    value={options.citationStyle} 
                    onValueChange={(value) => setOptions(prev => ({ ...prev, citationStyle: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {citationOptions.map(citation => (
                        <SelectItem key={citation.value} value={citation.value}>
                          {citation.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cỡ chữ: {options.fontSize}pt</Label>
                <Slider
                  value={[options.fontSize || 12]}
                  onValueChange={([value]) => setOptions(prev => ({ ...prev, fontSize: value }))}
                  min={10}
                  max={16}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10pt</span>
                  <span>16pt</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Giãn dòng: {options.lineSpacing}x</Label>
                <Slider
                  value={[options.lineSpacing || 1.5]}
                  onValueChange={([value]) => setOptions(prev => ({ ...prev, lineSpacing: value }))}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1x</span>
                  <span>3x</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageMargins">Lề trang</Label>
                <Input
                  id="pageMargins"
                  value={options.pageMargins}
                  onChange={(e) => setOptions(prev => ({ ...prev, pageMargins: e.target.value }))}
                  placeholder="VD: 2.5cm"
                />
                <div className="text-xs text-muted-foreground">
                  Định dạng: 2.5cm hoặc 1in
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tùy chọn nâng cao</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pageHeader">Đầu trang (tùy chọn)</Label>
                <Input
                  id="pageHeader"
                  value={options.pageHeader}
                  onChange={(e) => setOptions(prev => ({ ...prev, pageHeader: e.target.value }))}
                  placeholder="Văn bản hiển thị ở đầu mỗi trang"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageFooter">Chân trang (tùy chọn)</Label>
                <Input
                  id="pageFooter"
                  value={options.pageFooter}
                  onChange={(e) => setOptions(prev => ({ ...prev, pageFooter: e.target.value }))}
                  placeholder="Văn bản hiển thị ở chân mỗi trang"
                />
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Xuất luận văn {options.format.toUpperCase()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;