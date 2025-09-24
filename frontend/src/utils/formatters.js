export const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '');
