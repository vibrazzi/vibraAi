import Navbar from "@/components/layout/Navbar";
import AudioPlayer from "@/components/player/AudioPlayer";
import MusicCard from "@/components/music/MusicCard";
import { MOCK_GENERATED_MUSIC } from "@/utils/constants";
import { Badge } from "@/components/ui/badge";

export default function Explore() {
  const trendingMusic = [...MOCK_GENERATED_MUSIC, ...MOCK_GENERATED_MUSIC];

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-32">
        <div className="mb-10 animate-in fade-in slide-in-from-left-5">
          <h1 className="text-4xl font-bold mb-4">
            Explorar <span className="text-primary">Comunidade</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Descubra o que outros produtores estão criando com Suno AI.
          </p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide animate-in fade-in duration-700 delay-100">
          {[
            "🔥 Em Alta",
            "Techno",
            "House",
            "Trance",
            "Drum & Bass",
            "Ambient",
            "Cyberpunk",
            "Lo-Fi",
          ].map((tag, i) => (
            <Badge
              key={tag}
              variant="outline"
              className={`px-4 py-2 text-sm cursor-pointer transition-all hover:scale-105 active:scale-95 ${i === 0 ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "hover:bg-white/10 hover:text-white"}`}
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Melhores da Semana
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trendingMusic.map((music, i) => (
              <MusicCard key={`${music.id}-${i}`} music={music} />
            ))}
          </div>
        </div>
      </main>

      <AudioPlayer />
    </div>
  );
}
