const API = import.meta.env.VITE_SERVER_URL || '';
const f = (path, opts) => fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts }).then(r => r.json());

export const createRoom = (hostName) => f('/api/rooms', { method: 'POST', body: JSON.stringify({ hostName }) });
export const joinRoom = (code, ownerName, franchise) => f(`/api/rooms/${code}/join`, { method: 'POST', body: JSON.stringify({ ownerName, franchise }) });
export const getRoom = (code) => f(`/api/rooms/${code}`);
export const getPlayers = () => f('/api/players');
