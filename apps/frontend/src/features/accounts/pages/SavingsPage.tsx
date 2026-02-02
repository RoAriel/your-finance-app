import { useState } from 'react';
import { Plus, ArrowRightLeft, Wallet, TrendingUp } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { AccountCard } from '../components/AccountCard';
import { TransferModal } from '../../transactions/components/TransferModal'; // Asegúrate que la ruta sea correcta
import { CreateAccountModal } from '../components/CreateAccountModal';
import { AccountType } from '../types';
import type { Account } from '../types';

export const SavingsPage = () => {
  // 1. Hook: Traemos TODAS las cuentas
  const { accounts, isLoading } = useAccounts();

  // 2. Filtros
  const wallets = accounts.filter((a) => a.type === AccountType.WALLET);
  const savings = accounts.filter((a) => a.type === AccountType.SAVINGS);

  // 3. ESTADOS (Sin useEffects, controlados por montaje/desmontaje)
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<AccountType>(AccountType.WALLET);

  // 4. HANDLERS
  const handleOpenCreateWallet = () => {
    setCreateType(AccountType.WALLET); // Configuramos el modal para Billetera
    setIsCreateOpen(true); // Abrimos
  };

  const handleOpenCreateSavings = () => {
    setCreateType(AccountType.SAVINGS); // Configuramos el modal para Meta
    setIsCreateOpen(true); // Abrimos
  };

  const handleOpenEdit = (account: Account) => {
    console.log('Editando cuenta:', account.name);
    // Aquí iría la lógica para abrir un modal de edición en el futuro
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Cargando cuentas...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Cuentas</h1>
          <p className="text-gray-500">Administra tu efectivo y objetivos</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
          >
            <ArrowRightLeft size={18} />
            <span>Transferir</span>
          </button>

          {/* Botón Principal: Abre creación de Billetera por defecto */}
          <button
            onClick={handleOpenCreateWallet}
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors shadow-sm shadow-primary/30"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nueva Cuenta</span>
            <span className="sm:hidden">Crear</span>
          </button>
        </div>
      </div>

      {/* --- SECCIÓN 1: BILLETERAS --- */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
            <Wallet size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-700">
            Cuentas y Efectivo
          </h2>
        </div>

        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={handleOpenEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
            <p className="mb-2">No tienes cuentas de efectivo.</p>
            <button
              onClick={handleOpenCreateWallet}
              className="text-emerald-600 font-medium hover:underline"
            >
              + Crear mi primera billetera
            </button>
          </div>
        )}
      </section>

      {/* --- SECCIÓN 2: METAS DE AHORRO --- */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
            <TrendingUp size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-700">Metas de Ahorro</h2>
        </div>

        {savings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savings.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={handleOpenEdit}
              />
            ))}

            {/* Tarjeta de Acceso Rápido para Crear Meta */}
            <button
              onClick={handleOpenCreateSavings}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-100 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all group min-h-40"
            >
              <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <Plus className="text-purple-400" />
              </div>
              <span className="text-sm font-medium text-purple-600">
                Nueva Meta
              </span>
            </button>
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-500 mb-2">
              No tienes metas de ahorro activas.
            </p>
            <button
              onClick={handleOpenCreateSavings}
              className="text-primary font-medium hover:underline"
            >
              Crear mi primera meta
            </button>
          </div>
        )}
      </section>

      {/* --- MODALES (Renderizado Condicional) --- */}

      {isTransferOpen && (
        <TransferModal
          isOpen={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
        />
      )}

      {isCreateOpen && (
        <CreateAccountModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          defaultType={createType} // Pasamos el tipo (WALLET o SAVINGS)
        />
      )}
    </div>
  );
};
