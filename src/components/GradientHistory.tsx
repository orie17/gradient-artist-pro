import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface GradientHistoryProps {
  history: Array<{
    angle: number;
    colors: string[];
    type: "linear" | "radial" | "conic";
    animationType: string;
    speed: number;
  }>;
  currentIndex: number;
  onSelectHistory: (index: number) => void;
}

export const GradientHistory = ({ history, currentIndex, onSelectHistory }: GradientHistoryProps) => {
  const recentHistory = history.slice(-10).reverse();

  if (recentHistory.length <= 1) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-bold">Recent Gradients</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {recentHistory.map((gradient, index) => {
          const actualIndex = history.length - 1 - index;
          const isActive = actualIndex === currentIndex;
          return (
            <button
              key={`history-${actualIndex}`}
              onClick={() => onSelectHistory(actualIndex)}
              className={`relative overflow-hidden rounded-lg border transition-all aspect-video ${
                isActive 
                  ? "border-primary ring-2 ring-primary/50" 
                  : "border-border hover:border-primary"
              }`}
            >
              <div 
                className="absolute inset-0"
                style={{
                  background: gradient.type === "linear"
                    ? `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(", ")})`
                    : gradient.type === "radial"
                    ? `radial-gradient(circle, ${gradient.colors.join(", ")})`
                    : `conic-gradient(from ${gradient.angle}deg, ${gradient.colors.join(", ")})`,
                }}
              />
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="text-white text-xs font-medium">Current</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
