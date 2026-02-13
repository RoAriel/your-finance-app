import { iconMap } from './icons';

interface Props {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
}

export const IconPicker = ({ selectedIcon, onSelect }: Props) => {
  const iconNames = Object.keys(iconMap);

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Selecciona un ícono
      </label>

      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {iconNames.map((name) => {
          // Como ya tipamos iconMap, TypeScript sabe que IconComponent es un componente válido
          const IconComponent = iconMap[name];
          const isSelected = selectedIcon === name;

          return (
            <button
              key={name}
              type="button" // Importante para que no haga submit del form
              onClick={() => onSelect(name)}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-primary text-white shadow-md scale-110'
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
              }`}
              title={name}
            >
              <IconComponent size={20} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
