import { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

interface Props {
  currentDate: Date;
  onChange: (newDate: Date) => void;
}

export const MonthSelector = ({ currentDate, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const menuRef = useRef<HTMLDivElement>(null);

  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  // Click Outside: Este useEffect SÍ está bien porque interactúa con el DOM global
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleMenu = () => {
    if (!isOpen) {
      // Si vamos a ABRIR, reseteamos el año a la fecha actual
      // Esto evita el cascading render porque sucede durante el evento del usuario
      setViewYear(currentDate.getFullYear());
    }
    setIsOpen(!isOpen);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewYear, monthIndex, 1);
    onChange(newDate);
    setIsOpen(false);
  };

  const handleYearChange = (increment: number) => {
    setViewYear((prev) => prev + increment);
  };

  const goToCurrentMonth = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    onChange(today);
    setIsOpen(false);
  };

  const formattedDate = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate);
  const displayLabel =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="relative" ref={menuRef}>
      {/* TRIGGER: Usamos la nueva función handleToggleMenu */}
      <button
        onClick={handleToggleMenu}
        className={`
          flex items-center gap-2 px-4 py-2 bg-white border rounded-xl shadow-sm transition-all
          ${isOpen ? 'border-primary ring-2 ring-primary/10' : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        <Calendar size={18} className="text-gray-500" />
        <span className="font-semibold text-gray-700 select-none min-w-25 text-left">
          {displayLabel}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* POPOVER */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Años */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => handleYearChange(-1)}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <span className="text-lg font-bold text-gray-800">{viewYear}</span>

            <button
              onClick={() => handleYearChange(1)}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Grid Meses */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {months.map((month, index) => {
              const isSelected =
                currentDate.getMonth() === index &&
                currentDate.getFullYear() === viewYear;

              const isCurrentMonth =
                new Date().getMonth() === index &&
                new Date().getFullYear() === viewYear;

              return (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(index)}
                  className={`
                    py-2 text-xs font-semibold rounded-lg transition-all
                    ${
                      isSelected
                        ? 'bg-primary text-white shadow-md transform scale-105'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                    }
                    ${!isSelected && isCurrentMonth ? 'text-primary border border-primary/20 bg-primary/5' : ''}
                  `}
                >
                  {month.slice(0, 3)}
                </button>
              );
            })}
          </div>

          {/* Botón Ir a Hoy */}
          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={goToCurrentMonth}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
            >
              <RotateCcw size={14} />
              Volver a Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
