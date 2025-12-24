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

  const generateTailwind = () => {
    const colorStops = gradient.colors.map((color, i) => {
      if (i === 0) return `from-[${color}]`;
      if (i === gradient.colors.length - 1) return `to-[${color}]`;
      return `via-[${color}]`;
    }).join(" ");
    
    if (gradient.type === "linear") {
      const directions: Record<number, string> = {
        0: "bg-gradient-to-t",
        45: "bg-gradient-to-tr",
        90: "bg-gradient-to-r",
        135: "bg-gradient-to-br",
        180: "bg-gradient-to-b",
        225: "bg-gradient-to-bl",
        270: "bg-gradient-to-l",
        315: "bg-gradient-to-tl",
      };
      const closest = Object.keys(directions).reduce((prev, curr) => 
        Math.abs(parseInt(curr) - gradient.angle) < Math.abs(parseInt(prev) - gradient.angle) ? curr : prev
      );
      return `className="${directions[parseInt(closest)]} ${colorStops}"`;
    } else if (gradient.type === "radial") {
      return `className="bg-[radial-gradient(circle,${gradient.colors.join(",")})]"`;
    } else {
      return `className="bg-[conic-gradient(from_${gradient.angle}deg,${gradient.colors.join(",")})]"`;
    }
  };

  const generateReact = () => {
    const cssValue = gradient.type === "linear"
      ? `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(", ")})`
      : gradient.type === "radial"
      ? `radial-gradient(circle, ${gradient.colors.join(", ")})`
      : `conic-gradient(from ${gradient.angle}deg, ${gradient.colors.join(", ")})`;

    return `const GradientBackground = () => {
  return (
    <div
      style={{
        background: '${cssValue}',
        width: '100%',
        height: '100vh',
      }}
    />
  );
};`;
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
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const cssCode = generateCSS();
  const tailwindCode = generateTailwind();
  const reactCode = generateReact();
  const svgCode = generateSVG();
  const canvasCode = generateCanvas();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-2">
        <Code className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Code Export</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Best for websites (developers)</p>
      
      <Tabs defaultValue="css" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
          <TabsTrigger value="react">React</TabsTrigger>
          <TabsTrigger value="svg">SVG</TabsTrigger>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="css" className="space-y-3">
          <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
            <code>{cssCode}</code>
          </pre>
          <Button onClick={() => handleCopy(cssCode, "css")} className="w-full" size="lg">
            {copiedTab === "css" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copiedTab === "css" ? "Copied!" : "Copy Code"}
          </Button>
        </TabsContent>
        
        <TabsContent value="tailwind" className="space-y-3">
          <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
            <code>{tailwindCode}</code>
          </pre>
          <Button onClick={() => handleCopy(tailwindCode, "tailwind")} className="w-full" size="lg">
            {copiedTab === "tailwind" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copiedTab === "tailwind" ? "Copied!" : "Copy Code"}
          </Button>
        </TabsContent>
        
        <TabsContent value="react" className="space-y-3">
          <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-[200px]">
            <code>{reactCode}</code>
          </pre>
          <Button onClick={() => handleCopy(reactCode, "react")} className="w-full" size="lg">
            {copiedTab === "react" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copiedTab === "react" ? "Copied!" : "Copy Code"}
          </Button>
        </TabsContent>
        
        <TabsContent value="svg" className="space-y-3">
          <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-[200px]">
            <code>{svgCode}</code>
          </pre>
          <Button onClick={() => handleCopy(svgCode, "svg")} className="w-full" size="lg">
            {copiedTab === "svg" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copiedTab === "svg" ? "Copied!" : "Copy Code"}
          </Button>
        </TabsContent>
        
        <TabsContent value="canvas" className="space-y-3">
          <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-[200px]">
            <code>{canvasCode}</code>
          </pre>
          <Button onClick={() => handleCopy(canvasCode, "canvas")} className="w-full" size="lg">
            {copiedTab === "canvas" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copiedTab === "canvas" ? "Copied!" : "Copy Code"}
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
