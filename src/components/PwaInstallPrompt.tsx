import * as React from 'react'
import { Download, MoreVertical, PlusSquare, Share, Smartphone, Sparkles, X } from 'lucide-react'
import { getPwaIconUrl, usePwaInstall } from '../hooks/usePwaInstall'

const DISMISS_STORAGE_KEY = 'gnz_pwa_banner_dismissed_v1'

interface PwaInstallModalProps {
  isOpen: boolean
  onClose: () => void
  isIOS: boolean
  canPromptNatively: boolean
  onTriggerNativePrompt: () => void
  primaryColor?: string
}

export function PwaInstallModal({
  isOpen,
  onClose,
  isIOS,
  canPromptNatively,
  onTriggerNativePrompt,
  primaryColor = '#1B6B1E',
}: PwaInstallModalProps) {
  if (!isOpen) return null

  const iconUrl = getPwaIconUrl('icon-192.png')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Topo com ícone oficial GNZ. */}
        <div className="relative bg-[#12141A] text-white p-6 flex items-center gap-4">
          <img
            src={iconUrl}
            alt="GNZ Horti"
            className="h-16 w-16 rounded-2xl border border-white/15 shadow-lg shrink-0 object-cover"
          />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-primary/30 text-brand-light border border-brand-light/30">
              <Sparkles className="h-3 w-3" />
              Aplicativo Oficial
            </span>
            <h3 className="text-lg font-black tracking-tight mt-1">GNZ Hortifruti</h3>
            <p className="text-xs text-slate-300 leading-snug">
              Instale na tela inicial para pedir mais rápido e acompanhar entregas em tempo real.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corpo com instruções */}
        <div className="p-6 space-y-5">
          {canPromptNatively ? (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Seu navegador suporta instalação direta! Toque no botão abaixo para adicionar o{' '}
                <strong>GNZ Horti</strong> aos seus aplicativos:
              </p>
              <button
                type="button"
                onClick={() => {
                  onTriggerNativePrompt()
                  onClose()
                }}
                className="w-full py-3.5 px-5 rounded-2xl text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition hover:opacity-95 active:scale-98"
                style={{ backgroundColor: primaryColor }}
              >
                <Download className="h-4 w-4" />
                Instalar Aplicativo Agora
              </button>
            </div>
          ) : isIOS ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-brand-primary dark:text-brand-light">
                <Smartphone className="h-4 w-4" />
                <span>Como instalar no iPhone / iPad</span>
              </div>

              <ol className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                  <span
                    className="h-6 w-6 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: primaryColor }}
                  >
                    1
                  </span>
                  <div className="flex-1">
                    Toque no botão <strong>Compartilhar</strong>{' '}
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white align-middle mx-0.5">
                      <Share className="h-3.5 w-3.5" />
                    </span>{' '}
                    na barra do Safari.
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                  <span
                    className="h-6 w-6 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: primaryColor }}
                  >
                    2
                  </span>
                  <div className="flex-1">
                    Role as opções e toque em <strong>Adicionar à Tela de Início</strong>{' '}
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white align-middle mx-0.5">
                      <PlusSquare className="h-3.5 w-3.5" />
                    </span>
                    .
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                  <span
                    className="h-6 w-6 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: primaryColor }}
                  >
                    3
                  </span>
                  <div className="flex-1">
                    Confirme tocando em <strong>Adicionar</strong> no canto superior direito.
                  </div>
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-brand-primary dark:text-brand-light">
                <Smartphone className="h-4 w-4" />
                <span>Como instalar no seu dispositivo</span>
              </div>

              <ol className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                  <span
                    className="h-6 w-6 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: primaryColor }}
                  >
                    1
                  </span>
                  <div className="flex-1">
                    No Android ou computador, toque no menu do navegador{' '}
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white align-middle mx-0.5">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </span>{' '}
                    ou no ícone de instalação na barra de endereço.
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                  <span
                    className="h-6 w-6 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: primaryColor }}
                  >
                    2
                  </span>
                  <div className="flex-1">
                    Selecione <strong>Instalar aplicativo</strong> ou{' '}
                    <strong>Adicionar à tela inicial</strong>.
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                  <span
                    className="h-6 w-6 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: primaryColor }}
                  >
                    3
                  </span>
                  <div className="flex-1">
                    No iPhone/iPad (Safari), toque em <strong>Compartilhar</strong>{' '}
                    <Share className="inline h-3.5 w-3.5" /> e depois em{' '}
                    <strong>Adicionar à Tela de Início</strong>.
                  </div>
                </li>
              </ol>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  )
}

interface PwaInstallBannerProps {
  primaryColor?: string
  externalModalOpen?: boolean
  onCloseExternalModal?: () => void
}

export function PwaInstallPrompt({
  primaryColor = '#1B6B1E',
  externalModalOpen = false,
  onCloseExternalModal,
}: PwaInstallBannerProps) {
  const {
    isStandalone,
    isIOS,
    canPromptNatively,
    isInstructionModalOpen,
    closeInstructionModal,
    triggerInstall,
  } = usePwaInstall()

  const [dismissed, setDismissed] = React.useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem(DISMISS_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  const handleDismiss = () => {
    setDismissed(true)
    try {
      window.sessionStorage.setItem(DISMISS_STORAGE_KEY, '1')
    } catch {
      // ignore
    }
  }

  // Esconder completamente quando já estiver rodando como app instalado (standalone)
  if (isStandalone) return null

  const modalOpen = isInstructionModalOpen || externalModalOpen
  const handleCloseModal = () => {
    closeInstructionModal()
    onCloseExternalModal?.()
  }

  const showFloatingBanner = !dismissed && (canPromptNatively || isIOS)
  const iconUrl = getPwaIconUrl('icon-192.png')

  return (
    <>
      {showFloatingBanner && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-40">
          <div className="rounded-2xl bg-[#12141A] text-white p-3.5 shadow-2xl border border-white/10 flex items-center gap-3.5">
            <img
              src={iconUrl}
              alt="GNZ Horti"
              className="h-12 w-12 rounded-xl border border-white/15 shrink-0 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black tracking-tight truncate">
                Instalar App GNZ Horti
              </p>
              <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                {isIOS
                  ? 'Adicione à Tela de Início no iPhone para acesso rápido'
                  : 'Peça mais rápido direto da tela inicial do aparelho'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={triggerInstall}
                className="px-3 py-2 rounded-xl text-white text-xs font-black shadow-xs transition hover:opacity-95 active:scale-95 flex items-center gap-1.5"
                style={{ backgroundColor: primaryColor }}
              >
                <Download className="h-3.5 w-3.5" />
                <span>Instalar</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                title="Fechar sugestão"
                aria-label="Fechar sugestão"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <PwaInstallModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        isIOS={isIOS}
        canPromptNatively={canPromptNatively}
        onTriggerNativePrompt={triggerInstall}
        primaryColor={primaryColor}
      />
    </>
  )
}
