
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1010';

export const API_ENDPOINTS = {
  notes: `${API_URL}/api/notes`,
  generateFromPdf: `${API_URL}/api/notes/generate-from-pdf`,
  generate: `${API_URL}/api/notes/generate`,
  userStats: `${API_URL}/api/user/stats`,
  userGoals: `${API_URL}/api/user/goals`,
};
