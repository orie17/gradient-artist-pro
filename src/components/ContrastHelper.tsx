import { Badge } from "@/components/ui/badge";
import { Sun, Moon } from "lucide-react";

interface ContrastHelperProps {
  colors: string[];
}

// Convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Calculate relative luminance
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Get average luminance of gradient colors
const getAverageLuminance = (colors: string[]): number => {
  const luminances = colors.map((color) => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0.5;
    return getLuminance(rgb.r, rgb.g, rgb.b);
  });
  return luminances.reduce((a, b) => a + b, 0) / luminances.length;
};

export const ContrastHelper = ({ colors }: ContrastHelperProps) => {
  const avgLuminance = getAverageLuminance(colors);
  const isLightBackground = avgLuminance > 0.5;

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={`text-xs gap-1.5 ${
          isLightBackground
            ? "border-foreground/20 text-foreground"
            : "border-primary/30 text-primary"
        }`}
      >
        {isLightBackground ? (
          <>
            <Sun className="w-3 h-3" />
            <span>Better for dark text</span>
          </>
        ) : (
          <>
            <Moon className="w-3 h-3" />
            <span>Good for light text</span>
          </>
        )}
      </Badge>
    </div>
  );
};
