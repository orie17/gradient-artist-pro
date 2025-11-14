import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, FolderOpen, Trash2, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SavedGradient {
  id: string;
  name: string;
  colors: string[];
  angle: number;
  type: "linear" | "radial" | "conic";
  animationType: string;
  speed: number;
  direction: string;
  timestamp: number;
}

interface GradientLibraryProps {
  currentGradient: {
    colors: string[];
    angle: number;
    type: "linear" | "radial" | "conic";
    animationType: string;
    speed: number;
    direction: string;
  };
  onLoadGradient: (gradient: SavedGradient) => void;
}

export const GradientLibrary = ({ currentGradient, onLoadGradient }: GradientLibraryProps) => {
  const [savedGradients, setSavedGradients] = useState<SavedGradient[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [gradientName, setGradientName] = useState("");

  useEffect(() => {
    loadGradients();
  }, []);

  const loadGradients = () => {
    const stored = localStorage.getItem("gradient-library");
    if (stored) {
      setSavedGradients(JSON.parse(stored));
    }
  };

  const saveGradient = () => {
    if (!gradientName.trim()) {
      toast.error("Please enter a name for your gradient");
      return;
    }

    const newGradient: SavedGradient = {
      id: Date.now().toString(),
      name: gradientName,
      ...currentGradient,
      timestamp: Date.now(),
    };

    const updated = [...savedGradients, newGradient];
    setSavedGradients(updated);
    localStorage.setItem("gradient-library", JSON.stringify(updated));
    
    toast.success("Gradient saved to library");
    setSaveDialogOpen(false);
    setGradientName("");
  };

  const deleteGradient = (id: string) => {
    const updated = savedGradients.filter(g => g.id !== id);
    setSavedGradients(updated);
    localStorage.setItem("gradient-library", JSON.stringify(updated));
    toast.success("Gradient deleted");
  };

  const exportLibrary = () => {
    const dataStr = JSON.stringify(savedGradients, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gradient-library.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Library exported");
  };

  const importLibrary = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setSavedGradients(imported);
        localStorage.setItem("gradient-library", JSON.stringify(imported));
        toast.success("Library imported");
      } catch (error) {
        toast.error("Invalid library file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Current
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={exportLibrary}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          asChild
        >
          <label>
            <Upload className="w-4 h-4 mr-2" />
            Import
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={importLibrary}
            />
          </label>
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {savedGradients.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No saved gradients yet
            </div>
          ) : (
            savedGradients.map((gradient) => (
              <div
                key={gradient.id}
                className="flex items-center gap-2 p-2 rounded border border-border hover:border-primary transition-colors group"
              >
                <div
                  className="w-12 h-12 rounded flex-shrink-0"
                  style={{
                    background: `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(", ")})`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {gradient.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(gradient.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onLoadGradient(gradient)}
                    className="h-8 w-8 p-0"
                  >
                    <FolderOpen className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteGradient(gradient.id)}
                    className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Gradient</DialogTitle>
            <DialogDescription>
              Give your gradient a name to save it to your library
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gradient-name">Gradient Name</Label>
              <Input
                id="gradient-name"
                value={gradientName}
                onChange={(e) => setGradientName(e.target.value)}
                placeholder="e.g., My Awesome Gradient"
                onKeyDown={(e) => e.key === "Enter" && saveGradient()}
              />
            </div>
            <div
              className="h-24 rounded-lg"
              style={{
                background: `linear-gradient(${currentGradient.angle}deg, ${currentGradient.colors.join(", ")})`,
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveGradient}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
