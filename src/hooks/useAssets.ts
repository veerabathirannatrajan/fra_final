import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Asset = Database['public']['Tables']['assets']['Row'];

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getAssetsByVillage = async (village: string) => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('village', village)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    }
  };

  const getAssetStats = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('asset_type, state, district')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const stats = {
        total: data?.length || 0,
        byType: {
          agriculture: data?.filter(asset => asset.asset_type === 'agriculture').length || 0,
          forest_cover: data?.filter(asset => asset.asset_type === 'forest_cover').length || 0,
          water_body: data?.filter(asset => asset.asset_type === 'water_body').length || 0,
          homestead: data?.filter(asset => asset.asset_type === 'homestead').length || 0,
          grazing_land: data?.filter(asset => asset.asset_type === 'grazing_land').length || 0,
        },
        byState: data?.reduce((acc, asset) => {
          acc[asset.state] = (acc[asset.state] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {}
      };

      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return {
    assets,
    loading,
    error,
    refetch: fetchAssets,
    getAssetsByVillage,
    getAssetStats
  };
};