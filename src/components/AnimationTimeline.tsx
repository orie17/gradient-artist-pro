import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface Keyframe {
  id: string;
  position: number; // 0-100 percentage
  colors: string[];
  angle: number;
}

interface AnimationTimelineProps {
  gradient: {
    colors: string[];
    angle: number;
    speed: number;
  };
  onGradientChange: (gradient: any) => void;
}

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
  return "#" + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
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

export const AnimationTimeline = ({
  gradient,
  onGradientChange,
}: AnimationTimelineProps) => {
  const [keyframes, setKeyframes] = useState<Keyframe[]>([
    { id: "start", position: 0, colors: gradient.colors, angle: gradient.angle },
    { id: "end", position: 100, colors: gradient.colors.slice().reverse(), angle: gradient.angle + 180 },
  ]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(3000); // ms for full cycle
  const [selectedKeyframe, setSelectedKeyframe] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  const getInterpolatedGradient = useCallback(
    (position: number) => {
      const sortedKeyframes = [...keyframes].sort((a, b) => a.position - b.position);

      // Find surrounding keyframes
      let beforeKeyframe = sortedKeyframes[0];
      let afterKeyframe = sortedKeyframes[sortedKeyframes.length - 1];

      for (let i = 0; i < sortedKeyframes.length - 1; i++) {
        if (
          position >= sortedKeyframes[i].position &&
          position <= sortedKeyframes[i + 1].position
        ) {
          beforeKeyframe = sortedKeyframes[i];
          afterKeyframe = sortedKeyframes[i + 1];
          break;
        }
      }

      if (beforeKeyframe.position === afterKeyframe.position) {
        return { colors: beforeKeyframe.colors, angle: beforeKeyframe.angle };
      }

      const factor =
        (position - beforeKeyframe.position) /
        (afterKeyframe.position - beforeKeyframe.position);

      // Interpolate colors
      const maxLength = Math.max(
        beforeKeyframe.colors.length,
        afterKeyframe.colors.length
      );
      const interpolatedColors: string[] = [];

      for (let i = 0; i < maxLength; i++) {
        const beforeIdx = Math.min(i, beforeKeyframe.colors.length - 1);
        const afterIdx = Math.min(i, afterKeyframe.colors.length - 1);
        interpolatedColors.push(
          interpolateColor(
            beforeKeyframe.colors[beforeIdx],
            afterKeyframe.colors[afterIdx],
            factor
          )
        );
      }

      // Interpolate angle
      const interpolatedAngle =
        beforeKeyframe.angle + factor * (afterKeyframe.angle - beforeKeyframe.angle);

      return { colors: interpolatedColors, angle: Math.round(interpolatedAngle) };
    },
    [keyframes]
  );

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const position = (elapsed % duration) / duration * 100;

      setCurrentPosition(position);

      animationRef.current = requestAnimationFrame(animate);
    },
    [duration]
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

  // Update gradient based on current position
  useEffect(() => {
    const { colors, angle } = getInterpolatedGradient(currentPosition);
    // Only update if significantly different to avoid infinite loops
    if (JSON.stringify(colors) !== JSON.stringify(gradient.colors) || angle !== gradient.angle) {
      onGradientChange({
        ...gradient,
        colors,
        angle,
      });
    }
  }, [currentPosition, getInterpolatedGradient]);

  const addKeyframe = () => {
    const newKeyframe: Keyframe = {
      id: Date.now().toString(),
      position: currentPosition,
      colors: [...gradient.colors],
      angle: gradient.angle,
    };
    setKeyframes([...keyframes, newKeyframe]);
    toast.success("Keyframe added!");
  };

  const removeKeyframe = (id: string) => {
    if (keyframes.length <= 2) {
      toast.error("Need at least 2 keyframes");
      return;
    }
    setKeyframes(keyframes.filter((kf) => kf.id !== id));
    if (selectedKeyframe === id) {
      setSelectedKeyframe(null);
    }
    toast.success("Keyframe removed");
  };

  const updateKeyframeFromCurrent = (id: string) => {
    setKeyframes(
      keyframes.map((kf) =>
        kf.id === id ? { ...kf, colors: [...gradient.colors], angle: gradient.angle } : kf
      )
    );
    toast.success("Keyframe updated with current gradient");
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    setCurrentPosition(Math.max(0, Math.min(100, position)));
    setIsPlaying(false);
  };

  const handleKeyframeDrag = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const timeline = timelineRef.current;
    if (!timeline) return;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rect = timeline.getBoundingClientRect();
      const position = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setKeyframes(
        keyframes.map((kf) =>
          kf.id === id ? { ...kf, position: Math.max(0, Math.min(100, position)) } : kf
        )
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const skipToStart = () => {
    setCurrentPosition(0);
    startTimeRef.current = 0;
  };

  const skipToEnd = () => {
    setCurrentPosition(100);
  };

  const formatTime = (position: number) => {
    const ms = (position / 100) * duration;
    const seconds = Math.floor(ms / 1000);
    const frames = Math.floor((ms % 1000) / (1000 / 30));
    return `${seconds}:${frames.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Animation Timeline
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Create keyframes and scrub through the animation cycle
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" onClick={skipToStart}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            size="lg"
            className="w-16"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>
          <Button variant="outline" size="icon" onClick={skipToEnd}>
            <SkipForward className="w-4 h-4" />
          </Button>
          <div className="ml-4 text-sm font-mono text-muted-foreground">
            {formatTime(currentPosition)} / {formatTime(100)}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <Label className="text-sm">Timeline</Label>
          <div
            ref={timelineRef}
            className="relative h-16 bg-muted/30 rounded-lg border border-border cursor-pointer overflow-hidden"
            onClick={handleTimelineClick}
          >
            {/* Gradient Preview Background */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: 20 }).map((_, i) => {
                const pos = (i / 19) * 100;
                const { colors, angle } = getInterpolatedGradient(pos);
                return (
                  <div
                    key={i}
                    className="flex-1 h-full"
                    style={{
                      background: `linear-gradient(${angle}deg, ${colors.join(", ")})`,
                    }}
                  />
                );
              })}
            </div>

            {/* Keyframe Markers */}
            {keyframes.map((kf) => (
              <div
                key={kf.id}
                className={`absolute top-0 bottom-0 w-3 cursor-grab transform -translate-x-1/2 ${
                  selectedKeyframe === kf.id
                    ? "z-20"
                    : "z-10"
                }`}
                style={{ left: `${kf.position}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedKeyframe(kf.id);
                  setCurrentPosition(kf.position);
                }}
                onMouseDown={(e) => handleKeyframeDrag(kf.id, e)}
              >
                <div
                  className={`w-3 h-full border-2 rounded-sm ${
                    selectedKeyframe === kf.id
                      ? "bg-primary border-primary-foreground"
                      : "bg-background border-primary"
                  }`}
                />
              </div>
            ))}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-foreground z-30 pointer-events-none"
              style={{ left: `${currentPosition}%` }}
            >
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
            </div>
          </div>

          {/* Timeline Labels */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0:00</span>
            <span>{(duration / 1000).toFixed(1)}s</span>
          </div>
        </div>

        {/* Position Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Scrub Position</Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(currentPosition)}%
            </span>
          </div>
          <Slider
            value={[currentPosition]}
            onValueChange={([v]) => {
              setIsPlaying(false);
              setCurrentPosition(v);
            }}
            max={100}
            step={0.5}
          />
        </div>

        {/* Duration Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Cycle Duration</Label>
            <span className="text-sm text-muted-foreground">
              {(duration / 1000).toFixed(1)}s
            </span>
          </div>
          <Slider
            value={[duration]}
            onValueChange={([v]) => setDuration(v)}
            min={1000}
            max={10000}
            step={100}
          />
        </div>

        {/* Keyframe Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Keyframes ({keyframes.length})</Label>
            <Button variant="outline" size="sm" onClick={addKeyframe}>
              <Plus className="w-4 h-4 mr-1" />
              Add at Current
            </Button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {keyframes
              .sort((a, b) => a.position - b.position)
              .map((kf) => (
                <div
                  key={kf.id}
                  className={`flex items-center gap-3 p-2 rounded-md border ${
                    selectedKeyframe === kf.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/20"
                  }`}
                  onClick={() => {
                    setSelectedKeyframe(kf.id);
                    setCurrentPosition(kf.position);
                    setIsPlaying(false);
                  }}
                >
                  {/* Mini gradient preview */}
                  <div
                    className="w-10 h-6 rounded border border-border flex-shrink-0"
                    style={{
                      background: `linear-gradient(${kf.angle}deg, ${kf.colors.join(", ")})`,
                    }}
                  />
                  <div className="flex-1 text-sm">
                    <span className="font-mono">{Math.round(kf.position)}%</span>
                    <span className="text-muted-foreground ml-2">{formatTime(kf.position)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateKeyframeFromCurrent(kf.id);
                    }}
                    className="h-7 text-xs"
                  >
                    Update
                  </Button>
                  {keyframes.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeKeyframe(kf.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
