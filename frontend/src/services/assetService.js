import { api } from './api.js';

export const assetService = {
  async list(params = {}) {
    const { data } = await api.get('/assets', { params });
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/assets/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/assets', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/assets/${id}`, payload);
    return data;
  },

  async delete(id) {
    await api.delete(`/assets/${id}`);
  },

  async search(query, params = {}) {
    const { data } = await api.get('/assets/search', { 
      params: { query, ...params } 
    });
    return data;
  },

  async getByStatus(status, params = {}) {
    const { data } = await api.get(`/assets/status/${status}`, { params });
    return data;
  },

  async getByCategory(categoryId, params = {}) {
    const { data } = await api.get(`/assets/category/${categoryId}`, { params });
    return data;
  },

  async assignToUser(assetId, userId) {
    const { data } = await api.post(`/assets/${assetId}/assign/${userId}`);
    return data;
  },

  async unassignFromUser(assetId, userId) {
    const { data } = await api.post(`/assets/${assetId}/unassign/${userId}`);
    return data;
  },

  async changeStatus(assetId, status) {
    const { data } = await api.patch(`/assets/${assetId}/status`, null, {
      params: { status }
    });
    return data;
  },

  async getStatistics() {
    try {
      const { data } = await api.get('/assets/statistics');
      return data;
    } catch (error) {
      // If the statistics endpoint doesn't exist, return empty object
      if (error.response?.status === 404) {
        console.log('Statistics endpoint not found - this is optional');
        return {};
      }
      throw error;
    }
  }
};
