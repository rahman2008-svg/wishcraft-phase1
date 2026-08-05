import {
  Cake,
  Heart,
  GraduationCap,
  Home,
  Gift,
  HandHeart,
  PartyPopper,
  MessageCircleHeart,
  Moon,
  Star,
  Sparkle,
  Snowflake,
  HeartHandshake,
  Users,
  Flower2,
  Sparkles,
} from 'lucide-react';

export const EVENT_TYPES = [
  { value: 'BIRTHDAY', label: 'Birthday', icon: Cake },
  { value: 'WEDDING', label: 'Wedding', icon: Heart },
  { value: 'ANNIVERSARY', label: 'Anniversary', icon: HeartHandshake },
  { value: 'GRADUATION', label: 'Graduation', icon: GraduationCap },
  { value: 'BABY_SHOWER', label: 'Baby Shower', icon: Gift },
  { value: 'HOUSE_WARMING', label: 'House Warming', icon: Home },
  { value: 'ENGAGEMENT', label: 'Engagement', icon: Gift },
  { value: 'FAREWELL', label: 'Farewell', icon: Users },
  { value: 'CONGRATULATIONS', label: 'Congratulations', icon: PartyPopper },
  { value: 'THANK_YOU', label: 'Thank You', icon: HandHeart },
  { value: 'EID_MUBARAK', label: 'Eid Mubarak', icon: Moon },
  { value: 'RAMADAN', label: 'Ramadan', icon: Star },
  { value: 'CHRISTMAS', label: 'Christmas', icon: Snowflake },
  { value: 'NEW_YEAR', label: 'New Year', icon: Sparkle },
  { value: 'VALENTINES_DAY', label: "Valentine's Day", icon: Heart },
  { value: 'FATHERS_DAY', label: "Father's Day", icon: MessageCircleHeart },
  { value: 'MOTHERS_DAY', label: "Mother's Day", icon: MessageCircleHeart },
  { value: 'DIWALI', label: 'Diwali', icon: Flower2 },
  { value: 'CUSTOM', label: 'Custom Event', icon: Sparkles },
];

export const ANIMATION_EFFECTS = [
  { value: 'none', label: 'None' },
  { value: 'confetti', label: 'Confetti' },
  { value: 'fireworks', label: 'Fireworks' },
  { value: 'floatingHearts', label: 'Floating Hearts' },
  { value: 'snow', label: 'Snow' },
  { value: 'stars', label: 'Stars' },
  { value: 'emojiRain', label: 'Emoji Rain' },
];

export const THEME_COLORS = [
  { value: '#7c3aed', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ef4444', label: 'Red' },
  { value: '#111827', label: 'Midnight' },
];

export default { EVENT_TYPES, ANIMATION_EFFECTS, THEME_COLORS };
