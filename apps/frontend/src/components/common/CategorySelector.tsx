import { useCategories } from '../../features/categories/hooks/useCategories';

interface Props {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}

export const CategorySelector = ({
  value,
  onChange,
  type,
  placeholder = 'Selecciona una categoría...',
  className = '',
}: Props) => {
  // TypeScript ahora sabe que 'response' es PaginatedResponse<Category> | undefined
  const { data: response, isLoading } = useCategories();

  // 👇 Lógica limpia y sin 'any'.
  // Como ya tipamos el servicio, TS sabe que response tiene .data
  const rawList = response?.data || [];

  const categories = type
    ? rawList.filter((cat) => {
        const catType = cat.type?.toUpperCase();
        const reqType = type.toUpperCase();
        return catType === reqType || catType === 'BOTH';
      })
    : rawList;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2.5 text-sm text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        <span>Cargando...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-gray-700 appearance-none ${className}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {categories.length > 0 ? (
          categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))
        ) : (
          <option value="" disabled>
            No hay categorías disponibles
          </option>
        )}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </div>
    </div>
  );
};
