import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SplitSquareHorizontal, RotateCcw, Columns, Rows, Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface GradientConfig {
  angle: number;
  colors: string[];
  type: "linear" | "radial" | "conic";
  animationType: "rotate" | "slide-horizontal" | "slide-vertical" | "pulse" | "wave" | "diagonal" | "zoom" | "color-shift";
  speed: number;
  direction: "forward" | "reverse" | "alternate";
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

interface GradientSplitComparisonProps {
  currentGradient: GradientConfig;
  history: GradientConfig[];
  savedGradients: Array<{ name: string; gradient: GradientConfig }>;
  onApplyGradient?: (gradient: GradientConfig) => void;
}

type SplitMode = "vertical" | "horizontal";

export const GradientSplitComparison = ({
  currentGradient,
  history,
  savedGradients,
  onApplyGradient,
}: GradientSplitComparisonProps) => {
  const [leftGradient, setLeftGradient] = useState<GradientConfig>(currentGradient);
  const [rightGradient, setRightGradient] = useState<GradientConfig>(
    history.length > 1 ? history[history.length - 2] : currentGradient
  );
  const [splitPosition, setSplitPosition] = useState(50);
  const [splitMode, setSplitMode] = useState<SplitMode>("vertical");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const renderGradient = (
    canvas: HTMLCanvasElement,
    gradient: GradientConfig,
    time: number
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    let grad: CanvasGradient;
    const speed = isAnimating ? gradient.speed : 0;
    const animTime = time * speed;

    if (gradient.type === "radial") {
      const maxRadius = Math.max(width, height);
      let radius = maxRadius / 2;
      if (gradient.animationType === "pulse" || gradient.animationType === "zoom") {
        radius = maxRadius / 2 + Math.sin(animTime) * maxRadius / 6;
      }
      grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    } else if (gradient.type === "conic") {
      const startAngle = gradient.animationType === "rotate" ? animTime : (gradient.angle * Math.PI) / 180;
      grad = ctx.createConicGradient(startAngle, centerX, centerY);
    } else {
      let angleRad = (gradient.angle * Math.PI) / 180;
      if (gradient.animationType === "rotate") {
        angleRad += animTime * 0.5;
      }
      const x1 = centerX - Math.cos(angleRad) * width / 2;
      const y1 = centerY - Math.sin(angleRad) * height / 2;
      const x2 = centerX + Math.cos(angleRad) * width / 2;
      const y2 = centerY + Math.sin(angleRad) * height / 2;
      grad = ctx.createLinearGradient(x1, y1, x2, y2);
    }

    gradient.colors.forEach((color, index) => {
      let position = index / (gradient.colors.length - 1);
      if (gradient.animationType === "color-shift") {
        position = (position + animTime * 0.1) % 1;
      }
      grad.addColorStop(position, color);
    });

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  };

  useEffect(() => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      if (leftCanvasRef.current) {
        renderGradient(leftCanvasRef.current, leftGradient, elapsed);
      }
      if (rightCanvasRef.current) {
        renderGradient(rightCanvasRef.current, rightGradient, elapsed);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [leftGradient, rightGradient, isAnimating]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let position: number;

    if (splitMode === "vertical") {
      position = ((e.clientX - rect.left) / rect.width) * 100;
    } else {
      position = ((e.clientY - rect.top) / rect.height) * 100;
    }

    setSplitPosition(Math.max(10, Math.min(90, position)));
  };

  const selectGradient = (source: string): GradientConfig => {
    if (source === "current") return currentGradient;
    if (source.startsWith("history-")) {
      const index = parseInt(source.split("-")[1]);
      return history[index] || currentGradient;
    }
    if (source.startsWith("saved-")) {
      const index = parseInt(source.split("-")[1]);
      return savedGradients[index]?.gradient || currentGradient;
    }
    return currentGradient;
  };

  const swapGradients = () => {
    const temp = leftGradient;
    setLeftGradient(rightGradient);
    setRightGradient(temp);
    toast.success("Gradients swapped");
  };

  const getGradientCSS = (gradient: GradientConfig) => {
    const colorStops = gradient.colors.join(", ");
    if (gradient.type === "radial") {
      return `radial-gradient(circle, ${colorStops})`;
    } else if (gradient.type === "conic") {
      return `conic-gradient(from ${gradient.angle}deg, ${colorStops})`;
    }
    return `linear-gradient(${gradient.angle}deg, ${colorStops})`;
  };

  return (
    <Card className="p-6 bg-panel border-border">
      <div className="flex items-center gap-2 mb-4">
        <SplitSquareHorizontal className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Split Comparison</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Compare two gradients side-by-side with a draggable split view
      </p>

      {/* Controls */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Left Gradient</Label>
          <Select
            value="current"
            onValueChange={(value) => setLeftGradient(selectGradient(value))}
          >
            <SelectTrigger className="h-9 bg-input border-border">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              {history.slice(-10).map((_, i) => (
                <SelectItem key={`history-${i}`} value={`history-${i}`}>
                  History #{i + 1}
                </SelectItem>
              ))}
              {savedGradients.map((saved, i) => (
                <SelectItem key={`saved-${i}`} value={`saved-${i}`}>
                  {saved.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Right Gradient</Label>
          <Select
            value="current"
            onValueChange={(value) => setRightGradient(selectGradient(value))}
          >
            <SelectTrigger className="h-9 bg-input border-border">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              {history.slice(-10).map((_, i) => (
                <SelectItem key={`history-${i}`} value={`history-${i}`}>
                  History #{i + 1}
                </SelectItem>
              ))}
              {savedGradients.map((saved, i) => (
                <SelectItem key={`saved-${i}`} value={`saved-${i}`}>
                  {saved.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Split Mode</Label>
          <div className="flex gap-1">
            <Button
              variant={splitMode === "vertical" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setSplitMode("vertical")}
            >
              <Columns className="w-4 h-4" />
            </Button>
            <Button
              variant={splitMode === "horizontal" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setSplitMode("horizontal")}
            >
              <Rows className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={swapGradients}
            className="flex-1 gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            Swap
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAnimating(!isAnimating)}
            className="px-3"
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Split Position Slider */}
      <div className="mb-4">
        <Label className="text-xs text-muted-foreground mb-2 block">
          Split Position: {splitPosition.toFixed(0)}%
        </Label>
        <Slider
          value={[splitPosition]}
          onValueChange={([value]) => setSplitPosition(value)}
          min={10}
          max={90}
          step={1}
          className="w-full"
        />
      </div>

      {/* Split View Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video rounded-lg overflow-hidden border border-border cursor-col-resize"
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Left/Top Gradient */}
        <div
          className="absolute overflow-hidden"
          style={
            splitMode === "vertical"
              ? { left: 0, top: 0, width: `${splitPosition}%`, height: "100%" }
              : { left: 0, top: 0, width: "100%", height: `${splitPosition}%` }
          }
        >
          <canvas
            ref={leftCanvasRef}
            width={800}
            height={450}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
            Left
          </div>
        </div>

        {/* Right/Bottom Gradient */}
        <div
          className="absolute overflow-hidden"
          style={
            splitMode === "vertical"
              ? { right: 0, top: 0, width: `${100 - splitPosition}%`, height: "100%" }
              : { left: 0, bottom: 0, width: "100%", height: `${100 - splitPosition}%` }
          }
        >
          <canvas
            ref={rightCanvasRef}
            width={800}
            height={450}
            className="w-full h-full object-cover"
          />
          <div
            className={`absolute px-2 py-1 bg-black/50 rounded text-xs text-white ${
              splitMode === "vertical" ? "top-2 right-2" : "bottom-2 right-2"
            }`}
          >
            Right
          </div>
        </div>

        {/* Divider Line */}
        <div
          className={`absolute bg-white/80 shadow-lg ${
            splitMode === "vertical"
              ? "w-1 h-full cursor-col-resize"
              : "h-1 w-full cursor-row-resize"
          }`}
          style={
            splitMode === "vertical"
              ? { left: `${splitPosition}%`, top: 0, transform: "translateX(-50%)" }
              : { top: `${splitPosition}%`, left: 0, transform: "translateY(-50%)" }
          }
          onMouseDown={() => setIsDragging(true)}
        >
          <div
            className={`absolute bg-white rounded-full shadow-lg flex items-center justify-center ${
              splitMode === "vertical"
                ? "w-6 h-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                : "h-6 w-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            }`}
          >
            <div className={`flex gap-0.5 ${splitMode === "horizontal" ? "flex-col" : ""}`}>
              <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
              <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Info */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="p-3 bg-card rounded border border-border">
          <Label className="text-xs text-muted-foreground mb-2 block">Left Gradient</Label>
          <div className="flex items-center gap-2 mb-2">
            {leftGradient.colors.map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {leftGradient.type} • {leftGradient.angle}° • {leftGradient.animationType}
          </p>
          {onApplyGradient && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => onApplyGradient(leftGradient)}
            >
              Use This
            </Button>
          )}
        </div>

        <div className="p-3 bg-card rounded border border-border">
          <Label className="text-xs text-muted-foreground mb-2 block">Right Gradient</Label>
          <div className="flex items-center gap-2 mb-2">
            {rightGradient.colors.map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {rightGradient.type} • {rightGradient.angle}° • {rightGradient.animationType}
          </p>
          {onApplyGradient && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => onApplyGradient(rightGradient)}
            >
              Use This
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
