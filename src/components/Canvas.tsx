import { useEffect, useRef, useState, forwardRef } from "react";
import { Card } from "@/components/ui/card";

interface CanvasProps {
  gradient: {
    angle: number;
    colors: string[];
  };
  animationSpeed: number;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ gradient, animationSpeed }, ref) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || internalCanvasRef;
  const [animationFrame, setAnimationFrame] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 1080, height: 720 });

  // Handle responsive canvas sizing
  useEffect(() => {
    const updateDimensions = () => {
      const containerPadding = 64; // 8 * 2 for p-8
      const sidebarWidth = 288 * 2; // w-72 * 2 for both sidebars
      const headerHeight = 64;
      
      const availableWidth = window.innerWidth - sidebarWidth - containerPadding;
      const availableHeight = window.innerHeight - headerHeight - containerPadding;
      
      // Maintain 16:10 aspect ratio
      let width = Math.min(availableWidth, 1080);
      let height = Math.min(availableHeight, 720);
      
      // Adjust to maintain aspect ratio
      const aspectRatio = 1080 / 720;
      if (width / height > aspectRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }
      
      setDimensions({ width: Math.floor(width), height: Math.floor(height) });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw animated gradient background
      const angleRad = ((gradient.angle + animationFrame * animationSpeed * 0.1) * Math.PI) / 180;
      const x1 = canvas.width / 2 - Math.cos(angleRad) * canvas.width / 2;
      const y1 = canvas.height / 2 - Math.sin(angleRad) * canvas.height / 2;
      const x2 = canvas.width / 2 + Math.cos(angleRad) * canvas.width / 2;
      const y2 = canvas.height / 2 + Math.sin(angleRad) * canvas.height / 2;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.colors.forEach((color, index) => {
        grad.addColorStop(index / (gradient.colors.length - 1), color);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      setAnimationFrame((prev) => prev + 1);
    };

    const interval = setInterval(animate, 1000 / 60); // 60 FPS

    return () => clearInterval(interval);
  }, [gradient, animationSpeed, animationFrame, dimensions]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="bg-panel border-border overflow-hidden">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="max-w-full h-auto"
        />
      </Card>
    </div>
  );
});
