import * as React from 'react'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Leaf,
  Pause,
  Play,
  Sparkles,
  Tag,
} from 'lucide-react'

interface PromoSlide {
  id: string
  title: string
  subtitle: string
  badge: string
  highlightTag: string
  imageUrl: string
  gradient: string
  accentColor: string
  ctaText: string
  targetCategory?: string
}

const PROMO_SLIDES: PromoSlide[] = [
  {
    id: 'quarta-verde',
    title: 'Quarta & Quinta Verde: Feira Fresquinha',
    subtitle:
      'Frutas, verduras e legumes selecionados no amanhecer com preços especiais direto do produtor rural.',
    badge: 'Oferta da Semana • Feira Fresca',
    highlightTag: 'Até 30% OFF',
    imageUrl:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-emerald-950/95 via-slate-950/85 to-transparent',
    accentColor: '#16a34a',
    ctaText: 'Aproveitar a Feira',
  },
  {
    id: 'festival-frutas',
    title: 'Festival de Frutas Especiais & Doces',
    subtitle:
      'Morangos selecionados, uvas nobres, melão amarelo e mamão com doçura e suculência garantidas.',
    badge: 'Doçura & Padrão Premium',
    highlightTag: 'Seleção do Dia',
    imageUrl:
      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-rose-950/95 via-slate-950/85 to-transparent',
    accentColor: '#e11d48',
    ctaText: 'Ver Frutas Selecionadas',
    targetCategory: 'Frutas',
  },
  {
    id: 'organicos-roca',
    title: 'Hortifruti & Orgânicos Direto da Roça',
    subtitle:
      'Cenoura, abobrinha, batatas e raízes sem agrotóxicos para uma alimentação saudável da sua família.',
    badge: 'Colheita Matinal • 100% Fresco',
    highlightTag: 'Campo para a Mesa',
    imageUrl:
      'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-green-950/95 via-slate-950/85 to-transparent',
    accentColor: '#15803d',
    ctaText: 'Ver Verduras & Legumes',
    targetCategory: 'Verduras e Legumes',
  },
  {
    id: 'saladas-prontas',
    title: 'Especial Saladas & Folhagens Crocantes',
    subtitle:
      'Alfaces higienizadas, rúculas, espinafre e temperos frescos com crocância e sabor sem igual.',
    badge: 'Praticidade & Saúde Diária',
    highlightTag: 'Higienizados & Prontos',
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-teal-950/95 via-slate-950/85 to-transparent',
    accentColor: '#0d9488',
    ctaText: 'Conferir Folhas & Saladas',
    targetCategory: 'Seleção Praticidade',
  },
  {
    id: 'cogumelos-gourmet',
    title: 'Cogumelos Frescos & Mercearia Gourmet',
    subtitle:
      'Shimeji, Paris fresco, ovos caipiras e temperos nobres para transformar seus pratos em momentos únicos.',
    badge: 'Linha Gourmet & Fresca',
    highlightTag: 'Shimeji & Paris',
    imageUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-amber-950/95 via-slate-950/85 to-transparent',
    accentColor: '#d97706',
    ctaText: 'Ver Cogumelos & Especiais',
    targetCategory: 'Cogumelos',
  },
]

interface PromoSliderProps {
  onSelectCategory?: (categoryName: string) => void
  onScrollToOffers?: () => void
  primaryColor: string
}

export function PromoSlider({
  onSelectCategory,
  onScrollToOffers,
  primaryColor,
}: PromoSliderProps) {
  const [currentIdx, setCurrentIdx] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  // Auto-play a cada 5 segundos
  React.useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % PROMO_SLIDES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isPaused])

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length)
  }

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % PROMO_SLIDES.length)
  }

  const slide = PROMO_SLIDES[currentIdx]

  const handleCtaClick = () => {
    if (slide.targetCategory && onSelectCategory) {
      onSelectCategory(slide.targetCategory)
    } else if (onScrollToOffers) {
      onScrollToOffers()
    }
  }

  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800 bg-slate-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Imagem de Fundo com Transição Suave */}
      <div className="relative aspect-[16/8] sm:aspect-[21/8] md:aspect-[24/8] min-h-[290px] sm:min-h-[340px] w-full overflow-hidden">
        {PROMO_SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={s.imageUrl}
              alt={s.title}
              className="w-full h-full object-cover object-center scale-102 transition-transform duration-7000 ease-out"
            />
            {/* Gradiente estilo Oba Hortifruti */}
            <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient}`} />
          </div>
        ))}

        {/* Conteúdo do Slide */}
        <div className="relative z-20 h-full flex flex-col justify-center px-6 sm:px-12 md:px-16 py-8 max-w-3xl text-white space-y-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md text-amber-300 border border-white/10 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{slide.badge}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-2xs">
              <Flame className="h-3 w-3 fill-slate-950" />
              <span>{slide.highlightTag}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
            {slide.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-xl drop-shadow-xs line-clamp-2 sm:line-clamp-none">
            {slide.subtitle}
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleCtaClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white shadow-md transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: slide.accentColor || primaryColor }}
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Setas de Navegação (Desktop) */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white backdrop-blur-sm transition border border-white/10 shadow-md"
          title="Promoção anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white backdrop-blur-sm transition border border-white/10 shadow-md"
          title="Próxima promoção"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Indicadores de Bolinhas (Dots) */}
        <div className="absolute bottom-4 left-6 sm:left-12 z-30 flex items-center gap-2">
          {PROMO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIdx
                  ? 'w-8 bg-amber-400 shadow-xs'
                  : 'w-2 bg-white/40 hover:bg-white/80'
              }`}
              title={`Ir para ${s.title}`}
            />
          ))}

          {/* Botão de Pausa/Play */}
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className="ml-2 text-white/60 hover:text-white transition"
            title={isPaused ? 'Continuar reprodução automática' : 'Pausar slider'}
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </div>
  )
}
