import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Video, Download } from "lucide-react";
import { toast } from "sonner";

interface VideoExportProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const VideoExport = ({ canvasRef }: VideoExportProps) => {
  const [duration, setDuration] = useState("5");
  const [quality, setQuality] = useState("1080p");
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("Canvas not found");
      return;
    }

    setIsRecording(true);
    setProgress(0);

    try {
      const stream = canvas.captureStream(60); // 60 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: quality === "4k" ? 20000000 : quality === "1080p" ? 10000000 : 5000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `gradient-background-${Date.now()}.webm`;
        link.click();
        URL.revokeObjectURL(url);
        
        setIsRecording(false);
        setProgress(0);
        toast.success("Video exported successfully!");
      };

      mediaRecorder.start();

      const durationMs = Number(duration) * 1000;
      const intervalMs = 100;
      let elapsed = 0;

      const progressInterval = setInterval(() => {
        elapsed += intervalMs;
        const newProgress = (elapsed / durationMs) * 100;
        setProgress(newProgress);

        if (elapsed >= durationMs) {
          clearInterval(progressInterval);
          mediaRecorder.stop();
        }
      }, intervalMs);
    } catch (error) {
      console.error("Video export error:", error);
      toast.error("Failed to export video");
      setIsRecording(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Video className="w-4 h-4 text-primary" />
        Video Export
      </h3>

      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Duration</Label>
          <Select value={duration} onValueChange={setDuration} disabled={isRecording}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 seconds</SelectItem>
              <SelectItem value="5">5 seconds</SelectItem>
              <SelectItem value="10">10 seconds</SelectItem>
              <SelectItem value="15">15 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Quality</Label>
          <Select value={quality} onValueChange={setQuality} disabled={isRecording}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="720p">720p (HD)</SelectItem>
              <SelectItem value="1080p">1080p (Full HD)</SelectItem>
              <SelectItem value="4k">4K (Ultra HD)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isRecording && (
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Recording... {Math.round(progress)}%
            </Label>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button
          onClick={handleExportVideo}
          disabled={isRecording}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isRecording ? (
            "Recording..."
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Video (WebM)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
