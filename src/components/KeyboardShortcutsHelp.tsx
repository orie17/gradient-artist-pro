import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { keys: ["Ctrl", "E"], description: "Export gradient as PNG" },
  { keys: ["Ctrl", "S"], description: "Open save dialog" },
  { keys: ["Ctrl", "Z"], description: "Undo last change" },
  { keys: ["Ctrl", "Y"], description: "Redo last change" },
  { keys: ["Ctrl", "Shift", "Z"], description: "Redo (alternative)" },
  { keys: ["Ctrl", "K"], description: "Open comparison view" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
  { keys: ["1"], description: "Rotate animation" },
  { keys: ["2"], description: "Slide horizontal animation" },
  { keys: ["3"], description: "Slide vertical animation" },
  { keys: ["4"], description: "Pulse animation" },
  { keys: ["5"], description: "Wave animation" },
  { keys: ["6"], description: "Diagonal animation" },
  { keys: ["7"], description: "Zoom animation" },
  { keys: ["8"], description: "Color shift animation" },
];

export const KeyboardShortcutsHelp = ({ open, onOpenChange }: KeyboardShortcutsHelpProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            <DialogTitle className="text-foreground">Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground mb-3">General</h3>
            {shortcuts.slice(0, 7).map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, i) => (
                    <kbd
                      key={i}
                      className="px-2 py-1 text-xs font-semibold bg-muted text-foreground border border-border rounded"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground mb-3">Animation Types</h3>
            {shortcuts.slice(7).map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, i) => (
                    <kbd
                      key={i}
                      className="px-2 py-1 text-xs font-semibold bg-muted text-foreground border border-border rounded"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Note: Use <kbd className="px-1.5 py-0.5 text-xs bg-muted border border-border rounded">Cmd</kbd> instead of <kbd className="px-1.5 py-0.5 text-xs bg-muted border border-border rounded">Ctrl</kbd> on macOS
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
