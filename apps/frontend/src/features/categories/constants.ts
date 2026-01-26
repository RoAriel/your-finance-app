import {
  Home,
  ShoppingCart,
  Car,
  GraduationCap,
  HeartPulse,
  Wifi,
  Coffee,
  Gift,
  Briefcase,
  PiggyBank,
  Plane,
  Gamepad2,
  Zap,
  Smartphone,
  Utensils,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export const CATEGORY_COLORS = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#64748B',
];

// 2. Usamos el tipo correcto en lugar de 'any'
export const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  ShoppingCart,
  Car,
  GraduationCap,
  HeartPulse,
  Wifi,
  Coffee,
  Gift,
  Briefcase,
  PiggyBank,
  Plane,
  Gamepad2,
  Zap,
  Smartphone,
  Utensils,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
