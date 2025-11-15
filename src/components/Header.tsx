import { Sparkles } from "lucide-react";

export const Header = () => {
  return (
    <header className="h-14 md:h-16 border-b border-border bg-card flex items-center justify-between px-3 md:px-6">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-gradient-1 to-gradient-2 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-white" />
        </div>
        <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-gradient-1 to-gradient-2 bg-clip-text text-transparent">
          GradientGPT
        </h1>
      </div>
      <div className="text-xs md:text-sm text-muted-foreground hidden sm:block">
        Professional Animated Background Generator
      </div>
    </header>
  );
};
