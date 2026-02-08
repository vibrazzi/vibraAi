import Navbar from "@/components/layout/Navbar";
import GeneratorForm from "@/components/music/GeneratorForm";
import AudioPlayer from "@/components/player/AudioPlayer";
import { Zap, Music, AudioWaveform } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-primary/30 font-sans">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-900/20 rounded-full blur-[120px] animate-pulse-glow"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <main className="container mx-auto px-4 pt-28 pb-32 relative z-10">
        <div className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
            Crie o Futuro da <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-cyan-400 to-primary bg-size-[200%_auto] animate-gradient">
              Música Eletrônica
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Transforme suas ideias em tracks de estúdio. Techno, House, DnB e
            muito mais — gerados em segundos com IA de ponta.
          </p>
        </div>

        <GeneratorForm />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          {[
            {
              icon: AudioWaveform,
              title: "Qualidade de Estúdio",
              desc: "Áudio de alta fidelidade 44.1kHz estéreo pronto para streaming.",
            },
            {
              icon: Music,
              title: "Controle Total",
              desc: "Defina BPM, estilo, humor e até a letra da sua música.",
            },
            {
              icon: Zap,
              title: "Geração Instantânea",
              desc: "De texto para áudio em menos de 60 segundos com Suno v5.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <AudioPlayer />
    </div>
  );
}
