import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mic2, Zap, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMusicStore } from "@/store/useMusicStore";
import { ELECTRONIC_GENRES, type GeneratedMusic } from "@/utils/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generateMusic, getMusicStatus } from "@/services/api";
import { useLocation } from "wouter";

const formSchema = z.object({
  prompt: z.string().min(3, "A descrição é muito curta").max(1000),
  lyrics: z.string().optional(),
  title: z.string().optional(),
  isInstrumental: z.boolean(),
  modelVersion: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface SunoTrack {
  id: string;
  title?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  duration?: number;
  tags?: string;
}

interface MusicPayload {
  model: string;
  instrumental: boolean;
  customMode?: boolean;
  prompt?: string;
  title?: string;
  style?: string;
}

export default function GeneratorForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("simple");
  const { addMusic } = useMusicStore();
  const pollingRef = useRef<number | null>(null);
  const pollingErrorCountRef = useRef(0);
  const [, navigate] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      lyrics: "",
      title: "",
      isInstrumental: false,
      modelVersion: "v5",
    },
  });

  const isInstrumental = form.watch("isInstrumental");

  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles((prev) => prev.filter((s) => s !== style));
    } else {
      if (selectedStyles.length >= 5) {
        toast.error("Máximo de 5 estilos permitidos");
        return;
      }
      setSelectedStyles((prev) => [...prev, style]);
    }
  };

  const startPolling = async (
    taskId: string,
    title: string,
    modelVersion: string,
  ) => {
    let attempts = 0;
    const maxAttempts = 60;
    pollingErrorCountRef.current = 0;
    const maxConsecutiveErrors = 5;

    pollingRef.current = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setIsGenerating(false);
        toast.error(
          "Tempo limite excedido. Verifique sua biblioteca mais tarde.",
        );
        return;
      }

      try {
        const statusData = await getMusicStatus(taskId);
        console.log("Polling status:", statusData);
        pollingErrorCountRef.current = 0;

        const status = statusData.data?.status;

        if (status === "SUCCESS" || status === "FIRST_SUCCESS") {
          if (pollingRef.current) clearInterval(pollingRef.current);

          const sunoData = statusData.data?.response?.sunoData || [];

          if (sunoData.length > 0) {
            sunoData.forEach((track: SunoTrack) => {
              const newMusic: GeneratedMusic = {
                id: track.id,
                title: track.title || title || "Faixa Gerada",
                image_url: track.imageUrl || import.meta.env.VITE_IMAGE_URL,
                audio_url: track.audioUrl || "",
                video_url: track.videoUrl,
                duration: track.duration || 180,
                tags: track.tags || "Electronic",
                status: "complete",
                created_at: new Date().toISOString(),
                model_name: modelVersion,
              };

              addMusic(newMusic);
            });

            toast.success(
              "Música gerada com sucesso! Redirecionando para a Biblioteca...",
              {
                duration: 4000,
                action: {
                  label: "Ver Biblioteca",
                  onClick: () => navigate("/library"),
                },
              },
            );

            setTimeout(() => navigate("/library"), 2000);
          } else {
            toast.error("Geração concluída mas sem dados de áudio.");
          }

          setIsGenerating(false);
        } else if (
          status === "GENERATE_AUDIO_FAILED" ||
          status === "CREATE_TASK_FAILED"
        ) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setIsGenerating(false);
          toast.error(`Falha na geração: ${status}. Tente novamente.`, {
            duration: 6000,
          });
        }
      } catch (error) {
        console.error("Polling error", error);
        pollingErrorCountRef.current++;

        if (pollingErrorCountRef.current >= maxConsecutiveErrors) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setIsGenerating(false);
          toast.error(
            "Erro de conexão persistente. A geração pode ter falhado. Verifique sua biblioteca.",
            {
              duration: 8000,
              action: {
                label: "Ver Biblioteca",
                onClick: () => navigate("/library"),
              },
            },
          );
        }
      }
    }, 5000);
  };

  const onSubmit = async (values: FormValues) => {
    setIsGenerating(true);
    const loadingToast = toast.loading("Enviando para Suno AI...", {
      description: "Aguarde o início do processo...",
    });

    try {
      const payload: MusicPayload = {
        model: values.modelVersion.toUpperCase(),
        instrumental: values.isInstrumental,
      };

      if (activeTab === "simple") {
        payload.customMode = false;

        const styleString = selectedStyles.join(", ");
        payload.prompt = styleString
          ? `${styleString} style. ${values.prompt}`
          : values.prompt;

        delete payload.title;
        delete payload.style;
      } else {
        payload.customMode = true;
        payload.title = values.title || "VibraAi Track";
        payload.prompt = values.lyrics || "";

        const styleString = selectedStyles.join(", ");
        const userStyleDesc = values.prompt;
        payload.style = styleString
          ? `${styleString}, ${userStyleDesc}`
          : userStyleDesc;
      }

      console.log("Payload:", payload);

      const result = await generateMusic(payload);

      toast.dismiss(loadingToast);

      if (result && result.data && result.data.taskId) {
        toast.info("Geração iniciada! Isso pode levar alguns minutos.", {
          duration: 5000,
        });

        startPolling(
          result.data.taskId,
          values.title || "Nova Música",
          values.modelVersion,
        );
      } else {
        throw new Error("Resposta inválida da API");
      }
    } catch (error: unknown) {
      console.error(error);
      setIsGenerating(false);
      toast.dismiss(loadingToast);

      let errorMessage = "Erro desconhecido";
      let action: { label: string; onClick: () => void } | undefined =
        undefined;

      if (error instanceof Error) {
        if (error.message === "Network Error") {
          errorMessage = "Não foi possível conectar ao servidor backend.";
          action = {
            label: "Ajuda",
            onClick: () =>
              alert(
                "Para gerar música real, execute localmente:\n1. Baixe o projeto\n2. Rode 'npm install' e 'node server.js'\n3. Rode 'npm run dev'",
              ),
          };
        }
      }

      const axiosError = error as {
        response?: { data?: { msg?: string; error?: string } };
      };
      if (axiosError?.response?.data) {
        const apiError =
          axiosError.response.data.msg || axiosError.response.data.error;
        if (apiError && apiError.toLowerCase().includes("artist name")) {
          errorMessage =
            "Política Suno: Nomes de artistas reais (ex: Kygo, Avicii) são proibidos. Descreva o estilo (ex: 'Tropical House').";
        } else if (apiError) {
          errorMessage = apiError;
        }
      }

      toast.error("Erro ao iniciar geração", {
        description: errorMessage,
        duration: 8000,
        action,
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-card rounded-2xl p-6 md:p-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
            Estúdio de Criação
          </h2>
          <p className="text-muted-foreground text-sm">
            Transforme texto em música eletrônica profissional
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-primary/50 text-primary bg-primary/10"
        >
          Suno AI v5 Enabled
        </Badge>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs
          defaultValue="simple"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 bg-black/20 p-1 mb-6">
            <TabsTrigger
              value="simple"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Modo Simples
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Mic2 className="w-4 h-4 mr-2" /> Modo Letra Customizada
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                Descreva sua música
              </Label>
              <Textarea
                placeholder="Ex: Uma track de techno progressivo com batidas pesadas, sintetizadores etéreos e uma vibe futurista. BPM 128, energia alta."
                className="min-h-[120px] bg-black/20 border-white/10 focus:border-primary/50 resize-none text-lg"
                {...form.register("prompt")}
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.watch("prompt")?.length || 0}/1000 caracteres
              </p>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Estilo Musical</Label>
                <Textarea
                  placeholder="Descreva o estilo musical..."
                  className="h-[200px] bg-black/20"
                  {...form.register("prompt")}
                />
              </div>
              <div className="space-y-2">
                <Label>Sua Letra</Label>
                <Textarea
                  placeholder="[Verse]&#10;Neon lights in the rain...&#10;&#10;[Chorus]&#10;We are the future..."
                  className="h-[200px] bg-black/20 font-mono text-sm"
                  {...form.register("lyrics")}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <Label className="text-base">Estilos & Gêneros</Label>
          <div className="border border-white/10 rounded-xl p-4 bg-black/10">
            <Accordion type="single" collapsible defaultValue="House">
              {Object.entries(ELECTRONIC_GENRES).map(([category, genres]) => (
                <AccordionItem
                  key={category}
                  value={category}
                  className="border-white/5"
                >
                  <AccordionTrigger className="text-sm hover:text-primary transition-colors">
                    {category}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {genres.map((genre) => (
                        <Badge
                          key={genre}
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all hover:scale-105 active:scale-95 px-3 py-1.5",
                            selectedStyles.includes(genre)
                              ? "bg-primary text-white border-primary shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                              : "bg-transparent text-muted-foreground border-white/10 hover:border-white/30 hover:text-white",
                          )}
                          onClick={() => toggleStyle(genre)}
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {selectedStyles.length > 0 && (
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-2">
              <span className="text-xs text-muted-foreground self-center mr-2">
                Selecionados:
              </span>
              {selectedStyles.map((style) => (
                <Badge
                  key={style}
                  className="bg-secondary/20 text-secondary border-secondary/50 pr-1 gap-1 hover:bg-secondary/30"
                >
                  {style}
                  <div
                    className="w-4 h-4 rounded-full hover:bg-white/20 flex items-center justify-center cursor-pointer"
                    onClick={() => toggleStyle(style)}
                  >
                    <span className="text-[10px]">×</span>
                  </div>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <Label>Título da Música (Opcional)</Label>
            <Input
              {...form.register("title")}
              placeholder="Ex: Cyberpunk Dreams"
              className="bg-black/20 border-white/10"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-black/10">
            <div className="space-y-0.5">
              <Label className="text-base">Modo Instrumental</Label>
              <p className="text-xs text-muted-foreground">
                Gerar música sem vocais
              </p>
            </div>
            <Switch
              checked={isInstrumental}
              onCheckedChange={(checked) =>
                form.setValue("isInstrumental", checked)
              }
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isGenerating}
          className={cn(
            "w-full h-16 text-lg font-bold uppercase tracking-widest shadow-lg transition-all duration-300",
            isGenerating
              ? "bg-muted cursor-not-allowed"
              : "bg-linear-to-r from-primary to-secondary hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:scale-[1.01]",
          )}
        >
          {isGenerating ? (
            <span className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              Processando IA...
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <Zap className="w-5 h-5 fill-current" />
              Gerar Música
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
