import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Shuffle, Play, Pause, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface GradientConfig {
  colors: string[];
  angle: number;
  type: "linear" | "radial" | "conic";
}

interface GradientMorphProps {
  currentGradient: GradientConfig;
  onApplyGradient: (colors: string[], angle: number) => void;
}

const EASING_FUNCTIONS = {
  linear: (t: number) => t,
  "ease-in": (t: number) => t * t,
  "ease-out": (t: number) => t * (2 - t),
  "ease-in-out": (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  "bounce": (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  "elastic": (t: number) => {
    if (t === 0 || t === 1) return t;
    return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
  },
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
};

const interpolateColor = (color1: string, color2: string, factor: number) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  return rgbToHex(
    rgb1.r + factor * (rgb2.r - rgb1.r),
    rgb1.g + factor * (rgb2.g - rgb1.g),
    rgb1.b + factor * (rgb2.b - rgb1.b)
  );
};

const PRESET_GRADIENTS: GradientConfig[] = [
  { colors: ["#ec4899", "#8b5cf6", "#3b82f6"], angle: 45, type: "linear" },
  { colors: ["#f97316", "#eab308", "#84cc16"], angle: 90, type: "linear" },
  { colors: ["#06b6d4", "#3b82f6", "#8b5cf6"], angle: 135, type: "linear" },
  { colors: ["#ef4444", "#f97316", "#fbbf24"], angle: 0, type: "linear" },
  { colors: ["#10b981", "#14b8a6", "#06b6d4"], angle: 180, type: "linear" },
  { colors: ["#8b5cf6", "#d946ef", "#ec4899"], angle: 270, type: "linear" },
];

export const GradientMorph = ({ currentGradient, onApplyGradient }: GradientMorphProps) => {
  const [startGradient, setStartGradient] = useState<GradientConfig>(currentGradient);
  const [endGradient, setEndGradient] = useState<GradientConfig>(PRESET_GRADIENTS[1]);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(2000);
  const [easing, setEasing] = useState<keyof typeof EASING_FUNCTIONS>("ease-in-out");
  const [loop, setLoop] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getMorphedGradient = useCallback(
    (t: number): { colors: string[]; angle: number } => {
      const easedT = EASING_FUNCTIONS[easing](t);
      const maxLength = Math.max(startGradient.colors.length, endGradient.colors.length);
      const morphedColors: string[] = [];

      for (let i = 0; i < maxLength; i++) {
        const startIdx = Math.min(i, startGradient.colors.length - 1);
        const endIdx = Math.min(i, endGradient.colors.length - 1);
        morphedColors.push(
          interpolateColor(startGradient.colors[startIdx], endGradient.colors[endIdx], easedT)
        );
      }

      const morphedAngle = startGradient.angle + easedT * (endGradient.angle - startGradient.angle);

      return { colors: morphedColors, angle: Math.round(morphedAngle) };
    },
    [startGradient, endGradient, easing]
  );

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      let t = Math.min(elapsed / duration, 1);

      setProgress(t);

      if (t >= 1) {
        if (loop) {
          startTimeRef.current = 0;
          setStartGradient(endGradient);
          const randomPreset = PRESET_GRADIENTS[Math.floor(Math.random() * PRESET_GRADIENTS.length)];
          setEndGradient(randomPreset);
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
          animationRef.current = null;
        }
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    },
    [duration, loop, endGradient]
  );

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate]);

  // Draw preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { colors, angle } = getMorphedGradient(progress);
    const radians = (angle * Math.PI) / 180;
    const x1 = canvas.width / 2 - Math.cos(radians) * canvas.width;
    const y1 = canvas.height / 2 - Math.sin(radians) * canvas.height;
    const x2 = canvas.width / 2 + Math.cos(radians) * canvas.width;
    const y2 = canvas.height / 2 + Math.sin(radians) * canvas.height;

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [progress, getMorphedGradient]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    startTimeRef.current = 0;
  };

  const handleApply = () => {
    const { colors, angle } = getMorphedGradient(progress);
    onApplyGradient(colors, angle);
    toast.success("Morphed gradient applied!");
  };

  const swapGradients = () => {
    const temp = startGradient;
    setStartGradient(endGradient);
    setEndGradient(temp);
    setProgress(0);
  };

  const setStartFromCurrent = () => {
    setStartGradient(currentGradient);
    setProgress(0);
    toast.success("Start gradient set from current");
  };

  const setEndFromCurrent = () => {
    setEndGradient(currentGradient);
    setProgress(0);
    toast.success("End gradient set from current");
  };

  const randomizeEnd = () => {
    const randomPreset = PRESET_GRADIENTS[Math.floor(Math.random() * PRESET_GRADIENTS.length)];
    setEndGradient(randomPreset);
    setProgress(0);
  };

  const renderGradientPreview = (gradient: GradientConfig) => {
    const gradientStyle = `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(", ")})`;
    return (
      <div
        className="w-full h-12 rounded-md border border-border"
        style={{ background: gradientStyle }}
      />
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-primary" />
          Gradient Morphing
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Smoothly animate between two gradients
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={120}
            className="w-full h-24 rounded-lg border border-border"
          />
          <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-xs">
            {Math.round(progress * 100)}%
          </div>
        </div>

        {/* Start & End Gradients */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Start</Label>
              <Button variant="ghost" size="sm" onClick={setStartFromCurrent} className="h-6 text-xs">
                Use Current
              </Button>
            </div>
            {renderGradientPreview(startGradient)}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">End</Label>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={setEndFromCurrent} className="h-6 text-xs">
                  Use Current
                </Button>
                <Button variant="ghost" size="sm" onClick={randomizeEnd} className="h-6 text-xs">
                  Random
                </Button>
              </div>
            </div>
            {renderGradientPreview(endGradient)}
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={swapGradients} className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Swap Start & End
        </Button>

        {/* Progress Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Progress</Label>
            <span className="text-sm text-muted-foreground">{Math.round(progress * 100)}%</span>
          </div>
          <Slider
            value={[progress * 100]}
            onValueChange={([v]) => {
              setIsPlaying(false);
              setProgress(v / 100);
            }}
            max={100}
            step={1}
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Duration</Label>
            <span className="text-sm text-muted-foreground">{duration / 1000}s</span>
          </div>
          <Slider
            value={[duration]}
            onValueChange={([v]) => setDuration(v)}
            min={500}
            max={5000}
            step={100}
          />
        </div>

        {/* Easing */}
        <div className="space-y-2">
          <Label className="text-sm">Easing</Label>
          <Select value={easing} onValueChange={(v) => setEasing(v as keyof typeof EASING_FUNCTIONS)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(EASING_FUNCTIONS).map((e) => (
                <SelectItem key={e} value={e}>
                  {e.replace("-", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Controls acceleration of the morph transition</p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button onClick={handlePlayPause} variant="default" className="flex-1">
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Play
              </>
            )}
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Apply Button */}
        <Button onClick={handleApply} variant="secondary" className="w-full">
          Apply Current Frame to Gradient
        </Button>
      </CardContent>
    </Card>
  );
};
