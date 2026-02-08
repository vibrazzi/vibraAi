import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";

interface WaveformProps {
  audioUrl: string;
  onPlay?: () => void;
  onPause?: () => void;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  className?: string;
  interactive?: boolean;
}

export default function Waveform({
  audioUrl,
  height = 40,
  waveColor = "rgba(255, 255, 255, 0.2)",
  progressColor = "#8B5CF6",
  className,
  interactive = true,
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: waveColor,
      progressColor: progressColor,
      height: height,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      cursorWidth: 0,
      url: audioUrl,
      interact: interactive,
      normalize: true,
    });

    wavesurfer.current.on("ready", () => {
      setIsReady(true);
    });

    wavesurfer.current.on("finish", () => {
      setIsPlaying(false);
    });

    wavesurfer.current.on("play", () => setIsPlaying(true));
    wavesurfer.current.on("pause", () => setIsPlaying(false));

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl, height, waveColor, progressColor, interactive]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  return (
    <div className={cn("relative group w-full", className)}>
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full bg-white/5 animate-pulse rounded-md" />
        </div>
      )}

      <div
        ref={containerRef}
        className={cn(
          "w-full transition-opacity duration-500",
          isReady ? "opacity-100" : "opacity-0",
        )}
      />

      <button
        onClick={togglePlay}
        className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/10 hover:bg-primary hover:border-primary transition-all">
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white fill-current" />
          ) : (
            <Play className="w-5 h-5 text-white fill-current ml-1" />
          )}
        </div>
      </button>
    </div>
  );
}
