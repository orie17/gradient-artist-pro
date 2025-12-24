import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Wand2 } from "lucide-react";
import { ColorExtractor } from "./ColorExtractor";
import { ColorHarmonyAnalyzer } from "./ColorHarmonyAnalyzer";
import { GradientRandomizer } from "./GradientRandomizer";

interface AdvancedToolsSectionProps {
  gradient: {
    colors: string[];
    [key: string]: any;
  };
  effects: {
    blur: number;
    noise: number;
  };
  onGradientChange: (gradient: any) => void;
  onEffectsChange: (effects: any) => void;
}

export const AdvancedToolsSection = ({
  gradient,
  effects,
  onGradientChange,
  onEffectsChange,
}: AdvancedToolsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="p-4">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              <div className="text-left">
                <h2 className="text-lg font-bold text-foreground">Advanced Tools</h2>
                <p className="text-sm text-muted-foreground">
                  Color extraction, harmony, randomization, and effects
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-6 space-y-6">
          {/* Color Extractor */}
          <ColorExtractor
            onApplyColors={(colors) => {
              onGradientChange({ ...gradient, colors });
            }}
          />

          {/* Color Harmony Analyzer */}
          <ColorHarmonyAnalyzer
            colors={gradient.colors}
            onApplySuggestion={(colors) => {
              onGradientChange({ ...gradient, colors });
            }}
          />

          {/* Smart Randomizer */}
          <GradientRandomizer
            onApplyGradient={(colors) => {
              onGradientChange({ ...gradient, colors });
            }}
            currentColors={gradient.colors}
          />

          {/* Effects */}
          <Card className="p-6 bg-card/50">
            <h3 className="text-lg font-semibold mb-4">Effects</h3>
            <div className="space-y-6">
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
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Subtle blur can create a soft glow effect</span>
                  <span>{effects.blur.toFixed(1)}px</span>
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
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Adds texture to the gradient</span>
                  <span>{(effects.noise * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </Card>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
