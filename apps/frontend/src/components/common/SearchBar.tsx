import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  onSearch: (value: string) => void;
  placeholder?: string;
  initialValue?: string;
  debounceTime?: number;
}

export const SearchBar = ({
  onSearch,
  placeholder = 'Buscar...',
  initialValue = '',
  debounceTime = 500, // Espera 500ms antes de buscar
}: Props) => {
  const [value, setValue] = useState(initialValue);

  // Efecto de Debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, debounceTime);

    return () => clearTimeout(timeoutId);
  }, [value, debounceTime, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="relative w-full md:max-w-xs">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-shadow"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
