import { api } from './api.js';

export const userService = {
  async list(params = {}) {
    const { data } = await api.get('/users', { params });
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  async search(query, params = {}) {
    const { data } = await api.get('/users/search', { 
      params: { query, ...params } 
    });
    return data;
  },

  async getActive() {
    const { data } = await api.get('/users', { 
      params: { active: true } 
    });
    return data;
  },

  async getByRole(role, params = {}) {
    const { data } = await api.get('/users', { 
      params: { role, ...params } 
    });
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/users', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  }
};
