import { useEffect, useRef, forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { ContrastHelper } from "./ContrastHelper";

interface CanvasProps {
  gradient: {
    angle: number;
    colors: string[];
    type: "linear" | "radial" | "conic";
    animationType: "rotate" | "slide-horizontal" | "slide-vertical" | "pulse" | "wave" | "diagonal" | "zoom" | "color-shift";
    speed: number;
    direction: "forward" | "reverse" | "alternate";
  };
  effects: {
    blur: number;
    noise: number;
  };
  canvasSize: { width: number; height: number };
  reduceMotion?: boolean;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ gradient, effects, canvasSize, reduceMotion = false }, ref) => {
    const internalCanvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || internalCanvasRef;
    const animationIdRef = useRef<number>();

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      let startTime = Date.now();

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        // Reduce motion: slow down to 0.1x speed
        const speedMultiplier = reduceMotion ? gradient.speed * 0.1 : gradient.speed;
        const time = elapsed * speedMultiplier;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Create gradient based on type and animation
        let grad: CanvasGradient;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        if (gradient.type === "radial") {
          const maxRadius = Math.max(canvas.width, canvas.height);
          let radius = maxRadius / 2;
          
          if (gradient.animationType === "pulse" || gradient.animationType === "zoom") {
            radius = maxRadius / 2 + Math.sin(time) * maxRadius / 6;
          }
          
          grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        } else if (gradient.type === "conic") {
          const startAngle = gradient.animationType === "rotate" 
            ? time 
            : (gradient.angle * Math.PI) / 180;
          
          grad = ctx.createConicGradient(startAngle, centerX, centerY);
        } else {
          // Linear gradient
          let angleRad = (gradient.angle * Math.PI) / 180;
          
          if (gradient.animationType === "rotate") {
            angleRad += time * 0.5;
          } else if (gradient.animationType === "slide-horizontal") {
            angleRad = 0;
          } else if (gradient.animationType === "slide-vertical") {
            angleRad = Math.PI / 2;
          } else if (gradient.animationType === "diagonal") {
            angleRad = Math.PI / 4 + time * 0.3;
          } else if (gradient.animationType === "wave") {
            angleRad += Math.sin(time) * 0.5;
          }

          const x1 = centerX - Math.cos(angleRad) * canvas.width / 2;
          const y1 = centerY - Math.sin(angleRad) * canvas.height / 2;
          const x2 = centerX + Math.cos(angleRad) * canvas.width / 2;
          const y2 = centerY + Math.sin(angleRad) * canvas.height / 2;

          grad = ctx.createLinearGradient(x1, y1, x2, y2);
        }

        // Add color stops with potential color shifting
        gradient.colors.forEach((color, index) => {
          let position = index / (gradient.colors.length - 1);
          
          if (gradient.animationType === "color-shift") {
            position = (position + time * 0.1) % 1;
          }
          
          grad.addColorStop(position, color);
        });

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply effects
        if (effects.blur > 0) {
          ctx.filter = `blur(${effects.blur}px)`;
          ctx.drawImage(canvas, 0, 0);
          ctx.filter = "none";
        }

        if (effects.noise > 0) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const noiseAmount = effects.noise * 255;
          
          for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * noiseAmount;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;
          }
          
          ctx.putImageData(imageData, 0, 0);
        }

        animationIdRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
      };
    }, [gradient, effects, canvasSize, reduceMotion]);

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 gap-3">
        <Card className="bg-panel border-border overflow-hidden w-full max-w-full">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="max-w-full h-auto mx-auto"
            style={{ 
              display: 'block',
              willChange: 'transform',
            }}
          />
        </Card>
        <ContrastHelper colors={gradient.colors} />
      </div>
    );
  }
);

Canvas.displayName = "Canvas";
