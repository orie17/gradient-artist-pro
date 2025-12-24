import { Palette, Eye, Accessibility } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GradientComparison } from "@/components/GradientComparison";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderProps {
  currentGradient?: any;
  history?: any[];
  savedGradients?: Array<{ name: string; gradient: any }>;
  reduceMotion?: boolean;
  onReduceMotionChange?: (value: boolean) => void;
}

export const Header = ({ 
  currentGradient, 
  history = [], 
  savedGradients = [],
  reduceMotion = false,
  onReduceMotionChange,
}: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                GradientGPT
              </h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block leading-none">
                Animated gradient studio for developers, designers, and creators
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {currentGradient && (
            <GradientComparison
              currentGradient={currentGradient}
              history={history}
              savedGradients={savedGradients}
            />
          )}
          
          {/* Accessibility Menu */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Accessibility className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Accessibility</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduce-motion" className="text-sm text-muted-foreground cursor-pointer">
                    Reduce Motion
                  </Label>
                  <Switch
                    id="reduce-motion"
                    checked={reduceMotion}
                    onCheckedChange={onReduceMotionChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Slows down animations for accessibility
                </p>
              </div>
            </PopoverContent>
          </Popover>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
