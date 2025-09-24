import { useEffect, useState } from 'react';
import { assetService } from '../services/assetService.js';

export function useAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    assetService.list().then(setAssets).finally(() => setLoading(false));
  }, []);

  return { assets, loading };
}
