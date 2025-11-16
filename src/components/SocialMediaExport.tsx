import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { toast } from "sonner";

interface SocialMediaExportProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onCanvasSizeChange: (size: { width: number; height: number }) => void;
}

const socialMediaPresets = [
  { name: "Instagram Post", width: 1080, height: 1080, icon: Instagram },
  { name: "Instagram Story", width: 1080, height: 1920, icon: Instagram },
  { name: "Facebook Cover", width: 820, height: 312, icon: Facebook },
  { name: "Twitter Header", width: 1500, height: 500, icon: Twitter },
  { name: "YouTube Thumbnail", width: 1280, height: 720, icon: Youtube },
];

export const SocialMediaExport = ({ canvasRef, onCanvasSizeChange }: SocialMediaExportProps) => {
  const handleExport = (width: number, height: number, name: string) => {
    onCanvasSizeChange({ width, height });
    
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const link = document.createElement("a");
      link.download = `${name.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success(`Exported as ${name}`);
    }, 100);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5" />
        <h3 className="text-2xl font-bold">Social Media Export</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {socialMediaPresets.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            className="justify-start gap-3 h-auto py-3"
            onClick={() => handleExport(preset.width, preset.height, preset.name)}
          >
            <preset.icon className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium text-sm">{preset.name}</div>
              <div className="text-xs text-muted-foreground">
                {preset.width} × {preset.height}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
};
