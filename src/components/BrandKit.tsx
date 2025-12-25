import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Type, ImageIcon, Plus, X, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface BrandKitData {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo?: string;
  createdAt: number;
}

interface BrandKitProps {
  onApplyColors?: (colors: string[]) => void;
}

const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Playfair Display",
  "Merriweather",
  "Source Sans Pro",
  "Raleway",
  "Oswald",
  "Nunito",
];

const DEFAULT_BRAND_KIT: Omit<BrandKitData, "id" | "createdAt"> = {
  name: "My Brand",
  colors: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    accent: "#ec4899",
    background: "#0f172a",
    text: "#f8fafc",
  },
  fonts: {
    heading: "Montserrat",
    body: "Inter",
  },
};

export const BrandKit = ({ onApplyColors }: BrandKitProps) => {
  const [brandKits, setBrandKits] = useState<BrandKitData[]>([]);
  const [selectedKit, setSelectedKit] = useState<BrandKitData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKit, setEditingKit] = useState<BrandKitData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("brandKits");
    if (saved) {
      const kits = JSON.parse(saved);
      setBrandKits(kits);
      if (kits.length > 0) {
        setSelectedKit(kits[0]);
      }
    }
  }, []);

  const saveBrandKits = (kits: BrandKitData[]) => {
    localStorage.setItem("brandKits", JSON.stringify(kits));
    setBrandKits(kits);
  };

  const createNewKit = () => {
    const newKit: BrandKitData = {
      ...DEFAULT_BRAND_KIT,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    setEditingKit(newKit);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const editKit = (kit: BrandKitData) => {
    setEditingKit({ ...kit });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const saveKit = () => {
    if (!editingKit) return;

    const existingIndex = brandKits.findIndex((k) => k.id === editingKit.id);
    let updatedKits: BrandKitData[];

    if (existingIndex >= 0) {
      updatedKits = [...brandKits];
      updatedKits[existingIndex] = editingKit;
    } else {
      updatedKits = [...brandKits, editingKit];
    }

    saveBrandKits(updatedKits);
    setSelectedKit(editingKit);
    setIsEditing(false);
    setEditingKit(null);
    setIsDialogOpen(false);
    toast.success("Brand kit saved!");
  };

  const deleteKit = (id: string) => {
    const updatedKits = brandKits.filter((k) => k.id !== id);
    saveBrandKits(updatedKits);
    if (selectedKit?.id === id) {
      setSelectedKit(updatedKits[0] || null);
    }
    toast.success("Brand kit deleted");
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingKit) return;

    if (file.size > 500 * 1024) {
      toast.error("Logo must be under 500KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setEditingKit({
        ...editingKit,
        logo: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const applyBrandColors = () => {
    if (!selectedKit || !onApplyColors) return;
    const colors = [
      selectedKit.colors.primary,
      selectedKit.colors.secondary,
      selectedKit.colors.accent,
    ];
    onApplyColors(colors);
    toast.success("Brand colors applied to gradient!");
  };

  const updateEditingColor = (key: keyof BrandKitData["colors"], value: string) => {
    if (!editingKit) return;
    setEditingKit({
      ...editingKit,
      colors: { ...editingKit.colors, [key]: value },
    });
  };

  const updateEditingFont = (key: keyof BrandKitData["fonts"], value: string) => {
    if (!editingKit) return;
    setEditingKit({
      ...editingKit,
      fonts: { ...editingKit.fonts, [key]: value },
    });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Brand Kit
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Save brand colors, fonts, and logo for consistent exports
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Kit Selection */}
        <div className="flex gap-2">
          <Select
            value={selectedKit?.id || ""}
            onValueChange={(id) => {
              const kit = brandKits.find((k) => k.id === id);
              if (kit) setSelectedKit(kit);
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a brand kit" />
            </SelectTrigger>
            <SelectContent>
              {brandKits.map((kit) => (
                <SelectItem key={kit.id} value={kit.id}>
                  {kit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={createNewKit}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Selected Kit Preview */}
        {selectedKit && (
          <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center justify-between">
              <span className="font-medium">{selectedKit.name}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => editKit(selectedKit)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => deleteKit(selectedKit.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Colors</Label>
              <div className="flex gap-2">
                {Object.entries(selectedKit.colors).map(([key, color]) => (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <div
                      className="w-8 h-8 rounded-md border border-border"
                      style={{ backgroundColor: color }}
                      title={key}
                    />
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {key.slice(0, 3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fonts */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Fonts</Label>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Heading:</span>{" "}
                  <span style={{ fontFamily: selectedKit.fonts.heading }}>
                    {selectedKit.fonts.heading}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Body:</span>{" "}
                  <span style={{ fontFamily: selectedKit.fonts.body }}>
                    {selectedKit.fonts.body}
                  </span>
                </div>
              </div>
            </div>

            {/* Logo Preview */}
            {selectedKit.logo && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Logo</Label>
                <img
                  src={selectedKit.logo}
                  alt="Brand logo"
                  className="h-10 object-contain"
                />
              </div>
            )}

            {/* Apply Button */}
            <Button onClick={applyBrandColors} className="w-full">
              <Palette className="w-4 h-4 mr-2" />
              Apply Brand Colors to Gradient
            </Button>
          </div>
        )}

        {brandKits.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Palette className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No brand kits yet</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={createNewKit}>
              Create your first brand kit
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingKit && brandKits.find((k) => k.id === editingKit.id)
                  ? "Edit Brand Kit"
                  : "Create Brand Kit"}
              </DialogTitle>
            </DialogHeader>

            {editingKit && (
              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label>Brand Name</Label>
                  <Input
                    value={editingKit.name}
                    onChange={(e) =>
                      setEditingKit({ ...editingKit, name: e.target.value })
                    }
                    placeholder="My Brand"
                  />
                </div>

                {/* Colors */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Brand Colors
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(editingKit.colors).map(([key, color]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs capitalize">{key}</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={color}
                            onChange={(e) =>
                              updateEditingColor(
                                key as keyof BrandKitData["colors"],
                                e.target.value
                              )
                            }
                            className="w-12 h-9 p-1 cursor-pointer"
                          />
                          <Input
                            value={color}
                            onChange={(e) =>
                              updateEditingColor(
                                key as keyof BrandKitData["colors"],
                                e.target.value
                              )
                            }
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fonts */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Fonts
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Heading</Label>
                      <Select
                        value={editingKit.fonts.heading}
                        onValueChange={(v) => updateEditingFont("heading", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((font) => (
                            <SelectItem key={font} value={font}>
                              <span style={{ fontFamily: font }}>{font}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Body</Label>
                      <Select
                        value={editingKit.fonts.body}
                        onValueChange={(v) => updateEditingFont("body", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((font) => (
                            <SelectItem key={font} value={font}>
                              <span style={{ fontFamily: font }}>{font}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Logo (optional)
                  </Label>
                  <div className="flex gap-3 items-center">
                    {editingKit.logo ? (
                      <div className="relative">
                        <img
                          src={editingKit.logo}
                          alt="Logo preview"
                          className="h-16 object-contain rounded border border-border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6"
                          onClick={() =>
                            setEditingKit({ ...editingKit, logo: undefined })
                          }
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Max 500KB, PNG or SVG recommended</p>
                </div>

                {/* Save Button */}
                <Button onClick={saveKit} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Brand Kit
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
