import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Play } from "lucide-react";
import { toast } from "sonner";

interface AnimationPresetsProps {
  onApplyPreset: (preset: AnimationPreset) => void;
}

export interface AnimationPreset {
  name: string;
  animationType: "rotate" | "slide-horizontal" | "slide-vertical" | "pulse" | "wave" | "diagonal" | "zoom" | "color-shift";
  speed: number;
  direction: "forward" | "reverse" | "alternate";
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  description: string;
}

const presets: AnimationPreset[] = [
  {
    name: "Smooth Wave",
    animationType: "wave",
    speed: 0.5,
    direction: "forward",
    easing: "ease-in-out",
    description: "Gentle, flowing wave motion",
  },
  {
    name: "Fast Spin",
    animationType: "rotate",
    speed: 2,
    direction: "forward",
    easing: "linear",
    description: "Quick continuous rotation",
  },
  {
    name: "Pulsing Glow",
    animationType: "pulse",
    speed: 0.8,
    direction: "alternate",
    easing: "ease-in-out",
    description: "Breathing, pulsing effect",
  },
  {
    name: "Diagonal Slide",
    animationType: "diagonal",
    speed: 1.2,
    direction: "forward",
    easing: "ease-out",
    description: "Smooth diagonal movement",
  },
  {
    name: "Gentle Zoom",
    animationType: "zoom",
    speed: 0.6,
    direction: "alternate",
    easing: "ease-in-out",
    description: "Subtle zoom in and out",
  },
  {
    name: "Color Morph",
    animationType: "color-shift",
    speed: 1,
    direction: "forward",
    easing: "ease-in",
    description: "Smooth color transitions",
  },
  {
    name: "Horizontal Flow",
    animationType: "slide-horizontal",
    speed: 1.5,
    direction: "forward",
    easing: "linear",
    description: "Steady horizontal movement",
  },
  {
    name: "Reverse Spin",
    animationType: "rotate",
    speed: 1,
    direction: "reverse",
    easing: "linear",
    description: "Counter-clockwise rotation",
  },
];

export const AnimationPresets = ({ onApplyPreset }: AnimationPresetsProps) => {
  const handleApplyPreset = (preset: AnimationPreset) => {
    onApplyPreset(preset);
    toast.success(`Applied "${preset.name}" preset`);
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Animation Presets</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Pre-configured animation combinations for quick styling
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handleApplyPreset(preset)}
            className="group p-4 text-left bg-muted/50 hover:bg-muted border border-border rounded-lg transition-all hover:shadow-md hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">
                  {preset.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {preset.description}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    {preset.animationType}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                    {preset.speed}x
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                    {preset.easing}
                  </span>
                </div>
              </div>
              <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
