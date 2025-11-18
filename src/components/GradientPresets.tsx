import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export interface GradientPreset {
  name: string;
  colors: string[];
  angle: number;
  animationType: "rotate" | "slide-horizontal" | "slide-vertical" | "pulse" | "wave" | "diagonal" | "zoom" | "color-shift";
  speed: number;
}

export const gradientPresets: GradientPreset[] = [
  { name: "Purple Dream", colors: ["#ec4899", "#8b5cf6", "#3b82f6"], angle: 45, animationType: "rotate", speed: 1 },
  { name: "Cool Blues", colors: ["#3b82f6", "#06b6d4", "#10b981"], angle: 135, animationType: "slide-horizontal", speed: 1.5 },
  { name: "Candy", colors: ["#f43f5e", "#ec4899", "#a855f7"], angle: 90, animationType: "pulse", speed: 2 },
  { name: "Emerald", colors: ["#10b981", "#14b8a6", "#06b6d4"], angle: 180, animationType: "wave", speed: 1 },
  { name: "Peach", colors: ["#fb923c", "#f97316", "#ef4444"], angle: 225, animationType: "diagonal", speed: 1.2 },
  { name: "Cosmic", colors: ["#a855f7", "#6366f1", "#3b82f6"], angle: 270, animationType: "slide-vertical", speed: 1.8 },
  { name: "Sunset Blaze", colors: ["#ff6b6b", "#ee5a6f", "#c44569"], angle: 60, animationType: "zoom", speed: 2.5 },
  { name: "Ocean Deep", colors: ["#0a4d68", "#088395", "#05bfdb"], angle: 120, animationType: "color-shift", speed: 1.3 },
  { name: "Forest Magic", colors: ["#2d5016", "#3a7d44", "#96e072"], angle: 150, animationType: "rotate", speed: 0.8 },
  { name: "Neon Nights", colors: ["#ff006e", "#8338ec", "#3a86ff"], angle: 200, animationType: "diagonal", speed: 2 },
];

interface GradientPresetsProps {
  onSelectPreset: (preset: GradientPreset) => void;
}

export const GradientPresets = ({ onSelectPreset }: GradientPresetsProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPresets = gradientPresets.filter((preset) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      preset.name.toLowerCase().includes(searchLower) ||
      preset.animationType.toLowerCase().includes(searchLower) ||
      preset.colors.some((color) => color.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search presets by name, animation, or color..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-panel border-border"
        />
      </div>
      {filteredPresets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No presets found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPresets.map((preset) => {
        return (
          <button
            key={preset.name}
            onClick={() => onSelectPreset(preset)}
            className="group relative overflow-hidden rounded-lg border border-border hover:border-primary transition-all min-h-[60px]"
          >
            <div className="h-full w-full p-3 flex items-center gap-3 bg-panel hover:bg-panel-hover transition-colors">
              <div 
                className="w-12 h-12 rounded-md flex-shrink-0"
                style={{
                  background: `linear-gradient(${preset.angle}deg, ${preset.colors.join(", ")})`,
                }}
              />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-foreground">{preset.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{preset.animationType.replace("-", " ")}</div>
              </div>
            </div>
          </button>
        );
      })}
        </div>
      )}
    </div>
  );
};
