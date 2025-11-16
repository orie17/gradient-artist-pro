import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shuffle, Lock, Unlock, History } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GradientRandomizerProps {
  onApplyGradient: (colors: string[]) => void;
  currentColors: string[];
}

const colorSchemes = {
  complementary: (baseHue: number) => [
    `hsl(${baseHue}, 70%, 60%)`,
    `hsl(${(baseHue + 180) % 360}, 70%, 60%)`,
  ],
  triadic: (baseHue: number) => [
    `hsl(${baseHue}, 70%, 60%)`,
    `hsl(${(baseHue + 120) % 360}, 70%, 60%)`,
    `hsl(${(baseHue + 240) % 360}, 70%, 60%)`,
  ],
  analogous: (baseHue: number) => [
    `hsl(${baseHue}, 70%, 60%)`,
    `hsl(${(baseHue + 30) % 360}, 70%, 60%)`,
    `hsl(${(baseHue + 60) % 360}, 70%, 60%)`,
  ],
  tetradic: (baseHue: number) => [
    `hsl(${baseHue}, 70%, 60%)`,
    `hsl(${(baseHue + 90) % 360}, 70%, 60%)`,
    `hsl(${(baseHue + 180) % 360}, 70%, 60%)`,
    `hsl(${(baseHue + 270) % 360}, 70%, 60%)`,
  ],
  monochromatic: (baseHue: number) => [
    `hsl(${baseHue}, 70%, 40%)`,
    `hsl(${baseHue}, 70%, 60%)`,
    `hsl(${baseHue}, 70%, 80%)`,
  ],
};

export const GradientRandomizer = ({ onApplyGradient, currentColors }: GradientRandomizerProps) => {
  const [lockedIndices, setLockedIndices] = useState<Set<number>>(new Set());
  const [history, setHistory] = useState<string[][]>([currentColors]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const generateRandomGradient = () => {
    const schemes = Object.keys(colorSchemes);
    const randomScheme = schemes[Math.floor(Math.random() * schemes.length)] as keyof typeof colorSchemes;
    const baseHue = Math.floor(Math.random() * 360);
    
    let newColors = colorSchemes[randomScheme](baseHue);
    
    // Keep locked colors
    const finalColors = newColors.map((color, index) => {
      if (lockedIndices.has(index) && currentColors[index]) {
        return currentColors[index];
      }
      return color;
    });
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(finalColors);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    onApplyGradient(finalColors);
    toast.success(`Applied ${randomScheme} color scheme`);
  };

  const toggleLock = (index: number) => {
    const newLocked = new Set(lockedIndices);
    if (newLocked.has(index)) {
      newLocked.delete(index);
    } else {
      newLocked.add(index);
    }
    setLockedIndices(newLocked);
  };

  const goToHistory = (index: number) => {
    if (index >= 0 && index < history.length) {
      setHistoryIndex(index);
      onApplyGradient(history[index]);
      toast.success("Restored from history");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shuffle className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Smart Randomizer</h3>
      </div>
      
      <div className="space-y-4">
        <Button onClick={generateRandomGradient} className="w-full" size="lg">
          <Shuffle className="w-4 h-4 mr-2" />
          Generate Random Gradient
        </Button>

        <div>
          <p className="text-sm font-medium mb-2">Lock Colors</p>
          <div className="flex gap-2 flex-wrap">
            {currentColors.map((color, index) => (
              <Button
                key={index}
                variant={lockedIndices.has(index) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLock(index)}
                className="gap-2"
              >
                {lockedIndices.has(index) ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <Unlock className="w-3 h-3" />
                )}
                <div
                  className="w-4 h-4 rounded border border-border"
                  style={{ background: color }}
                />
              </Button>
            ))}
          </div>
        </div>

        {history.length > 1 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4" />
              <p className="text-sm font-medium">History</p>
            </div>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {history.map((colors, index) => (
                  <button
                    key={index}
                    onClick={() => goToHistory(index)}
                    className={`w-full h-10 rounded border transition-all ${
                      index === historyIndex
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                    style={{
                      background: `linear-gradient(90deg, ${colors.join(", ")})`,
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </Card>
  );
};
