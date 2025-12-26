import { api } from './api';

export const getStripeConfig = async () => {
  const res = await api.get('/stripe/config');
  return res.data;
};

export const createSetupIntent = async () => {
  const res = await api.post('/stripe/setup-intent');
  return res.data; // { clientSecret }
};

export const getPriceIds = async () => {
  const res = await api.get('/stripe/price-ids');
  return res.data;
};

export default { getStripeConfig, createSetupIntent, getPriceIds };
