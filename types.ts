import { JSX } from 'react';

export enum SuggestionType {
  IMPROVE = 'Improve Lyrics',
  NEXT_LINES = 'Suggest Next Lines',
  MELODY = 'Suggest Melody',
  STRUCTURE = 'Suggest Structure',
  CHORDS = 'Suggest Chords',
  RHYMES = 'Find Rhymes',
  REVIEW = 'Review Lyrics',
  ORIGINALITY_CHECK = 'Check Originality',
  STYLE_MIMIC = 'Change Style',
  TIKTOK_HOOK = 'TikTok Hook Generator',
  GENERATE_SONG = 'Generate Song Preview',
  RADIO_READY = 'Make It Radio-Ready',
  GENERATE_BEAT = 'Generate Beat',
}

export const SUGGESTION_COSTS: Record<SuggestionType, number> = {
  [SuggestionType.IMPROVE]: 1,
  [SuggestionType.NEXT_LINES]: 1,
  [SuggestionType.RHYMES]: 1,
  [SuggestionType.STRUCTURE]: 1,
  [SuggestionType.MELODY]: 1,
  [SuggestionType.CHORDS]: 1,
  [SuggestionType.REVIEW]: 1,
  [SuggestionType.STYLE_MIMIC]: 5,
  [SuggestionType.ORIGINALITY_CHECK]: 5,
  [SuggestionType.TIKTOK_HOOK]: 5,
  [SuggestionType.RADIO_READY]: 5,
  [SuggestionType.GENERATE_BEAT]: 10,
  [SuggestionType.GENERATE_SONG]: 10,
};

export enum SubscriptionTier {
  OPEN_MIC = 'Open Mic',
  RISING_ARTIST = 'Rising Artist',
  HEADLINER = 'Headliner',
  LEGEND = 'Legend'
}

export const TIER_FEATURES: Record<SubscriptionTier, SuggestionType[]> = {
  [SubscriptionTier.OPEN_MIC]: [
    SuggestionType.NEXT_LINES,
    SuggestionType.RHYMES,
    SuggestionType.REVIEW,
  ],
  [SubscriptionTier.RISING_ARTIST]: [
    SuggestionType.NEXT_LINES,
    SuggestionType.RHYMES,
    SuggestionType.REVIEW,
    SuggestionType.IMPROVE,
    SuggestionType.STRUCTURE,
    SuggestionType.CHORDS,
    SuggestionType.GENERATE_BEAT,
  ],
  [SubscriptionTier.HEADLINER]: [
    SuggestionType.NEXT_LINES,
    SuggestionType.RHYMES,
    SuggestionType.REVIEW,
    SuggestionType.IMPROVE,
    SuggestionType.STRUCTURE,
    SuggestionType.CHORDS,
    SuggestionType.GENERATE_BEAT,
    SuggestionType.STYLE_MIMIC,
    SuggestionType.MELODY,
    SuggestionType.ORIGINALITY_CHECK,
  ],
  [SubscriptionTier.LEGEND]: [
    SuggestionType.NEXT_LINES,
    SuggestionType.RHYMES,
    SuggestionType.REVIEW,
    SuggestionType.IMPROVE,
    SuggestionType.STRUCTURE,
    SuggestionType.CHORDS,
    SuggestionType.GENERATE_BEAT,
    SuggestionType.STYLE_MIMIC,
    SuggestionType.MELODY,
    SuggestionType.ORIGINALITY_CHECK,
    SuggestionType.GENERATE_SONG,
    SuggestionType.TIKTOK_HOOK,
    SuggestionType.RADIO_READY,
  ]
};

export const getEffectiveSuggestionCost = (type: SuggestionType, userTier: string): number => {
  let normalizedTier = SubscriptionTier.OPEN_MIC;
  if (userTier === 'Rising Artist') normalizedTier = SubscriptionTier.RISING_ARTIST;
  else if (userTier === 'Headliner') normalizedTier = SubscriptionTier.HEADLINER;
  else if (userTier === 'Legend') normalizedTier = SubscriptionTier.LEGEND;
  else if (userTier === 'Free' || !userTier || userTier === 'Open Mic') normalizedTier = SubscriptionTier.OPEN_MIC;

  if (TIER_FEATURES[normalizedTier].includes(type)) {
    return 0;
  }

  return SUGGESTION_COSTS[type] || 1;
};

// FIX: Add ChatMessage type definition. This was missing, causing import errors.
export interface ChatMessage {
  sender: 'user' | 'companion' | 'greeting';
  content: string;
}

// FIX: Add Companion type definition. This was missing, causing import errors.
export interface Companion {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  description: string;
  greeting: string;
  systemInstruction: string;
}

export interface AudioClip {
  id: string;
  name: string;
  timestamp: number;
  audioData: string; // base64 string
}

export interface AiSuggestionResult {
  text: string;
  groundingChunks?: any[];
}

export interface Project {
  id: string;
  title: string;
  lastModified: number;
  lyrics: string;
  suggestion: string;
  feedback: string;
  companion: Companion;
  messages: ChatMessage[];
  activeTab: 'editor' | 'chat';
  audioClips?: AudioClip[];
}

export interface ProjectVersion {
  id: string;
  timestamp: number;
  lyrics: string;
  suggestion: string;
  feedback: string;
  audioClips: AudioClip[];
}
