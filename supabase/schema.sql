-- =====================================================================
-- SHARMA WOODCRAFT - PRODUCTION SUPABASE / POSTGRESQL DATABASE SCHEMA
-- Free-First Tier Compatible with Row Level Security (RLS)
-- =====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADMIN PROFILES TABLE (Linked with Supabase auth.users or standalone)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Wardrobes', 'Kitchen', 'Bedroom', 'Living Room', 'Office', 'Custom Furniture', 'Doors & Paneling')),
    completion_date TEXT,
    is_published BOOLEAN DEFAULT true NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PROJECT IMAGES TABLE (1-to-Many with Projects)
CREATE TABLE IF NOT EXISTS public.project_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    starting_price TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    short_bio TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    location_or_project TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CUSTOMER INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    service_needed TEXT NOT NULL,
    dimensions TEXT,
    budget_range TEXT,
    location_area TEXT NOT NULL,
    details TEXT NOT NULL,
    preferred_contact TEXT DEFAULT 'phone' CHECK (preferred_contact IN ('phone', 'whatsapp', 'email')),
    reference_image_url TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'cancelled')),
    admin_notes TEXT,
    is_callback BOOLEAN DEFAULT false NOT NULL,
    preferred_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. WEBSITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.website_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(is_published, display_order);
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON public.project_images(project_id, display_order);
CREATE INDEX IF NOT EXISTS idx_services_published ON public.services(is_published, display_order);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status, created_at DESC);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Public can read published projects
CREATE POLICY "Public can view published projects"
    ON public.projects FOR SELECT
    USING (is_published = true);

-- Public can view images of published projects
CREATE POLICY "Public can view published project images"
    ON public.project_images FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.projects WHERE projects.id = project_images.project_id AND projects.is_published = true
    ));

-- Public can view published services
CREATE POLICY "Public can view published services"
    ON public.services FOR SELECT
    USING (is_published = true);

-- Public can view team members
CREATE POLICY "Public can view team members"
    ON public.team_members FOR SELECT
    USING (true);

-- Public can view published testimonials
CREATE POLICY "Public can view published testimonials"
    ON public.testimonials FOR SELECT
    USING (is_published = true);

-- Public can view website settings
CREATE POLICY "Public can view website settings"
    ON public.website_settings FOR SELECT
    USING (true);

-- Public can INSERT inquiries (only insert, never read inquiries or notes)
CREATE POLICY "Public can submit quotation inquiries"
    ON public.inquiries FOR INSERT
    WITH CHECK (true);

-- Authenticated admins have full CRUD on everything
CREATE POLICY "Admins full access to admin_profiles"
    ON public.admin_profiles FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admins full access to projects"
    ON public.projects FOR ALL
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins full access to project_images"
    ON public.project_images FOR ALL
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins full access to services"
    ON public.services FOR ALL
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins full access to team_members"
    ON public.team_members FOR ALL
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins full access to testimonials"
    ON public.testimonials FOR ALL
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins full access to inquiries"
    ON public.inquiries FOR ALL
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins full access to website_settings"
    ON public.website_settings FOR ALL
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));
