import Navbar from "@/components/layout/Navbar";
import AudioPlayer from "@/components/player/AudioPlayer";
import MusicCard from "@/components/music/MusicCard";
import { useMusicStore } from "@/store/useMusicStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Library as LibIcon, Music } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Library() {
  const library = useMusicStore((state) => state.library);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLibrary = library.filter(
    (music) =>
      music.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      music.tags.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-32">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 animate-in fade-in slide-in-from-top-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
              <LibIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Minha Biblioteca</h1>
              <p className="text-muted-foreground">
                {library.length} faixas geradas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar faixas..."
                className="pl-9 bg-card border-white/10 focus:border-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20"
            >
              <Filter className="w-4 h-4 mr-2" /> Filtros
            </Button>
          </div>
        </div>

        {filteredLibrary.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in duration-700">
            {filteredLibrary.map((music) => (
              <MusicCard key={music.id} music={music} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Music className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">Nenhuma música encontrada</h3>
            <p className="max-w-xs mx-auto mt-2 text-muted-foreground">
              {searchTerm
                ? "Tente buscar por outro termo."
                : "Sua coleção está vazia. Comece a criar agora!"}
            </p>
            {!searchTerm && (
              <Link href="/">
                <Button className="mt-6 bg-primary hover:bg-primary/90">
                  Criar Música
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>

      <AudioPlayer />
    </div>
  );
}
