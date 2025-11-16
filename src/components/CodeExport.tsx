import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CodeExportProps {
  gradient: {
    angle: number;
    colors: string[];
    type: "linear" | "radial" | "conic";
  };
}

export const CodeExport = ({ gradient }: CodeExportProps) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const generateCSS = () => {
    if (gradient.type === "linear") {
      return `background: linear-gradient(${gradient.angle}deg, ${gradient.colors.join(", ")});`;
    } else if (gradient.type === "radial") {
      return `background: radial-gradient(circle, ${gradient.colors.join(", ")});`;
    } else {
      return `background: conic-gradient(from ${gradient.angle}deg, ${gradient.colors.join(", ")});`;
    }
  };

  const generateSVG = () => {
    const stops = gradient.colors
      .map((color, i) => {
        const offset = (i / (gradient.colors.length - 1)) * 100;
        return `    <stop offset="${offset}%" stop-color="${color}" />`;
      })
      .join("\n");

    if (gradient.type === "linear") {
      return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
${stops}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#gradient)" />
</svg>`;
    } else if (gradient.type === "radial") {
      return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="gradient">
${stops}
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#gradient)" />
</svg>`;
    }
    return `<!-- Conic gradients are not supported in SVG -->`;
  };

  const generateCanvas = () => {
    const colorStops = gradient.colors
      .map((color, i) => {
        const position = i / (gradient.colors.length - 1);
        return `grad.addColorStop(${position}, "${color}");`;
      })
      .join("\n  ");

    if (gradient.type === "linear") {
      return `const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const angle = ${gradient.angle} * Math.PI / 180;
const x1 = canvas.width / 2 - Math.cos(angle) * canvas.width / 2;
const y1 = canvas.height / 2 - Math.sin(angle) * canvas.height / 2;
const x2 = canvas.width / 2 + Math.cos(angle) * canvas.width / 2;
const y2 = canvas.height / 2 + Math.sin(angle) * canvas.height / 2;
const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  ${colorStops}
ctx.fillStyle = grad;
ctx.fillRect(0, 0, canvas.width, canvas.height);`;
    } else if (gradient.type === "radial") {
      return `const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = Math.max(canvas.width, canvas.height) / 2;
const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  ${colorStops}
ctx.fillStyle = grad;
ctx.fillRect(0, 0, canvas.width, canvas.height);`;
    } else {
      return `const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const startAngle = ${gradient.angle} * Math.PI / 180;
const grad = ctx.createConicGradient(startAngle, centerX, centerY);
  ${colorStops}
ctx.fillStyle = grad;
ctx.fillRect(0, 0, canvas.width, canvas.height);`;
    }
  };

  const handleCopy = (code: string, tab: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tab);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const cssCode = generateCSS();
  const svgCode = generateSVG();
  const canvasCode = generateCanvas();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Code Export</h3>
      </div>
      <Tabs defaultValue="css" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="svg">SVG</TabsTrigger>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
        </TabsList>
        <TabsContent value="css" className="space-y-3">
          <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
            <code>{cssCode}</code>
          </pre>
          <Button
            onClick={() => handleCopy(cssCode, "css")}
            className="w-full"
            variant="secondary"
          >
            {copiedTab === "css" ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copiedTab === "css" ? "Copied!" : "Copy CSS"}
          </Button>
        </TabsContent>
        <TabsContent value="svg" className="space-y-3">
          <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-[200px]">
            <code>{svgCode}</code>
          </pre>
          <Button
            onClick={() => handleCopy(svgCode, "svg")}
            className="w-full"
            variant="secondary"
          >
            {copiedTab === "svg" ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copiedTab === "svg" ? "Copied!" : "Copy SVG"}
          </Button>
        </TabsContent>
        <TabsContent value="canvas" className="space-y-3">
          <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-[200px]">
            <code>{canvasCode}</code>
          </pre>
          <Button
            onClick={() => handleCopy(canvasCode, "canvas")}
            className="w-full"
            variant="secondary"
          >
            {copiedTab === "canvas" ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copiedTab === "canvas" ? "Copied!" : "Copy Canvas"}
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
