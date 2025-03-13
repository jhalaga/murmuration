import { create } from 'zustand';

export interface SimulationParams {
  birdCount: number;
  speed: number;
  cohesionFactor: number;
  alignmentFactor: number;
  separationFactor: number;
  perceptionRadius: number;
  maxForce: number;
  maxSpeed: number;
  birdSize: number;
  showTrails: boolean;
  trailLength: number;
  boundaryRadius: number;
  windFactor: number;
  windDirection: [number, number, number];
}

export interface TextModeParams {
  text: string;
  fontSize: number;
  fontWeight: number;
  transitionSpeed: number;
  formationDensity: number;
  maintainFormation: boolean;
}

interface StoreState {
  // Simulation parameters
  params: SimulationParams;
  updateParams: (params: Partial<SimulationParams>) => void;
  resetParams: () => void;
  
  // Text mode parameters
  textParams: TextModeParams;
  updateTextParams: (params: Partial<TextModeParams>) => void;
  
  // Mode control
  isTextMode: boolean;
  toggleTextMode: () => void;
  setTextMode: (active: boolean) => void;
  
  // Presets
  savePreset: (name: string) => void;
  loadPreset: (name: string) => void;
  presets: Record<string, SimulationParams>;
  
  // UI state
  isPaused: boolean;
  togglePause: () => void;
}

const DEFAULT_PARAMS: SimulationParams = {
  birdCount: 500,
  speed: 1.0,
  cohesionFactor: 1.0,
  alignmentFactor: 1.0,
  separationFactor: 1.5,
  perceptionRadius: 25,
  maxForce: 0.2,
  maxSpeed: 3.0,
  birdSize: 0.5,
  showTrails: true,
  trailLength: 20,
  boundaryRadius: 150,
  windFactor: 0,
  windDirection: [0, 0, 0],
};

const DEFAULT_TEXT_PARAMS: TextModeParams = {
  text: 'MURMURATION',
  fontSize: 15,
  fontWeight: 700,
  transitionSpeed: 0.02,
  formationDensity: 0.8,
  maintainFormation: true,
};

const PRESET_CONFIGS = {
  'Default': DEFAULT_PARAMS,
  'Dense Flock': {
    ...DEFAULT_PARAMS,
    birdCount: 1000,
    cohesionFactor: 1.5,
    alignmentFactor: 1.2,
    separationFactor: 1.0,
    perceptionRadius: 20,
  },
  'Scattered': {
    ...DEFAULT_PARAMS,
    birdCount: 300,
    cohesionFactor: 0.5,
    alignmentFactor: 0.8,
    separationFactor: 2.0,
    perceptionRadius: 15,
  },
  'Fast': {
    ...DEFAULT_PARAMS,
    speed: 1.5,
    maxSpeed: 4.5,
    trailLength: 30,
  },
  'Windy Day': {
    ...DEFAULT_PARAMS,
    windFactor: 0.3,
    windDirection: [1, 0.5, 0] as [number, number, number],
  },
};

export const useStore = create<StoreState>((set) => ({
  params: DEFAULT_PARAMS,
  updateParams: (newParams) => 
    set((state) => ({ params: { ...state.params, ...newParams } })),
  resetParams: () => set({ params: DEFAULT_PARAMS }),
  
  textParams: DEFAULT_TEXT_PARAMS,
  updateTextParams: (newParams) => 
    set((state) => ({ textParams: { ...state.textParams, ...newParams } })),
  
  isTextMode: false,
  toggleTextMode: () => set((state) => ({ isTextMode: !state.isTextMode })),
  setTextMode: (active) => set({ isTextMode: active }),
  
  presets: PRESET_CONFIGS,
  savePreset: (name) => 
    set((state) => ({ 
      presets: { 
        ...state.presets, 
        [name]: { ...state.params } 
      } 
    })),
  loadPreset: (name) => 
    set((state) => ({ 
      params: state.presets[name] || DEFAULT_PARAMS 
    })),
  
  isPaused: false,
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
})); 