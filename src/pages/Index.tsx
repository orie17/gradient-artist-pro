import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Canvas } from "@/components/Canvas";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { GradientPreset } from "@/components/GradientPresets";
import { AppSidebar } from "@/components/AppSidebar";
import { BackToTop } from "@/components/BackToTop";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "sonner";

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
  const [history, setHistory] = useState<typeof gradient[]>([gradient]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = (newGradient: typeof gradient) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newGradient);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleSelectPreset = (preset: GradientPreset) => {
    const newGradient = {
      ...gradient,
      colors: preset.colors,
      angle: preset.angle,
      animationType: preset.animationType,
      speed: preset.speed,
    };
    setGradient(newGradient);
    addToHistory(newGradient);
  };

  const handleGradientChange = (newGradient: typeof gradient) => {
    setGradient(newGradient);
    addToHistory(newGradient);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setGradient(history[newIndex]);
      toast.success("Undo");
    } else {
      toast.error("Nothing to undo");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setGradient(history[newIndex]);
      toast.success("Redo");
    } else {
      toast.error("Nothing to redo");
    }
  };

  const handleExport = (format: "png" | "jpeg") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `gradient-background.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  };

  const handleSaveShortcut = () => {
    toast.info("Opening save dialog...");
  };

  const handleAnimationTypeChange = (type: string) => {
    const newGradient = { ...gradient, animationType: type as any };
    setGradient(newGradient);
    addToHistory(newGradient);
    toast.success(`Animation: ${type}`);
  };

  useKeyboardShortcuts({
    onExport: () => handleExport("png"),
    onSave: handleSaveShortcut,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onAnimationType: handleAnimationTypeChange,
  });

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex flex-col w-full bg-background">
        <Header />
        
        <div className="flex flex-1 w-full overflow-hidden">
          <AppSidebar
            onSelectPreset={handleSelectPreset}
            onCanvasSizeChange={setCanvasSize}
            canvasSize={canvasSize}
          />

          <main className="flex-1 flex flex-col lg:flex-row overflow-auto">
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
              <Canvas
                ref={canvasRef}
                gradient={gradient}
                effects={effects}
                canvasSize={canvasSize}
              />
            </div>

            <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-panel">
              <PropertiesPanel
                gradient={gradient}
                effects={effects}
                canvasSize={canvasSize}
                onGradientChange={handleGradientChange}
                onEffectsChange={setEffects}
                onCanvasSizeChange={setCanvasSize}
                onExport={handleExport}
                canvasRef={canvasRef}
              />
            </aside>
          </main>
        </div>

        <BackToTop />
      </div>
    </SidebarProvider>
  );
};

export default Index;
