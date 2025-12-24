import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Instagram, Facebook, Twitter, Youtube, Type, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SocialMediaExportProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onCanvasSizeChange: (size: { width: number; height: number }) => void;
}

const socialMediaPresets = [
  { name: "Instagram Post", width: 1080, height: 1080, icon: Instagram },
  { name: "Instagram Story", width: 1080, height: 1920, icon: Instagram },
  { name: "Facebook Cover", width: 820, height: 312, icon: Facebook },
  { name: "X Header", width: 1500, height: 500, icon: Twitter },
  { name: "YouTube Thumbnail", width: 1280, height: 720, icon: Youtube },
];

const logoPositions = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
  { value: "center", label: "Center" },
];

export const SocialMediaExport = ({ canvasRef, onCanvasSizeChange }: SocialMediaExportProps) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState("");
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState("top-right");
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoFile(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = (width: number, height: number, name: string) => {
    onCanvasSizeChange({ width, height });
    setSelectedPreset(name);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Create a new canvas for compositing
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = width;
      exportCanvas.height = height;
      const ctx = exportCanvas.getContext("2d");
      if (!ctx) return;

      // Draw the gradient
      ctx.drawImage(canvas, 0, 0, width, height);

      // Add text overlay if provided
      if (overlayText) {
        ctx.font = `bold ${Math.floor(width / 15)}px sans-serif`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 10;
        ctx.fillText(overlayText, width / 2, height / 2);
      }

      // Add logo if provided
      if (logoFile) {
        const logo = new Image();
        logo.onload = () => {
          const logoSize = Math.min(width, height) / 6;
          const padding = logoSize / 4;
          let x = padding;
          let y = padding;

          if (logoPosition.includes("right")) x = width - logoSize - padding;
          if (logoPosition.includes("bottom")) y = height - logoSize - padding;
          if (logoPosition === "center") {
            x = (width - logoSize) / 2;
            y = (height - logoSize) / 2;
          }

          ctx.drawImage(logo, x, y, logoSize, logoSize);
          downloadCanvas(exportCanvas, name);
        };
        logo.src = logoFile;
      } else {
        downloadCanvas(exportCanvas, name);
      }
    }, 100);
  };

  const downloadCanvas = (canvas: HTMLCanvasElement, name: string) => {
    const link = document.createElement("a");
    link.download = `${name.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success(`Exported as ${name}`);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-2">
        <Download className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Social Media Export</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Best for social media posts and thumbnails</p>

      {/* Platform Presets Grid - Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {socialMediaPresets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handleExport(preset.width, preset.height, preset.name)}
            className={`group relative overflow-hidden rounded-lg border transition-all p-4 hover:border-primary ${
              selectedPreset === preset.name ? "border-primary bg-primary/10" : "border-border bg-card"
            }`}
          >
            {/* Aspect ratio preview */}
            <div
              className="w-full mx-auto mb-3 rounded bg-gradient-to-br from-primary/20 to-accent/20 border border-border/50"
              style={{
                aspectRatio: `${preset.width}/${preset.height}`,
                maxHeight: "60px",
              }}
            />
            <div className="flex items-center gap-2">
              <preset.icon className="w-4 h-4 text-muted-foreground" />
              <div className="text-left">
                <div className="text-xs font-medium truncate">{preset.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {preset.width}×{preset.height}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Overlay Options */}
      <div className="space-y-4 pt-4 border-t border-border">
        <p className="text-sm font-medium text-muted-foreground">Optional Overlays</p>

        {/* Text Overlay */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-2">
            <Type className="w-3 h-3" />
            Text Overlay
          </Label>
          <Input
            placeholder="Add title or heading..."
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
            className="bg-input"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-2">
            <ImageIcon className="w-3 h-3" />
            Logo
          </Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoInputRef.current?.click()}
              className="flex-1"
            >
              {logoFile ? "Change Logo" : "Upload Logo"}
            </Button>
            {logoFile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLogoFile(null)}
                className="px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Select value={logoPosition} onValueChange={setLogoPosition}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {logoPositions.map((pos) => (
                  <SelectItem key={pos.value} value={pos.value}>
                    {pos.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          {logoFile && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <img src={logoFile} alt="Logo preview" className="w-8 h-8 object-contain rounded" />
              <span className="text-xs text-muted-foreground">Logo ready</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
