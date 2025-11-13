import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface GradientPreset {
  name: string;
  colors: string[];
  angle: number;
}

export const gradientPresets: GradientPreset[] = [
  { name: "Sunset", colors: ["#ff6b6b", "#feca57", "#ee5a6f"], angle: 135 },
  { name: "Ocean", colors: ["#00d2ff", "#3a7bd5", "#00d2ff"], angle: 45 },
  { name: "Aurora", colors: ["#a8edea", "#fed6e3", "#a8edea"], angle: 90 },
  { name: "Neon Nights", colors: ["#f093fb", "#f5576c", "#4facfe"], angle: 180 },
  { name: "Forest", colors: ["#56ab2f", "#a8e063", "#56ab2f"], angle: 270 },
  { name: "Fire", colors: ["#ff0844", "#ffb199", "#ff0844"], angle: 45 },
  { name: "Purple Dream", colors: ["#a770ef", "#cf8bf3", "#fdb99b"], angle: 135 },
  { name: "Cool Blues", colors: ["#2196f3", "#21cbf3", "#2196f3"], angle: 90 },
  { name: "Candy", colors: ["#ff6ec4", "#7873f5", "#4facfe"], angle: 180 },
  { name: "Emerald", colors: ["#02aab0", "#00cdac", "#02aab0"], angle: 60 },
  { name: "Peach", colors: ["#ffecd2", "#fcb69f", "#ffecd2"], angle: 120 },
  { name: "Cosmic", colors: ["#5f27cd", "#341f97", "#8854d0"], angle: 225 },
];

interface GradientPresetsProps {
  onSelectPreset: (preset: GradientPreset) => void;
}

export const GradientPresets = ({ onSelectPreset }: GradientPresetsProps) => {
  return (
    <ScrollArea className="h-48">
      <div className="grid grid-cols-2 gap-2">
        {gradientPresets.map((preset) => {
          const gradientStyle = {
            background: `linear-gradient(${preset.angle}deg, ${preset.colors.join(", ")})`,
          };

          return (
            <Button
              key={preset.name}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center p-2 relative overflow-hidden group"
              onClick={() => onSelectPreset(preset)}
            >
              <div
                className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
                style={gradientStyle}
              />
              <span className="relative z-10 text-xs font-semibold text-white drop-shadow-lg">
                {preset.name}
              </span>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
