import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Canvas } from "@/components/Canvas";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { GradientPresets, GradientPreset } from "@/components/GradientPresets";
import { SocialMediaExport } from "@/components/SocialMediaExport";
import { CodeExport } from "@/components/CodeExport";
import { GradientHistory } from "@/components/GradientHistory";
import { BackToTop } from "@/components/BackToTop";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { AnimationPresets, AnimationPreset } from "@/components/AnimationPresets";
import { GettingStartedStrip } from "@/components/GettingStartedStrip";
import { PersonaToggle, Persona } from "@/components/PersonaToggle";
import { BuilderAnimationSection } from "@/components/BuilderAnimationSection";
import { AdvancedToolsSection } from "@/components/AdvancedToolsSection";
import { ImageVideoExport } from "@/components/ImageVideoExport";
import { BrandKit } from "@/components/BrandKit";
import { GradientMorph } from "@/components/GradientMorph";
import { AnimationTimeline } from "@/components/AnimationTimeline";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "sonner";

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const getInitialGradient = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("colors")) {
      return {
        angle: parseInt(params.get("angle") || "45"),
        colors: params.get("colors")?.split(",") || ["#ec4899", "#8b5cf6", "#3b82f6"],
        type: (params.get("type") || "linear") as "linear" | "radial" | "conic",
        animationType: (params.get("animation") || "rotate") as "rotate" | "slide-horizontal" | "slide-vertical" | "pulse" | "wave" | "diagonal" | "zoom" | "color-shift",
        speed: parseFloat(params.get("speed") || "1"),
        direction: (params.get("direction") || "forward") as "forward" | "reverse" | "alternate",
        easing: (params.get("easing") || "linear") as "linear" | "ease-in" | "ease-out" | "ease-in-out",
      };
    }
    return {
      angle: 45,
      colors: ["#ec4899", "#8b5cf6", "#3b82f6"],
      type: "linear" as const,
      animationType: "rotate" as const,
      speed: 1,
      direction: "forward" as const,
      easing: "linear" as const,
    };
  };

  const [gradient, setGradient] = useState(getInitialGradient);
  const [effects, setEffects] = useState({ blur: 0, noise: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [history, setHistory] = useState<typeof gradient[]>([getInitialGradient()]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(() => {
    return localStorage.getItem("reduceMotion") === "true";
  });
  const [persona, setPersona] = useState<Persona>("developers");

  useEffect(() => {
    if (window.location.search) {
      toast.success("Loaded shared gradient!");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("reduceMotion", reduceMotion.toString());
  }, [reduceMotion]);

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
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setGradient(history[newIndex]);
      toast.success("Redo");
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

  const handleApplyAnimationPreset = (preset: AnimationPreset) => {
    const newGradient = {
      ...gradient,
      animationType: preset.animationType,
      speed: preset.speed,
      direction: preset.direction,
      easing: preset.easing,
    };
    setGradient(newGradient);
    addToHistory(newGradient);
  };

  const handleSelectHistory = (index: number) => {
    setHistoryIndex(index);
    setGradient(history[index]);
    toast.success("Loaded from history");
  };

  useKeyboardShortcuts({
    onExport: () => handleExport("png"),
    onSave: () => toast.info("Opening save dialog..."),
    onUndo: handleUndo,
    onRedo: handleRedo,
    onAnimationType: (type) => {
      const newGradient = { ...gradient, animationType: type as any };
      setGradient(newGradient);
      addToHistory(newGradient);
    },
    onShowHelp: () => setShowKeyboardHelp(true),
  });

  const getSavedGradients = () => {
    try {
      const saved = localStorage.getItem('gradientLibrary');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header 
        currentGradient={gradient}
        history={history}
        savedGradients={getSavedGradients()}
        reduceMotion={reduceMotion}
        onReduceMotionChange={setReduceMotion}
      />
      
      <div className="flex flex-1 w-full">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-72 border-r border-border bg-panel fixed left-0 top-16 bottom-0 overflow-y-auto">
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
        <main className="flex-1 overflow-auto lg:ml-72">
          {/* Sticky Canvas */}
          <div className="sticky top-0 z-10 bg-background border-b border-border p-4 lg:p-6">
            <Canvas
              ref={canvasRef}
              gradient={gradient}
              effects={effects}
              canvasSize={canvasSize}
              reduceMotion={reduceMotion}
            />
          </div>

          {/* Scrollable Content */}
          <div className="p-4 lg:p-8 space-y-8">
            {/* Getting Started */}
            <GettingStartedStrip />

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
              <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">Gradient Presets</h2>
                <p className="text-sm text-muted-foreground">Start from beautiful ready-made looks</p>
              </div>
              <GradientPresets onSelectPreset={handleSelectPreset} />
            </section>

            {/* Animation Presets */}
            <AnimationPresets onApplyPreset={handleApplyAnimationPreset} />

            {/* Builder & Animation */}
            <BuilderAnimationSection
              gradient={gradient}
              onGradientChange={handleGradientChange}
            />

            {/* Advanced Tools (Collapsible) */}
            <AdvancedToolsSection
              gradient={gradient}
              effects={effects}
              onGradientChange={handleGradientChange}
              onEffectsChange={setEffects}
            />

            {/* Brand Kit */}
            <section>
              <BrandKit
                onApplyColors={(colors) => {
                  const newGradient = { ...gradient, colors };
                  setGradient(newGradient);
                  addToHistory(newGradient);
                }}
              />
            </section>

            {/* Gradient Morphing */}
            <section>
              <GradientMorph
                currentGradient={gradient}
                onApplyGradient={(colors, angle) => {
                  const newGradient = { ...gradient, colors, angle };
                  setGradient(newGradient);
                  addToHistory(newGradient);
                }}
              />
            </section>

            {/* Animation Timeline */}
            <section>
              <AnimationTimeline
                gradient={gradient}
                onGradientChange={(newGradient) => setGradient(newGradient)}
              />
            </section>

            {/* History */}
            <GradientHistory
              history={history}
              currentIndex={historyIndex}
              onSelectHistory={handleSelectHistory}
            />

            {/* Export Section */}
            <section className="space-y-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">Export</h2>
                <p className="text-sm text-muted-foreground">Ship gradients to code, designs, and socials</p>
              </div>
              
              <PersonaToggle value={persona} onChange={setPersona} />

              {persona === "developers" && (
                <>
                  <CodeExport gradient={gradient} />
                  <ImageVideoExport 
                    canvasRef={canvasRef} 
                    canvasSize={canvasSize}
                    onCanvasSizeChange={setCanvasSize} 
                  />
                  <SocialMediaExport canvasRef={canvasRef} onCanvasSizeChange={setCanvasSize} />
                </>
              )}
              
              {persona === "designers" && (
                <>
                  <ImageVideoExport 
                    canvasRef={canvasRef} 
                    canvasSize={canvasSize}
                    onCanvasSizeChange={setCanvasSize} 
                  />
                  <CodeExport gradient={gradient} />
                  <SocialMediaExport canvasRef={canvasRef} onCanvasSizeChange={setCanvasSize} />
                </>
              )}
              
              {persona === "creators" && (
                <>
                  <SocialMediaExport canvasRef={canvasRef} onCanvasSizeChange={setCanvasSize} />
                  <ImageVideoExport 
                    canvasRef={canvasRef} 
                    canvasSize={canvasSize}
                    onCanvasSizeChange={setCanvasSize} 
                  />
                  <CodeExport gradient={gradient} />
                </>
              )}
            </section>
          </div>
        </main>
      </div>

      <BackToTop />
      <KeyboardShortcutsHelp open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp} />
    </div>
  );
};

export default Index;
