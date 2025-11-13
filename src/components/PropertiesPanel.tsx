import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Palette, Layers, Settings } from "lucide-react";
import { toast } from "sonner";
import type { Shape } from "./Canvas";

interface PropertiesPanelProps {
  animationSpeed: number;
  onAnimationSpeedChange: (speed: number) => void;
  gradientAngle: number;
  onGradientAngleChange: (angle: number) => void;
  onExport: (format: "png" | "jpeg") => void;
  layers: Shape[];
  onLayerSelect: (id: string) => void;
}

export const PropertiesPanel = ({
  animationSpeed,
  onAnimationSpeedChange,
  gradientAngle,
  onGradientAngleChange,
  onExport,
  layers,
  onLayerSelect,
}: PropertiesPanelProps) => {
  const handleExport = (format: "png" | "jpeg") => {
    onExport(format);
    toast.success(`Exported as ${format.toUpperCase()}`, {
      description: "Your background has been downloaded",
    });
  };

  return (
    <Card className="w-80 h-full border-l bg-panel p-4">
      <ScrollArea className="h-full">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Animation Controls
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Speed</Label>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={([value]) => onAnimationSpeedChange(value)}
                  min={0}
                  max={10}
                  step={0.1}
                  className="mt-2"
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {animationSpeed.toFixed(1)}x
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              Gradient Controls
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Angle</Label>
                <Slider
                  value={[gradientAngle]}
                  onValueChange={([value]) => onGradientAngleChange(value)}
                  min={0}
                  max={360}
                  step={1}
                  className="mt-2"
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {gradientAngle}°
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Layers ({layers.length})
            </h3>
            <div className="space-y-2">
              {layers.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No layers yet. Add shapes from the toolbar!
                </p>
              ) : (
                layers.map((layer, index) => (
                  <Button
                    key={layer.id}
                    variant="secondary"
                    className="w-full justify-start text-left hover:bg-panel-hover transition-colors"
                    onClick={() => onLayerSelect(layer.id)}
                  >
                    <span className="text-xs">
                      {layer.type.charAt(0).toUpperCase() + layer.type.slice(1)} {index + 1}
                    </span>
                  </Button>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              Export
            </h3>
            <div className="space-y-2">
              <Button
                onClick={() => handleExport("png")}
                className="w-full bg-primary hover:bg-primary/90 transition-colors"
              >
                Export PNG
              </Button>
              <Button
                onClick={() => handleExport("jpeg")}
                variant="secondary"
                className="w-full hover:bg-panel-hover transition-colors"
              >
                Export JPEG
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};
