import { useMusicStore } from "@/store/useMusicStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
  Shuffle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Waveform from "@/components/player/Waveform";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AudioPlayer() {
  const { currentTrack, isPlaying, setIsPlaying } = useMusicStore();
  const [volume, setVolume] = useState([80]);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentTrack) return null;

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-t border-white/10 shadow-2xl overflow-hidden",
        isExpanded
          ? "h-[calc(100vh-4rem)] top-16 bg-background/95 backdrop-blur-2xl flex flex-col"
          : "h-24 bg-black/80 backdrop-blur-lg",
      )}
    >
      {!isExpanded && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5">
          <div className="h-full bg-primary w-1/3 animate-pulse"></div>
        </div>
      )}
      <div
        className={cn(
          "container mx-auto px-4 h-full flex transition-all duration-500",
          isExpanded
            ? "flex-col py-8 items-center justify-center gap-8"
            : "items-center justify-between",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-4 transition-all",
            isExpanded ? "flex-col text-center" : "flex-row w-1/3",
          )}
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-lg shadow-2xl transition-all duration-500",
              isExpanded ? "w-64 h-64 md:w-96 md:h-96" : "w-14 h-14",
            )}
          >
            <img
              src={currentTrack.image_url}
              alt={currentTrack.title}
              className={cn(
                "w-full h-full object-cover",
                isPlaying && "animate-pulse-glow",
              )}
            />
          </div>
          <div className="min-w-0">
            <h4
              className={cn(
                "font-bold text-white truncate",
                isExpanded ? "text-3xl mt-4" : "text-sm",
              )}
            >
              {currentTrack.title}
            </h4>
            <p
              className={cn(
                "text-muted-foreground truncate",
                isExpanded ? "text-lg" : "text-xs",
              )}
            >
              {currentTrack.tags}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col items-center gap-2",
            isExpanded
              ? "w-full max-w-3xl flex-1 justify-center"
              : "flex-1 max-w-xl",
          )}
        >
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-white"
            >
              <Shuffle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-primary"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </Button>
            <Button
              onClick={togglePlay}
              size="icon"
              className={cn(
                "rounded-full transition-all hover:scale-105 shadow-lg shadow-primary/20",
                isExpanded ? "w-16 h-16" : "w-12 h-12",
              )}
            >
              {isPlaying ? (
                <Pause
                  className={cn(
                    "fill-current",
                    isExpanded ? "w-8 h-8" : "w-6 h-6",
                  )}
                />
              ) : (
                <Play
                  className={cn(
                    "fill-current ml-1",
                    isExpanded ? "w-8 h-8" : "w-6 h-6",
                  )}
                />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-primary"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-white"
            >
              <Repeat className="w-5 h-5" />
            </Button>
          </div>

          <div className="w-full h-12 flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono">
              1:24
            </span>
            <Waveform
              audioUrl={currentTrack.audio_url}
              height={isExpanded ? 60 : 30}
              waveColor="rgba(255,255,255,0.3)"
              progressColor="#8B5CF6"
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground font-mono">
              {Math.floor(currentTrack.duration / 60)}:
              {String(currentTrack.duration % 60).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div
          className={cn(
            "flex items-center gap-4 justify-end",
            isExpanded ? "w-full max-w-xs" : "w-1/3 hidden md:flex",
          )}
        >
          <div className="flex items-center gap-2 flex-1">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
            <Slider
              defaultValue={volume}
              max={100}
              step={1}
              onValueChange={setVolume}
              className="w-24"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown /> : <ChevronUp />}
          </Button>
        </div>
      </div>
    </div>
  );
}
