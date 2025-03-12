/* eslint-disable @typescript-eslint/indent */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      navigation_category: {
        Row: {
          create_by: number;
          create_time: string;
          del_flag: number;
          id: number;
          name: string;
          sort: number;
          title: string;
        };
        Insert: {
          create_by?: number | null;
          create_time?: string;
          del_flag?: number | null;
          id?: never;
          name: string;
          sort?: number | null;
          title?: string | null;
        };
        Update: {
          create_by?: number | null;
          create_time?: string;
          del_flag?: number | null;
          id?: never;
          name?: string;
          sort?: number | null;
          title?: string | null;
        };
        Relationships: [];
      };
      redbook_projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          website_url: string;
          redbook_url: string;
          creator_name: string;
          creator_redbook_id: string;
          status: 'pending' | 'approved' | 'rejected';
          category: string;
          tags: string[];
          screenshot_urls: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          website_url: string;
          redbook_url: string;
          creator_name: string;
          creator_redbook_id: string;
          status?: 'pending' | 'approved' | 'rejected';
          category: string;
          tags?: string[];
          screenshot_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          website_url?: string;
          redbook_url?: string;
          creator_name?: string;
          creator_redbook_id?: string;
          status?: 'pending' | 'approved' | 'rejected';
          category?: string;
          tags?: string[];
          screenshot_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      submit: {
        Row: {
          created_at: string;
          email: string | null;
          id: number;
          is_feature: number | null;
          name: string | null;
          status: number | null;
          url: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: number;
          is_feature?: number | null;
          name?: string | null;
          status?: number | null;
          url?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: number;
          is_feature?: number | null;
          name?: string | null;
          status?: number | null;
          url?: string | null;
        };
        Relationships: [];
      };
      web_navigation: {
        Row: {
          id: string | number;
          name: string;
          title: string | null;
          content: string | null;
          detail: string | null;
          url: string | null;
          image_url: string | null;
          thumbnail_url: string | null;
          website_data: string | null;
          collection_time: string | null;
          star_rating: number | null;
          tag_name: string | null;
          category_name: string | null;
        };
        Insert: {
          id?: string | number;
          name: string;
          title?: string | null;
          content?: string | null;
          detail?: string | null;
          url?: string | null;
          image_url?: string | null;
          thumbnail_url?: string | null;
          website_data?: string | null;
          collection_time?: string | null;
          star_rating?: number | null;
          tag_name?: string | null;
          category_name?: string | null;
        };
        Update: {
          id?: string | number;
          name?: string;
          title?: string | null;
          content?: string | null;
          detail?: string | null;
          url?: string | null;
          image_url?: string | null;
          thumbnail_url?: string | null;
          website_data?: string | null;
          collection_time?: string | null;
          star_rating?: number | null;
          tag_name?: string | null;
          category_name?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ];
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type NavigationCategory = Database['public']['Tables']['navigation_category']['Row'];
export type Submit = {
  id: number
  created_at: string
  title: string
  description: string
  url: string
  redbook_url: string
  creator_name: string
  creator_redbook_id: string
  category: string
  tags: string[]
  screenshot_urls: string[]
  status: 'pending' | 'approved' | 'rejected'
}
export type WebNavigation = Database['public']['Tables']['web_navigation']['Row'];

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views']) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export interface RedBookProject {
  id: string
  title: string
  description: string
  website_url: string
  redbook_url: string
  creator_name: string
  creator_redbook_id: string
  status: 'pending' | 'approved' | 'rejected'
  category: string
  tags: string[]
  screenshot_urls: string[]
  created_at: string
  updated_at: string
}
