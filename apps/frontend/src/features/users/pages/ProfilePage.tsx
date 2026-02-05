import { useState } from 'react';
import { User, Mail, Save, Loader2, Camera } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import type { UserProfile } from '../services/users.service';

// 1. FORMULARIO (Presentational)
const ProfileForm = ({
  user,
  updateProfile,
  isUpdating,
}: {
  user: UserProfile;
  updateProfile: (data: any) => Promise<any>;
  isUpdating: boolean;
}) => {
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      await updateProfile({ firstName, lastName });
      setSuccessMsg('¡Cambios guardados correctamente!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const getInitials = () => {
    if (!firstName && !lastName) return 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="h-32 bg-linear-to-r from-blue-600 to-blue-400"></div>
      <div className="px-8 pb-8">
        <div className="relative -mt-16 mb-8 flex flex-col items-center sm:items-start sm:flex-row gap-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 shadow-md overflow-hidden">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500">{getInitials()}</span>
              )}
            </div>
            <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-primary transition-colors cursor-not-allowed">
              <Camera size={18} />
            </button>
          </div>
          <div className="pt-16 text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-800">
              {firstName} {lastName}
            </h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Tu nombre"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Tu apellido"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {successMsg && (
            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 animate-in fade-in slide-in-from-top-1">
              {successMsg}
            </div>
          )}

          <div className="pt-4 border-t border-gray-50 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-70 font-medium"
            >
              {isUpdating ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save size={18} /> Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. CONTAINER
export const ProfilePage = () => {
  const { user, isLoading, updateProfile, isUpdating } = useProfile();

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-full min-h-100">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
        <p className="text-gray-500">
          Administra tu información personal y cuenta
        </p>
      </div>
      <ProfileForm
        key={user.id}
        user={user}
        updateProfile={updateProfile}
        isUpdating={isUpdating}
      />
    </div>
  );
};
