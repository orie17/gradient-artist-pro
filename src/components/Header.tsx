import { Sparkles } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Header = () => {
  return (
    <header className="h-14 md:h-16 border-b border-border bg-card flex items-center justify-between px-3 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-2 md:gap-4">
        <SidebarTrigger className="min-h-[44px] min-w-[44px]" />
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-gradient-1 to-gradient-2 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-gradient-1 to-gradient-2 bg-clip-text text-transparent">
            GradientGPT
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="text-xs md:text-sm text-muted-foreground hidden sm:block">
          Professional Animated Background Generator
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};
