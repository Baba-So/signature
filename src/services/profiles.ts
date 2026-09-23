import { PresetProfile, PresetProfileId } from '../types';

export const PRESET_PROFILES: Record<PresetProfileId, PresetProfile> = {
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'Signature et cachet alignés en bas de page droite',
    signature: {
      x: 64,
      y: 80,
      width: 26,
      rotation: 0,
    },
    cachet: {
      x: 40,
      y: 78,
      width: 20,
      rotation: -5,
    },
  },
  large_signature: {
    id: 'large_signature',
    name: 'Signature large',
    description: 'Signature proéminente avec cachet d’authentification discret',
    signature: {
      x: 52,
      y: 78,
      width: 38,
      rotation: 0,
    },
    cachet: {
      x: 24,
      y: 77,
      width: 22,
      rotation: 2,
    },
  },
  clear_stamp: {
    id: 'clear_stamp',
    name: 'Cachet net',
    description: 'Cachet officiel bien droit et lisible avec paraphe/signature ajusté',
    signature: {
      x: 42,
      y: 81,
      width: 22,
      rotation: 0,
    },
    cachet: {
      x: 68,
      y: 76,
      width: 24,
      rotation: 0,
    },
  },
  contract: {
    id: 'contract',
    name: 'Contrat',
    description: 'Style juridique avec cachet « Lu et approuvé » incliné et signature',
    signature: {
      x: 60,
      y: 84,
      width: 28,
      rotation: 3,
    },
    cachet: {
      x: 32,
      y: 82,
      width: 22,
      rotation: -8,
    },
  },
};

export const DEFAULT_PROFILE_ID: PresetProfileId = 'standard';
