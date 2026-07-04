// Detect if running locally or in production to determine backend URL
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // If we're not running locally, point to the production backend on Render
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
      return 'https://novakernel-os-simulation.onrender.com';
    }
  }
  
  return 'http://127.0.0.1:5000';
};

export const SOCKET_URL = getSocketUrl();
export const API_BASE_URL = import.meta.env.VITE_API_URL || `${SOCKET_URL}/api`;
