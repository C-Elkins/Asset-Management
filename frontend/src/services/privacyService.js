import { api } from './api';

export const privacyService = {
  async getPolicyStatus() {
    const res = await api.get('/privacy/policy-status');
    return res.data;
  },

  async getConsent() {
    const res = await api.get('/privacy/consent');
    return res.data;
  },

  async updateConsent(payload) {
    const res = await api.put('/privacy/consent', payload);
    return res.data;
  },

  async getMyData() {
    const res = await api.get('/privacy/my-data');
    return res.data;
  },

  async requestDeletion(reason) {
    const res = await api.post('/privacy/request-deletion', { reason });
    return res.data;
  }
};

export const getDefaultConsent = () => ({
  marketingEmails: false,
  analytics: false,
  dataProcessing: true,
  consentVersion: '1.0'
});
