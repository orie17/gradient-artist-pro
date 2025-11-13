import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const Header = () => {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gradient-1 to-gradient-2 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gradient-1 to-gradient-2 bg-clip-text text-transparent">
          GradientGPT
        </h1>
      </div>
      <div className="text-sm text-muted-foreground">
        Professional Animated Background Generator
      </div>
    </header>
  );
};
