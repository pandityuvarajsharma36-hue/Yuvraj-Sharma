-- ====================================================================
-- SHARMA WOODCRAFT: SUPABASE POSTGRESQL DATABASE SCHEMA & SEED DATA
-- ====================================================================
-- इस SQL स्क्रिप्ट को आप Supabase Dashboard के 'SQL Editor' में जाकर Run करें।

-- 1. व्यवस्थापक तालिका (Admins)
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. वेबसाइट सेटिंग्स (Website Settings)
CREATE TABLE IF NOT EXISTS public.website_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary_settings',
  business_name TEXT NOT NULL DEFAULT 'शर्मा वुडक्राफ्ट',
  phone TEXT NOT NULL DEFAULT '+91 98100 12345',
  whatsapp TEXT NOT NULL DEFAULT '919810012345',
  email TEXT DEFAULT 'contact@sharmawoodcraft.in',
  address TEXT DEFAULT 'कीर्ति नगर फर्नीचर ब्लॉक, नई दिल्ली, दिल्ली 110015, भारत',
  business_hours TEXT DEFAULT 'सोमवार - शनिवार: सुबह 10:00 से रात 8:00 बजे तक (रविवार केवल अपॉइंटमेंट द्वारा)',
  headline TEXT DEFAULT 'सुंदर स्थानों का निर्माण, एक-एक काष्ठशिल्प के साथ',
  about_snippet TEXT DEFAULT 'शर्मा वुडक्राफ्ट दिल्ली एनसीआर में हस्तनिर्मित लक्ज़री फर्नीचर और कस्टम काष्ठकला की प्रमुख कार्यशाला है।',
  hero_image_url TEXT,
  facebook_url TEXT DEFAULT 'https://facebook.com',
  instagram_url TEXT DEFAULT 'https://instagram.com',
  pinterest_url TEXT DEFAULT 'https://pinterest.com',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. सेवाएं (Services)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  starting_price TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. प्रोजेक्ट्स व गैलरी (Projects)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  completion_date TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. प्रोजेक्ट तस्वीरें (Project Images)
CREATE TABLE IF NOT EXISTS public.project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. टीम व मुख्य कारीगर (Team Members)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  short_bio TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ग्राहक समीक्षाएं (Testimonials)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  location_or_project TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ग्राहक पूछताछ व लीड्स (Inquiries)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_needed TEXT NOT NULL,
  dimensions TEXT,
  budget_range TEXT,
  location_area TEXT NOT NULL,
  details TEXT NOT NULL,
  preferred_contact TEXT NOT NULL DEFAULT 'phone',
  reference_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  is_callback BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
-- RLS को सक्षम करें
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- सार्वजनिक रीड (Public Read) - वेबसाइट पर डेटा दिखने के लिए
CREATE POLICY "Public Read Website Settings" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Published Services" ON public.services FOR SELECT USING (is_published = true);
CREATE POLICY "Public Read Published Projects" ON public.projects FOR SELECT USING (is_published = true);
CREATE POLICY "Public Read Project Images" ON public.project_images FOR SELECT USING (true);
CREATE POLICY "Public Read Team Members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Public Read Published Testimonials" ON public.testimonials FOR SELECT USING (is_published = true);

-- सार्वजनिक इंसर्ट (Public Insert) - ग्राहक पूछताछ / कोटेशन / कॉल बैक सबमिट कर सकें
CREATE POLICY "Public Insert Inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);

-- ====================================================================
-- प्रारंभिक डेटा (Initial Seed Data)
-- ====================================================================
INSERT INTO public.website_settings (id, business_name, phone, whatsapp, email, address, business_hours, headline, about_snippet)
VALUES (
  'primary_settings',
  'शर्मा वुडक्राफ्ट',
  '+91 98100 12345',
  '919810012345',
  'contact@sharmawoodcraft.in',
  'कीर्ति नगर फर्नीचर ब्लॉक, नई दिल्ली, दिल्ली 110015, भारत',
  'सोमवार - शनिवार: सुबह 10:00 से रात 8:00 बजे तक (रविवार केवल अपॉइंटमेंट द्वारा)',
  'सुंदर स्थानों का निर्माण, एक-एक काष्ठशिल्प के साथ',
  'शर्मा वुडक्राफ्ट दिल्ली एनसीआर में पिछले 25 वर्षों से शुद्ध ठोस लकड़ी (सागवान, शीशम, वालनट) से लक्ज़री कस्टम फर्नीचर और आवासीय इंटीरियर तैयार कर रहा है।'
) ON CONFLICT (id) DO NOTHING;

-- सेवाएं (Services)
INSERT INTO public.services (title, description, image_url, starting_price, display_order)
VALUES 
  ('कस्टम वार्डरोब (अलमारियां)', 'दीवार के सटीक नाप के अनुसार फर्श से छत तक वॉक-इन और स्लाइडिंग अलमारियां, ब्लम सॉफ्ट-क्लोज़ फिटिंग्स व प्रीमियम आंतरिक लेआउट।', '/src/assets/images/custom_teak_wardrobe_bedroom_1793256792751.jpg', '₹45,000 से', 1),
  ('मॉड्यूलर व सेमी-मॉड्यूलर किचन', '100% वाटरप्रूफ बीब्लूपी मरीन प्लाई और ठोस लकड़ी के शटर, हाइड्रॉलिक ड्रॉअर, क्वार्ट्ज टॉप और आधुनिक पेंट्री यूनिट्स।', '/src/assets/images/teak_wood_modular_kitchen_cabinetry_1793256860086.jpg', '₹1,25,000 से', 2),
  ('ठोस लकड़ी के डबल बेड व बेडरूम सेट', 'सॉलिड सीपी सागवान और शीशम में निर्मित हेवी-ड्यूटी किंग व क्वीन साइज बेड, हाइड्रॉलिक स्टोरेज और मैचिंग साइड टेबल्स।', '/src/assets/images/solid_sheesham_wood_king_bed_1793256897287.jpg', '₹38,000 से', 3),
  ('डाइनिंग टेबल व कुर्सियों का सेट', '6-सीटर व 8-सीटर सॉलिड वुड डाइनिंग टेबल्स, हैंड-कार्व्ड पैर, हीट-रेसिस्टेंट पीयू कोटिंग और प्रीमियम फैब्रिक कुर्सियां।', '/src/assets/images/crafted_sheesham_dining_table_1793257007559.jpg', '₹42,000 से', 4),
  ('टीवी यूनिट व लाउंज वॉल पैनलिंग', 'फ्लोटिंग कंसोल, हिडन केबल मैनेजमेंट, बैक-लिट अकोस्टिक वुडन स्लैट्स और इटैलियन मार्बल/माइका फिनिश।', '/src/assets/images/minimalist_fluted_wood_tv_unit_1793256934579.jpg', '₹28,000 से', 5),
  ('नक्काशीदार मुख्य लकड़ी के दरवाजे', 'उच्च श्रेणी के सीपी टीकवुड (सागवान) में भव्य नक्काशीदार मुख्य प्रवेश द्वार, मजबूत चौखट और ब्रास फिटिंग्स।', '/src/assets/images/artisan_carved_solid_teak_door_1793257041793.jpg', '₹22,000 से', 6)
ON CONFLICT DO NOTHING;
