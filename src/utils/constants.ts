export const ELECTRONIC_GENRES = {
  House: [
    "Deep House",
    "Tech House",
    "Progressive House",
    "Electro House",
    "Future House",
    "Tropical House",
  ],
  Techno: [
    "Minimal Techno",
    "Detroit Techno",
    "Industrial Techno",
    "Melodic Techno",
    "Hard Techno",
  ],
  Trance: [
    "Uplifting Trance",
    "Progressive Trance",
    "Psytrance",
    "Vocal Trance",
    "Tech Trance",
  ],
  Dubstep: ["Melodic Dubstep", "Riddim", "Brostep", "Chillstep", "Future Bass"],
  "Drum & Bass": ["Liquid DnB", "Neurofunk", "Jump Up", "Jungle", "Breakbeat"],
  Ambient: ["Ambient Techno", "Dark Ambient", "Drone", "Chillout", "Downtempo"],
  EDM: ["Big Room", "Electro Pop", "Festival EDM", "Hardstyle", "UK Garage"],
};

export const MOODS = [
  "Energética",
  "Melancólica",
  "Épica",
  "Relaxante",
  "Sombria",
  "Eufórica",
  "Atmosférica",
  "Agressiva",
  "Hipnótica",
  "Cinematográfica",
];

export const TEMPOS = [
  "Muito Lento (60-80 BPM)",
  "Lento (80-100 BPM)",
  "Médio (100-120 BPM)",
  "Rápido (120-140 BPM)",
  "Muito Rápido (140-180 BPM)",
];

export const VOICES = [
  "Masculina",
  "Feminina",
  "Neutra",
  "Robótica",
  "Sussurrada",
  "Poderosa",
];

export interface VibrAierationParams {
  prompt: string;
  tags: string;
  make_instrumental: boolean;
  mv: string;
  wait_audio: boolean;
}

export interface GeneratedMusic {
  id: string;
  title: string;
  image_url: string;
  audio_url: string;
  video_url?: string;
  duration: number;
  tags: string;
  status: "queued" | "streaming" | "complete" | "error";
  created_at: string;
  model_name: string;
}

export const MOCK_GENERATED_MUSIC: GeneratedMusic[] = [];
