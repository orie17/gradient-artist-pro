import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Palette, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ColorExtractorProps {
  onApplyColors: (colors: string[]) => void;
}

// Simple color quantization using k-means clustering
const extractColors = (imageData: ImageData, numColors: number): string[] => {
  const pixels: number[][] = [];
  const data = imageData.data;
  
  // Sample pixels (every 10th pixel for performance)
  for (let i = 0; i < data.length; i += 40) {
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  // Simple k-means clustering
  let centroids: number[][] = [];
  
  // Initialize centroids randomly
  for (let i = 0; i < numColors; i++) {
    const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
    centroids.push([...randomPixel]);
  }

  // Run k-means iterations
  for (let iter = 0; iter < 10; iter++) {
    const clusters: number[][][] = Array(numColors).fill(0).map(() => []);
    
    // Assign pixels to nearest centroid
    pixels.forEach(pixel => {
      let minDist = Infinity;
      let clusterIndex = 0;
      
      centroids.forEach((centroid, i) => {
        const dist = Math.sqrt(
          Math.pow(pixel[0] - centroid[0], 2) +
          Math.pow(pixel[1] - centroid[1], 2) +
          Math.pow(pixel[2] - centroid[2], 2)
        );
        if (dist < minDist) {
          minDist = dist;
          clusterIndex = i;
        }
      });
      
      clusters[clusterIndex].push(pixel);
    });

    // Update centroids
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[0];
      const sum = cluster.reduce((acc, pixel) => [
        acc[0] + pixel[0],
        acc[1] + pixel[1],
        acc[2] + pixel[2]
      ], [0, 0, 0]);
      return [
        Math.round(sum[0] / cluster.length),
        Math.round(sum[1] / cluster.length),
        Math.round(sum[2] / cluster.length)
      ];
    });
  }

  // Convert to hex colors
  return centroids.map(rgb => {
    const hex = rgb.map(v => {
      const h = v.toString(16);
      return h.length === 1 ? '0' + h : h;
    }).join('');
    return `#${hex}`;
  });
};

export const ColorExtractor = ({ onApplyColors }: ColorExtractorProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [numColors, setNumColors] = useState<number>(5);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setSelectedImage(e.target?.result as string);
        processImage(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const processImage = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize image for faster processing
    const maxSize = 400;
    let width = img.width;
    let height = img.height;

    if (width > height && width > maxSize) {
      height = (height * maxSize) / width;
      width = maxSize;
    } else if (height > maxSize) {
      width = (width * maxSize) / height;
      height = maxSize;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const colors = extractColors(imageData, numColors);
    setExtractedColors(colors);
    toast.success(`Extracted ${colors.length} colors from image`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setSelectedImage(event.target?.result as string);
          processImage(img);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = () => {
    if (extractedColors.length === 0) {
      toast.error("No colors extracted yet");
      return;
    }
    onApplyColors(extractedColors);
    toast.success("Applied color palette to gradient");
  };

  const handleClear = () => {
    setSelectedImage(null);
    setExtractedColors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Color Extractor</h3>
          </div>
          {selectedImage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 hover:bg-destructive/20 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="numColors" className="text-sm text-muted-foreground">
              Number of Colors
            </Label>
            <Select
              value={numColors.toString()}
              onValueChange={(value) => {
                setNumColors(parseInt(value));
                if (selectedImage && canvasRef.current) {
                  const ctx = canvasRef.current.getContext('2d');
                  if (ctx) {
                    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
                    const colors = extractColors(imageData, parseInt(value));
                    setExtractedColors(colors);
                  }
                }
              }}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} colors
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedImage ? (
              <div className="space-y-2">
                <img
                  src={selectedImage}
                  alt="Uploaded"
                  className="max-h-48 mx-auto rounded-lg"
                />
                <p className="text-sm text-muted-foreground">Click or drag to replace</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click or drag image here to extract colors
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WEBP
                </p>
              </div>
            )}
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <canvas ref={canvasRef} className="hidden" />

          {extractedColors.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Extracted Colors</Label>
              <div className="grid grid-cols-3 gap-2">
                {extractedColors.map((color, index) => (
                  <div key={index} className="space-y-1">
                    <div
                      className="h-16 rounded-lg border border-border shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-center font-mono text-muted-foreground">
                      {color}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleApply}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Palette className="w-4 h-4 mr-2" />
                Apply to Gradient
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
