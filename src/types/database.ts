export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'editor' | 'viewer';
          department: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'editor' | 'viewer';
          department?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'admin' | 'editor' | 'viewer';
          department?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      fra_claims: {
        Row: {
          id: string;
          holder_name: string;
          claim_type: 'IFR' | 'CR' | 'CFR';
          village: string;
          block: string | null;
          district: string;
          state: string;
          year: number;
          status: 'pending' | 'approved' | 'rejected' | 'under_review';
          area_hectares: number | null;
          tribal_group: string | null;
          documents_url: string[] | null;
          geom: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          holder_name: string;
          claim_type: 'IFR' | 'CR' | 'CFR';
          village: string;
          block?: string | null;
          district: string;
          state: string;
          year: number;
          status?: 'pending' | 'approved' | 'rejected' | 'under_review';
          area_hectares?: number | null;
          tribal_group?: string | null;
          documents_url?: string[] | null;
          geom?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          holder_name?: string;
          claim_type?: 'IFR' | 'CR' | 'CFR';
          village?: string;
          block?: string | null;
          district?: string;
          state?: string;
          year?: number;
          status?: 'pending' | 'approved' | 'rejected' | 'under_review';
          area_hectares?: number | null;
          tribal_group?: string | null;
          documents_url?: string[] | null;
          geom?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      assets: {
        Row: {
          id: string;
          village: string;
          district: string;
          state: string;
          asset_type: 'agriculture' | 'forest_cover' | 'water_body' | 'homestead' | 'grazing_land';
          description: string | null;
          source: string | null;
          geom: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          village: string;
          district: string;
          state: string;
          asset_type: 'agriculture' | 'forest_cover' | 'water_body' | 'homestead' | 'grazing_land';
          description?: string | null;
          source?: string | null;
          geom?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          village?: string;
          district?: string;
          state?: string;
          asset_type?: 'agriculture' | 'forest_cover' | 'water_body' | 'homestead' | 'grazing_land';
          description?: string | null;
          source?: string | null;
          geom?: any | null;
          created_at?: string | null;
        };
      };
      dss_results: {
        Row: {
          id: string;
          claim_id: string | null;
          scheme: 'PM_KISAN' | 'JAL_JEEVAN_MISSION' | 'MGNREGA' | 'DAJGUA';
          priority_score: number;
          recommendation: string;
          rationale: string | null;
          created_at: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          claim_id?: string | null;
          scheme: 'PM_KISAN' | 'JAL_JEEVAN_MISSION' | 'MGNREGA' | 'DAJGUA';
          priority_score: number;
          recommendation: string;
          rationale?: string | null;
          created_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          claim_id?: string | null;
          scheme?: 'PM_KISAN' | 'JAL_JEEVAN_MISSION' | 'MGNREGA' | 'DAJGUA';
          priority_score?: number;
          recommendation?: string;
          rationale?: string | null;
          created_at?: string | null;
          created_by?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}