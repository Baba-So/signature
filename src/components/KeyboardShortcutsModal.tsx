import React from 'react';
import {
  Keyboard,
  X,
  FileCheck,
  ZoomIn,
  Move,
  Layers,
  Sparkles,
  Download,
  Command,
  Maximize,
} from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcutGroups = [
    {
      title: 'Navigation & Pages',
      icon: <Move className="w-4 h-4 text-blue-600" />,
      shortcuts: [
        {
          keys: ['←'],
          altKeys: ['Page Haut'],
          description: 'Aller à la page précédente',
        },
        {
          keys: ['→'],
          altKeys: ['Page Bas'],
          description: 'Aller à la page suivante',
        },
        {
          keys: ['Début (Home)'],
          description: 'Revenir à la première page (Page 1)',
        },
        {
          keys: ['Fin (End)'],
          description: 'Aller à la dernière page du document',
        },
      ],
    },
    {
      title: 'Zoom & Affichage',
      icon: <ZoomIn className="w-4 h-4 text-emerald-600" />,
      shortcuts: [
        {
          keys: ['+'],
          altKeys: [`${modKey}`, '+'],
          description: 'Zoomer en avant (+15%)',
        },
        {
          keys: ['-'],
          altKeys: [`${modKey}`, '-'],
          description: 'Dézoomer en arrière (-15%)',
        },
        {
          keys: ['0'],
          altKeys: [`${modKey}`, '0'],
          description: 'Ajuster la page à 100% (taille normale)',
        },
        {
          keys: ['P'],
          description: 'Fixer / Détacher le visualiseur à l’écran (mode sticky)',
        },
        {
          keys: ['W'],
          description: 'Basculer entre largeur standard et espace élargi',
        },
        {
          keys: [modKey, 'Molette'],
          description: 'Zoomer / dézoomer directement à la souris',
        },
        {
          keys: ['F'],
          altKeys: ['F11'],
          description: 'Mode plein écran (masquer les panneaux latéraux)',
        },
      ],
    },
    {
      title: 'Export & Sécurité',
      icon: <Download className="w-4 h-4 text-indigo-600" />,
      shortcuts: [
        {
          keys: [modKey, 'S'],
          description: 'Lancer l’exportation du PDF signé et audité',
        },
        {
          keys: ['Échap (Esc)'],
          description: 'Fermer la boîte de dialogue ou quitter le plein écran',
        },
        {
          keys: ['?'],
          altKeys: ['F1'],
          description: 'Ouvrir ce guide des raccourcis clavier',
        },
      ],
    },
    {
      title: 'Éléments & Actions rapides',
      icon: <Layers className="w-4 h-4 text-purple-600" />,
      shortcuts: [
        {
          keys: ['1'],
          altKeys: ['S'],
          description: 'Activer le mode Signature',
        },
        {
          keys: ['2'],
          altKeys: ['C'],
          description: 'Activer le mode Cachet / Tampon',
        },
        {
          keys: ['T'],
          description: 'Ajouter ou supprimer Cachet & Signature (liés ensemble) sur la page',
        },
        {
          keys: ['E'],
          description: 'Ajouter ou supprimer l’en-tête sur la page courante',
        },
        {
          keys: ['L'],
          description: 'Basculer calque en-tête (Arrière-plan / Premier plan)',
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Raccourcis clavier professionnels</h3>
              <p className="text-xs text-slate-500">
                Commandes rapides pour accélérer le traitement de vos documents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
                {group.icon}
                <span>{group.title}</span>
              </div>

              <div className="space-y-1.5">
                {group.shortcuts.map((shortcut, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                  >
                    <span className="text-slate-700 font-medium">{shortcut.description}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((k, kIdx) => (
                          <React.Fragment key={kIdx}>
                            {kIdx > 0 && <span className="text-slate-400 text-[10px]">+</span>}
                            <kbd className="px-2 py-0.5 min-w-[24px] text-center font-mono font-semibold text-[11px] bg-slate-100 text-slate-800 border border-slate-300 rounded shadow-2xs">
                              {k}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>

                      {shortcut.altKeys && (
                        <>
                          <span className="text-slate-400 text-[10px]">ou</span>
                          <div className="flex items-center gap-1">
                            {shortcut.altKeys.map((ak, akIdx) => (
                              <React.Fragment key={akIdx}>
                                {akIdx > 0 && <span className="text-slate-400 text-[10px]">+</span>}
                                <kbd className="px-1.5 py-0.5 min-w-[20px] text-center font-mono font-semibold text-[10px] bg-slate-50 text-slate-600 border border-slate-200 rounded">
                                  {ak}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl text-blue-900 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <p>
              Les raccourcis sont actifs automatiquement dès qu'aucun champ de saisie n'est en cours d'édition.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <span className="text-xs text-slate-500 font-medium">
            Appuyez sur <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-slate-200 rounded">Échap</kbd> pour fermer
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
