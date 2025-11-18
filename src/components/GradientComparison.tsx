import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Canvas } from "@/components/Canvas";
import { Grid3x3, Download, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GradientConfig {
  angle: number;
  colors: string[];
  type: "linear" | "radial" | "conic";
  animationType: "rotate" | "slide-horizontal" | "slide-vertical" | "pulse" | "wave" | "diagonal" | "zoom" | "color-shift";
  speed: number;
  direction: "forward" | "reverse" | "alternate";
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

interface GradientComparisonProps {
  currentGradient: GradientConfig;
  history: GradientConfig[];
  savedGradients: Array<{ name: string; gradient: GradientConfig }>;
}

type LayoutType = "2-col" | "3-col" | "2x2";

export const GradientComparison = ({ currentGradient, history, savedGradients }: GradientComparisonProps) => {
  const [selectedGradients, setSelectedGradients] = useState<GradientConfig[]>([currentGradient, currentGradient]);
  const [layout, setLayout] = useState<LayoutType>("2-col");
  const [isPlaying, setIsPlaying] = useState(true);

  const maxGradients = layout === "2-col" ? 2 : layout === "3-col" ? 3 : 4;

  const handleAddGradient = () => {
    if (selectedGradients.length < maxGradients) {
      setSelectedGradients([...selectedGradients, currentGradient]);
    }
  };

  const handleRemoveGradient = (index: number) => {
    if (selectedGradients.length > 2) {
      setSelectedGradients(selectedGradients.filter((_, i) => i !== index));
    } else {
      toast.error("Must have at least 2 gradients to compare");
    }
  };

  const handleSelectSource = (index: number, source: string) => {
    let gradient: GradientConfig;
    
    if (source === "current") {
      gradient = currentGradient;
    } else if (source.startsWith("history-")) {
      const historyIndex = parseInt(source.split("-")[1]);
      gradient = history[historyIndex];
    } else if (source.startsWith("saved-")) {
      const savedIndex = parseInt(source.split("-")[1]);
      gradient = savedGradients[savedIndex].gradient;
    } else {
      return;
    }

    const newGradients = [...selectedGradients];
    newGradients[index] = gradient;
    setSelectedGradients(newGradients);
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case "2-col":
        return "grid-cols-1 md:grid-cols-2";
      case "3-col":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case "2x2":
        return "grid-cols-1 md:grid-cols-2";
      default:
        return "grid-cols-2";
    }
  };

  const effects = { blur: 0, noise: 0 };
  const canvasSize = { width: 800, height: 600 };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-card border-border hover:bg-card/80"
        >
          <Grid3x3 className="w-4 h-4" />
          <span className="hidden sm:inline">Compare</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Gradient Comparison</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <Select value={layout} onValueChange={(value: LayoutType) => setLayout(value)}>
                <SelectTrigger className="w-32 bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-col">2 Column</SelectItem>
                  <SelectItem value="3-col">3 Column</SelectItem>
                  <SelectItem value="2x2">2×2 Grid</SelectItem>
                </SelectContent>
              </Select>

              {selectedGradients.length < maxGradients && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddGradient}
                  className="bg-card border-border"
                >
                  Add Gradient
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-card border-border"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>

          {/* Gradient Grid */}
          <div className={`grid gap-4 ${getLayoutClasses()}`}>
            {selectedGradients.map((gradient, index) => (
              <Card key={index} className="p-4 space-y-3 bg-card border-border">
                <div className="flex items-center justify-between">
                  <Select
                    value={`current`}
                    onValueChange={(value) => handleSelectSource(index, value)}
                  >
                    <SelectTrigger className="flex-1 bg-input border-border">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Gradient</SelectItem>
                      {history.slice(-10).map((_, i) => (
                        <SelectItem key={`history-${i}`} value={`history-${i}`}>
                          History #{i + 1}
                        </SelectItem>
                      ))}
                      {savedGradients.map((saved, i) => (
                        <SelectItem key={`saved-${i}`} value={`saved-${i}`}>
                          {saved.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedGradients.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveGradient(index)}
                      className="ml-2 hover:bg-destructive/20 hover:text-destructive"
                    >
                      ×
                    </Button>
                  )}
                </div>

                <div className="aspect-video rounded-lg overflow-hidden border border-border">
                  <Canvas
                    gradient={{
                      ...gradient,
                      speed: isPlaying ? gradient.speed : 0,
                    }}
                    effects={effects}
                    canvasSize={canvasSize}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    {gradient.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded border border-border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{gradient.type}</span>
                    <span>{gradient.animationType}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Export Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Use the main canvas export feature to save individual gradients
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
