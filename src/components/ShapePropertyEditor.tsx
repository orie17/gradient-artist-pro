import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Edit3 } from "lucide-react";
import type { Shape } from "./Canvas";

interface ShapePropertyEditorProps {
  shape: Shape | null;
  onShapeUpdate: (updates: Partial<Shape>) => void;
}

export const ShapePropertyEditor = ({
  shape,
  onShapeUpdate,
}: ShapePropertyEditorProps) => {
  if (!shape) {
    return (
      <Card className="p-4 bg-panel border-border">
        <p className="text-sm text-muted-foreground text-center">
          Select a layer to edit its properties
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-panel border-border space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Edit3 className="w-4 h-4 text-primary" />
        Shape Properties
      </h3>

      <div>
        <Label className="text-xs text-muted-foreground">Size</Label>
        <Slider
          value={[shape.size]}
          onValueChange={([value]) => onShapeUpdate({ size: value })}
          min={10}
          max={200}
          step={1}
          className="mt-2"
        />
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {shape.size}px
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Color</Label>
        <div className="flex gap-2 mt-2">
          <Input
            type="color"
            value={shape.color}
            onChange={(e) => onShapeUpdate({ color: e.target.value })}
            className="w-12 h-9 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={shape.color}
            onChange={(e) => onShapeUpdate({ color: e.target.value })}
            className="flex-1 h-9 text-xs"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Opacity</Label>
        <Slider
          value={[shape.opacity * 100]}
          onValueChange={([value]) => onShapeUpdate({ opacity: value / 100 })}
          min={0}
          max={100}
          step={1}
          className="mt-2"
        />
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {Math.round(shape.opacity * 100)}%
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Rotation</Label>
        <Slider
          value={[(shape.rotation * 180) / Math.PI]}
          onValueChange={([value]) =>
            onShapeUpdate({ rotation: (value * Math.PI) / 180 })
          }
          min={0}
          max={360}
          step={1}
          className="mt-2"
        />
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {Math.round((shape.rotation * 180) / Math.PI)}°
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">X Position</Label>
          <Input
            type="number"
            value={Math.round(shape.x)}
            onChange={(e) => onShapeUpdate({ x: Number(e.target.value) })}
            className="h-9 text-xs mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Y Position</Label>
          <Input
            type="number"
            value={Math.round(shape.y)}
            onChange={(e) => onShapeUpdate({ y: Number(e.target.value) })}
            className="h-9 text-xs mt-1"
          />
        </div>
      </div>
    </Card>
  );
};
