import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GradientPresets, GradientPreset } from "@/components/GradientPresets";
import { Sparkles } from "lucide-react";

interface ToolbarProps {
  onSelectPreset: (preset: GradientPreset) => void;
}

export const Toolbar = ({ onSelectPreset }: ToolbarProps) => {
  return (
    <Card className="w-72 h-full border-r bg-panel p-4 hidden md:block">
      <ScrollArea className="h-full">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Gradient Presets
            </h3>
            <div className="min-h-[600px]">
              <GradientPresets onSelectPreset={onSelectPreset} />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};
