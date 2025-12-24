import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Download, Image, Video } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoExport } from "./VideoExport";

interface ImageVideoExportProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasSize: { width: number; height: number };
  onCanvasSizeChange: (size: { width: number; height: number }) => void;
}

const resolutionPresets = [
  { label: "HD (1280 × 720)", width: 1280, height: 720 },
  { label: "Full HD (1920 × 1080)", width: 1920, height: 1080 },
  { label: "2K (2560 × 1440)", width: 2560, height: 1440 },
  { label: "4K (3840 × 2160)", width: 3840, height: 2160 },
  { label: "Square (1080 × 1080)", width: 1080, height: 1080 },
];

export const ImageVideoExport = ({
  canvasRef,
  canvasSize,
  onCanvasSizeChange,
}: ImageVideoExportProps) => {
  const [quality, setQuality] = useState(0.92);
  const [selectedResolution, setSelectedResolution] = useState("1920x1080");

  const handleResolutionChange = (value: string) => {
    setSelectedResolution(value);
    const [width, height] = value.split("x").map(Number);
    onCanvasSizeChange({ width, height });
  };

  const handleExport = (format: "png" | "jpeg") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `gradient-background.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, format === "jpeg" ? quality : 1);
    link.click();

    toast.success(`Exported as ${format.toUpperCase()}`, {
      description: `Resolution: ${canvasSize.width} × ${canvasSize.height}`,
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-2">
        <Image className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Image & Video Export</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Use this for hero backgrounds, app screens, or static design assets
      </p>

      <div className="space-y-6">
        {/* Resolution */}
        <div>
          <Label className="text-xs text-muted-foreground">Resolution</Label>
          <Select value={selectedResolution} onValueChange={handleResolutionChange}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {resolutionPresets.map((preset) => (
                <SelectItem key={`${preset.width}x${preset.height}`} value={`${preset.width}x${preset.height}`}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quality (for JPEG) */}
        <div>
          <Label className="text-xs text-muted-foreground">Quality (JPEG)</Label>
          <Slider
            value={[quality * 100]}
            onValueChange={([value]) => setQuality(value / 100)}
            min={50}
            max={100}
            step={1}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1 text-right">{Math.round(quality * 100)}%</div>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => handleExport("png")} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export PNG
          </Button>
          <Button onClick={() => handleExport("jpeg")} variant="secondary" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export JPEG
          </Button>
        </div>

        {/* Video Export */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Video className="w-4 h-4 text-primary" />
            <Label className="text-sm font-medium">Video Export</Label>
          </div>
          <VideoExport canvasRef={canvasRef} />
        </div>
      </div>
    </Card>
  );
};
