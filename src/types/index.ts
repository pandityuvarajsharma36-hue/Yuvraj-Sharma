export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  completion_date?: string | null;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
  images: string[];
  created_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  image_url: string;
  starting_price?: string | null;
  display_order: number;
  is_published: boolean;
  created_at?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo_url: string;
  short_bio?: string | null;
  display_order: number;
  created_at?: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  location_or_project: string;
  content: string;
  rating: number;
  is_published: boolean;
  created_at?: string;
}

export interface Inquiry {
  id: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  service_needed: string;
  dimensions?: string | null;
  budget_range?: string | null;
  location_area: string;
  details: string;
  preferred_contact: 'phone' | 'whatsapp' | 'email';
  reference_image_url?: string | null;
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
  admin_notes?: string | null;
  is_callback?: boolean;
  preferred_time?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebsiteSettings {
  business_name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  business_hours?: string;
  headline?: string;
  hero_description?: string;
  footer_text?: string;
  seo_title?: string;
  seo_description?: string;
  facebook_url?: string;
  instagram_url?: string;
  pinterest_url?: string;
  [key: string]: string | undefined;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}
