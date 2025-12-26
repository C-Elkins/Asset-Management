import { api } from "./api.js";

export const categoryService = {
  async list() {
    const { data } = await api.get("/categories");
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/categories/${id}`);
    return data;
  },

  async getActive() {
    const { data } = await api.get("/categories", {
      params: { active: true },
    });
    return data;
  },

  async create(payload) {
    const { data } = await api.post("/categories", payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/categories/${id}`, payload);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },
};
