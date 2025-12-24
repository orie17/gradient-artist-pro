import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Download, Palette, Settings, Trash2, Plus, GripVertical, Sparkles, Save } from "lucide-react";
import { toast } from "sonner";
import { VideoExport } from "./VideoExport";
import { GradientLibrary } from "./GradientLibrary";
import { ColorPaletteGenerator } from "./ColorPaletteGenerator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PropertiesPanelProps {
  gradient: {
    angle: number;
    colors: string[];
    type: "linear" | "radial" | "conic";
    animationType: "rotate" | "slide-horizontal" | "slide-vertical" | "pulse" | "wave" | "diagonal" | "zoom" | "color-shift";
    speed: number;
    direction: "forward" | "reverse" | "alternate";
    easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  };
  effects: {
    blur: number;
    noise: number;
  };
  canvasSize: { width: number; height: number };
  onGradientChange: (gradient: any) => void;
  onEffectsChange: (effects: any) => void;
  onCanvasSizeChange: (size: { width: number; height: number }) => void;
  onExport: (format: "png" | "jpeg") => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

interface SortableColorStopProps {
  color: string;
  index: number;
  onColorChange: (index: number, color: string) => void;
  onRemove: (index: number) => void;
  disabled: boolean;
}

const SortableColorStop = ({
  color,
  index,
  onColorChange,
  onRemove,
  disabled,
}: SortableColorStopProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `color-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-manipulation"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <Input
        type="color"
        value={color}
        onChange={(e) => onColorChange(index, e.target.value)}
        className="w-10 h-10 p-1 cursor-pointer"
      />
      <Input
        type="text"
        value={color}
        onChange={(e) => onColorChange(index, e.target.value)}
        className="flex-1 h-10 text-xs font-mono"
      />
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onRemove(index)}
        className="h-10 w-10 p-0 hover:bg-destructive/20 hover:text-destructive min-w-[40px]"
        disabled={disabled}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const PropertiesPanel = ({
  gradient,
  effects,
  canvasSize,
  onGradientChange,
  onEffectsChange,
  onCanvasSizeChange,
  onExport,
  canvasRef,
}: PropertiesPanelProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt((active.id as string).split("-")[1]);
      const newIndex = parseInt((over.id as string).split("-")[1]);

      const newColors = arrayMove(gradient.colors, oldIndex, newIndex);
      onGradientChange({ ...gradient, colors: newColors });
    }
  };

  const handleExport = (format: "png" | "jpeg") => {
    onExport(format);
    toast.success(`Exported as ${format.toUpperCase()}`, {
      description: "Your gradient has been downloaded",
    });
  };

  const handleAddColorStop = () => {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    onGradientChange({ ...gradient, colors: [...gradient.colors, randomColor] });
    toast.success("Color stop added");
  };

  const handleRemoveColorStop = (index: number) => {
    if (gradient.colors.length <= 2) {
      toast.error("Gradient needs at least 2 colors");
      return;
    }
    const newColors = gradient.colors.filter((_, i) => i !== index);
    onGradientChange({ ...gradient, colors: newColors });
    toast.success("Color stop removed");
  };

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...gradient.colors];
    newColors[index] = color;
    onGradientChange({ ...gradient, colors: newColors });
  };

  return (
    <Card className="w-full lg:w-72 h-full border-0 lg:border-l bg-panel p-4">
      <ScrollArea className="h-full">
        <div className="space-y-8">
          {/* Animation Style */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              Animation Style
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select
                  value={gradient.animationType}
                  onValueChange={(value: any) => onGradientChange({ ...gradient, animationType: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="rotate">Rotate</SelectItem>
                    <SelectItem value="slide-horizontal">Slide Horizontal</SelectItem>
                    <SelectItem value="slide-vertical">Slide Vertical</SelectItem>
                    <SelectItem value="pulse">Pulse</SelectItem>
                    <SelectItem value="wave">Wave</SelectItem>
                    <SelectItem value="diagonal">Diagonal</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="color-shift">Color Shift</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Animation Speed</Label>
                <Slider
                  value={[gradient.speed]}
                  onValueChange={([value]) => onGradientChange({ ...gradient, speed: value })}
                  min={0.5}
                  max={5}
                  step={0.1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Higher = faster</span>
                  <span>{gradient.speed.toFixed(1)}x</span>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Direction</Label>
                <Select
                  value={gradient.direction}
                  onValueChange={(value: any) => onGradientChange({ ...gradient, direction: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="forward">Forward</SelectItem>
                    <SelectItem value="reverse">Reverse</SelectItem>
                    <SelectItem value="alternate">Alternate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="text-xs text-muted-foreground cursor-help">Easing</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Controls how animation speeds up and slows down</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select
                  value={gradient.easing || "linear"}
                  onValueChange={(value: any) => onGradientChange({ ...gradient, easing: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="ease-in">Ease In</SelectItem>
                    <SelectItem value="ease-out">Ease Out</SelectItem>
                    <SelectItem value="ease-in-out">Ease In-Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Gradient Builder */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Palette className="w-4 h-4 text-primary" />
              Gradient Builder
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Style</Label>
                <Select
                  value={gradient.type}
                  onValueChange={(value: any) => onGradientChange({ ...gradient, type: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                    <SelectItem value="conic">Conic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {gradient.type === "linear" && (
                <div>
                  <Label className="text-xs text-muted-foreground">Direction</Label>
                  <Slider
                    value={[gradient.angle]}
                    onValueChange={([value]) => onGradientChange({ ...gradient, angle: value })}
                    min={0}
                    max={360}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1 text-right">
                    {gradient.angle}°
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Color Stops</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddColorStop}
                    className="h-7 px-2 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={gradient.colors.map((_, i) => `color-${i}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {gradient.colors.map((color, index) => (
                        <SortableColorStop
                          key={`color-${index}`}
                          color={color}
                          index={index}
                          onColorChange={handleColorChange}
                          onRemove={handleRemoveColorStop}
                          disabled={gradient.colors.length <= 2}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {/* Color Palette Generator */}
              <div className="pt-4 border-t border-border">
                <ColorPaletteGenerator
                  baseColor={gradient.colors[0]}
                  onApplyPalette={(colors) => onGradientChange({ ...gradient, colors })}
                />
              </div>
            </div>
          </div>

          {/* Effects */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Settings className="w-4 h-4 text-primary" />
              Effects
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Blur</Label>
                <Slider
                  value={[effects.blur]}
                  onValueChange={([value]) => onEffectsChange({ ...effects, blur: value })}
                  min={0}
                  max={20}
                  step={0.5}
                  className="mt-2"
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {effects.blur.toFixed(1)}px
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Noise</Label>
                <Slider
                  value={[effects.noise]}
                  onValueChange={([value]) => onEffectsChange({ ...effects, noise: value })}
                  min={0}
                  max={0.5}
                  step={0.01}
                  className="mt-2"
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {(effects.noise * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Gradient Library */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Save className="w-4 h-4 text-primary" />
              Gradient Library
            </h3>
            <GradientLibrary
              currentGradient={gradient}
              onLoadGradient={(saved) => {
                onGradientChange({
                  colors: saved.colors,
                  angle: saved.angle,
                  type: saved.type,
                  animationType: saved.animationType as any,
                  speed: saved.speed,
                  direction: saved.direction as any,
                });
                toast.success(`Loaded "${saved.name}"`);
              }}
              onSave={() => {}}
            />
          </div>

          {/* Export */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Download className="w-4 h-4 text-primary" />
              Export
            </h3>
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => handleExport("png")}
              >
                <Download className="w-4 h-4 mr-2" />
                Export PNG
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleExport("jpeg")}
              >
                <Download className="w-4 h-4 mr-2" />
                Export JPEG
              </Button>
              <VideoExport canvasRef={canvasRef} />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};
