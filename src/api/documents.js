import api from './axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const uploadDocument = async (file, title) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);

  const token = localStorage.getItem('accessToken');
  const { data } = await api.post('/api/document/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const downloadDocument = async (documentId, fileName) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${BASE_URL}/api/document/${documentId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Download failed');

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'document.pdf';
  a.click();
  URL.revokeObjectURL(url);
};
