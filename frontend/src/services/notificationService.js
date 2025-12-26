import { api } from './api';

const STORAGE_KEY = 'APP_NOTIFICATIONS';

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export async function getNotifications({ status = 'all', limit = 50, before } = {}) {
  try {
    const { data } = await api.get('/notifications', { params: { status, limit, before } });
    // Expecting data.items or array fallback
    const items = Array.isArray(data) ? data : (data?.items ?? []);
    writeStorage(items);
    return { items, nextCursor: data?.nextCursor };
  } catch {
    let items = readStorage();
    if (status === 'unread') items = items.filter(n => !n.read);
    if (limit) items = items.slice(0, limit);
    return { items };
  }
}

export async function markRead(id) {
  try {
    await api.post(`/notifications/${id}/read`);
  } catch {}
  // update local cache optimistically
  const items = readStorage().map(n => n.id === id ? { ...n, read: true } : n);
  writeStorage(items);
}

export async function markAllRead() {
  try {
    await api.post('/notifications/read-all');
  } catch {}
  const items = readStorage().map(n => ({ ...n, read: true }));
  writeStorage(items);
}

export async function clearAll() {
  try {
    await api.delete('/notifications');
  } catch {}
  writeStorage([]);
}
