import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface ColorHarmonyAnalyzerProps {
  colors: string[];
  onApplySuggestion: (colors: string[]) => void;
}

// Convert hex to HSL
const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

// Convert HSL to hex
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
};

export const ColorHarmonyAnalyzer = ({ colors, onApplySuggestion }: ColorHarmonyAnalyzerProps) => {
  const analysis = useMemo(() => {
    if (colors.length < 2) return null;

    const hslColors = colors.map(hexToHSL);
    const avgHue = hslColors.reduce((sum, c) => sum + c.h, 0) / hslColors.length;
    
    // Determine harmony type based on hue differences
    const hueDiffs = hslColors.map(c => Math.abs(c.h - avgHue));
    const maxDiff = Math.max(...hueDiffs);

    let harmonyType = "Custom";
    let description = "A unique color combination";

    if (maxDiff < 30) {
      harmonyType = "Analogous";
      description = "Colors are adjacent on the color wheel, creating harmony";
    } else if (maxDiff > 150 && maxDiff < 210) {
      harmonyType = "Complementary";
      description = "Opposite colors creating high contrast and vibrancy";
    } else if (hueDiffs.filter(d => d > 100 && d < 140).length >= 2) {
      harmonyType = "Triadic";
      description = "Evenly spaced colors creating balanced variety";
    } else if (maxDiff > 70 && maxDiff < 110) {
      harmonyType = "Split-Complementary";
      description = "Variation of complementary with softer contrast";
    }

    // Generate suggestions
    const suggestions = [];

    // Complementary suggestion
    const complementaryColors = hslColors.map(c => 
      hslToHex((c.h + 180) % 360, c.s, c.l)
    );
    suggestions.push({
      type: "Complementary",
      colors: complementaryColors,
      description: "High contrast opposite colors"
    });

    // Analogous suggestion
    const analogousColors = hslColors.map((c, i) => 
      hslToHex((c.h + (i - 1) * 30) % 360, c.s, c.l)
    );
    suggestions.push({
      type: "Analogous",
      colors: analogousColors,
      description: "Harmonious adjacent colors"
    });

    // Triadic suggestion
    const triadicColors = hslColors.slice(0, 3).map((c, i) => 
      hslToHex((c.h + i * 120) % 360, c.s, c.l)
    );
    if (colors.length >= 3) {
      suggestions.push({
        type: "Triadic",
        colors: triadicColors,
        description: "Balanced three-way harmony"
      });
    }

    return { harmonyType, description, suggestions };
  }, [colors]);

  if (!analysis) return null;

  const handleApplySuggestion = (suggestion: typeof analysis.suggestions[0]) => {
    onApplySuggestion(suggestion.colors);
    toast.success(`Applied ${suggestion.type} harmony`);
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Color Harmony Analyzer</h3>
      </div>

      <div className="space-y-4">
        {/* Current harmony analysis */}
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-1">
                {analysis.harmonyType} Harmony
              </h4>
              <p className="text-xs text-muted-foreground">
                {analysis.description}
              </p>
            </div>
          </div>
        </div>

        {/* Color suggestions */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Suggested Harmonies
          </h4>
          <div className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex gap-1">
                    {suggestion.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded border border-border shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-foreground">
                      {suggestion.type}
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApplySuggestion(suggestion)}
                  className="flex-shrink-0 hover:bg-primary hover:text-primary-foreground"
                >
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Based on traditional color theory principles. Experiment with variations for best results.
        </p>
      </div>
    </Card>
  );
};
