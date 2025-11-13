import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Toolbar } from "@/components/Toolbar";
import { Canvas, Shape } from "@/components/Canvas";
import { PropertiesPanel } from "@/components/PropertiesPanel";

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [gradientAngle, setGradientAngle] = useState(45);
  const [gradientColors, setGradientColors] = useState(["#ec4899", "#8b5cf6", "#3b82f6"]);

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

  const handleDeleteLayer = (id: string) => {
    setShapes(shapes.filter((shape) => shape.id !== id));
    if (selectedShapeId === id) {
      setSelectedShapeId(null);
    }
  };

  const handleLayerSelect = (id: string) => {
    setSelectedShapeId(id);
  };

  const handleShapeUpdate = (id: string, updates: Partial<Shape>) => {
    setShapes(shapes.map((shape) => 
      shape.id === id ? { ...shape, ...updates } : shape
    ));
  };

  const handleExport = (format: "png" | "jpeg") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `gradient-background.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  };

  const selectedShape = shapes.find((shape) => shape.id === selectedShapeId) || null;

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Toolbar onAddShape={handleAddShape} />
        <Canvas
          ref={canvasRef}
          shapes={shapes}
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
          layers={shapes}
          selectedShape={selectedShape}
          onLayerSelect={handleLayerSelect}
          onLayerDelete={handleDeleteLayer}
          onShapeUpdate={handleShapeUpdate}
          canvasRef={canvasRef}
        />
      </div>
    </div>
  );
};

export default Index;
