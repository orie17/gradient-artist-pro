import { Palette } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GradientComparison } from "@/components/GradientComparison";

interface HeaderProps {
  currentGradient?: any;
  history?: any[];
  savedGradients?: Array<{ name: string; gradient: any }>;
}

export const Header = ({ currentGradient, history = [], savedGradients = [] }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-[clamp(1rem,3vw,1.5rem)] font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              GradientGPT
            </h1>
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
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
