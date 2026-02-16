import type { AxiosResponse } from 'axios'; // 👈 1. Importamos el tipo

export const triggerDownload = (data: Blob, filename: string) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// 👇 2. Tipamos el argumento 'response'
export const getFilenameFromHeader = (
  response: AxiosResponse,
  fallback: string
): string => {
  // Axios headers pueden ser accedidos como objeto
  const disposition = response.headers['content-disposition'];

  if (
    disposition &&
    typeof disposition === 'string' &&
    disposition.indexOf('attachment') !== -1
  ) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      return matches[1].replace(/['"]/g, '');
    }
  }
  return fallback;
};
