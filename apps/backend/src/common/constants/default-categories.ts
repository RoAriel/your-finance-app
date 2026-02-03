import { CategoryType } from '../../categories/dto/create-category.dto';

export interface DefaultCategory {
  name: string;
  type: CategoryType; // Usamos el Enum, no strings sueltos
  icon: string;
  color: string;
  isFixed: boolean;
  children?: Omit<DefaultCategory, 'children'>[];
}

// 👇 2. Tipamos la constante explícitamente como un array de esa interfaz
export const DEFAULT_CATEGORIES_HIERARCHY: DefaultCategory[] = [
  // --- PADRES ---
  {
    name: 'Servicios',
    type: CategoryType.EXPENSE,
    color: '#AA96DA',
    icon: 'zap',
    isFixed: true,
    children: [
      {
        name: 'Luz / Electricidad',
        type: CategoryType.EXPENSE,
        icon: 'bulb',
        color: '#AA96DA',
        isFixed: true,
      },
      {
        name: 'Agua',
        type: CategoryType.EXPENSE,
        icon: 'droplet',
        color: '#AA96DA',
        isFixed: true,
      },
      {
        name: 'Gas',
        type: CategoryType.EXPENSE,
        icon: 'flame',
        color: '#AA96DA',
        isFixed: true,
      },
      {
        name: 'Internet / Cable',
        type: CategoryType.EXPENSE,
        icon: 'wifi',
        color: '#AA96DA',
        isFixed: true,
      },
      {
        name: 'Celular',
        type: CategoryType.EXPENSE,
        icon: 'smartphone',
        color: '#AA96DA',
        isFixed: true,
      },
    ],
  },
  {
    name: 'Alimentación',
    type: CategoryType.EXPENSE,
    color: '#FF6B6B',
    icon: 'shopping-cart',
    isFixed: false,
    children: [
      {
        name: 'Supermercado',
        type: CategoryType.EXPENSE,
        icon: 'shopping-cart',
        color: '#FF6B6B',
        isFixed: false,
      },
      {
        name: 'Restaurantes / Delivery',
        type: CategoryType.EXPENSE,
        icon: 'coffee',
        color: '#FF6B6B',
        isFixed: false,
      },
    ],
  },
  {
    name: 'Transporte',
    type: CategoryType.EXPENSE,
    color: '#4ECDC4',
    icon: 'car',
    isFixed: false,
    children: [
      {
        name: 'Combustible / Nafta',
        type: CategoryType.EXPENSE,
        icon: 'droplet',
        color: '#4ECDC4',
        isFixed: false,
      },
      {
        name: 'Uber / Cabify',
        type: CategoryType.EXPENSE,
        icon: 'map-pin',
        color: '#4ECDC4',
        isFixed: false,
      },
      {
        name: 'Transporte Público',
        type: CategoryType.EXPENSE,
        icon: 'credit-card',
        color: '#4ECDC4',
        isFixed: false,
      },
    ],
  },
  {
    name: 'Ingresos',
    type: CategoryType.INCOME,
    color: '#6BCF7F',
    icon: 'briefcase',
    isFixed: true,
    children: [
      {
        name: 'Salario Mensual',
        type: CategoryType.INCOME,
        icon: 'briefcase',
        color: '#6BCF7F',
        isFixed: true,
      },
      {
        name: 'Freelance / Extra',
        type: CategoryType.INCOME,
        icon: 'code',
        color: '#6BCF7F',
        isFixed: false,
      },
      {
        name: 'Inversiones',
        type: CategoryType.INCOME,
        icon: 'trending-up',
        color: '#6BCF7F',
        isFixed: false,
      },
    ],
  },
  {
    name: 'Ocio y Vida Social',
    type: CategoryType.EXPENSE,
    color: '#F38181',
    icon: 'film',
    isFixed: false,
    children: [
      {
        name: 'Cine / Streaming',
        type: CategoryType.EXPENSE,
        icon: 'tv',
        color: '#F38181',
        isFixed: false,
      },
      {
        name: 'Salidas',
        type: CategoryType.EXPENSE,
        icon: 'party',
        color: '#F38181',
        isFixed: false,
      },
    ],
  },
  // --- SUELTAS (Sin hijos) ---
  {
    name: 'Salud',
    type: CategoryType.EXPENSE,
    color: '#95E1D3',
    icon: 'heart',
    isFixed: false,
    children: [],
  },
  {
    name: 'Educación',
    type: CategoryType.EXPENSE,
    color: '#A8D8EA',
    icon: 'book',
    isFixed: true,
    children: [],
  },
  {
    name: 'Ropa',
    type: CategoryType.EXPENSE,
    color: '#FFD93D',
    icon: 'shopping-bag',
    isFixed: false,
    children: [],
  },
  {
    name: 'Otros',
    type: CategoryType.BOTH,
    color: '#95A5A6',
    icon: 'more-horizontal',
    isFixed: false,
    children: [],
  },
];
