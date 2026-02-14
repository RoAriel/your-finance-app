import { CategoryType } from '@prisma/client';
export interface DefaultCategory {
  name: string;
  type: CategoryType; // Ahora esto es compatible al 100% con la DB
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
    icon: 'Zap', // Genérico para servicios
    isFixed: true,
    children: [
      {
        name: 'Luz / Electricidad',
        type: CategoryType.EXPENSE,
        icon: 'Lightbulb', // Específico
        color: '#AA96DA',
        isFixed: true,
      },
      {
        name: 'Agua',
        type: CategoryType.EXPENSE,
        icon: 'Droplet', // Específico
        color: '#AA96DA',
        isFixed: true,
      },
      {
        name: 'Gas',
        type: CategoryType.EXPENSE,
        icon: 'Flame', // Específico
        color: '#AA96DA',
        isFixed: true,
      },
      {
        name: 'Internet / Cable',
        type: CategoryType.EXPENSE,
        icon: 'Wifi',
        color: '#AA96DA',
        isFixed: true,
      },
      {
        name: 'Celular',
        type: CategoryType.EXPENSE,
        icon: 'Smartphone',
        color: '#AA96DA',
        isFixed: true,
      },
    ],
  },
  {
    name: 'Alimentación',
    type: CategoryType.EXPENSE,
    color: '#FF6B6B',
    icon: 'Utensils', // Mejor que carrito para la categoría general
    isFixed: false,
    children: [
      {
        name: 'Supermercado',
        type: CategoryType.EXPENSE,
        icon: 'ShoppingCart',
        color: '#FF6B6B',
        isFixed: false,
      },
      {
        name: 'Restaurantes / Delivery',
        type: CategoryType.EXPENSE,
        icon: 'Utensils',
        color: '#FF6B6B',
        isFixed: false,
      },
    ],
  },
  {
    name: 'Transporte',
    type: CategoryType.EXPENSE,
    color: '#4ECDC4',
    icon: 'Car',
    isFixed: false,
    children: [
      {
        name: 'Combustible / Nafta',
        type: CategoryType.EXPENSE,
        icon: 'Fuel', // No existe 'gas-pump' en todos los sets, Fuel es seguro
        color: '#4ECDC4',
        isFixed: false,
      },
      {
        name: 'Uber / Cabify',
        type: CategoryType.EXPENSE,
        icon: 'MapPin', // Representa destino/viaje
        color: '#4ECDC4',
        isFixed: false,
      },
      {
        name: 'Transporte Público',
        type: CategoryType.EXPENSE,
        icon: 'Bus',
        color: '#4ECDC4',
        isFixed: false,
      },
    ],
  },
  {
    name: 'Ingresos',
    type: CategoryType.INCOME,
    color: '#6BCF7F',
    icon: 'Wallet', // Genérico para ingresos
    isFixed: true,
    children: [
      {
        name: 'Salario Mensual',
        type: CategoryType.INCOME,
        icon: 'Banknote', // Dinero físico/billetes
        color: '#6BCF7F',
        isFixed: true,
      },
      {
        name: 'Freelance / Extra',
        type: CategoryType.INCOME,
        icon: 'Laptop', // Trabajo remoto/extra
        color: '#6BCF7F',
        isFixed: false,
      },
      {
        name: 'Inversiones',
        type: CategoryType.INCOME,
        icon: 'TrendingUp',
        color: '#6BCF7F',
        isFixed: false,
      },
    ],
  },
  {
    name: 'Ocio y Vida Social',
    type: CategoryType.EXPENSE,
    color: '#F38181',
    icon: 'Clapperboard', // Cine/Arte
    isFixed: false,
    children: [
      {
        name: 'Cine / Streaming',
        type: CategoryType.EXPENSE,
        icon: 'Tv',
        color: '#F38181',
        isFixed: false,
      },
      {
        name: 'Salidas',
        type: CategoryType.EXPENSE,
        icon: 'Beer', // O 'PartyPopper'
        color: '#F38181',
        isFixed: false,
      },
    ],
  },
  // --- SUELTAS ---
  {
    name: 'Salud',
    type: CategoryType.EXPENSE,
    color: '#95E1D3',
    icon: 'HeartPulse',
    isFixed: false,
    children: [],
  },
  {
    name: 'Educación',
    type: CategoryType.EXPENSE,
    color: '#A8D8EA',
    icon: 'GraduationCap',
    isFixed: true,
    children: [],
  },
  {
    name: 'Ropa',
    type: CategoryType.EXPENSE,
    color: '#FFD93D',
    icon: 'Shirt',
    isFixed: false,
    children: [],
  },
  {
    name: 'Otros',
    type: CategoryType.BOTH,
    color: '#95A5A6',
    icon: 'MoreHorizontal',
    isFixed: false,
    children: [],
  },
];
