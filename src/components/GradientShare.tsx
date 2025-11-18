import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GradientShareProps {
  gradient: {
    angle: number;
    colors: string[];
    type: "linear" | "radial" | "conic";
    animationType: string;
    speed: number;
    direction: string;
    easing: string;
  };
}

export const GradientShare = ({ gradient }: GradientShareProps) => {
  const [copied, setCopied] = useState(false);

  const generateShareUrl = () => {
    const params = new URLSearchParams({
      colors: gradient.colors.join(","),
      angle: gradient.angle.toString(),
      type: gradient.type,
      animation: gradient.animationType,
      speed: gradient.speed.toString(),
      direction: gradient.direction,
      easing: gradient.easing,
    });
    return `${window.location.origin}?${params.toString()}`;
  };

  const handleCopy = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Share link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareUrl = generateShareUrl();

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-primary" />
        <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-bold">Share Gradient</h2>
      </div>
      <div className="flex gap-2">
        <Input
          value={shareUrl}
          readOnly
          className="flex-1 bg-panel border-border"
          onClick={(e) => e.currentTarget.select()}
        />
        <Button
          onClick={handleCopy}
          variant="default"
          size="icon"
          className="flex-shrink-0"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Share this link to let others use your gradient configuration
      </p>
    </section>
  );
};
