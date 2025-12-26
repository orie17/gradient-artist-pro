import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Layers, Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Blend } from "lucide-react";
import { toast } from "sonner";

interface GradientLayer {
  id: string;
  colors: string[];
  angle: number;
  type: "linear" | "radial" | "conic";
  blendMode: BlendMode;
  opacity: number;
  visible: boolean;
}

type BlendMode = "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion";

interface GradientLayersProps {
  currentGradient: {
    colors: string[];
    angle: number;
    type: "linear" | "radial" | "conic";
  };
  onApplyLayers: (layers: GradientLayer[]) => void;
}

const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "multiply", label: "Multiply" },
  { value: "screen", label: "Screen" },
  { value: "overlay", label: "Overlay" },
  { value: "darken", label: "Darken" },
  { value: "lighten", label: "Lighten" },
  { value: "color-dodge", label: "Color Dodge" },
  { value: "color-burn", label: "Color Burn" },
  { value: "hard-light", label: "Hard Light" },
  { value: "soft-light", label: "Soft Light" },
  { value: "difference", label: "Difference" },
  { value: "exclusion", label: "Exclusion" },
];

export const GradientLayers = ({ currentGradient, onApplyLayers }: GradientLayersProps) => {
  const [layers, setLayers] = useState<GradientLayer[]>([
    {
      id: "layer-1",
      colors: currentGradient.colors,
      angle: currentGradient.angle,
      type: currentGradient.type,
      blendMode: "normal",
      opacity: 100,
      visible: true,
    },
  ]);

  const addLayer = () => {
    const newLayer: GradientLayer = {
      id: `layer-${Date.now()}`,
      colors: ["#3b82f6", "#8b5cf6"],
      angle: 135,
      type: "linear",
      blendMode: "overlay",
      opacity: 50,
      visible: true,
    };
    setLayers([...layers, newLayer]);
    toast.success("Layer added");
  };

  const removeLayer = (id: string) => {
    if (layers.length <= 1) {
      toast.error("Must have at least one layer");
      return;
    }
    setLayers(layers.filter((l) => l.id !== id));
    toast.success("Layer removed");
  };

  const updateLayer = (id: string, updates: Partial<GradientLayer>) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const moveLayer = (id: string, direction: "up" | "down") => {
    const index = layers.findIndex((l) => l.id === id);
    if ((direction === "up" && index === 0) || (direction === "down" && index === layers.length - 1)) return;
    
    const newLayers = [...layers];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
    setLayers(newLayers);
  };

  const updateLayerColor = (layerId: string, colorIndex: number, newColor: string) => {
    setLayers(layers.map((l) => {
      if (l.id !== layerId) return l;
      const newColors = [...l.colors];
      newColors[colorIndex] = newColor;
      return { ...l, colors: newColors };
    }));
  };

  const addColorToLayer = (layerId: string) => {
    setLayers(layers.map((l) => {
      if (l.id !== layerId) return l;
      return { ...l, colors: [...l.colors, "#ffffff"] };
    }));
  };

  const removeColorFromLayer = (layerId: string, colorIndex: number) => {
    setLayers(layers.map((l) => {
      if (l.id !== layerId || l.colors.length <= 2) return l;
      const newColors = l.colors.filter((_, i) => i !== colorIndex);
      return { ...l, colors: newColors };
    }));
  };

  const generateCSSLayers = () => {
    return layers
      .filter((l) => l.visible)
      .map((layer) => {
        const colorStops = layer.colors.join(", ");
        if (layer.type === "radial") {
          return `radial-gradient(circle, ${colorStops})`;
        } else if (layer.type === "conic") {
          return `conic-gradient(from ${layer.angle}deg, ${colorStops})`;
        }
        return `linear-gradient(${layer.angle}deg, ${colorStops})`;
      })
      .reverse()
      .join(", ");
  };

  const handleApply = () => {
    onApplyLayers(layers);
    toast.success("Layers applied to gradient");
  };

  return (
    <Card className="p-6 bg-panel border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Gradient Layers</h3>
        </div>
        <Button variant="outline" size="sm" onClick={addLayer} className="gap-1">
          <Plus className="w-4 h-4" />
          Add Layer
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Stack multiple gradients with blend modes for complex effects
      </p>

      {/* Preview */}
      <div
        className="w-full h-32 rounded-lg mb-6 border border-border"
        style={{
          background: generateCSSLayers(),
        }}
      />

      {/* Layers List */}
      <div className="space-y-4 mb-6">
        {layers.map((layer, index) => (
          <Card key={layer.id} className={`p-4 bg-card border-border ${!layer.visible ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Layer {index + 1}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => moveLayer(layer.id, "up")}
                  disabled={index === 0}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => moveLayer(layer.id, "down")}
                  disabled={index === layers.length - 1}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => updateLayer(layer.id, { visible: !layer.visible })}
                >
                  {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:text-destructive"
                  onClick={() => removeLayer(layer.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Type</Label>
                <Select
                  value={layer.type}
                  onValueChange={(value: "linear" | "radial" | "conic") => updateLayer(layer.id, { type: value })}
                >
                  <SelectTrigger className="h-8 bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                    <SelectItem value="conic">Conic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Blend Mode</Label>
                <Select
                  value={layer.blendMode}
                  onValueChange={(value: BlendMode) => updateLayer(layer.id, { blendMode: value })}
                >
                  <SelectTrigger className="h-8 bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLEND_MODES.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Angle: {layer.angle}°</Label>
                <Slider
                  value={[layer.angle]}
                  onValueChange={([value]) => updateLayer(layer.id, { angle: value })}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Opacity: {layer.opacity}%</Label>
                <Slider
                  value={[layer.opacity]}
                  onValueChange={([value]) => updateLayer(layer.id, { opacity: value })}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Colors</Label>
              <div className="flex flex-wrap gap-2">
                {layer.colors.map((color, colorIndex) => (
                  <div key={colorIndex} className="relative group">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => updateLayerColor(layer.id, colorIndex, e.target.value)}
                      className="w-10 h-10 p-1 cursor-pointer rounded border border-border"
                    />
                    {layer.colors.length > 2 && (
                      <button
                        onClick={() => removeColorFromLayer(layer.id, colorIndex)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10"
                  onClick={() => addColorToLayer(layer.id)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApply} className="flex-1 gap-2">
          <Blend className="w-4 h-4" />
          Apply Layers
        </Button>
      </div>

      {/* CSS Output */}
      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <Label className="text-xs text-muted-foreground mb-2 block">Generated CSS</Label>
        <code className="text-xs text-foreground break-all">{generateCSSLayers()}</code>
      </div>
    </Card>
  );
};
