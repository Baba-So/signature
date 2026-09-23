import React from 'react';
import { Bookmark, RotateCcw, Check } from 'lucide-react';
import { PRESET_PROFILES } from '../services/profiles';
import { PresetProfileId } from '../types';

interface ProfilePresetsProps {
  activeProfile: PresetProfileId;
  onSelectProfile: (id: PresetProfileId) => void;
  onResetDefaults: () => void;
}

export const ProfilePresets: React.FC<ProfilePresetsProps> = ({
  activeProfile,
  onSelectProfile,
  onResetDefaults,
}) => {
  const profilesList = Object.values(PRESET_PROFILES);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-blue-600" />
          Profils prédéfinis
        </h4>

        <button
          onClick={onResetDefaults}
          className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors font-medium"
          title="Restaurer le profil Standard par défaut"
        >
          <RotateCcw className="w-3 h-3" />
          Réinitialiser
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {profilesList.map(profile => {
          const isActive = activeProfile === profile.id;
          return (
            <button
              key={profile.id}
              onClick={() => onSelectProfile(profile.id)}
              className={`p-2.5 rounded-xl border text-left transition-all relative ${
                isActive
                  ? 'bg-blue-50 border-blue-400 text-blue-950 ring-2 ring-blue-200'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-xs">{profile.name}</span>
                {isActive && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </div>
              <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                {profile.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
