import { Button } from "@/components/ui/button";
import { Circle, Square, Waves, Sparkles, Layers, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ToolbarProps {
  onAddShape: (type: "circle" | "square" | "wave") => void;
}

export const Toolbar = ({ onAddShape }: ToolbarProps) => {
  return (
    <Card className="w-72 h-full border-r bg-panel p-4">
      <ScrollArea className="h-full">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Shapes
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                className="h-20 flex flex-col gap-2 hover:bg-panel-hover transition-colors"
                onClick={() => onAddShape("circle")}
              >
                <Circle className="w-6 h-6" />
                <span className="text-xs">Circle</span>
              </Button>
              <Button
                variant="secondary"
                className="h-20 flex flex-col gap-2 hover:bg-panel-hover transition-colors"
                onClick={() => onAddShape("square")}
              >
                <Square className="w-6 h-6" />
                <span className="text-xs">Square</span>
              </Button>
              <Button
                variant="secondary"
                className="h-20 flex flex-col gap-2 hover:bg-panel-hover transition-colors"
                onClick={() => onAddShape("wave")}
              >
                <Waves className="w-6 h-6" />
                <span className="text-xs">Wave</span>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Gradient Presets
            </h3>
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full h-12 bg-gradient-to-r from-gradient-1 to-gradient-2 hover:opacity-90 transition-opacity"
              >
                <span className="text-white font-medium">Sunset Vibes</span>
              </Button>
              <Button
                variant="secondary"
                className="w-full h-12 bg-gradient-to-r from-gradient-2 to-gradient-3 hover:opacity-90 transition-opacity"
              >
                <span className="text-white font-medium">Ocean Dream</span>
              </Button>
              <Button
                variant="secondary"
                className="w-full h-12 bg-gradient-to-r from-gradient-3 to-gradient-4 hover:opacity-90 transition-opacity"
              >
                <span className="text-white font-medium">Forest Mist</span>
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};
