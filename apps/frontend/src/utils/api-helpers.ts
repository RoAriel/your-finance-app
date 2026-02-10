// Recibimos 'object' para ser genéricos y evitar peleas con TypeScript
export const cleanObject = (obj: object) => {
  const newObj: Record<string, unknown> = {};

  Object.keys(obj).forEach((key) => {
    // Le decimos a TS: "Tranquilo, voy a leer esto como un diccionario"
    const value = (obj as Record<string, unknown>)[key];

    // Solo guardamos si tiene valor real
    if (value !== undefined && value !== null && value !== '') {
      newObj[key] = value;
    }
  });

  return newObj;
};
