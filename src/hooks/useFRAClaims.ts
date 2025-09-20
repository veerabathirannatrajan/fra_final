import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type FRAClaim = Database['public']['Tables']['fra_claims']['Row'];

export const useFRAClaims = () => {
  const [claims, setClaims] = useState<FRAClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fra_claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getClaimsByState = async (state: string) => {
    try {
      const { data, error } = await supabase
        .from('fra_claims')
        .select('*')
        .eq('state', state)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    }
  };

  const getClaimsByDistrict = async (district: string) => {
    try {
      const { data, error } = await supabase
        .from('fra_claims')
        .select('*')
        .eq('district', district)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    }
  };

  const getClaimStats = async () => {
    try {
      const { data, error } = await supabase
        .from('fra_claims')
        .select('claim_type, status, state')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const stats = {
        total: data?.length || 0,
        byType: {
          IFR: data?.filter(claim => claim.claim_type === 'IFR').length || 0,
          CR: data?.filter(claim => claim.claim_type === 'CR').length || 0,
          CFR: data?.filter(claim => claim.claim_type === 'CFR').length || 0,
        },
        byStatus: {
          pending: data?.filter(claim => claim.status === 'pending').length || 0,
          approved: data?.filter(claim => claim.status === 'approved').length || 0,
          rejected: data?.filter(claim => claim.status === 'rejected').length || 0,
          under_review: data?.filter(claim => claim.status === 'under_review').length || 0,
        },
        byState: data?.reduce((acc, claim) => {
          acc[claim.state] = (acc[claim.state] || 0) + 1;
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
    fetchClaims();
  }, []);

  return {
    claims,
    loading,
    error,
    refetch: fetchClaims,
    getClaimsByState,
    getClaimsByDistrict,
    getClaimStats
  };
};