import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star } from "lucide-react";
import { useState, useEffect } from "react";

export interface GradientPreset {
  name: string;
  description?: string;
  colors: string[];
  angle: number;
  animationType: "rotate" | "slide-horizontal" | "slide-vertical" | "pulse" | "wave" | "diagonal" | "zoom" | "color-shift";
  speed: number;
  tags?: string[];
}

export const gradientPresets: GradientPreset[] = [
  { name: "Purple Dream", description: "Soft diagonal blend", colors: ["#ec4899", "#8b5cf6", "#3b82f6"], angle: 45, animationType: "rotate", speed: 1, tags: ["vibrant", "cool"] },
  { name: "Cool Blues", description: "Ocean-inspired tones", colors: ["#3b82f6", "#06b6d4", "#10b981"], angle: 135, animationType: "slide-horizontal", speed: 1.5, tags: ["cool", "minimal"] },
  { name: "Candy", description: "Sweet pink tones", colors: ["#f43f5e", "#ec4899", "#a855f7"], angle: 90, animationType: "pulse", speed: 2, tags: ["warm", "vibrant"] },
  { name: "Emerald", description: "Fresh green hues", colors: ["#10b981", "#14b8a6", "#06b6d4"], angle: 180, animationType: "wave", speed: 1, tags: ["cool", "brand-friendly"] },
  { name: "Peach", description: "Warm sunset glow", colors: ["#fb923c", "#f97316", "#ef4444"], angle: 225, animationType: "diagonal", speed: 1.2, tags: ["warm", "vibrant"] },
  { name: "Cosmic", description: "Deep space vibes", colors: ["#a855f7", "#6366f1", "#3b82f6"], angle: 270, animationType: "slide-vertical", speed: 1.8, tags: ["cool", "vibrant"] },
  { name: "Sunset Blaze", description: "Fiery evening sky", colors: ["#ff6b6b", "#ee5a6f", "#c44569"], angle: 60, animationType: "zoom", speed: 2.5, tags: ["warm", "vibrant"] },
  { name: "Ocean Deep", description: "Underwater mystery", colors: ["#0a4d68", "#088395", "#05bfdb"], angle: 120, animationType: "color-shift", speed: 1.3, tags: ["cool", "minimal"] },
  { name: "Forest Magic", description: "Natural greens", colors: ["#2d5016", "#3a7d44", "#96e072"], angle: 150, animationType: "rotate", speed: 0.8, tags: ["cool", "brand-friendly"] },
  { name: "Neon Nights", description: "Electric vibrancy", colors: ["#ff006e", "#8338ec", "#3a86ff"], angle: 200, animationType: "diagonal", speed: 2, tags: ["vibrant", "cool"] },
];

const filterTags = ["All", "Warm", "Cool", "Minimal", "Vibrant", "Brand-friendly"];

interface GradientPresetsProps {
  onSelectPreset: (preset: GradientPreset) => void;
}

export const GradientPresets = ({ onSelectPreset }: GradientPresetsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gradientPresetFavorites");
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(name)) {
      newFavorites.delete(name);
    } else {
      newFavorites.add(name);
    }
    setFavorites(newFavorites);
    localStorage.setItem("gradientPresetFavorites", JSON.stringify([...newFavorites]));
  };

  const filteredPresets = gradientPresets.filter((preset) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      preset.name.toLowerCase().includes(searchLower) ||
      preset.animationType.toLowerCase().includes(searchLower) ||
      preset.description?.toLowerCase().includes(searchLower) ||
      preset.colors.some((color) => color.toLowerCase().includes(searchLower));

    const matchesTag =
      activeTag === "All" ||
      preset.tags?.some((tag) => tag.toLowerCase() === activeTag.toLowerCase());

    return matchesSearch && matchesTag;
  });

  const favoritePresets = filteredPresets.filter((p) => favorites.has(p.name));
  const otherPresets = filteredPresets.filter((p) => !favorites.has(p.name));

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search presets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-panel border-border"
        />
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2">
        {filterTags.map((tag) => (
          <Badge
            key={tag}
            variant={activeTag === tag ? "default" : "outline"}
            className="cursor-pointer transition-colors"
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Favorites Section */}
      {favoritePresets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Star className="w-4 h-4 fill-primary text-primary" />
            Favorites
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {favoritePresets.map((preset) => (
              <PresetCard
                key={preset.name}
                preset={preset}
                isFavorite={true}
                onSelect={() => onSelectPreset(preset)}
                onToggleFavorite={(e) => toggleFavorite(preset.name, e)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Presets */}
      {filteredPresets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No presets found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {otherPresets.map((preset) => (
            <PresetCard
              key={preset.name}
              preset={preset}
              isFavorite={favorites.has(preset.name)}
              onSelect={() => onSelectPreset(preset)}
              onToggleFavorite={(e) => toggleFavorite(preset.name, e)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface PresetCardProps {
  preset: GradientPreset;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

const PresetCard = ({ preset, isFavorite, onSelect, onToggleFavorite }: PresetCardProps) => {
  return (
    <button
      onClick={onSelect}
      className="group relative overflow-hidden rounded-lg border border-border hover:border-primary transition-all"
    >
      <div className="p-3 flex items-center gap-3 bg-panel hover:bg-panel-hover transition-colors">
        {/* Mini gradient preview bar */}
        <div
          className="w-12 h-12 rounded-md flex-shrink-0 ring-1 ring-border"
          style={{
            background: `linear-gradient(${preset.angle}deg, ${preset.colors.join(", ")})`,
          }}
        />
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{preset.name}</div>
          {preset.description && (
            <div className="text-xs text-muted-foreground truncate">{preset.description}</div>
          )}
        </div>
        <button
          onClick={onToggleFavorite}
          className="p-1 hover:bg-background/50 rounded transition-colors"
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              isFavorite ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          />
        </button>
      </div>
    </button>
  );
};
