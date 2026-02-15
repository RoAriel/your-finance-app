import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Key, Shield, User as UserIcon, Search } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'react-hot-toast';
import { UserRole } from '@/features/auth/types'; // Importa tus constantes
import type { User } from '@/features/auth/types'; // Asegúrate de tener esta interfaz definida

export const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();

  // Estado para el modal de password
  const [resetModal, setResetModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    userId: '',
    userName: '',
  });

  // Estado para búsqueda simple
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch de Usuarios
  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getAllUsers,
  });

  // 2. Mutación para Borrar
  const deleteMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      toast.success('Usuario eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Error al eliminar usuario'),
  });

  // Handlers
  const handleDelete = (user: User) => {
    confirm({
      title: '¿Eliminar Usuario Definitivamente?',
      message: `Estás a punto de borrar a ${user.email}. Esta acción eliminará TODAS sus cuentas, presupuestos y transacciones.`,
      variant: 'danger',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(user.id);
      },
    });
  };

  const handleOpenReset = (user: User) => {
    setResetModal({
      isOpen: true,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
    });
  };

  // Filtrado simple en cliente
  const filteredUsers = users?.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading)
    return <div className="p-10 text-center">Cargando usuarios...</div>;
  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        Error al cargar usuarios. Verifica tus permisos.
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Administración de Usuarios
          </h1>
          <p className="text-gray-500">
            Gestiona accesos y permisos del sistema
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-semibold">Usuario</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold">Registro</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredUsers?.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {user.role === UserRole.ADMIN ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Shield size={12} /> ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <UserIcon size={12} /> USER
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500">
                    {/* Asumiendo que viene createdAt, si no viene, mostrar fecha actual o ajustar */}
                    {new Date().toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenReset(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Cambiar Contraseña"
                      >
                        <Key size={18} />
                      </button>

                      {/* No permitir borrarse a sí mismo (opcional, pero buena práctica visual) */}
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar Usuario"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers?.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Reset Password */}
      <ResetPasswordModal
        isOpen={resetModal.isOpen}
        onClose={() => setResetModal((prev) => ({ ...prev, isOpen: false }))}
        userId={resetModal.userId}
        userName={resetModal.userName}
      />
    </div>
  );
};
