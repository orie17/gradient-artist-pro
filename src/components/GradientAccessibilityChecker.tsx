import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accessibility, Check, X, AlertTriangle, Copy, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface GradientAccessibilityCheckerProps {
  gradient: {
    colors: string[];
    angle: number;
    type: "linear" | "radial" | "conic";
  };
  onApplySuggestion?: (colors: string[]) => void;
}

interface ContrastResult {
  ratio: number;
  passAA: boolean;
  passAAA: boolean;
  passAALarge: boolean;
  passAAALarge: boolean;
}

// Convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

// Calculate relative luminance
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Calculate contrast ratio
const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

// Check WCAG compliance
const checkWCAG = (ratio: number): ContrastResult => ({
  ratio,
  passAA: ratio >= 4.5,
  passAAA: ratio >= 7,
  passAALarge: ratio >= 3,
  passAAALarge: ratio >= 4.5,
});

// Generate accessible color suggestions
const generateAccessibleColors = (
  bgColor: string,
  isLight: boolean
): { color: string; name: string }[] => {
  if (isLight) {
    return [
      { color: "#000000", name: "Black" },
      { color: "#1a1a1a", name: "Near Black" },
      { color: "#333333", name: "Dark Gray" },
      { color: "#1e3a5f", name: "Dark Blue" },
      { color: "#2d3748", name: "Slate" },
      { color: "#1a365d", name: "Navy" },
    ];
  }
  return [
    { color: "#ffffff", name: "White" },
    { color: "#f7fafc", name: "Off White" },
    { color: "#e2e8f0", name: "Light Gray" },
    { color: "#bee3f8", name: "Light Blue" },
    { color: "#c6f6d5", name: "Light Green" },
    { color: "#fefcbf", name: "Light Yellow" },
  ];
};

export const GradientAccessibilityChecker = ({
  gradient,
  onApplySuggestion,
}: GradientAccessibilityCheckerProps) => {
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState("16");

  // Calculate average luminance of gradient
  const averageLuminance = useMemo(() => {
    const luminances = gradient.colors.map((color) => {
      const rgb = hexToRgb(color);
      return getLuminance(rgb.r, rgb.g, rgb.b);
    });
    return luminances.reduce((a, b) => a + b, 0) / luminances.length;
  }, [gradient.colors]);

  const isLightBackground = averageLuminance > 0.5;

  // Calculate contrast with each gradient color
  const contrastResults = useMemo(() => {
    return gradient.colors.map((color) => ({
      color,
      result: checkWCAG(getContrastRatio(color, textColor)),
    }));
  }, [gradient.colors, textColor]);

  // Minimum contrast across gradient
  const minContrast = Math.min(...contrastResults.map((c) => c.result.ratio));
  const minContrastResult = checkWCAG(minContrast);

  // Suggested accessible colors
  const suggestions = useMemo(() => {
    return generateAccessibleColors(gradient.colors[0], isLightBackground).map(
      (s) => ({
        ...s,
        ratio: Math.min(
          ...gradient.colors.map((c) => getContrastRatio(c, s.color))
        ),
      })
    );
  }, [gradient.colors, isLightBackground]);

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`Copied ${color}`);
  };

  const getStatusIcon = (pass: boolean) =>
    pass ? (
      <Check className="w-4 h-4 text-green-500" />
    ) : (
      <X className="w-4 h-4 text-destructive" />
    );

  const getOverallStatus = () => {
    if (minContrastResult.passAAA) return { text: "Excellent", color: "bg-green-500" };
    if (minContrastResult.passAA) return { text: "Good", color: "bg-emerald-500" };
    if (minContrastResult.passAALarge) return { text: "Large Text Only", color: "bg-yellow-500" };
    return { text: "Needs Improvement", color: "bg-destructive" };
  };

  const status = getOverallStatus();

  return (
    <Card className="p-6 bg-panel border-border">
      <div className="flex items-center gap-2 mb-4">
        <Accessibility className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Accessibility Checker</h3>
        <Badge className={`${status.color} text-white ml-auto`}>{status.text}</Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Test text readability on your gradient for WCAG compliance
      </p>

      {/* Preview with text */}
      <div
        className="w-full h-32 rounded-lg mb-6 flex items-center justify-center relative border border-border"
        style={{
          background:
            gradient.type === "radial"
              ? `radial-gradient(circle, ${gradient.colors.join(", ")})`
              : gradient.type === "conic"
              ? `conic-gradient(from ${gradient.angle}deg, ${gradient.colors.join(", ")})`
              : `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(", ")})`,
        }}
      >
        <span
          style={{ color: textColor, fontSize: `${fontSize}px` }}
          className="font-semibold text-center px-4"
        >
          Sample Text Preview
        </span>
      </div>

      {/* Text Color & Size Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Text Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="flex-1 bg-input border-border font-mono text-sm"
            />
          </div>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Font Size (px)</Label>
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            min="12"
            max="72"
            className="bg-input border-border"
          />
        </div>
      </div>

      {/* Contrast Results */}
      <div className="mb-6">
        <Label className="text-sm text-muted-foreground mb-3 block">Contrast Ratios</Label>
        <div className="space-y-2">
          {contrastResults.map(({ color, result }, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-card rounded border border-border">
              <div
                className="w-8 h-8 rounded border border-border"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-mono text-foreground">{color}</span>
              <span className="text-sm font-semibold text-foreground ml-auto">
                {result.ratio.toFixed(2)}:1
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* WCAG Compliance Summary */}
      <div className="mb-6">
        <Label className="text-sm text-muted-foreground mb-3 block">
          WCAG Compliance (Minimum: {minContrast.toFixed(2)}:1)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-card rounded border border-border">
            {getStatusIcon(minContrastResult.passAA)}
            <span className="text-sm text-foreground">AA Normal (4.5:1)</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-card rounded border border-border">
            {getStatusIcon(minContrastResult.passAAA)}
            <span className="text-sm text-foreground">AAA Normal (7:1)</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-card rounded border border-border">
            {getStatusIcon(minContrastResult.passAALarge)}
            <span className="text-sm text-foreground">AA Large (3:1)</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-card rounded border border-border">
            {getStatusIcon(minContrastResult.passAAALarge)}
            <span className="text-sm text-foreground">AAA Large (4.5:1)</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Large text is 18pt (24px) or 14pt (18.5px) bold
        </p>
      </div>

      {/* Suggestions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-primary" />
          <Label className="text-sm text-muted-foreground">Accessible Color Suggestions</Label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {suggestions
            .filter((s) => s.ratio >= 4.5)
            .slice(0, 6)
            .map((suggestion) => (
              <div
                key={suggestion.color}
                className="flex items-center gap-2 p-2 bg-card rounded border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => {
                  setTextColor(suggestion.color);
                  toast.success(`Applied ${suggestion.name}`);
                }}
              >
                <div
                  className="w-6 h-6 rounded border border-border"
                  style={{ backgroundColor: suggestion.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{suggestion.name}</p>
                  <p className="text-xs text-muted-foreground">{suggestion.ratio.toFixed(1)}:1</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyColor(suggestion.color);
                  }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            ))}
        </div>
        {suggestions.filter((s) => s.ratio >= 4.5).length === 0 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded border border-yellow-500/20">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <p className="text-sm text-foreground">
              Consider adjusting your gradient colors for better accessibility
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
