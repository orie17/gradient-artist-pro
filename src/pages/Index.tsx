import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Toolbar } from "@/components/Toolbar";
import { Canvas } from "@/components/Canvas";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { GradientPreset } from "@/components/GradientPresets";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Sparkles } from "lucide-react";
import { GradientPresets } from "@/components/GradientPresets";

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gradient, setGradient] = useState({
    angle: 45,
    colors: ["#ec4899", "#8b5cf6", "#3b82f6"],
    type: "linear" as "linear" | "radial" | "conic",
    animationType: "rotate" as "rotate" | "slide-horizontal" | "slide-vertical" | "pulse" | "wave" | "diagonal" | "zoom" | "color-shift",
    speed: 1,
    direction: "forward" as "forward" | "reverse" | "alternate",
  });
  const [effects, setEffects] = useState({
    blur: 0,
    noise: 0,
  });
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });

  const handleSelectPreset = (preset: GradientPreset) => {
    setGradient({
      ...gradient,
      colors: preset.colors,
      angle: preset.angle,
      animationType: preset.animationType,
      speed: preset.speed,
    });
  };

  const handleExport = (format: "png" | "jpeg") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `gradient-background.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      
      {/* Mobile Preset Sheet */}
      <div className="md:hidden fixed bottom-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg min-h-[56px] min-w-[56px]">
              <Sparkles className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] bg-panel">
            <div className="py-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Gradient Presets
              </h3>
              <GradientPresets onSelectPreset={handleSelectPreset} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        <Toolbar onSelectPreset={handleSelectPreset} />
        <Canvas
          ref={canvasRef}
          gradient={gradient}
          effects={effects}
          canvasSize={canvasSize}
        />
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                size="lg" 
                className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg min-h-[56px] min-w-[56px]"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] bg-panel p-0">
              <div className="h-full overflow-y-auto p-4">
                <PropertiesPanel
                  gradient={gradient}
                  effects={effects}
                  canvasSize={canvasSize}
                  onGradientChange={setGradient}
                  onEffectsChange={setEffects}
                  onCanvasSizeChange={setCanvasSize}
                  onExport={handleExport}
                  canvasRef={canvasRef}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden md:block">
          <PropertiesPanel
            gradient={gradient}
            effects={effects}
            canvasSize={canvasSize}
            onGradientChange={setGradient}
            onEffectsChange={setEffects}
            onCanvasSizeChange={setCanvasSize}
            onExport={handleExport}
            canvasRef={canvasRef}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
