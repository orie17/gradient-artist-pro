import { useState } from "react";
import { Header } from "@/components/Header";
import { Toolbar } from "@/components/Toolbar";
import { Canvas, Shape } from "@/components/Canvas";
import { PropertiesPanel } from "@/components/PropertiesPanel";

const Index = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [gradientAngle, setGradientAngle] = useState(45);
  const [gradient] = useState({
    angle: gradientAngle,
    colors: ["#ec4899", "#8b5cf6", "#3b82f6"],
  });

  const handleAddShape = (type: "circle" | "square" | "wave") => {
    const newShape: Shape = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 540 + Math.random() * 200 - 100,
      y: 360 + Math.random() * 200 - 100,
      size: 50 + Math.random() * 100,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      rotation: Math.random() * Math.PI * 2,
      opacity: 0.6 + Math.random() * 0.4,
    };
    setShapes([...shapes, newShape]);
  };

  const handleExport = (format: "png" | "jpeg") => {
    const canvas = document.querySelector("canvas");
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
        <Toolbar onAddShape={handleAddShape} />
        <Canvas
          shapes={shapes}
          gradient={{ ...gradient, angle: gradientAngle }}
          animationSpeed={animationSpeed}
        />
        <PropertiesPanel
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={setAnimationSpeed}
          gradientAngle={gradientAngle}
          onGradientAngleChange={setGradientAngle}
          onExport={handleExport}
          layers={shapes}
          onLayerSelect={(id) => console.log("Selected layer:", id)}
        />
      </div>
    </div>
  );
};

export default Index;
