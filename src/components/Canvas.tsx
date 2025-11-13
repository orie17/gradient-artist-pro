import { useEffect, useRef, useState, forwardRef } from "react";
import { Card } from "@/components/ui/card";

export interface Shape {
  id: string;
  type: "circle" | "square" | "wave";
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  opacity: number;
}

interface CanvasProps {
  shapes: Shape[];
  gradient: {
    angle: number;
    colors: string[];
  };
  animationSpeed: number;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ shapes, gradient, animationSpeed }, ref) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || internalCanvasRef;
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const angleRad = (gradient.angle * Math.PI) / 180;
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

      // Draw shapes with animation
      shapes.forEach((shape) => {
        ctx.save();
        
        const animatedRotation = shape.rotation + (animationFrame * animationSpeed * 0.01);
        ctx.translate(shape.x, shape.y);
        ctx.rotate(animatedRotation);
        ctx.globalAlpha = shape.opacity;

        ctx.fillStyle = shape.color;

        switch (shape.type) {
          case "circle":
            ctx.beginPath();
            ctx.arc(0, 0, shape.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "square":
            ctx.fillRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
            break;
          case "wave":
            ctx.beginPath();
            for (let i = 0; i < shape.size * 2; i++) {
              const y = Math.sin(i * 0.1 + animationFrame * animationSpeed * 0.05) * 20;
              if (i === 0) {
                ctx.moveTo(i - shape.size, y);
              } else {
                ctx.lineTo(i - shape.size, y);
              }
            }
            ctx.strokeStyle = shape.color;
            ctx.lineWidth = 3;
            ctx.stroke();
            break;
        }

        ctx.restore();
      });

      setAnimationFrame((prev) => prev + 1);
    };

    const interval = setInterval(animate, 1000 / 60); // 60 FPS

    return () => clearInterval(interval);
  }, [shapes, gradient, animationSpeed, animationFrame]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="bg-panel border-border overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1080}
          height={720}
      className="max-w-full h-auto"
        />
      </Card>
    </div>
  );
});
