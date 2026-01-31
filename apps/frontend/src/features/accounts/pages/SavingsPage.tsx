import { Plus } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { AccountCard } from '../components/AccountCard'; // 👈 Usamos el nuevo componente
// 👇 FIX: Importamos SOLO TIPO
import type { Account } from '../types';
import { AccountType } from '../types';

export const SavingsPage = () => {
  // 1. Hook unificado
  const { accounts, isLoading } = useAccounts({ type: AccountType.SAVINGS });

  // 2. Estados de Modales (Solo dejamos lo que usas para que no salte error de unused vars)
  // const [isModalOpen, setIsModalOpen] = useState(false); // Descomenta cuando hagas el modal de Crear Cuenta
  // const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleOpenCreate = () => {
    // setEditingAccount(null);
    // setIsModalOpen(true);
    alert('Próximamente: Modal Crear Cuenta'); // Placeholder hasta que hagamos el modal
  };

  const handleOpenEdit = (account: Account) => {
    console.log('Editando', account);
    // setEditingAccount(account);
    // setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Cargando metas...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Metas de Ahorro</h1>
          <p className="text-gray-500">Tus objetivos financieros</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-primary-hover transition-colors"
        >
          <Plus /> Nueva Meta
        </button>
      </div>

      {/* Grid de Metas */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleOpenEdit}
              // onDeposit={...} // Puedes agregar la lógica de depósito aquí
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-gray-500 mb-2">
            No tienes metas de ahorro activas.
          </p>
          <button
            onClick={handleOpenCreate}
            className="text-primary font-medium hover:underline"
          >
            Crear mi primera meta
          </button>
        </div>
      )}
    </div>
  );
};
