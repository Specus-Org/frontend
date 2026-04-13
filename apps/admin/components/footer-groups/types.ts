export interface FooterGroup {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FooterGroupListResponse {
  items: FooterGroup[];
  integration_ready: boolean;
  message?: string;
}

export interface ContentFooterGroupResponse {
  current_footer_group_id: string | null;
  current_footer_group?: FooterGroup | null;
  integration_ready: boolean;
  message?: string;
}
