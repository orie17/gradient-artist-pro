import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Download, Palette, Layers, Settings, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Shape } from "./Canvas";

interface PropertiesPanelProps {
  animationSpeed: number;
  onAnimationSpeedChange: (speed: number) => void;
  gradientAngle: number;
  onGradientAngleChange: (angle: number) => void;
  gradientColors: string[];
  onGradientColorsChange: (colors: string[]) => void;
  onExport: (format: "png" | "jpeg") => void;
  layers: Shape[];
  onLayerSelect: (id: string) => void;
  onLayerDelete: (id: string) => void;
}

export const PropertiesPanel = ({
  animationSpeed,
  onAnimationSpeedChange,
  gradientAngle,
  onGradientAngleChange,
  gradientColors,
  onGradientColorsChange,
  onExport,
  layers,
  onLayerSelect,
  onLayerDelete,
}: PropertiesPanelProps) => {
  const handleExport = (format: "png" | "jpeg") => {
    onExport(format);
    toast.success(`Exported as ${format.toUpperCase()}`, {
      description: "Your background has been downloaded",
    });
  };

  const handleAddColorStop = () => {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    onGradientColorsChange([...gradientColors, randomColor]);
    toast.success("Color stop added");
  };

  const handleRemoveColorStop = (index: number) => {
    if (gradientColors.length <= 2) {
      toast.error("Gradient needs at least 2 colors");
      return;
    }
    const newColors = gradientColors.filter((_, i) => i !== index);
    onGradientColorsChange(newColors);
    toast.success("Color stop removed");
  };

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...gradientColors];
    newColors[index] = color;
    onGradientColorsChange(newColors);
  };

  const handleDeleteLayer = (id: string) => {
    onLayerDelete(id);
    toast.success("Layer deleted");
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
              Gradient Builder
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Color Stops</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAddColorStop}
                    className="h-6 px-2"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {gradientColors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="w-12 h-8 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="flex-1 h-8 text-xs"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveColorStop(index)}
                        className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                        disabled={gradientColors.length <= 2}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
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
                  <div key={layer.id} className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1 justify-start text-left hover:bg-panel-hover transition-colors"
                      onClick={() => onLayerSelect(layer.id)}
                    >
                      <span className="text-xs">
                        {layer.type.charAt(0).toUpperCase() + layer.type.slice(1)} {index + 1}
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteLayer(layer.id)}
                      className="h-9 w-9 p-0 hover:bg-destructive/20 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
