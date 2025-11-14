import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Toolbar } from "@/components/Toolbar";
import { Canvas } from "@/components/Canvas";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { GradientPreset } from "@/components/GradientPresets";

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [gradientAngle, setGradientAngle] = useState(45);
  const [gradientColors, setGradientColors] = useState(["#ec4899", "#8b5cf6", "#3b82f6"]);

  const handleSelectPreset = (preset: GradientPreset) => {
    setGradientColors(preset.colors);
    setGradientAngle(preset.angle);
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
      <div className="flex-1 flex overflow-hidden">
        <Toolbar onSelectPreset={handleSelectPreset} />
        <Canvas
          ref={canvasRef}
          gradient={{ angle: gradientAngle, colors: gradientColors }}
          animationSpeed={animationSpeed}
        />
        <PropertiesPanel
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={setAnimationSpeed}
          gradientAngle={gradientAngle}
          onGradientAngleChange={setGradientAngle}
          gradientColors={gradientColors}
          onGradientColorsChange={setGradientColors}
          onExport={handleExport}
          canvasRef={canvasRef}
        />
      </div>
    </div>
  );
};

export default Index;
