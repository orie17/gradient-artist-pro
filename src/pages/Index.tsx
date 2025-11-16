import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Canvas } from "@/components/Canvas";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { GradientPresets, GradientPreset } from "@/components/GradientPresets";
import { SocialMediaExport } from "@/components/SocialMediaExport";
import { CodeExport } from "@/components/CodeExport";
import { GradientRandomizer } from "@/components/GradientRandomizer";
import { BackToTop } from "@/components/BackToTop";
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
    easing: "linear" as "linear" | "ease-in" | "ease-out" | "ease-in-out",
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
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header />
      
      <div className="flex flex-1 w-full">
        {/* Left Sidebar - Animation Controls */}
        <aside className="hidden lg:block w-80 border-r border-border bg-panel fixed left-0 top-16 bottom-0 overflow-y-auto">
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

        {/* Main Content */}
        <main className="flex-1 overflow-auto lg:ml-80">
          {/* Sticky Canvas Section */}
          <div className="sticky top-0 z-10 bg-background border-b border-border p-4 lg:p-8">
            <div className="flex items-center justify-center">
              <Canvas
                ref={canvasRef}
                gradient={gradient}
                effects={effects}
                canvasSize={canvasSize}
              />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-4 lg:p-8 space-y-8">
            {/* Mobile Properties Panel */}
            <div className="lg:hidden">
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
            </div>

            {/* Gradient Presets */}
            <section>
              <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-bold mb-4">Gradient Presets</h2>
              <GradientPresets onSelectPreset={handleSelectPreset} />
            </section>

            {/* Social Media Export */}
            <SocialMediaExport canvasRef={canvasRef} onCanvasSizeChange={setCanvasSize} />

            {/* Code Export */}
            <CodeExport gradient={gradient} />

            {/* Smart Randomizer */}
            <GradientRandomizer
              onApplyGradient={(colors) => {
                const newGradient = { ...gradient, colors };
                handleGradientChange(newGradient);
              }}
              currentColors={gradient.colors}
            />
          </div>
        </main>
      </div>

      <BackToTop />
    </div>
  );
};

export default Index;
