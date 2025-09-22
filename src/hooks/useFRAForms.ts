import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface IndividualForm {
  claim_id: string;
  claimant_name: string;
  address?: string;
  village?: string;
  land_no?: string;
  gram_panchayat?: string;
  taluka?: string;
  district?: string;
  state?: string;
  area?: number;
  status?: string;
  income?: number;
  forest_near?: string;
  aadhar_number?: string;
}

export interface VillageForm {
  claim_id: string;
  claimant_name: string;
  village?: string;
  gram_panchayat?: string;
  taluka?: string;
  district?: string;
  state?: string;
  village_no?: string;
  resources_rights?: string;
  status?: string;
}

export interface ForestForm {
  claim_id: string;
  claimant_name: string;
  gram_panchayat?: string;
  village?: string;
  taluka?: string;
  forest?: string;
  district?: string;
  state?: string;
  forest_no?: string;
  status?: string;
  resource?: string;
}

export interface SchemeRecommendation {
  claim_id: string;
  claimant_name: string;
  claim_type: 'Individual' | 'Village' | 'Forest';
  village?: string;
  district?: string;
  state?: string;
  status?: string;
  recommended_schemes: string[];
  eligibility_reasons: string[];
  primary_scheme?: string;
}

export const useFRAForms = () => {
  const [individualForms, setIndividualForms] = useState<IndividualForm[]>([]);
  const [villageForms, setVillageForms] = useState<VillageForm[]>([]);
  const [forestForms, setForestForms] = useState<ForestForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllForms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch individual forms
      const { data: individualData, error: individualError } = await supabase
        .from('individual_forms')
        .select('*')
        .order('claim_id');

      if (individualError) throw individualError;

      // Fetch village forms
      const { data: villageData, error: villageError } = await supabase
        .from('village_form')
        .select('*')
        .order('claim_id');

      if (villageError) throw villageError;

      // Fetch forest forms
      const { data: forestData, error: forestError } = await supabase
        .from('forest_form')
        .select('*')
        .order('claim_id');

      if (forestError) throw forestError;

      setIndividualForms(individualData || []);
      setVillageForms(villageData || []);
      setForestForms(forestData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = (
    individual: IndividualForm | null,
    village: VillageForm | null,
    forest: ForestForm | null
  ): SchemeRecommendation => {
    const schemes: string[] = [];
    const reasons: string[] = [];

    if (individual) {
      // PM-KISAN eligibility
      if (individual.area && individual.area > 1.0 && individual.income && individual.income <= 200000) {
        schemes.push('PM-KISAN');
        reasons.push(`Cultivable land > 1.0 acre (${individual.area} acres) and income ≤ ₹2,00,000`);
      }

      // Jal Jeevan Mission eligibility
      if (individual.status === 'Pending') {
        schemes.push('Jal Jeevan Mission');
        reasons.push('No tap water connection (status: Pending)');
      }

      // MGNREGA eligibility
      if (individual.income && individual.income <= 120000) {
        schemes.push('MGNREGA');
        reasons.push(`Low income ≤ ₹1,20,000 (₹${individual.income?.toLocaleString()})`);
      }
      if (individual.status === 'Unemployed') {
        schemes.push('MGNREGA');
        reasons.push('Employment status: Unemployed');
      }

      return {
        claim_id: individual.claim_id,
        claimant_name: individual.claimant_name,
        claim_type: 'Individual',
        village: individual.village,
        district: individual.district,
        state: individual.state,
        status: individual.status,
        recommended_schemes: [...new Set(schemes)],
        eligibility_reasons: reasons
      };
    }

    if (village) {
      // Jal Jeevan Mission eligibility
      if (village.resources_rights && village.resources_rights.toLowerCase().includes('water')) {
        schemes.push('Jal Jeevan Mission');
        reasons.push('Village has water resource rights');
      }

      // MGNREGA eligibility (assuming village-level income data)
      if (village.status === 'Unemployed' || village.status === 'Pending') {
        schemes.push('MGNREGA');
        reasons.push(`Village employment status: ${village.status}`);
      }

      return {
        claim_id: village.claim_id,
        claimant_name: village.claimant_name,
        claim_type: 'Village',
        village: village.village,
        district: village.district,
        state: village.state,
        status: village.status,
        recommended_schemes: [...new Set(schemes)],
        eligibility_reasons: reasons
      };
    }

    if (forest) {
      // DAJGUA eligibility
      if (forest.status === 'Approved') {
        schemes.push('DAJGUA');
        reasons.push('Forest rights approved for community resource management');
      }

      return {
        claim_id: forest.claim_id,
        claimant_name: forest.claimant_name,
        claim_type: 'Forest',
        village: forest.village,
        district: forest.district,
        state: forest.state,
        status: forest.status,
        recommended_schemes: [...new Set(schemes)],
        eligibility_reasons: reasons
      };
    }

    return {
      claim_id: '',
      claimant_name: '',
      claim_type: 'Individual',
      recommended_schemes: [],
      eligibility_reasons: []
    };
  };

  const getAllRecommendations = (): SchemeRecommendation[] => {
    const recommendations: SchemeRecommendation[] = [];

    // Process individual forms
    individualForms.forEach(form => {
      recommendations.push(checkEligibility(form, null, null));
    });

    // Process village forms
    villageForms.forEach(form => {
      recommendations.push(checkEligibility(null, form, null));
    });

    // Process forest forms
    forestForms.forEach(form => {
      recommendations.push(checkEligibility(null, null, form));
    });

    return recommendations;
  };

  const getAnalytics = () => {
    const recommendations = getAllRecommendations();
    
    // Total claims by type
    const claimsByType = {
      Individual: individualForms.length,
      Village: villageForms.length,
      Forest: forestForms.length,
      Total: individualForms.length + villageForms.length + forestForms.length
    };

    // Eligible claims by scheme
    const schemeEligibility = {
      'PM-KISAN': recommendations.filter(r => r.recommended_schemes.includes('PM-KISAN')).length,
      'Jal Jeevan Mission': recommendations.filter(r => r.recommended_schemes.includes('Jal Jeevan Mission')).length,
      'MGNREGA': recommendations.filter(r => r.recommended_schemes.includes('MGNREGA')).length,
      'DAJGUA': recommendations.filter(r => r.recommended_schemes.includes('DAJGUA')).length
    };

    // State-wise distribution
    const stateDistribution: Record<string, number> = {};
    [...individualForms, ...villageForms, ...forestForms].forEach(form => {
      if (form.state) {
        stateDistribution[form.state] = (stateDistribution[form.state] || 0) + 1;
      }
    });

    // Status summary
    const statusSummary: Record<string, number> = {};
    [...individualForms, ...villageForms, ...forestForms].forEach(form => {
      const status = form.status || 'Pending';
      statusSummary[status] = (statusSummary[status] || 0) + 1;
    });

    return {
      claimsByType,
      schemeEligibility,
      stateDistribution,
      statusSummary,
      totalRecommendations: recommendations.length
    };
  };

  useEffect(() => {
    fetchAllForms();
  }, []);

  return {
    individualForms,
    villageForms,
    forestForms,
    loading,
    error,
    refetch: fetchAllForms,
    getAllRecommendations,
    getAnalytics,
    checkEligibility
  };
};