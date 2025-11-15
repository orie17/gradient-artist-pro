import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Plus } from "lucide-react";
import { toast } from "sonner";

interface ColorPaletteGeneratorProps {
  baseColor?: string;
  onApplyPalette: (colors: string[]) => void;
}

export const ColorPaletteGenerator = ({
  baseColor = "#8b5cf6",
  onApplyPalette,
}: ColorPaletteGeneratorProps) => {
  const [scheme, setScheme] = useState<string>("complementary");

  const hexToHSL = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

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

  const HSLToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (300 <= h && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const generatePalette = () => {
    const base = hexToHSL(baseColor);
    let colors: string[] = [];

    switch (scheme) {
      case "complementary":
        colors = [
          baseColor,
          HSLToHex((base.h + 180) % 360, base.s, base.l),
          HSLToHex(base.h, base.s, Math.max(base.l - 20, 10)),
        ];
        break;

      case "triadic":
        colors = [
          baseColor,
          HSLToHex((base.h + 120) % 360, base.s, base.l),
          HSLToHex((base.h + 240) % 360, base.s, base.l),
        ];
        break;

      case "analogous":
        colors = [
          HSLToHex((base.h - 30 + 360) % 360, base.s, base.l),
          baseColor,
          HSLToHex((base.h + 30) % 360, base.s, base.l),
        ];
        break;

      case "tetradic":
        colors = [
          baseColor,
          HSLToHex((base.h + 90) % 360, base.s, base.l),
          HSLToHex((base.h + 180) % 360, base.s, base.l),
          HSLToHex((base.h + 270) % 360, base.s, base.l),
        ];
        break;

      case "monochromatic":
        colors = [
          HSLToHex(base.h, base.s, Math.min(base.l + 20, 90)),
          baseColor,
          HSLToHex(base.h, base.s, Math.max(base.l - 20, 10)),
        ];
        break;

      case "split-complementary":
        colors = [
          baseColor,
          HSLToHex((base.h + 150) % 360, base.s, base.l),
          HSLToHex((base.h + 210) % 360, base.s, base.l),
        ];
        break;

      default:
        colors = [baseColor];
    }

    return colors;
  };

  const handleGenerate = () => {
    const palette = generatePalette();
    onApplyPalette(palette);
    toast.success(`Applied ${scheme} color palette`);
  };

  const generatedColors = generatePalette();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Color Scheme
        </Label>
        <Select value={scheme} onValueChange={setScheme}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="complementary">Complementary</SelectItem>
            <SelectItem value="triadic">Triadic</SelectItem>
            <SelectItem value="analogous">Analogous</SelectItem>
            <SelectItem value="tetradic">Tetradic</SelectItem>
            <SelectItem value="monochromatic">Monochromatic</SelectItem>
            <SelectItem value="split-complementary">Split Complementary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 h-12">
        {generatedColors.map((color, index) => (
          <div
            key={index}
            className="flex-1 rounded border border-border"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <Button onClick={handleGenerate} className="w-full" variant="secondary">
        <Plus className="w-4 h-4 mr-2" />
        Apply Palette
      </Button>
    </div>
  );
};
