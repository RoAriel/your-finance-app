import { useEffect, useState } from 'react';
import { api } from '../../lib/axios'; // Asegúrate de que esta ruta sea correcta

// Definimos la interfaz aquí mismo para evitar problemas de importación
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  type?: 'EXPENSE' | 'INCOME';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Pedimos muchas para evitar paginación corta
        const response = await api.get('/categories?limit=100');

        // --- AQUÍ ESTÁ EL FIX "A PRUEBA DE BALAS" ---

        // 1. Obtenemos el cuerpo de la respuesta
        const body = response.data;

        // 2. Buscamos el array.
        // - Si 'body' ya es un array, lo usamos.
        // - Si 'body.data' es un array (estructura paginada), usamos ese.
        // - Si no, array vacío.
        const rawList = Array.isArray(body)
          ? body
          : Array.isArray(body?.data)
            ? body.data
            : [];

        // 3. Filtrado seguro
        const filtered = type
          ? rawList.filter((cat: Category) => {
              const reqType = type.toLowerCase();
              return cat.type === reqType || cat.type === 'both';
            })
          : rawList;

        setCategories(filtered);
      } catch (error) {
        console.error('Error cargando categorías:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [type]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 text-sm text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        <span>Cargando...</span>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white ${className}`}
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
          No se encontraron categorías
        </option>
      )}
    </select>
  );
};
