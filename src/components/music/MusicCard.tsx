import { type GeneratedMusic } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download, Heart, MoreVertical, Share2, Clock, Music } from "lucide-react";
import Waveform from "@/components/player/Waveform";
import { useState } from "react";
import { useMusicStore } from "@/store/useMusicStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MusicCardProps {
  music: GeneratedMusic;
}

export default function MusicCard({ music }: MusicCardProps) {
  const { currentTrack, isPlaying, setCurrentTrack, setIsPlaying } = useMusicStore();
  const [isLiked, setIsLiked] = useState(false);

  const isCurrent = currentTrack?.id === music.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;

  const handlePlay = () => {
    if (isCurrent) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(music);
    }
  };

  const handleDownload = async () => {
    if (!music.audio_url) {
      toast.error("URL de áudio não disponível.");
      return;
    }
    try {
      toast.loading(`Baixando: ${music.title}...`, { id: 'download' });
      const response = await fetch(music.audio_url);
      if (!response.ok) throw new Error('Falha no download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = music.title.replace(/[^a-zA-Z0-9À-ÿ\s\-_]/g, '').trim() || 'musica';
      a.download = `${fileName}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Download concluído: ${music.title}`, { id: 'download' });
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Falha no download. Tente novamente.`, { id: 'download' });
    }
  };

  return (
    <div className="group relative bg-card/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      <div className="flex flex-col md:flex-row h-full">
        <div className="relative w-full md:w-48 h-48 md:h-auto shrink-0 overflow-hidden">
          <img
            src={music.image_url}
            alt={music.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="w-14 h-14 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform backdrop-blur-sm">
              {isCurrentlyPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </div>
          </button>
        </div>

        <div className="flex flex-col flex-1 p-5 gap-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors line-clamp-1">{music.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1 flex items-center gap-2 mt-1">
                 <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
                 {music.tags}
              </p>
            </div>

            <div className="flex items-center gap-1">
               <Button
                 variant="ghost"
                 size="icon"
                 className={cn("hover:text-red-500 hover:bg-red-500/10", isLiked && "text-red-500")}
                 onClick={() => setIsLiked(!isLiked)}
               >
                 <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
               </Button>

               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="hover:text-white hover:bg-white/10">
                     <MoreVertical className="w-5 h-5" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48 bg-card border-white/10 text-white">
                   <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
                     <Download className="w-4 h-4 mr-2" /> Download MP3
                   </DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer">
                     <Share2 className="w-4 h-4 mr-2" /> Compartilhar
                   </DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer">
                     <Music className="w-4 h-4 mr-2" /> Criar Remix
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 flex items-center w-full py-2">
            <Waveform
              audioUrl={music.audio_url}
              height={40}
              waveColor="#4b5563"
              progressColor="#06b6d4"
              interactive={false}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-white/5 pt-3 mt-auto">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.floor(music.duration / 60)}:{String(music.duration % 60).padStart(2, '0')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase tracking-wider">
                {music.model_name}
              </span>
            </div>
            <span>{new Date(music.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
