import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Instagram, 
  Youtube, 
  Mail, 
  Calendar, 
  ExternalLink, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Music, 
  Sparkles, 
  Activity, 
  Disc, 
  Compass, 
  History, 
  Clock,
  Users,
  Send,
  Check,
  Download,
  RefreshCw,
  Database,
  AlertTriangle
} from 'lucide-react';

// Interfaces
interface Track {
  title: string;
  bpm: string;
  genre: string;
  meta: string;
  notes: string;
  lyrics: string;
  audioUrl?: string; // Link direto para arquivo .mp3 ou similar
  spotifyUrl?: string; // Link direto ou embed do Spotify
  soundcloudUrl?: string; // Link direto ou embed do SoundCloud
  spotifyPlaceholder?: string;
  soundcloudPlaceholder?: string;
}

// Helpers for automatic link conversion to interactive embed players
function getSpotifyEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    if (url.includes('/embed/')) return url;
    const trackIdMatch = url.match(/track\/([a-zA-Z0-9]+)/);
    if (trackIdMatch && trackIdMatch[1]) {
      return `https://open.spotify.com/embed/track/${trackIdMatch[1]}?utm_source=generator&theme=0`;
    }
    const playlistIdMatch = url.match(/playlist\/([a-zA-Z0-9]+)/);
    if (playlistIdMatch && playlistIdMatch[1]) {
      return `https://open.spotify.com/embed/playlist/${playlistIdMatch[1]}?utm_source=generator&theme=0`;
    }
  } catch (e) {
    console.error("Error converting Spotify URL to embed:", e);
  }
  return null;
}

function getSoundCloudEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    if (url.includes('w.soundcloud.com/player')) return url;
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%2310b981&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
  } catch (e) {
    console.error("Error converting SoundCloud URL to embed:", e);
  }
  return null;
}

interface StandardizedEmbedPlayerProps {
  track: Track;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

function StandardizedEmbedPlayer({ track, isPlaying, setIsPlaying, nextTrack, prevTrack }: StandardizedEmbedPlayerProps) {
  const soundCloudEmbedUrl = getSoundCloudEmbedUrl(track.soundcloudUrl);
  const spotifyEmbedUrl = getSpotifyEmbedUrl(track.spotifyUrl);

  const [activePlatform, setActivePlatform] = useState<'soundcloud' | 'spotify'>(
    soundCloudEmbedUrl ? 'soundcloud' : 'spotify'
  );

  // Automatically update the platform when the track changes if the current one isn't supported
  useEffect(() => {
    if (activePlatform === 'spotify' && !spotifyEmbedUrl && soundCloudEmbedUrl) {
      setActivePlatform('soundcloud');
    } else if (activePlatform === 'soundcloud' && !soundCloudEmbedUrl && spotifyEmbedUrl) {
      setActivePlatform('spotify');
    }
  }, [track, spotifyEmbedUrl, soundCloudEmbedUrl]);

  return (
    <div className="bg-[#07070a] border border-zinc-900 rounded-xl p-5 space-y-4 relative overflow-hidden shadow-2xl">
      {/* Visual scanning line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent animate-pulse" />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-900/85 pb-3">
        {/* Platform selection tabs */}
        <div className="flex gap-1 text-[10px] font-mono tracking-widest uppercase select-none">
          {soundCloudEmbedUrl && (
            <button
              onClick={() => setActivePlatform('soundcloud')}
              className={`px-3 py-1.5 border rounded-lg transition-all font-bold flex items-center space-x-1.5 cursor-pointer ${
                activePlatform === 'soundcloud'
                  ? 'border-emerald-500/40 text-[#FF5500] bg-[#FF5500]/5 shadow-[0_0_10px_rgba(255,85,0,0.1)]'
                  : 'border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
              <span>SOUNDCLOUD</span>
            </button>
          )}
          {spotifyEmbedUrl && (
            <button
              onClick={() => setActivePlatform('spotify')}
              className={`px-3 py-1.5 border rounded-lg transition-all font-bold flex items-center space-x-1.5 cursor-pointer ${
                activePlatform === 'spotify'
                  ? 'border-emerald-500/40 text-[#1DB954] bg-[#1DB954]/5 shadow-[0_0_10px_rgba(29,185,84,0.1)]'
                  : 'border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
              <span>SPOTIFY</span>
            </button>
          )}
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-500">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="uppercase tracking-wider">MODO_EMBED_SEGURO</span>
        </div>
      </div>

      {/* Embedded iframe container */}
      <div className="relative w-full rounded-xl overflow-hidden border border-zinc-900 shadow-inner bg-black/60 p-1">
        {activePlatform === 'soundcloud' && soundCloudEmbedUrl ? (
          <div className="h-[166px] w-full transition-all duration-300">
            <iframe
              src={soundCloudEmbedUrl}
              width="100%"
              height="166"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              className="border-0 rounded-lg"
              title={`${track.title} on SoundCloud`}
            />
          </div>
        ) : activePlatform === 'spotify' && spotifyEmbedUrl ? (
          <div className="h-[80px] w-full transition-all duration-300 py-1">
            <iframe
              src={spotifyEmbedUrl}
              width="100%"
              height="80"
              allowFullScreen={false}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="border-0 rounded-lg"
              title={`${track.title} on Spotify`}
            />
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-500 text-xs font-mono flex flex-col items-center justify-center space-y-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>Nenhum reprodutor disponível para esta faixa.</span>
          </div>
        )}
      </div>

      {/* Playlist Navigation and Decorative visualizer panel */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Prev / Next buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={prevTrack}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all focus:outline-none cursor-pointer"
            title="Faixa anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          
          <div className="text-[10px] font-mono text-zinc-500 px-2 uppercase tracking-widest bg-zinc-900/50 py-1 rounded border border-zinc-850 font-bold">
            {track.bpm}
          </div>

          <button
            onClick={nextTrack}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all focus:outline-none cursor-pointer"
            title="Próxima faixa"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic visual spectrum analyzer decorative simulator */}
        <div className="h-6 flex items-center justify-between gap-[2px] select-none flex-1 max-w-[200px] sm:max-w-none px-4">
          {[...Array(24)].map((_, index) => {
            const runningHeight = 4 + Math.sin(index * 0.5) * 12 + (isPlaying ? Math.sin(Date.now() * 0.05 + index) * 6 : 0);
            return (
              <div
                key={index}
                className={`w-px flex-1 rounded-sm transition-all duration-300 ${
                  isPlaying ? 'bg-emerald-400/80 animate-pulse' : 'bg-zinc-800'
                }`}
                style={{
                  height: `${isPlaying ? Math.max(3, Math.min(22, runningHeight)) : 3}px`,
                  opacity: isPlaying ? 0.4 + (index % 4) * 0.15 : 0.2
                }}
              />
            );
          })}
        </div>

        {/* Interaction trigger */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono tracking-wider transition-all cursor-pointer select-none ${
            isPlaying 
              ? 'border-pink-500/30 text-pink-400 bg-pink-500/5 hover:bg-pink-500/10'
              : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10'
          }`}
        >
          {isPlaying ? '👁️ VISUAL: ATIVO' : '👁️ VISUAL: PARADO'}
        </button>
      </div>
    </div>
  );
}

const ddiList = [
  { code: 'BR', name: 'Brasil', ddi: '+55' },
  { code: 'US', name: 'EUA/Canadá', ddi: '+1' },
  { code: 'MX', name: 'México', ddi: '+52' },
  { code: 'PT', name: 'Portugal', ddi: '+351' },
  { code: 'AR', name: 'Argentina', ddi: '+54' },
  { code: 'UY', name: 'Uruguai', ddi: '+598' },
  { code: 'CL', name: 'Chile', ddi: '+56' },
  { code: 'CO', name: 'Colômbia', ddi: '+57' },
  { code: 'ES', name: 'Espanha', ddi: '+34' },
  { code: 'GB', name: 'Reino Unido', ddi: '+44' },
  { code: 'FR', name: 'França', ddi: '+33' },
  { code: 'DE', name: 'Alemanha', ddi: '+49' },
  { code: 'IT', name: 'Itália', ddi: '+39' },
  { code: 'JP', name: 'Japão', ddi: '+81' },
  { code: 'AU', name: 'Austrália', ddi: '+61' },
];

export default function App() {
  // Navigation states
  const [navOpen, setNavOpen] = useState(false);
  
  // Music player states
  const [activeTrack, setActiveTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lyricsExpanded, setLyricsExpanded] = useState(true);

  // Real audio & Integrations states (iframe-based)
  const [playerTab, setPlayerTab] = useState<'soundcloud' | 'spotify'>('soundcloud');
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  // Nano interaction states
  const [activeNanoPhrase, setActiveNanoPhrase] = useState("Clique nas frequências abaixo para ecoar o registro...");
  const [nanoLogCode, setNanoLogCode] = useState("PE_STATE_AWAIT");
  const [nanoClickCount, setNanoClickCount] = useState(0);

  // Fallback state for images
  const [heroImgError, setHeroImgError] = useState(false);
  const [cityImgError, setCityImgError] = useState(false);
  const [albumOriginalError, setAlbumOriginalError] = useState(false);
  const [albumRecoveredError, setAlbumRecoveredError] = useState(false);

  // Fan Club states
  const [fanName, setFanName] = useState('');
  const [fanEmail, setFanEmail] = useState('');
  const [fanDdi, setFanDdi] = useState('+55');
  const [fanPhone, setFanPhone] = useState('');
  const [fanInstagram, setFanInstagram] = useState('');
  const [fanCountry, setFanCountry] = useState('Brasil');
  const [fanState, setFanState] = useState('');
  const [fanCity, setFanCity] = useState('');
  const [fanFavTrack, setFanFavTrack] = useState('');
  const [fanMessage, setFanMessage] = useState('');
  const [isSubmittingFan, setIsSubmittingFan] = useState(false);
  const [fanSubmitStatus, setFanSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleRegisterFan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fanName || !fanEmail || !fanCountry || !fanState || !fanCity) return;

    setIsSubmittingFan(true);
    setFanSubmitStatus('idle');

    try {
      const response = await fetch('/api/fans/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fanName,
          email: fanEmail,
          phone: fanPhone ? `${fanDdi} ${fanPhone}` : '',
          instagram: fanInstagram,
          country: fanCountry,
          state: fanState,
          city: fanCity,
          favoriteTrack: fanFavTrack,
          message: fanMessage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFanSubmitStatus('success');
        setFanName('');
        setFanEmail('');
        setFanDdi('+55');
        setFanPhone('');
        setFanInstagram('');
        setFanCountry('Brasil');
        setFanState('');
        setFanCity('');
        setFanFavTrack('');
        setFanMessage('');
      } else {
        setFanSubmitStatus('error');
      }
    } catch (error) {
      console.error("Erro ao cadastrar fã:", error);
      setFanSubmitStatus('error');
    } finally {
      setIsSubmittingFan(false);
    }
  };

  // Robust, cookie-safe direct relative-path audio synchronization with native media events
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const selectTrack = (index: number) => {
    setActiveTrack(index);
    setIsPlaying(true);
  };

  const nextTrack = () => {
    const nextIndex = activeTrack < tracks.length - 1 ? activeTrack + 1 : 0;
    selectTrack(nextIndex);
  };

  const prevTrack = () => {
    const prevIndex = activeTrack > 0 ? activeTrack - 1 : tracks.length - 1;
    selectTrack(prevIndex);
  };

  // Handle source-specific tab auto-switching
  useEffect(() => {
    const currentTrack = tracks[activeTrack];
    if (playerTab === 'spotify' && !currentTrack.spotifyUrl) {
      setPlayerTab('soundcloud');
    }
  }, [activeTrack, playerTab]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Full 16 tracks data
  const tracks: Track[] = [
    {
      title: "Dentro de Mim",
      bpm: "100 BPM",
      genre: "Pop Rock brilhante e emotivo",
      meta: "TRACK_01 // REF: DD-M // STATE: DECRYP_OK // FREQ: 432HZ // SIGNAL: PURE",
      notes: "'Dentro de Mim' abre o álbum com a profundidade emocional de quem encara seus próprios conflitos sem medo de parecer vulnerável. A música alterna introspecção e crescimento pessoal, transformando sentimentos de vazio e inquietação em uma busca sincera por sentido e paz interior. A letra ganha força justamente por sua honestidade crua, enquanto a melodia cria uma atmosfera melancólica, mas esperançosa. É uma faixa que sintetiza perfeitamente o espírito do álbum: emocional, reflexiva e carregada de humanidade.",
      // Para tocar faixas reais integradas no site, basta preencher os campos opcionais abaixo:
      // spotifyUrl: "https://open.spotify.com/track/46L5oHqTrM6y1w7iW5UfU1", // Cole o link da faixa do Spotify aqui
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/dentro-de-nos-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/dentro_de_nos_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `Às vezes,  parece difícil entender o porque
Na verdade, é bem simples
Basta se querer

O sentido que procuramos
Olhando ao redor
Está em algum lugar
Dentro de Nós

O céu, vozes
Tudo parece girar
Um grande vazio
Sinto se aproximar

A fuga é impossível
Eu posso até tentar
Mas não é só isso
Sempre existe algo mais

Mais forte que tudo isso
Mais alto que eu possa alcançar
Não sei se sou sensível
Eu já não posso afirmar

Tudo é uma rotina
Que temos que superar
Dia após dia
Tudo no mesmo lugar

A vida que eu tenho
É a vida que eu quis
Escondo meus pensamentos
Pra não te ferir

Ferir os teus sentimentos
Eu nunca seria capaz
Esquecendo os meus tormentos
Procurando nossa paz

Agora vejo que nada
Nada pode me derrubar
Às vezes, é bem mais simples
Da verdade se afastar....

Você não sabe quantos planos eu já fiz
E quantos planos deixei de fazer
Você não sabe quantos sonhos eu já tive
Nem quantos pelo caminho deixei...

Pelo Caminho, encontrei, você
Pelo Caminho, encontrei, você....`
    },
    {
      title: "Solitude",
      bpm: "120 BPM",
      genre: "Pop Rock radiofônico dos anos 90, superação",
      meta: "TRACK_02 // REF: SOL-94 // STATE: OPTIMIZED // COMPRESSION: VINTAGE // ENVELOPE: FULL",
      notes: "Com uma energia radiofônica típica do pop rock brasileiro dos anos 90, 'Solitude' transforma dor e superação em um refrão grandioso e contagiante. A canção fala sobre amadurecimento emocional após o fim de uma relação, sem cair no drama excessivo — pelo contrário, existe uma força silenciosa em aceitar a saudade e seguir em frente. As guitarras limpas, os vocais expressivos e a atmosfera otimista contrastam com a melancolia da letra, criando uma das músicas mais acessíveis e emocionais do disco.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/solitude-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/solitude_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `Bate mais forte agora
o Meu coração frustrado
Ainda sinto o gosto 
Da última lágrima
Que deixei ao seu lado
Chorei, mas sobrevivi
E nem lembro do passado
Hoje não ando menos sozinho
E não sou mais desesperado

Uuh
Uhh
Uuh
Uuh, Uuh

Meu amor, não sinta mais pena de você
Assim como eu, voce vai ter que aprender a crescer
Por favor não fique triste,
não chores mais assim
Por menos que dure será sempre forte
a saudade que há em mim...

Uuh
Uhh
Uuh
Uuh, Uuh`
    },
    {
      title: "Como Poderei Sonhar",
      bpm: "105 BPM",
      genre: "Pop Rock sensível, equilíbrio entre razão e desejo",
      meta: "TRACK_03 // REF: CPS-03 // DYNAMIC_RANGE: WIDE // NOISE_FLOOR: LEVEL_LOW",
      notes: "'Como Poderei Sonhar' equilibra romantismo, insegurança e reflexão existencial em uma das composições mais sensíveis do álbum. A faixa retrata o conflito entre razão e desejo, entre manter os pés no chão e permitir-se sonhar. Musicalmente, o arranjo cresce de forma envolvente até explodir em refrões amplos e emotivos, sustentados por guitarras brilhantes e melodias memoráveis. É uma música que traduz perfeitamente o sentimento de quem tenta encontrar equilíbrio entre amor, medo e identidade.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/como-poderei-sonhar-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/como_poderei_sonhar_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `Noite vem
Eu não quero me deixar levar
Da janela do meu quarto
Eu nem sequer vejo o luar

Como Poderei Sonhar
Se tenho os pés no chão
Como poderei me dividir
Sendo a única fração
Eu quase esqueço o meu viver
Pensando em você....

Ir além
Onde a insegurança não vai me levar
O desejo é um fato
E anda lado a lado
Com medo de ficar 

Como Poderei Sonhar
Se tenho os pés no chão
Como poderei me dividir
Sendo a única fração
Eu quase esqueço o meu viver
Pensando em você....

Quando me vi, sem sentido e direção
Procurei por alguém me guiar
E sei que muito tempo
Eu levei pra me encontrar

Seguir sem
Nenhuma dúvida a me incomodar
Hoje eu vejo o outro lado
Entendo o passado, o seu modo de pensar

Como Poderei Sonhar
Se tenho os pés no chão
Como poderei me dividir
Sendo a única fração
Eu quase esqueço o meu viver
Pensando em você...`
    },
    {
      title: "Mundo",
      bpm: "140 BPM",
      genre: "Hard Rock pesado contra alienação, corrupção e destruição",
      meta: "TRACK_04 // REF: MND-XX // DISTORTION: ANODE // GAIN: SHARP // LOW-END: HEAVY",
      notes: "'Mundo' traz a face mais pesada e combativa do Teonanacatl 94. Com riffs agressivos e uma energia intensa de hard rock, a música funciona como um manifesto contra a violência, a destruição ambiental, a corrupção e a alienação social. Mesmo escrita originalmente em 1994, sua mensagem permanece assustadoramente atual. A força da interpretação vocal e o peso das guitarras amplificam o senso de urgência da letra, transformando a faixa em um grito de resistência e consciência coletiva.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/mundo-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/mundo_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `O mundo em que vivemos
É triste pra valer
Guerras, Violência, destruição
Você pensa que está bem,
Pensa que é feliz
Mas muita gente sofre

Você precisa
Ir em busca de algo bem melhor
Tudo o que você quer, você terá
Você terá...

No ar que respiramos,
se encontra nosso sim
Fábricas, carros, poluição
Hoje você enxerga bem
Amanhã talvez,
Ninguém sabe te dizer

Você precisa
Ir em busca de algo bem melhor
Tudo o que você quer, você terá
Você terá...

Matas devastadas, lixo nuclear
Crime organizado, corrupção
São imagens que invadem nosso lar
Em doses diárias, pela televisão

Você precisa
Ir em busca de algo bem melhor
Tudo o que você quer, você terá
Você terá...`
    },
    {
      title: "Meu Vazio",
      bpm: "135 BPM",
      genre: "Hard Rock denso, introspectivo e claustrofóbico",
      meta: "TRACK_05 // REF: MVZ-94 // PHASING: DEEP // LOW_PASS: ACTIVE // SYSTEM: ANALOG",
      notes: "Sombria, intensa e profundamente introspectiva, 'Meu Vazio' mergulha em questões de identidade, alienação e desconexão emocional. A letra transmite a sensação de perder o controle sobre si mesmo, enquanto o instrumental pesado cria uma atmosfera quase claustrofóbica. Os vocais carregados de emoção reforçam o desconforto psicológico presente em cada verso, fazendo da música uma das experiências mais densas e impactantes do álbum. É o retrato cru do conflito interno transformado em hard rock.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/meu-vazio-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/meu_vazio_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `O meu vazio, é um vazio comum
Nada em que possa se apoiar
Meu pensamento, vaga longe
Ninguém que possa, segurar

Ninguém que possa sentir o que senti
Ninguém que possa fazer, o que fiz
Nem sequer tentar...

Se percebo algo em minhas palavras
Algo que não foi dito por mim
Minha alma treme, meu corpo gela
A sensação é de não estar mais aqui...

Eu não consigo nem me tocar
Não adianta, eu não sei quem está em mim...
Nem sequer tentei...
Eu não consigo...

Se percebo algo em minhas palavras...
Algo que não foi dito por mim
Minha alma treme, meu corpo gela
A sensação é de não estar mais aqui...

Eu não consigo nem me tocar
Não adianta, eu não sei quem está em mim...

Nem sequer tentei...`
    },
    {
      title: "Esperança",
      bpm: "115 BPM",
      genre: "Pop Rock melódico, ausência e persistência do amor",
      meta: "TRACK_06 // REF: ESP-06 // HARMONIC_SAT: WARM // REVERB: VALVES_HIGH",
      notes: "'Esperança' apresenta um lado mais melódico e sentimental da banda, combinando suavidade acústica com crescendos emocionais marcantes. A música fala sobre ausência, saudade e a persistência do amor mesmo diante da distância e da dor. Existe uma beleza quase épica na maneira como a letra transforma sofrimento em resistência emocional. O contraste entre delicadeza e intensidade faz da faixa uma das mais humanas e emocionalmente acessíveis do disco.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/esperanca-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/esperanca_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `Quando me sentir sozinho
Vou te buscar no além
Vou te buscar além, da minha, Imaginação
Da minha virtude, da minha compreensão
Da minha juventude

Você me aprisionou
E agora, que se foi
Sinto saudades
A esperança de te ter
Está em mim, está em nós...

Quando não houver mais caminhos
Pra chegar até ti, e te fazer feliz
Irei por entre espinhos, cortarei o mar
Só pra te amar por um instante
Não importa a que distância você está

Você me arruinou
Se foi, voltou, depois se foi
E agora estou sozinho
A esperança de te ter
Está em mim, está em nós...`
    },
    {
      title: "Máscara",
      bpm: "130 BPM",
      genre: "Hard Rock visceral sobre hipocrisia e desilusão",
      meta: "TRACK_07 // REF: MSK-07 // FILTER: ENGAGED // TRANSIENT: SHARP",
      notes: "Com riffs pesados e refrões explosivos, 'Máscara' aborda falsidade, desilusão e a perda da confiança nas relações humanas. A letra carrega uma sensação de confronto direto, como se cada verso arrancasse camadas de hipocrisia até revelar a verdadeira face das pessoas. Musicalmente, a faixa mistura agressividade e melodia de forma extremamente eficiente, criando uma atmosfera dramática e intensa. É uma das músicas mais viscerais e marcantes do álbum.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/mascara-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/mascara_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `O teu olhar me prostituiu
Não sabe mais quem você é
A sua face já me iludiu
E o seu sorriso já me feriu
Então vá!

Mostra seu rosto sem máscara
Então vá!

Fere, mas deixe me ver
Quem feriu....

Não vou mais confiar em ninguém
Não vou mais me entregar a alguém
Sorrir por sorrir, chorar por chorar
Não vou mais me machucar
Então vá!

Retira de ti esta lágrima falsa
Então vá!

Fere, mas deixe me ver
Quem feriu....

Quando a luta for difícil
Não chorarei minha dor
Pois o abismo do teu olhar
Será meu consolador

Eu vou seguir meu destino cruel
Eu vou seguir meu destino
Eu vou seguir meu destino cruel
Eu vou seguir meu destino
Seguir o meu destino...`
    },
    {
      title: "Minha Vida",
      bpm: "110 BPM",
      genre: "Pop Rock sobre amadurecimento e redenção familiar",
      meta: "TRACK_08 // REF: MNV-08 // DELAY: CHRONO // ENVELOPE: SOFT // GAIN: MID",
      notes: "'Minha Vida' é uma canção sobre amadurecimento, família e redenção emocional. A letra revisita dores do passado, pensamentos autodestrutivos e memórias da infância, mas encontra conforto nas pessoas que realmente importam. O tom positivo do refrão transforma a música em um hino de valorização da vida e das conexões humanas. Entre guitarras melódicas e uma interpretação sincera, a faixa emociona justamente por parecer autobiográfica e profundamente verdadeira.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/minha-vida-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/minha_vida_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `Na minha vida, tudo passou tão rápido
Posso até contar, 
quantas vezes sorri, quantas vezes eu chorei
E até pensei, em me abandonar

Mas agora eu sei, tudo faz sentido
Tenho o meu filho, meus amigos e tenho você...

Na minha vida, tudo passou tão rápido
Posso até contar, 
quantas vezes sorri, quantas vezes eu chorei
E até pensei, em me abandonar...

Mas agora eu sei, tudo faz sentido
Tenho o meu filho, meus amigos e tenho você

Na minha infância, eu sorria
Mas era um sorriso, 
de quem não sabia o que tinha por vir...
E veio...
bem antes que eu esperava...

Mas agora eu sei, tudo faz sentido
Tenho minha família, e tenho também o seu sorriso...

uhuuu
Não me deixe só...
Não me deixe só...`
    },
    {
      title: "O Último Tolteca",
      bpm: "140 BPM",
      genre: "Hard Rock progressivo conceitual, metáforas ecológicas",
      meta: "TRACK_09 // REF: ULT-TOLT // TIME_SIG: 7/8_4/4 // AMBIENT: MESO_CYBER",
      notes: "Épica, reflexiva e ambiciosa, 'O Último Tolteca' representa o momento mais conceitual do álbum. Misturando hard rock e influências progressivas, a música utiliza metáforas ecológicas e existenciais para discutir destruição ambiental, esperança, guerra, amor e solidão. A composição alterna peso e contemplação de maneira cinematográfica, criando uma jornada emocional intensa. Sua temática continua extremamente atual, tornando a faixa uma poderosa reflexão sobre o impacto humano no mundo e sobre a fragilidade das próprias emoções.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/o-ultimo-tolteca-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/o_ultimo_tolteca_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `Sentado aqui, esperando
Vejo a mata fechada.....
Tão aberta, desconsolada
Pobre Mata... 
...Adeus... 
...Pobre Mata...

Quantos mais virão pra destruir
O que o homem pensa que é?
Quantas mais, eles derrubarão?
Só pra acabar, e acabar,  na solidão...

Espero a chuva, que vem
Espero o Sol, que já vem
Espero a tal paz, aqui também
Espero a guerra, que nem, terminou....

Plantei a semente, mas não brotou
É assim quando se ama
Veio o fogo, tudo levou
Congelou minha esperança...

Não tenho mais motivos
Pra ficar aqui...

Minha semente não brotou
O meu amor já se acabou 
Mas mesmo assim
Não custa tentar....

As vezes não sei, 
nem onde estou...`
    },
    {
      title: "Sombras de um Caminho",
      bpm: "130 BPM",
      genre: "Rock Alternativo pós-grunge dos anos 90",
      meta: "TRACK_10 // REF: SUC-10 // CHORUS: ANALOG_CH // RESONANCE: STABLE",
      notes: "'Sombras de um Caminho' carrega uma atmosfera melancólica e ao mesmo tempo esperançosa, explorando arrependimento, redenção e a necessidade de continuar vivendo apesar dos erros. O contraste entre versos introspectivos e refrões expansivos cria uma experiência emocional crescente, típica do rock alternativo dos anos 90. A repetição da frase 'essa vontade que há em mim, de viver' funciona como um mantra de sobrevivência emocional, transformando a música em um dos momentos mais catárticos do disco.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/sombras-de-um-caminho-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/sombras_de_um_caminho_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `Vivi, sempre a sombra de um caminho
Preferia estar sozinho
E não ter com quem falar

Mas alguém me procurou
Me levou aonde estou
E só tenho a agradecer
Antes de perecer...

Essa vontade que há em mim, de viver
Essa vontade que há em mim, de viver
Essa vontade que há em mim, de viver
Essa vontade que há em mim, de viver

Uoh Uoh

Feri, quem sempre me ajudou
Do inferno me tirou
O motivo eu não sei

E agora estou sozinho
Não sei onde te buscar
Já me sinto arrependido
Já não tem nenhum valor

Essa vontade que há em mim, de viver
Essa vontade que há em mim, de viver
Essa vontade que há em mim, de viver
Essa vontade que há em mim, de viver

Uoh Uoh`
    },
    {
      title: "Bright Eyes",
      bpm: "140 BPM",
      genre: "Hard Rock/Alternative Metal em inglês, pesado e visceral",
      meta: "TRACK_11 // REF: BE-ENG // VOICE_FX: VOCODER // SIBILANCE: CALIBRATED // TUNING: DROP_D",
      notes: "Cantada em inglês, 'Bright Eyes' mergulha em uma atmosfera obscura e intensa influenciada pelo pós-grunge e pelo alternative metal. A repetição hipnótica dos versos reforça a sensação de perda de força, identidade e esperança. Musicalmente pesada e agressiva, a faixa se destaca pelo impacto direto de suas guitarras distorcidas e pela interpretação vocal carregada de tensão. É uma música curta, intensa e visceral, que amplia a diversidade sonora do álbum.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/bright-eyes-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/bright_eyes_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `I lose my bright eyes
I lose my power
I´ve slept to real when they go on another place

Stay on fire
Stay on Blood
Stay on fire
Stay on hell
In the hell, In the hell ...

I lose my bright eyes
I lose my power
I´ve slept to real when they go on another place

Stay on fire
Stay on blood
Stay on fire
Stay (stay) in the hell
In the hell
In the hell`
    },
    {
      title: "Dia Após o Outro",
      bpm: "120 BPM",
      genre: "Pop Rock luminoso sobre recomeços",
      meta: "TRACK_12 // REF: DAO-12 // EQ_BOOST: MID_HIGH // STAGE: STEREO // LEVEL: MAXIMUM",
      notes: "'Dia Após o Outro' transforma o fim de uma relação em uma narrativa de reconstrução emocional. Mesmo partindo da dor e da desilusão, a música evolui para uma mensagem otimista sobre recomeços e autoconhecimento. O refrão luminoso, aliado à sonoridade energética do pop rock, cria um equilíbrio perfeito entre melancolia e esperança. É uma faixa extremamente acessível, com potencial de conexão imediata com o público por sua sinceridade e sensação de renovação.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/dia-apos-o-outro-recovered-12", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/dia_apos_o_outro_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `Quem dera se não ja existisse
O que de você ficou em mim
Só assim esqueceria
O mal que você me faz sentir

Ficou um gosto amargo
Tristeza e muita dor
E um gesto mal pensado
Me deixou onde estou

Ninguém acreditaria 
Até eu mesmo custei
Deixei minha razão
Me abandonar de vez

Tudo Durou tão pouco
Na verdade, nada existiu
E um sentimento louco
Meu coração partiu

Eu  vou chorar meu pranto, vou cuidar de mim
Quebrado o encanto, não vou me iludir
Hoje já é outro dia, o céu está tão azul
O sol já irradia, em mim, uma luz...

Eu vejo novas cores
Nada como um dia após o outro
Sinto novos sabores
Eu sinto vida em meu corpo...

Nem tudo tem um motivo
Nem tudo tem uma explicação
Para cada ação da vida, existe uma reação
Não quero mais pensar, como poderia ser
Não vou me questionar, não vou me arrepender

Eu  vou chorar meu pranto, vou cuidar de mim
Quebrado o encanto, não vou me iludir
Hoje já é outro dia, o céu está tão azul
O sol já irradia, em mim, uma luz...

Eu vejo novas cores
Nada como um dia após o outro
Sinto novos sabores
Eu sinto vida em meu corpo...

Uohhhh
Uohhhh`
    },
    {
      title: "Outra Face do Dia",
      bpm: "110 BPM",
      genre: "Pop Rock urbano, solidão e rotina noturna",
      meta: "TRACK_13 // REF: OFD-13 // NOISE_GATE: ENGAGED // SPACE: VOLUMETRIC // LOWS: SHAPED",
      notes: "Com clima urbano e contemplativo, 'Outra Face do Dia' retrata a solidão das noites nas grandes cidades e a busca constante por sentido em meio à rotina. A letra observa o movimento das ruas, das pessoas e do tempo como se fossem reflexos do próprio estado emocional do narrador. A sonoridade leve e melódica cria um contraste interessante com o tom existencial da composição. É uma música madura, atmosférica e carregada de imagens cinematográficas.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/outra-face-do-dia-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/outra_face_do_dia_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `Outra face do dia
Surge vinda do leste
Escurece e esfria
Esta parte do globo terrestre

Noite fria e eu só
Amigos longe daqui
Sem distração melhor
Resolvo sair por aí

Carros passam, pessoas
Tentam se divertir
Afinal ainda é noite
E o dia está longe de vir

Isso é tudo que importa
Esquecer e tentar sorrir
Quando a sorte nos falta
Então fazemos existir

Correndo contra o tempo
Procurando encontrar 
um meio perfeito de prosseguir...

Outra esquina, outro mundo
Vidas tentando viver
Driblando o futuro
Não deixando o pior acontecer

Isso é tudo o que importa
Esquecer e tentar sorrir
Quando a sorte nos falta
Então fazemos existir

Correndo contra o tempo
Procurando encontrar 
um meio perfeito de prosseguir...

Correndo contra o tempo
Procurando encontrar 
um meio perfeito de prosseguir...`
    },
    {
      title: "Rochas",
      bpm: "90 BPM",
      genre: "Pop Rock Ballad melancólica, metáforas ligadas ao mar",
      meta: "TRACK_14 // REF: RCH-14 // REVERB_DECAY: 5.0S // SUB_BASS: SOFT // TRANSIENTS: LOW",
      notes: "'Rochas' é uma balada intensa sobre amor, dependência emocional e solidão. A música utiliza metáforas ligadas ao mar e às rochas para representar relações que ferem lentamente, mas deixam marcas profundas. A interpretação vocal transmite fragilidade e desespero emocional de maneira extremamente convincente, enquanto o instrumental cresce gradualmente até alcançar momentos de grande intensidade. É uma das canções mais emocionais e melancólicas do álbum.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/rochas-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/rochas_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `Só eu sei
Como te quis
E sem você
Não consigo ser feliz
Agora percebo
Antes não percebia
Você é meu medo
Já me fez muito feliz
As ruas vazias
Parecem me convidar
Angústia terrível
De um belo luar enfeitar

E me lembrar que só você
Um carinho me fazia
Que era só você
que me entendia...

A solidão que em me acaba,
foi o que sempre procurei
E agora que eu encontrei,
Me sinto sozinho demais
Eu sinto falta de você
Falta de sentido
Naquilo que eu penso,
Que faço e o que imagino

E me lembrar que só você
Um carinho me fazia
Que era só você
que me entendia...

Assim como o mar,
As rochas tentam destruir
Você com um simples gesto,
Consegue me ferir
Sinto saudades demais
Sinto tristeza demais
Definitivamente,
Eu te quero muito mais
E quanto mais eu quero,
Mais você se distancia...

Só eu sei
Como te quis...`
    },
    {
      title: "Será Que Eu Errei",
      bpm: "140 BPM",
      genre: "Pop Rock acelerado sobre excessos passionais",
      meta: "TRACK_15 // REF: SQE-15 // DRIVE: STAGE // TRANSLATION: DIRECT // SPEED: EXTRA",
      notes: "Com energia acelerada e forte apelo melódico, 'Será Que Eu Errei' explora os excessos emocionais provocados pelo amor e pela entrega total a outra pessoa. A letra retrata alguém dividido entre paixão e arrependimento, consciente das consequências emocionais de suas escolhas. O instrumental urgente e os refrões marcantes reforçam a sensação de descontrole afetivo, transformando a faixa em um rock intenso, direto e altamente memorável.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/sera-que-eu-errei-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/sera_que_eu_errei_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `Eu hoje acordei,
Clamando o seu nome
Quando penso em você,
minha mente vaga longe

Eu já não tenho forças pra fazer,
alguma coisa a não ser
Te querer a todo tempo, 
estar contigo a todo momento

E por isso eu vou viver 
as consequências , do amor

As consequências do amor,
vão perturbar a minha vida
E quando isso acontecer,
Eu estarei em um beco sem saída...

Será que eu errei,
cedendo aos teus caprichos
Talvez exagerei, me expondo a certos riscos
Eu já não dou mais conta do que faço,
alguma coisa guia os meus passos

Já tomei a liberdade, 
e vendi a ti por minha própria vontade

E por isso eu vou viver 
as consequências , do amor

As consequências do amor
Vão perturbar a minha vida
E quando isso acontecer
Eu estarei num beco sem saída...`
    },
    {
      title: "Cinema Imaginário (Bonus Track)",
      bpm: "115 BPM",
      genre: "Pop Rock funkeado com groove, celebração da ficção e da arte",
      meta: "TRACK_16 // REF: CI-GROOVE // COMPRESSION: OPTICAL // SATURATION: TUBE_M",
      notes: "Encerrando o álbum de maneira criativa e reflexiva, 'Cinema Imaginário' mistura crítica social, escapismo e lirismo em uma composição cheia de personalidade. A música fala sobre usar a imaginação como refúgio diante de uma realidade cansativa e repetitiva, transformando sonhos e ficção em mecanismos de sobrevivência emocional. O groove das guitarras, a dinâmica dos vocais e a atmosfera quase cinematográfica fazem da faixa um encerramento perfeito para o disco. É uma celebração da arte, da imaginação e da necessidade humana de criar mundos próprios para continuar seguindo em frente.",
      soundcloudUrl: "https://soundcloud.com/teonanacatl94/cinema-imaginario-recovered", // Cole o link do SoundCloud aqui
      audioUrl: "/audio/cinema_imaginario_recovered.mp3", // Se possuir o arquivo de áudio direto, coloque o caminho ou link dele aqui
      lyrics: `Passo horas do meu dia
Viajando alto, fazendo planos
Em linhas fortes, coloridas
Entra ano ou sai ano

Não deixo de sonhar,  (não deixo de sonhar)
Não deixo de sonhar

Eu caminho pelas ruas
Entre  casas e edifícios
Olho tudo ao meu redor
Só vejo espaços negativos

Tudo vai girar, (tudo vai girar)
Tudo vai girar

Não sei viver sem fugir
A esse mundo em movimento
Trago o meu momento aqui
No vagar do pensamento

O terror e a piedade 
Ocupam os noticiários
Linha a linha o meu diário
É mesmo um tédio sem fim

Busco a solução, (Busco a solução)
Busco a solução

Eu completo o incompleto
Eu corrijo a realidade
Invento uma nova vida
Mais triste ou feliz

Vivo da ficção, (Vivo da ficção)
Vivo da ficção

Não sei viver sem fugir
A esse mundo em movimento
Trago o meu momento aqui
No vagar do pensamento

Não chame de mentira, é puro lirismo...
Só quero viver minha vida, mas não consigo...

Não chame de mentira, é puro lirismo...
Só quero viver minha vida, mas não consigo...

Não chame de mentira, é puro lirismo...
Só quero viver minha vida, mas não consigo...

Não chame de mentira, é puro lirismo...
Só quero viver minha vida, mas não consigo...`
    }
  ];

  // Scrolling handler for header transitions
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setNavOpen(false);
  };

  // Nano interaction logic
  const handleNanoPhraseClick = (idx: number, text: string, code: string) => {
    setActiveNanoPhrase(text);
    setNanoLogCode(code);
    setNanoClickCount(prev => prev + 1);
  };

  return (
    <div className="relative min-h-screen bg-[#050507] text-[#e4e4e7] selection:bg-[#10b981] selection:text-black overflow-x-hidden font-rajdhani">
      
      {/* Volumetric rain simulation for immersive cyber atmosphere */}
      <div className="rain-container">
        {[...Array(25)].map((_, i) => {
          const delay = Math.random() * 5;
          const left = Math.random() * 100;
          const duration = 1.2 + Math.random() * 1.5;
          return (
            <div 
              key={i} 
              className="rain-drop" 
              style={{
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`
              }}
            />
          );
        })}
      </div>

      {/* FIXED IMMERSIVE HEADER */}
      <header id="header-nav" className="fixed top-0 left-0 w-full z-50 bg-[#050507]/80 backdrop-blur-md border-b border-zinc-900/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo with font-orbitron */}
          <button 
            onClick={() => scrollToSection('hero')} 
            className="flex items-center space-x-2 text-left group cursor-pointer"
            id="logo-brand"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-950/40 flex items-center justify-center border border-zinc-800 group-hover:border-emerald-500/50 transition-all overflow-hidden p-0.5">
              <img 
                src="Teonanacatl 94 Logo.png" 
                alt="Teonanacatl 94" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-orbitron font-black text-white tracking-widest text-lg block group-hover:text-emerald-400 transition-colors">
                TEONANACATL <span className="text-emerald-500">94</span>
              </span>
              <span className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase block -mt-1">
                Cyber-Mesoamérica Unit
              </span>
            </div>
          </button>

          {/* Nav Links Desktop */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wider font-orbitron">
            <button onClick={() => scrollToSection('hero')} className="text-zinc-400 hover:text-emerald-400 transition-colors uppercase h-20 flex items-center border-b-2 border-transparent hover:border-emerald-500/50">Início</button>
            <button onClick={() => scrollToSection('banda')} className="text-zinc-400 hover:text-emerald-400 transition-colors uppercase h-20 flex items-center border-b-2 border-transparent hover:border-emerald-500/50">Banda</button>
            <button onClick={() => scrollToSection('nano')} className="text-zinc-400 hover:text-emerald-400 transition-colors uppercase h-20 flex items-center border-b-2 border-transparent hover:border-emerald-500/50">Nano</button>
            <button onClick={() => scrollToSection('discografia')} className="text-zinc-400 hover:text-emerald-400 transition-colors uppercase h-20 flex items-center border-b-2 border-transparent hover:border-emerald-500/50">Discografia</button>
            <button onClick={() => scrollToSection('musicas')} className="text-zinc-400 hover:text-emerald-400 transition-colors uppercase h-20 flex items-center border-b-2 border-transparent hover:border-emerald-500/50">Músicas</button>
            <button onClick={() => scrollToSection('fas')} className="text-zinc-400 hover:text-emerald-400 transition-colors uppercase h-20 flex items-center border-b-2 border-transparent hover:border-emerald-500/50">Fãs</button>
            <button onClick={() => scrollToSection('contato')} className="text-zinc-400 hover:text-emerald-400 transition-colors uppercase h-20 flex items-center border-b-2 border-transparent hover:border-emerald-500/50">Contato</button>
          </nav>

          {/* Social Icons & Mobile toggle */}
          <div className="flex items-center space-x-4">
            {/* Social Icons Right */}
            <div className="hidden sm:flex items-center space-x-3">
              <a href="https://open.spotify.com/intl-pt/artist/26hUmRb9oyf0KlZ2xcBtkZ?si=oNZVWb0vT4qKQROorqEhUw" target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900/50 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 border border-zinc-800 rounded-lg transition-all" title="Spotify">
                <Music className="w-4 h-4" />
              </a>
              <a href="https://soundcloud.com/teonanacatl94/sets/teonanacatl-94-recovered" target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900/50 hover:bg-pink-500/10 text-zinc-400 hover:text-pink-400 border border-zinc-800 rounded-lg transition-all" title="SoundCloud">
                <Disc className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/@Teonanacatl94" target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900/50 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-500 border border-zinc-800 rounded-lg transition-all" title="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/teonanacatl94/" target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900/50 hover:bg-pink-500/10 text-zinc-400 hover:text-pink-500 border border-zinc-800 rounded-lg transition-all" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
            </div>

            {/* Mobile Menu Icon */}
            <button 
              onClick={() => setNavOpen(!navOpen)} 
              className="p-2 md:hidden bg-zinc-900 text-white rounded-lg border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="mobile-menu-toggle"
            >
              {navOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {navOpen && (
          <div className="md:hidden bg-[#050507]/95 border-b border-zinc-900 absolute top-20 left-0 w-full p-6 space-y-4 shadow-2xl backdrop-blur-lg animate-fadeIn">
            <div className="grid grid-cols-2 gap-3 text-center">
              <button onClick={() => scrollToSection('hero')} className="p-3 bg-zinc-950/80 hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-400 rounded-lg border border-zinc-900 font-orbitron text-xs font-bold tracking-wider transition-all uppercase">Início</button>
              <button onClick={() => scrollToSection('banda')} className="p-3 bg-zinc-950/80 hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-400 rounded-lg border border-zinc-900 font-orbitron text-xs font-bold tracking-wider transition-all uppercase">Banda</button>
              <button onClick={() => scrollToSection('nano')} className="p-3 bg-zinc-950/80 hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-400 rounded-lg border border-zinc-900 font-orbitron text-xs font-bold tracking-wider transition-all uppercase">Nano</button>
              <button onClick={() => scrollToSection('discografia')} className="p-3 bg-zinc-950/80 hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-400 rounded-lg border border-zinc-900 font-orbitron text-xs font-bold tracking-wider transition-all uppercase">Discografia</button>
              <button onClick={() => scrollToSection('musicas')} className="p-3 bg-zinc-950/80 hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-400 rounded-lg border border-zinc-900 font-orbitron text-xs font-bold tracking-wider transition-all uppercase text-left col-span-2 flex items-center justify-center space-x-2">
                <Music className="w-4 h-4 text-emerald-400" />
                <span>CENTRAL DE MÚSICAS</span>
              </button>
              <button onClick={() => scrollToSection('fas')} className="p-3 bg-zinc-950/80 hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-400 rounded-lg border border-zinc-900 font-orbitron text-xs font-bold tracking-wider transition-all uppercase col-span-1">Fãs</button>
              <button onClick={() => scrollToSection('contato')} className="p-3 bg-zinc-950/80 hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-400 rounded-lg border border-zinc-900 font-orbitron text-xs font-bold tracking-wider transition-all uppercase col-span-1">Contato</button>
            </div>
            {/* Quick socials in mobile footer */}
            <div className="flex items-center justify-center space-x-4 pt-4 border-t border-zinc-900">
              <a href="https://open.spotify.com/intl-pt/artist/26hUmRb9oyf0KlZ2xcBtkZ?si=oNZVWb0vT4qKQROorqEhUw" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-emerald-400">
                <Music className="w-5 h-5" />
              </a>
              <a href="https://soundcloud.com/teonanacatl94/sets/teonanacatl-94-recovered" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-pink-400">
                <Disc className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@Teonanacatl94" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-emerald-500">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/teonanacatl94/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-pink-500">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* SEÇÃO 1: HERO SECTION - BANNER PRINCIPAL */}
      <section 
        id="hero" 
        className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
      >
        {/* Cinematic Backdrop with Volcanic mesh & Fallback styling */}
        <div className="absolute inset-0 z-0">
          {!heroImgError ? (
            <img 
              src="Banda Teonanacatl94.png" 
              alt="Teonanacatl Retro concert"
              onError={() => setHeroImgError(true)}
              className="w-full h-full object-cover object-center scale-100 opacity-50 filter brightness-70 contrast-125 saturate-75 transition-opacity"
            />
          ) : (
            /* Premium gradient styled as volcanic landscape + neon glows if image missing */
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_bottom,#1a0b2e_0%,#090514_50%,#030206_100%)] flex items-center justify-center">
              <div className="absolute top-1/2 left-1/4 w-[40%] aspect-square rounded-full bg-emerald-500/5 blur-[120px] animate-pulse"></div>
              <div className="absolute top-1/3 right-1/4 w-[40%] aspect-square rounded-full bg-pink-500/5 blur-[120px] animate-pulse"></div>
              {/* Abstract lines simulation of a Concert stage */}
              <svg className="w-full h-full opacity-10 absolute pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="10" y1="100" x2="30" y2="40" stroke="#10b981" strokeWidth="0.1" />
                <line x1="50" y1="100" x2="50" y2="40" stroke="#ec4899" strokeWidth="0.1" />
                <line x1="90" y1="100" x2="70" y2="40" stroke="#10b981" strokeWidth="0.1" />
                <circle cx="50" cy="40" r="15" fill="none" stroke="#f59e0b" strokeWidth="0.05" strokeDasharray="1 2" />
              </svg>
            </div>
          )}
          
          {/* Obsidian-styled Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/40 to-black/60"></div>
          {/* Cybernetic grid mapping */}
          <div className="absolute bottom-0 left-0 w-full h-[30%] bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px)] [background-size:100%_4px] [mask-image:linear-gradient(to_top,black,transparent)]"></div>
        </div>

        {/* Hero Content Area */}
        <div className="relative z-10 text-center max-w-4xl px-4 flex flex-col items-center">
          
          {/* Jade Neon Stamp badge */}
          <div className="mb-6 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono tracking-widest uppercase shadow-lg animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>CYBER-MESOAMÉRICA UNIVERSE</span>
          </div>

          <h1 className="font-orbitron font-black text-[36px] w-[363.469px] text-white tracking-widest uppercase select-none relative filter drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] leading-tight">
            TEONANACATL <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-pink-500">94</span>
          </h1>

          <p className="mt-4 font-orbitron font-semibold text-lg sm:text-2xl text-zinc-300 tracking-[0.4em] uppercase">
            Brazilian Rock Band
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">
            <div className="flex items-center space-x-1">
              <Clock className="w-4.5 h-4.5 text-emerald-400" />
              <span className="text-[13px] font-bold">GRAVADO EM 1994</span>
            </div>
            <span className="hidden sm:inline text-zinc-700">//</span>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4.5 h-4.5 text-pink-400" />
              <span className="text-[13px] font-bold">RECONSTRUÍDO EM 2026</span>
            </div>
          </div>

          {/* Call To Action in neon pink */}
          <div className="mt-12">
            <button 
              onClick={() => scrollToSection('discografia')}
              className="px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-orbitron text-sm font-bold tracking-widest uppercase rounded-full border border-pink-400/50 hover:border-pink-300 transition-all cursor-pointer transform hover:-translate-y-1 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]"
              id="cta-listen-btn"
            >
              OUÇA TEONANACATL 94 (ReCovered)
            </button>
          </div>

          {/* Little scroll-down marker */}
          <button 
            onClick={() => scrollToSection('banda')}
            className="mt-20 text-zinc-500 hover:text-emerald-400 transition-colors animate-bounce flex flex-col items-center space-y-2 cursor-pointer focus:outline-none"
            title="Rolar para baixo"
          >
            <span className="font-mono text-[9px] tracking-widest uppercase">CONHEÇA A HISTÓRIA</span>
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          </button>

        </div>
      </section>

      {/* SEÇÃO 2: A BANDA (SOBRE & INTEGRANTES) */}
      <section 
        id="banda" 
        className="py-12 sm:py-16 relative bg-[#07070a] border-y border-zinc-900 overflow-hidden"
      >
        {/* Subtle decorative rock texture placeholder */}
        <div className="absolute inset-0 bg-[#07070a] opacity-50 z-0 flex items-center justify-center">
          <div className="absolute right-0 bottom-0 w-[50%] h-[50%] bg-emerald-500/2 blur-[100px] pointer-events-none"></div>
          <div className="absolute left-0 top-1/4 w-[40%] h-[40%] bg-pink-500/2 blur-[100px] pointer-events-none"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Section */}
          <div className="border-l-4 border-emerald-500 pl-4 mb-10">
            <span className="font-mono text-xs text-emerald-400 tracking-widest uppercase font-bold block">01 // THE LEGEND REBORN</span>
            <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-white tracking-wider uppercase mt-1">
              A BANDA & SUA ODISSÉIA
            </h2>
            <div className="h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent w-48 mt-2"></div>
          </div>

          {/* Grid layout containing text & photo card details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Biography text content */}
            <div className="lg:col-span-7 space-y-6 text-zinc-300 leading-relaxed text-base sm:text-lg">
              <p className="font-bold text-white text-lg sm:text-xl border-l-2 border-pink-500/60 pl-3">
                Teonanacatl é uma banda de rock nacional formada em 1994, cujo álbum original — gravado de forma crua e visceral, em uma única noite e com limitações técnicas na qualidade do áudio — permaneceu perdido por mais de duas décadas.
              </p>

              {/* Destaque para o significado do nome */}
              <div className="p-5 rounded-lg bg-emerald-950/10 border border-emerald-500/20 shadow-xl space-y-2">
                <span className="font-orbitron text-xs text-emerald-400 font-bold block uppercase tracking-widest">// O SIGNIFICADO DO NOME</span>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  <strong>Teonanacatl</strong> significa <span className="text-emerald-400 font-semibold">"A Carne dos Deuses"</span>, cogumelos sagrados (<em>Psilocybe Cubensis</em>) que são utilizados em cerimônias e rituais religiosos há milhares de anos por diversos povos e culturas, entre eles os Maias, Astecas e Mazatecas no México, como ferramenta para alcançar a compreensão do Universo, contato com seres celestiais e com o "Divino".
                </p>
              </div>
              
              <p>
                Após o fim precoce da banda, esse material precioso permaneceu enterrado em gavetas até 2020, quando foi lançado em sua forma original sob o título de <span className="text-emerald-400 font-semibold font-orbitron">Teonanacatl 94</span> — um registro autêntico, imperfeito e profundamente verdadeiro de uma época. 
              </p>

              <p>
                No mesmo ano de 2020, Carlão e Dennis decidiram iniciar um projeto ambicioso de reconstrução dessas canções, buscando uma nova interpretação artística com maior qualidade, estrutura e sofisticação de som. O projeto, porém, foi tragicamente interrompido com o falecimento precoce de Carlão em 2021, decorrente de complicações da Covid-19.
              </p>

              <div className="p-5 rounded-lg bg-zinc-950/80 border border-zinc-850 shadow-xl space-y-4">
                <span className="font-orbitron text-xs text-pink-500 font-bold block uppercase tracking-widest">RESGATE COMPLEMENTAR (2026)</span>
                <p className="text-sm font-medium">
                  Em 2026, esse valioso trabalho finalmente renasce como <span className="text-pink-400 font-bold font-orbitron">Teonanacatl 94 (ReCovered)</span> — uma detalhada reconstrução tecnológica que preserva religiosamente a essência emocional do registro físico de noventa e quatro, ganhando nova vida definitiva como tributo ao legado eterno de Carlão Oliveira.
                </p>
              </div>

              <p className="text-sm italic text-zinc-500 border-t border-zinc-900 pt-4">
                "Entre 1994 e o presente, existe Nano, a representação de nossa música com a essência invisível capturada nas gravações de 1994. Uma presença que nasce do imperfeito, do humano e do verdadeiro — e que atravessa o tempo para pulsar livre hoje."
              </p>
            </div>

            {/* Quick stats sidebox */}
            <div className="lg:col-span-1 border-r border-zinc-900/60 h-full hidden lg:block"></div>

            <div className="lg:col-span-4 bg-[#0a0a0f] border border-zinc-900 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <h3 className="font-orbitron text-sm tracking-widest text-[#B392AC] font-black uppercase">RECORDS_TRANSMISSION_INFO_UNIT</h3>
              <div className="space-y-4 font-mono text-xs">
                <div className="flex justify-between py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">ORIGEM:</span>
                  <span className="text-zinc-300">SÃO PAULO - SP (BRASIL)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">FORMATADO:</span>
                  <span className="text-zinc-300">VINTAGE ANALOG BAND</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">RESTAURAÇÃO:</span>
                  <span className="text-zinc-300">2026 TECHNOLOGY RESCUE</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">MASCOTE OFICIAL:</span>
                  <span className="text-zinc-300">NANO (THE CONSCIOUSNESS)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">GENERO INTEGRAL:</span>
                  <span className="text-zinc-300">ROCK NACIONAL / ALTERNATIVO</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-zinc-500">PLAYLIST TOTAL:</span>
                  <span className="text-zinc-300">16 COMPLETE REMASTERS</span>
                </div>
              </div>
              <div className="bg-[#050507] p-3 rounded-lg border border-zinc-920 text-center font-mono text-[10px] text-zinc-500">
                DATA_NODE_LOCK: ACTIVE_EMOTIONAL_TRIBUTE
              </div>
            </div>

          </div>

          {/* Grid de Integrantes */}
          <div className="mt-12">
            <h3 className="font-orbitron font-bold text-[13px] text-emerald-400 tracking-widest uppercase mb-8 border-b border-zinc-900 pb-2">
              FORMAÇÃO ORIGINAL // INTEGRANTES DA GRAVAÇÃO DE 1994
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Member Carlão */}
              <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-900 flex flex-col items-center shadow-xl space-y-4">
                <MemberImage 
                  src="carlao.png" 
                  name="Carlão Oliveira" 
                  role="Guitarra, Voz, Compositor" 
                />
                <div className="text-center w-full">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-pink-950/20 text-pink-400 border border-pink-500/20 text-[10px] font-mono tracking-widest uppercase mb-2">
                    In Memoriam (†2021)
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-mono">
                    Compositor e Guitarrista de som cru, alma e voz original do projeto, falecido em 2021 por Covid.
                  </p>
                </div>
              </div>

              {/* Member Dudu */}
              <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-900 flex flex-col items-center shadow-xl space-y-4">
                <MemberImage 
                  src="dudu.png" 
                  name="Dudu Oliveira" 
                  role="Baixo, Guitarra, Voz, Compositor" 
                />
                <div className="text-center w-full">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-805 text-[10px] font-mono tracking-widest uppercase mb-2">
                    Bass Master
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-mono">
                    Compositor e Responsável pelo peso melódico do contrabaixo e as dinâmicas rítmicas de 94.
                  </p>
                </div>
              </div>

              {/* Member Dennis */}
              <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-900 flex flex-col items-center shadow-xl space-y-4">
                <MemberImage 
                  src="dennis.png" 
                  name="Dennis Milan" 
                  role="Bateria, Produtor" 
                />
                <div className="text-center w-full">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono tracking-widest uppercase mb-2">
                    Drums & Production
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-mono">
                    Baterista estruturado, idealizador técnico do projeto de resgate sonoro ReCovered.
                  </p>
                </div>
              </div>

              {/* Member Décio */}
              <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-900 flex flex-col items-center shadow-xl space-y-4">
                <MemberImage 
                  src="decio.png" 
                  name="Décio Coraça" 
                  role="Teclados" 
                />
                <div className="text-center w-full">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-950/20 text-amber-400 border border-amber-500/20 text-[10px] font-mono tracking-widest uppercase mb-2">
                    Keys & SFX
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-mono">
                    Criador das atmosferas espaciais e arranjos épicos de piano e teclados que desenham as músicas.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO 3: NANO (MASCOTE OFICIAL) */}
      <section 
        id="nano" 
        className="py-12 sm:py-16 relative bg-[#050507] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Section */}
          <div className="border-l-4 border-amber-500 pl-4 mb-10">
            <span className="font-mono text-xs text-amber-400 tracking-widest uppercase font-bold block">02 // THE CONSCIOUSNESS OF 94</span>
            <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-white tracking-wider uppercase mt-1">
              NANO: CONSCIÊNCIA INVISÍVEL
            </h2>
            <div className="h-0.5 bg-gradient-to-r from-amber-500/50 to-transparent w-48 mt-2"></div>
          </div>

          {/* Nano Interactive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Nano Image / SVG Wrapper */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              
              <div className="relative w-full max-w-[340px] aspect-square rounded-2xl bg-[#090a0f] border border-zinc-800 p-4 shadow-2xl flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(#1a1103_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>
                
                {/* Fallback & SVG graphics directly representing Nano */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <NanoDisplay />
                    <div className="mt-4 text-xs font-mono text-center text-amber-500 tracking-widest uppercase">NANO_CONSCIOUSNESS_SYS</div>
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 flex space-x-1 z-20">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
              </div>

              {/* Glowing label */}
              <p className="mt-4 text-xs font-mono text-amber-400 uppercase tracking-widest flex items-center space-x-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse"></span>
                <span>OLHOS EM DESTAQUE ÂMBAR SUAVE</span>
              </p>

            </div>

            {/* Explanation box */}
            <div className="lg:col-span-7 space-y-6 text-zinc-300">
              <div className="space-y-4">
                <h3 className="font-orbitron font-black text-2xl text-white tracking-wide uppercase">
                  NANO — MASCOTE OFICIAL & ESSÊNCIA
                </h3>
                <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest border-b border-zinc-900 pb-2">
                  NANO NÃO É SÓ UM MASCOTE. ELE É A ESSÊNCIA DA MADRUGADA DE 1994.
                </p>
              </div>

              <div className="space-y-4 text-base leading-relaxed">
                <p>
                  Nano nasceu da música. Na noite fria de 1994, quando as faixas do primeiro álbum foram gravadas de cabo a rabo em um único take — imperfeitas, cruas e carregadas do desespero e sentimentos dos integrantes — algo ficou indelevelmente registrado além do som nas fitas analógicas.
                </p>
                <p>
                  Algo invisível. Algo misteriosamente vivo. <span className="text-amber-400 font-bold">Esse algo é o Nano.</span>
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900">
                    <span className="text-xs text-amber-400 font-mono font-bold block mb-2">// ORIGEM (MISTÉRIO DE 94)</span>
                    <p className="text-xs font-mono text-zinc-400">
                      Durante aquela madrugada mágica, entre falhas analógicas de gravação, ruídos estruturais de amplificadores quentes e sentimentos humanos intensos, a fita magnética capturou um estado de espírito duradouro. As fitas se degradaram, mas Nano emergiu cristalino.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900">
                    <span className="text-xs text-amber-400 font-mono font-bold block mb-2">// NATUREZA INTROSPECTIVA</span>
                    <p className="text-xs font-mono text-zinc-400">
                      Ele não fala. Ele não se intromete. Ele apenas observa em silêncio absoluto. Seus olhos vibram em uma brilhante iluminação âmbar — uma percepção, memória ancestral e consciência pura que resume tudo que já ecoou.
                    </p>
                  </div>
                </div>
              </div>

              {/* POETIC SENTENCE AREA */}
              <div className="border-t border-zinc-900 pt-6 space-y-4">
                <h4 className="font-orbitron text-xs text-zinc-400 font-bold uppercase tracking-widest">ECOS ENIGMÁTICOS DO NANO // CLIQUE PARA INTERAGIR</h4>
                
                {/* Clicking on these phrases updates an internal feed simulation */}
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { text: "“Eu estava lá em 94.”", code: "TRANS_94_OK" },
                    { text: "“Eu nunca fui embora.”", code: "PERSISTENCE_STATE" },
                    { text: "“Está dentro de nós.”", code: "RESONANCE_ENGAGED" },
                    { text: "“O som ficou.”", code: "ACOUSTIC_MEM_ACTIVE" },
                    { text: "“O registro se perdeu. Eu não.”", code: "RECOVERED_STABLE" }
                  ].map((phrase, i) => (
                    <button
                      key={i}
                      onClick={() => handleNanoPhraseClick(i, phrase.text, phrase.code)}
                      className="px-4 py-2 bg-zinc-950 border border-zinc-900 hover:border-amber-500/50 hover:bg-amber-500/5 text-xs text-zinc-400 hover:text-amber-400 rounded-lg transition-all font-semibold uppercase tracking-wider text-left cursor-pointer"
                    >
                      {phrase.text}
                    </button>
                  ))}
                </div>

                {/* Simulated live console feed connected to the clicks */}
                <div className="bg-[#030304] border border-zinc-90 w-full p-4 rounded-xl flex items-center space-x-4">
                  <div className="w-2.5 h-10 bg-amber-500/10 border-l-2 border-amber-500 hidden sm:block"></div>
                  <div className="font-mono text-xs space-y-1 text-zinc-400 w-full">
                    <p className="text-[10px] text-zinc-600 uppercase flex justify-between w-full">
                      <span>NANO_DEC_FEED_SYS (ACTIVE_LOGS)</span>
                      <span>CODE: {nanoLogCode}</span>
                    </p>
                    <p className="text-xs text-amber-400/90 font-bold">{activeNanoPhrase}</p>
                    {nanoClickCount > 0 && (
                      <p className="text-[10px] text-zinc-600">Interações registradas com o mascote: {nanoClickCount}</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SEÇÃO 4: DISCOGRAFIA (OS DOIS ÁLBUNS) */}
      <section 
        id="discografia" 
        className="py-12 sm:py-16 relative bg-[#07070a] border-y border-zinc-900 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Section */}
          <div className="border-l-4 border-pink-500 pl-4 mb-10">
            <span className="font-mono text-xs text-pink-400 tracking-widest uppercase font-bold block">03 // AUDIO RECORDINGS</span>
            <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-white tracking-wider uppercase mt-1">
              DISCOGRAFIA HISTÓRICA & RESGATE
            </h2>
            <div className="h-0.5 bg-gradient-to-r from-pink-500/50 to-transparent w-48 mt-2"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mt-8">
            
            {/* ALBUM 1: Original 1994 */}
            <div className="bg-zinc-950 rounded-2xl border border-zinc-900 shadow-2xl p-6 flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-300">
              <div className="space-y-6">
                
                {/* Simulated original covers utilizing a fallback gradient */}
                <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-xl overflow-hidden shadow-lg border border-zinc-850">
                  {!albumOriginalError ? (
                    <img 
                      src="/Teonanacatl 94.jpg" 
                      alt="Capa Teonanacatl 94"
                      onError={() => setAlbumOriginalError(true)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    /* Gorgeous raw pink outline simulation of original cover as requested (Image 9) */
                    <div className="w-full h-full bg-[#ec4899] flex flex-col justify-between p-6 relative">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="border-4 border-white/20 w-full h-full p-4 flex flex-col justify-between relative z-10">
                        <span className="font-orbitron font-black text-2xl tracking-widest text-white block uppercase">
                          TEONANACATL 94
                        </span>
                        <div className="flex flex-wrap gap-1 leading-none opacity-50">
                          {[...Array(6)].map((_, i) => (
                            <span key={i} className="text-[10px] text-white">🍄</span>
                          ))}
                        </div>
                        <span className="text-[10px] text-white font-mono tracking-widest block uppercase text-right">
                          ORIGINAL_RELEASE_1994
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-black/80 backdrop-blur-md rounded-md border border-zinc-800 text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                    LADO_A / LADO_B
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-orbitron font-black text-2xl text-white tracking-wide uppercase">Teonanacatl 94</h3>
                      <p className="text-sm font-mono text-zinc-500">Disco Original (1994)</p>
                    </div>
                    <span className="px-3 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] font-mono rounded-md block">
                      ANALOG_MASTER
                    </span>
                  </div>
                  
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    O disco histórico gravado em uma única noite atribulada de 1994. Cru, visceral, analógico, com problemas técnicos nos áudios e sem as frescuras digitais dos estúdios modernos. As fitas originais se perderam por mais de duas décadas, mas foram digitalizadas na íntegra no ano de 2020.
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-900/60">
                    <iframe 
                      data-testid="embed-iframe" 
                      style={{ borderRadius: "12px" }} 
                      src="https://open.spotify.com/embed/album/4PS00vnLmMPrsKMz5Wq2hj?utm_source=generator&si=44eb7d59324a471f" 
                      width="100%" 
                      height="352" 
                      frameBorder="0" 
                      allowFullScreen 
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase">15 FAIXAS ORIGINAIS</span>
                <a 
                  href="https://open.spotify.com/intl-pt/album/4PS00vnLmMPrsKMz5Wq2hj?si=FSbd7oilS9-zA31GsaLtaA" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-emerald-500 text-xs font-bold font-orbitron tracking-wider uppercase text-white hover:text-emerald-400 rounded-lg transition-all flex items-center space-x-2"
                >
                  <span>OUVIR VERSÃO ORIGINAL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

            {/* ALBUM 2: ReCovered 2026 */}
            <div className="bg-zinc-950 rounded-2xl border border-zinc-900 shadow-2xl p-6 flex flex-col justify-between group hover:border-pink-500/40 transition-all duration-300">
              <div className="space-y-6">
                
                {/* Simulated restored covers utilizing a fallback gradient */}
                <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-xl overflow-hidden shadow-lg border border-zinc-850">
                  {!albumRecoveredError ? (
                    <img 
                      src="/Teonanacatl 1994 (ReCovered) - Final.png" 
                      alt="Capa Teonanacatl 94 ReCovered"
                      onError={() => setAlbumRecoveredError(true)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    /* Fallback inspired on Image 2 with amber eyes */
                    <div className="w-full h-full bg-[#1c0f05] flex flex-col justify-between p-6 relative">
                      <div className="absolute inset-0 bg-radial-at-c from-amber-500/10 via-transparent to-transparent opacity-80 animate-pulse"></div>
                      <div className="border-4 border-[#f59e0b]/40 w-full h-full p-4 flex flex-col justify-between relative z-10">
                        <span className="font-orbitron font-black text-2xl tracking-widest text-[#f59e0b] block uppercase">
                          RECOVERED
                        </span>
                        <div className="w-14 h-14 mx-auto border border-amber-500/30 rounded-full flex items-center justify-center relative">
                          <div className="absolute w-2 h-2 bg-amber-400 rounded-full left-3 animate-pulse"></div>
                          <div className="absolute w-2 h-2 bg-amber-400 rounded-full right-3 animate-pulse"></div>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono tracking-widest block uppercase text-right">
                          TRIBUTE_COLLECTION_2026
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-black/80 backdrop-blur-md rounded-md border border-zinc-800 text-[9px] font-mono text-pink-400 uppercase tracking-widest">
                    RESGATE DE 2026
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-orbitron font-black text-2xl text-white tracking-wide uppercase">Teonanacatl 94 (ReCovered)</h3>
                      <p className="text-sm font-mono text-zinc-500">Lançamento Especial (2026)</p>
                    </div>
                    <span className="px-3 py-1 bg-pink-950/20 text-pink-400 border border-pink-500/30 text-[10px] font-mono rounded-md block uppercase">
                      TECH_RECOVERY
                    </span>
                  </div>
                  
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    A reconstrução sofisticada e remasterização total das músicas originais com altíssima qualidade sonora de estúdio e arranjos preservados, servindo como merecido tributo ao Carlão Oliveira.
                  </p>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase">15 REMASTERS + 1 BONUS TRACK</span>
                <button 
                  onClick={() => scrollToSection('musicas')}
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-xs font-bold font-orbitron tracking-wider uppercase text-white rounded-lg transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] cursor-pointer"
                >
                  <span>ABRIR CENTRAL PLAYER</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SEÇÃO 5: CENTRAL DE MÚSICAS (PLAYER DE ALTO IMPACTO & FAIXAS EXPANSÍVEL) */}
      <section 
        id="musicas" 
        className="py-12 sm:py-16 relative bg-[#050507] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Section */}
          <div className="border-l-4 border-emerald-500 pl-4 mb-10">
            <span className="font-mono text-xs text-emerald-400 tracking-widest uppercase font-bold block">04 // CYBERNETIC CENTRAL AUDIO DECK</span>
            <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-white tracking-wider uppercase mt-1">
              CENTRAL DE MÚSICAS & LETRAS
            </h2>
            <div className="h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent w-48 mt-2"></div>
          </div>

          {/* TWO COLUMN DECK: Left track select list, right detailed audio deck and lyrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT COLUMN: Tracklist (16 tracks list) */}
            <div className="lg:col-span-5 flex flex-col bg-zinc-950/70 rounded-2xl border border-zinc-900 p-4 space-y-1.5">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500 block px-2 mb-2">SELECIONE UMA FAIXA PARA DECRIPTAR</span>
              
              {tracks.map((track, i) => (
                <button
                  key={i}
                  onClick={() => {
                    selectTrack(i);
                    setPlayerTab('soundcloud');
                  }}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all duration-250 cursor-pointer ${
                    activeTrack === i 
                      ? 'bg-zinc-900 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                      : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/10'
                  }`}
                  id={`track-select-btn-${i}`}
                >
                  <div className="flex items-center space-x-3.5 w-full pr-4">
                    <span className={`font-mono text-xs font-bold leading-none ${activeTrack === i ? 'text-emerald-400' : 'text-zinc-650'}`}>
                      {i < 9 ? `0${i + 1}` : i + 1}
                    </span>
                    <div className="truncate">
                      <h4 className={`text-sm tracking-wide font-bold uppercase truncate ${activeTrack === i ? 'text-white' : 'text-zinc-400'}`}>
                        {track.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono tracking-wider truncate uppercase">{track.genre}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[9px] text-zinc-500 whitespace-nowrap hidden sm:block">
                      {track.bpm}
                    </span>
                    {activeTrack === i && isAudioLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    ) : activeTrack === i && isPlaying ? (
                      <div className="flex items-center space-x-0.5">
                        <span className="w-1 h-3 bg-emerald-400 animate-pulse inline-block"></span>
                        <span className="w-1 h-5 bg-emerald-400 animate-pulse delay-75 inline-block"></span>
                        <span className="w-1 h-2 bg-emerald-400 animate-pulse delay-150 inline-block"></span>
                      </div>
                    ) : (
                      <div className={`w-1.5 h-1.5 rounded-full ${activeTrack === i ? 'bg-emerald-400' : 'bg-transparent'}`}></div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* RIGHT COLUMN: Audio Deck visualizer, Notes and COMPLETE LYRICS */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-zinc-950 rounded-2xl border border-zinc-900 p-6 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/2 rounded-full blur-3xl pointer-events-none"></div>
              
              {/* Dynamic player block */}
              <div className="space-y-4">
                
                {/* Active song metadata */}
                <div className="flex flex-col sm:flex-row justify-between items-start md:items-center border-b border-zinc-900 pb-4">
                  <div>
                    <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-zinc-900 text-emerald-400 rounded-md text-[9px] font-mono tracking-widest uppercase mb-1.5">
                      <span>DECRYPTING NOW</span>
                    </div>
                    <h3 className="font-orbitron font-black text-2xl tracking-wide text-white uppercase flex items-center space-x-2">
                      <span>{tracks[activeTrack].title}</span>
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{tracks[activeTrack].genre}</p>
                  </div>
                  <div className="mt-2.5 sm:mt-0 bg-[#07070a] px-3.5 py-2 border border-zinc-900 rounded-xl flex items-center space-x-3 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-[9px] text-zinc-500 block">BPM SPEED</span>
                      <span className="text-zinc-300 font-bold">{tracks[activeTrack].bpm}</span>
                    </div>
                    <span className="h-6 w-px bg-zinc-900"></span>
                    <div>
                      <span className="text-[9px] text-zinc-500 block">FREQUENCY</span>
                      <span className="text-[#E6AF2E] font-bold">432 HZ</span>
                    </div>
                  </div>
                </div>

                {/* Cyberpunk technical meta block */}
                <div className="bg-[#030304] p-3 rounded-lg border border-zinc-920">
                  <span className="text-[9px] font-mono text-emerald-500 block tracking-widest uppercase mb-1">CYBER_STUDIO_DATALOG_LOGS_A1</span>
                  <code className="text-[10px] font-mono text-zinc-400 leading-relaxed block tracking-wide">
                    {tracks[activeTrack].meta}
                  </code>
                </div>

                {/* Band Notes block in Portuguese */}
                <div className="space-y-3 bg-zinc-900/40 p-5 rounded-xl border border-zinc-900">
                  <span className="font-orbitron text-xs text-[#E6AF2E] font-bold block uppercase tracking-widest">// NOTAS DA BANDA (1994 & HOJE)</span>
                  <p className="text-sm text-zinc-300 leading-relaxed italic">
                    "{tracks[activeTrack].notes}"
                  </p>
                </div>

                {/* Standardized Iframe Embed Player Container */}
                <StandardizedEmbedPlayer 
                  track={tracks[activeTrack]}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  nextTrack={nextTrack}
                  prevTrack={prevTrack}
                />

              </div>

              {/* COMPLETE LYRICS (MANDATORY VERSE-BY-VERSE ACCORDION COMPONENT) */}
              <div className="border border-zinc-900 rounded-xl overflow-hidden shadow-lg">
                <button
                  onClick={() => setLyricsExpanded(!lyricsExpanded)}
                  className="w-full bg-[#07070a] p-4 flex items-center justify-between text-left hover:bg-zinc-900/50 transition-colors focus:outline-none"
                  id={`lyrics-toggle-btn-${activeTrack}`}
                >
                  <div className="flex items-center space-x-2">
                    <Music className="w-4 h-4 text-pink-400" />
                    <span className="font-orbitron text-xs font-bold uppercase tracking-widest text-[#e4e4e7]">
                      LETRA COMPLETA DA MÚSICA
                    </span>
                  </div>
                  {lyricsExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>

                {lyricsExpanded && (
                  <div className="bg-zinc-950/60 p-6 border-t border-zinc-900 text-center font-semibold text-zinc-300 whitespace-pre-line text-sm md:text-base leading-relaxed max-h-[300px] overflow-y-auto animate-fadeIn scrollbar-thin">
                    {tracks[activeTrack].lyrics}
                  </div>
                )}
              </div>

              {/* Sptify and Soundcloud link platforms placeholder */}
              <div className="pt-4 border-t border-zinc-900/60 flex flex-col md:flex-row gap-3">
                <a 
                  href="https://open.spotify.com/intl-pt/artist/26hUmRb9oyf0KlZ2xcBtkZ?si=oNZVWb0vT4qKQROorqEhUw" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 p-3 bg-zinc-900 hover:bg-zinc-850 hover:border-emerald-500 rounded-xl border border-zinc-900 text-xs font-mono font-bold tracking-widest text-zinc-300 hover:text-emerald-400 text-center uppercase transition-all flex items-center justify-center space-x-2"
                >
                  <Music className="w-4 h-4 text-emerald-400" />
                  <span>OUVIR NO SPOTIFY OFICIAL</span>
                </a>
                <a 
                  href="https://soundcloud.com/teonanacatl94/sets/teonanacatl-94-recovered" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 p-3 bg-zinc-900 hover:bg-zinc-850 hover:border-pink-500 rounded-xl border border-zinc-900 text-xs font-mono font-bold tracking-widest text-zinc-300 hover:text-pink-400 text-center uppercase transition-all flex items-center justify-center space-x-2"
                >
                  <Disc className="w-4 h-4 text-pink-400" />
                  <span>PLAYLIST NO SOUNDCLOUD</span>
                </a>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SEÇÃO 5.5: ESPAÇO DOS FÃS & CADASTRO */}
      <section 
        id="fas" 
        className="py-12 sm:py-16 relative bg-[#050507] border-t border-zinc-900 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-950/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Section */}
          <div className="border-l-4 border-pink-500 pl-4 mb-10">
            <span className="font-mono text-xs text-pink-400 tracking-widest uppercase font-bold block">05 // TEONANACLÃ DE CYBER-FÃS</span>
            <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-white tracking-wider uppercase mt-1">
              CLÃ DOS FÃS
            </h2>
            <div className="h-0.5 bg-gradient-to-r from-pink-500/50 to-transparent w-48 mt-2"></div>
          </div>

          <div className="max-w-2xl mx-auto">
            
            {/* CADASTRO DO FÃ */}
            <div className="bg-zinc-950/80 rounded-2xl border border-zinc-900 p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <span className="font-orbitron text-[13px] text-emerald-400 font-bold block uppercase tracking-widest mb-1">// CADASTRO OFICIAL</span>
                <h3 className="font-orbitron font-bold text-xl text-white uppercase tracking-wider">ENTRAR PARA O TEONANACLÃ</h3>
                <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                  Cadastre-se na nossa base oficial para enviar sua mensagem e receber novidades em primeira mão sobre shows e lançamentos!
                </p>
              </div>

              {fanSubmitStatus === 'success' ? (
                <div className="p-5 rounded-lg bg-emerald-950/20 border border-emerald-500/40 text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">CADASTRO CONFIRMADO!</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Você agora faz parte do núcleo de apoiadores da Teonanacatl 94. Sua mensagem e informações foram enviadas para a banda!
                  </p>
                  <button 
                    onClick={() => setFanSubmitStatus('idle')}
                    className="mt-2 text-xs font-mono text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    Cadastrar outro fã
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterFan} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Nome Completo *</label>
                    <input 
                      type="text" 
                      required
                      value={fanName}
                      onChange={(e) => setFanName(e.target.value)}
                      placeholder="Ex: Carlos Oliveira"
                      className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1.5">E-mail *</label>
                      <input 
                        type="email" 
                        required
                        value={fanEmail}
                        onChange={(e) => setFanEmail(e.target.value)}
                        placeholder="nome@email.com"
                        className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Celular / WhatsApp</label>
                      <div className="flex gap-2">
                        <select
                          value={fanDdi}
                          onChange={(e) => setFanDdi(e.target.value)}
                          className="bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500/60 rounded-lg px-2.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono min-w-[84px] cursor-pointer"
                        >
                          {ddiList.map((item) => (
                            <option key={item.code} value={item.ddi} className="bg-zinc-950 text-zinc-300">
                              {item.code} ({item.ddi})
                            </option>
                          ))}
                        </select>
                        <input 
                          type="tel" 
                          value={fanPhone}
                          onChange={(e) => setFanPhone(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="flex-1 min-w-0 bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Instagram</label>
                      <input 
                        type="text" 
                        value={fanInstagram}
                        onChange={(e) => setFanInstagram(e.target.value)}
                        placeholder="@seu_perfil"
                        className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1.5">País *</label>
                      <select 
                        required
                        value={fanCountry}
                        onChange={(e) => setFanCountry(e.target.value)}
                        className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono cursor-pointer"
                      >
                        <option value="Brasil" className="bg-zinc-950 text-zinc-300">Brasil</option>
                        <option value="Portugal" className="bg-zinc-950 text-zinc-300">Portugal</option>
                        <option value="Angola" className="bg-zinc-950 text-zinc-300">Angola</option>
                        <option value="Moçambique" className="bg-zinc-950 text-zinc-300">Moçambique</option>
                        <option value="Cabo Verde" className="bg-zinc-950 text-zinc-300">Cabo Verde</option>
                        <option value="Guiné-Bissau" className="bg-zinc-950 text-zinc-300">Guiné-Bissau</option>
                        <option value="São Tomé e Príncipe" className="bg-zinc-950 text-zinc-300">São Tomé e Príncipe</option>
                        <option value="Timor-Leste" className="bg-zinc-950 text-zinc-300">Timor-Leste</option>
                        <option value="Argentina" className="bg-zinc-950 text-zinc-300">Argentina</option>
                        <option value="Uruguai" className="bg-zinc-950 text-zinc-300">Uruguai</option>
                        <option value="Paraguai" className="bg-zinc-950 text-zinc-300">Paraguai</option>
                        <option value="Chile" className="bg-zinc-950 text-zinc-300">Chile</option>
                        <option value="Colômbia" className="bg-zinc-950 text-zinc-300">Colômbia</option>
                        <option value="Peru" className="bg-zinc-950 text-zinc-300">Peru</option>
                        <option value="Bolívia" className="bg-zinc-950 text-zinc-300">Bolívia</option>
                        <option value="Equador" className="bg-zinc-950 text-zinc-300">Equador</option>
                        <option value="Venezuela" className="bg-zinc-950 text-zinc-300">Venezuela</option>
                        <option value="Estados Unidos" className="bg-zinc-950 text-zinc-300">Estados Unidos</option>
                        <option value="Canadá" className="bg-zinc-950 text-zinc-300">Canadá</option>
                        <option value="Reino Unido" className="bg-zinc-950 text-zinc-300">Reino Unido</option>
                        <option value="Alemanha" className="bg-zinc-950 text-zinc-300">Alemanha</option>
                        <option value="França" className="bg-zinc-950 text-zinc-300">França</option>
                        <option value="Espanha" className="bg-zinc-950 text-zinc-300">Espanha</option>
                        <option value="Itália" className="bg-zinc-950 text-zinc-300">Itália</option>
                        <option value="Japão" className="bg-zinc-950 text-zinc-300">Japão</option>
                        <option value="Outro" className="bg-zinc-950 text-zinc-300">Outro</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Estado *</label>
                      <input 
                        type="text" 
                        required
                        value={fanState}
                        onChange={(e) => setFanState(e.target.value)}
                        placeholder="Ex: SP"
                        className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Cidade *</label>
                      <input 
                        type="text" 
                        required
                        value={fanCity}
                        onChange={(e) => setFanCity(e.target.value)}
                        placeholder="Ex: São Paulo"
                        className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Música Favorita *</label>
                    <select 
                      required
                      value={fanFavTrack}
                      onChange={(e) => setFanFavTrack(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono cursor-pointer"
                    >
                      <option value="" className="bg-zinc-950 text-zinc-500">Selecione sua faixa favorita...</option>
                      {tracks.map((track, idx) => (
                        <option key={idx} value={track.title} className="bg-zinc-950 text-zinc-300">
                          {idx + 1}. {track.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Mensagem *</label>
                    <textarea 
                      required
                      value={fanMessage}
                      onChange={(e) => setFanMessage(e.target.value)}
                      placeholder="Escreva sua mensagem para a banda..."
                      rows={4}
                      className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans resize-none text-zinc-100"
                    />
                  </div>

                  {fanSubmitStatus === 'error' && (
                    <div className="text-xs text-rose-500 font-mono bg-rose-950/10 border border-rose-500/20 px-3 py-2 rounded">
                      Falha ao realizar cadastro. Verifique os campos e tente novamente.
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isSubmittingFan}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-xs font-bold font-orbitron tracking-widest uppercase text-white rounded-lg transition-all flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingFan ? 'ENVIANDO...' : 'ENVIAR MENSAGEM E ENTRAR NO CLÃ'}</span>
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* SEÇÃO 6: CONTATO & RODAPÉ (FOOTER) */}
      <section 
        id="contato" 
        className="py-12 sm:py-16 relative bg-[#07070a] border-t border-zinc-900 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          
          {/* Obsidian mask graphic placeholder */}
          <div className="mb-8 border border-zinc-900 p-6 rounded-full bg-[#050507] shadow-xl relative group">
            <svg className="w-12 h-12 text-pink-500 group-hover:text-emerald-400 transition-colors animate-pulse" viewBox="0 0 100 100" fill="none">
              <polygon points="53,10 77,50 53,90 29,50" stroke="currentColor" strokeWidth="2.5" />
              <polygon points="50,22 68,50 50,78 32,50" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="5" fill="#f59e0b" />
            </svg>
          </div>

          <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-white tracking-widest uppercase mb-4">
            CANAIS DE AGENDAMENTO & IMPRENSA
          </h2>

          <p className="font-rajdhani text-lg text-zinc-400 max-w-xl mb-6 leading-relaxed">
            Seja para fechar apresentações, licenciamento de trilha sonora ou contato promocional, conecte-se direto no núcleo operacional da banda.
          </p>

          {/* Email button grid */}
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-10">
            <a 
              href="mailto:teonanacatl1994@gmail.com" 
              className="px-8 py-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-lg text-sm font-semibold tracking-widest font-orbitron text-zinc-300 hover:text-emerald-400 transition-all flex items-center space-x-3 shadow-2xl"
              id="contact-email-btn"
            >
              <Mail className="w-4.5 h-4.5" />
              <span>teonanacatl1994@gmail.com</span>
            </a>
          </div>

          {/* Large stylized social anchors footer */}
          <div className="flex flex-wrap items-center justify-center gap-6 pb-12 border-b border-zinc-900 w-full max-w-2xl px-4">
            <a href="https://www.instagram.com/teonanacatl94/" target="_blank" rel="noopener noreferrer" className="font-orbitron text-xs tracking-wider uppercase font-black text-zinc-500 hover:text-pink-400 transition-colors">
              INSTAGRAM
            </a>
            <span className="text-zinc-805">•</span>
            <a href="https://open.spotify.com/intl-pt/artist/26hUmRb9oyf0KlZ2xcBtkZ?si=oNZVWb0vT4qKQROorqEhUw" target="_blank" rel="noopener noreferrer" className="font-orbitron text-xs tracking-wider uppercase font-black text-zinc-500 hover:text-emerald-400 transition-colors">
              SPOTIFY
            </a>
            <span className="text-zinc-805">•</span>
            <a href="https://www.youtube.com/@Teonanacatl94" target="_blank" rel="noopener noreferrer" className="font-orbitron text-xs tracking-wider uppercase font-black text-zinc-500 hover:text-emerald-500 transition-colors">
              YOUTUBE
            </a>
            <span className="text-zinc-805">•</span>
            <a href="https://soundcloud.com/teonanacatl94/sets/teonanacatl-94-recovered" target="_blank" rel="noopener noreferrer" className="font-orbitron text-xs tracking-wider uppercase font-black text-zinc-500 hover:text-pink-505 transition-colors">
              SOUNDCLOUD
            </a>
          </div>

          {/* Core copyrights stamp representing Cyber Mesoamerica */}
          <div className="mt-12 text-center text-[10px] font-mono tracking-[0.2em] text-zinc-600 space-y-2 uppercase">
            <p>© 2026 TEONANACATL 94. UNIVERSO CYBER-MESOAMÉRICA.</p>
            <p className="text-[9px] text-zinc-750">SISTEMA RECOVERED V1.2.0 • TODOS OS DIREITOS DE TRIBUTO RESERVADOS</p>
          </div>

        </div>
      </section>

    </div>
  );
}

// Fallback interactive rendering of Nano
function NanoDisplay() {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <svg className="w-48 h-48 text-amber-500" viewBox="0 0 100 100" fill="none">
        {/* Cap of mushroom */}
        <path d="M20 50 C20 18, 80 18, 80 50 C80 50, 75 50, 70 52 C65 54, 55 54, 50 50 C45 54, 35 54, 30 52 C25 50, 20 50, 20 50" fill="#1b120c" stroke="#f59e0b" strokeWidth="2.5" />
        {/* Stem */}
        <path d="M38 52 C38 52, 35 77, 30 87 C30 90, 70 90, 70 87 C65 77, 62 52, 62 52" fill="#140e08" stroke="#f59e0b" strokeWidth="2.5" />
        {/* Cap Dots */}
        <circle cx="35" cy="33" r="4.5" fill="#080503" stroke="#f59e0b" strokeWidth="1" />
        <circle cx="50" cy="24" r="5.5" fill="#030201" stroke="#f59e0b" strokeWidth="1" />
        <circle cx="65" cy="35" r="4.5" fill="#080503" stroke="#f59e0b" strokeWidth="1" />
        <circle cx="50" cy="41" r="3.5" fill="#080503" stroke="#f59e0b" strokeWidth="1" />
        {/* Glowing Eyes of Nano */}
        <g className="animate-pulse">
          <ellipse cx="40" cy="58" rx="5" ry="4" fill="#f59e0b" className="shadow-lg blur-[1px]" />
          <ellipse cx="60" cy="58" rx="5" ry="4" fill="#f59e0b" className="shadow-lg blur-[1px]" />
          <circle cx="40" cy="58" r="1.5" fill="#fff" />
          <circle cx="60" cy="58" r="1.5" fill="#fff" />
        </g>
        <path d="M47 68 Q50 71 53 68" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <img 
      src="nano.png" 
      alt="Nano" 
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
      className="w-48 h-48 object-contain filter drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all duration-300 transform group-hover:scale-105"
    />
  );
}

// Fallback image wrapper implemented cleanly
function MemberImage({ src, name, role }: { src: string; name: string; role: string }) {
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className="w-full aspect-[4/5] bg-[#0c0c12] border-2 border-dashed border-emerald-500/20 rounded-xl flex flex-col items-center justify-center p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-pink-500/5 opacity-50"></div>
        
        {/* Abstract Mesoamerican mask graphic or guitar badge in placeholder */}
        <div className="w-16 h-16 mb-4 rounded-full border-2 border-emerald-500/30 flex items-center justify-center bg-[#07070a] group-hover:border-pink-500/40 transition-colors duration-300">
          <svg className="w-8 h-8 text-emerald-400 group-hover:text-pink-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2v20M5 12h14" strokeLinecap="round" />
            <circle cx="12" cy="12" r="6" strokeDasharray="2 2" />
            <path d="M12 6c-3.3 0-6 2.7-6 6M12 18c3.3 0 6-2.7 6-6" strokeLinecap="round" />
          </svg>
        </div>
        
        <span className="text-white font-orbitron tracking-widest text-sm text-center mb-1 group-hover:text-emerald-400 transition-colors">{name}</span>
        <span className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase text-center block">{role}</span>
        
        <div className="absolute bottom-2 text-[8px] text-zinc-700 font-mono tracking-widest">ASSET_MAPPED_OK</div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden group border border-zinc-900 hover:border-emerald-500/40 transition-all duration-300 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 z-10"></div>
      <img 
        src={src} 
        alt={name} 
        onError={() => setError(true)}
        className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
      />
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <h4 className="text-base font-orbitron tracking-wider text-white font-bold group-hover:text-emerald-400 transition-colors">{name}</h4>
        <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">{role}</p>
      </div>
    </div>
  );
}
