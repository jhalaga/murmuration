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
  horizonHeight: number; // Controls how low birds can fly
  minCameraDistance: number; // Minimum distance birds should maintain from the camera
}

export interface TextModeParams {
  text: string;
  fontSize: number;
  fontWeight: number;
  transitionSpeed: number;
  formationDensity: number;
  maintainFormation: boolean;
  positionX: number; // Horizontal positioning of text formation
  positionY: number; // Vertical positioning of text formation
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
  
  // Background settings
  backgroundType: 'color' | 'image' | 'youtube';
  backgroundImage: string | null;
  youtubeVideoId: string | null;
  setBackgroundType: (type: 'color' | 'image' | 'youtube') => void;
  setBackgroundImage: (imageUrl: string | null) => void;
  setYoutubeVideoId: (videoId: string | null) => void;
  
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
  speed: 0.2,
  cohesionFactor: 0.6,
  alignmentFactor: 0.4,
  separationFactor: 2.0,
  perceptionRadius: 13,
  maxForce: 0.2,
  maxSpeed: 3.0,
  birdSize: 0.6,
  showTrails: false,
  trailLength: 20,
  boundaryRadius: 160,
  windFactor: 0,
  windDirection: [0, 0, 0],
  horizonHeight: -20, // Default horizon height (negative value for below the center)
  minCameraDistance: 30, // Reduced default minimum distance from camera to improve text formation
};

const DEFAULT_TEXT_PARAMS: TextModeParams = {
  text: 'MURMURATION',
  fontSize: 5,
  fontWeight: 300,
  transitionSpeed: 0.02,
  formationDensity: 1.0,
  maintainFormation: true,
  positionX: -35, // Center horizontally by default
  positionY: 45, // Position slightly above center by default
};

const PRESET_CONFIGS = {
  'Default': DEFAULT_PARAMS,
  'Dense Flock': {
    ...DEFAULT_PARAMS,
    birdCount: 1000,
    cohesionFactor: 0.5,
    alignmentFactor: 0.6,
    separationFactor: 1.5,
    perceptionRadius: 15,
  },
  'Scattered': {
    ...DEFAULT_PARAMS,
    birdCount: 300,
    cohesionFactor: 0.2,
    alignmentFactor: 0.3,
    separationFactor: 2.5,
    perceptionRadius: 10,
  },
  'Fast': {
    ...DEFAULT_PARAMS,
    speed: 0.8,
    maxSpeed: 4.0,
    trailLength: 30,
  },
  'Windy Day': {
    ...DEFAULT_PARAMS,
    windFactor: 0.3,
    windDirection: [1, 0.5, 0] as [number, number, number],
  },
  'Calm': {
    ...DEFAULT_PARAMS,
    speed: 0.3,
    cohesionFactor: 0.2,
    alignmentFactor: 0.3,
    separationFactor: 1.5,
    birdCount: 400,
    minCameraDistance: 80,
    boundaryRadius: 180,
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
  
  // Background settings
  backgroundType: 'color',
  backgroundImage: null,
  youtubeVideoId: null,
  setBackgroundType: (type) => set({ backgroundType: type }),
  setBackgroundImage: (imageUrl) => set({ backgroundImage: imageUrl }),
  setYoutubeVideoId: (videoId) => set({ youtubeVideoId: videoId }),
  
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