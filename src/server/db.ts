import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'sharma_woodcraft.db');
export const db = new Database(DB_PATH);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      completion_date TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      is_featured INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS project_images (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      starting_price TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      short_bio TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      location_or_project TEXT NOT NULL,
      content TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
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
      is_callback INTEGER NOT NULL DEFAULT 0,
      preferred_time TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS website_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(is_published, display_order);
    CREATE INDEX IF NOT EXISTS idx_services_order ON services(is_published, display_order);
    CREATE INDEX IF NOT EXISTS idx_inquiries_date ON inquiries(created_at DESC);
  `);

  // Migrate existing schema if columns don't exist
  try {
    const tableInfo = db.prepare('PRAGMA table_info(inquiries)').all() as { name: string }[];
    const colNames = tableInfo.map(c => c.name);
    if (!colNames.includes('is_callback')) {
      db.exec('ALTER TABLE inquiries ADD COLUMN is_callback INTEGER NOT NULL DEFAULT 0');
    }
    if (!colNames.includes('preferred_time')) {
      db.exec('ALTER TABLE inquiries ADD COLUMN preferred_time TEXT');
    }
  } catch (err) {
    console.warn('Inquiries column migration check:', err);
  }

  // Ensure content is in Hindi
  try {
    migrateContentToHindi();
  } catch (err) {
    console.warn('Hindi content migration check:', err);
  }

  seedInitialData();
}

function migrateContentToHindi() {
  const headline = db.prepare("SELECT value FROM website_settings WHERE key = 'headline'").get() as { value: string } | undefined;
  // If headline is in English or missing, update to Hindi
  if (!headline || headline.value.includes('Crafting Beautiful Spaces')) {
    const hindiSettings: Record<string, string> = {
      business_name: 'शर्मा वुडक्राफ्ट',
      phone: '+91 98100 12345',
      whatsapp: '919810012345',
      email: 'contact@sharmawoodcraft.in',
      address: 'कीर्ति नगर फर्नीचर ब्लॉक, नई दिल्ली, दिल्ली 110015, भारत',
      business_hours: 'सोमवार - शनिवार: सुबह 10:00 से रात 8:00 बजे तक (रविवार केवल अपॉइंटमेंट द्वारा)',
      headline: 'हर कोने को सुंदर बनाएं, एक-एक शिल्परूप के साथ।',
      hero_description: 'दिल्ली में 35+ वर्षों के अनुभव के साथ हस्तनिर्मित ठोस सागौन व शीशम का फर्नीचर, वास्तुशिल्प काष्ठकला, लक्ज़री मॉड्यूलर किचन और कस्टम वार्डरोब।',
      footer_text: 'शर्मा वुडक्राफ्ट — दिल्ली एनसीआर में हस्तनिर्मित वास्तुशिल्प काष्ठकला और पीढ़ियों तक चलने वाला कस्टम फर्नीचर।',
      seo_title: 'शर्मा वुडक्राफ्ट | प्रीमियम कस्टम फर्नीचर और काष्ठकला दिल्ली',
      seo_description: 'दिल्ली में हस्तनिर्मित कस्टम वार्डरोब, ठोस लकड़ी के डाइनिंग टेबल, मॉड्यूलर किचन और वास्तुशिल्प काष्ठकला। आज ही फ्री कोटेशन प्राप्त करें।',
      facebook_url: 'https://facebook.com',
      instagram_url: 'https://instagram.com',
      pinterest_url: 'https://pinterest.com'
    };

    const updateSetting = db.prepare('INSERT OR REPLACE INTO website_settings (key, value, updated_at) VALUES (?, ?, ?)');
    const now = new Date().toISOString();
    for (const [key, val] of Object.entries(hindiSettings)) {
      updateSetting.run(key, val, now);
    }

    // Update services to Hindi
    db.exec(`
      UPDATE services SET title = 'कस्टम वार्डरोब (अलमारियां)', description = 'दीवार के सटीक नाप के अनुसार फर्श से छत तक वॉक-इन और स्लाइडिंग अलमारियां, ब्लम सॉफ्ट-क्लोज़ फिटिंग्स, वेलवेट ज्वेलरी ड्रॉअर और बांसुरीदार लकड़ी की फिनिशिंग।', starting_price = '₹1,450 / वर्ग फुट' WHERE title LIKE '%Wardrobe%';
      UPDATE services SET title = 'मॉड्यूलर किचन (आधुनिक रसोई)', description = 'नमी प्रतिरोधी मरीन प्लाईवुड मॉड्यूलर किचन, ठोस सागौन शटर, ऐक्रेलिक फिनिश, स्पाइस पुल-आउट्स और सीमलेस क्वार्ट्ज़ काउंटरटॉप इंटीग्रेशन।', starting_price = '₹1,850 / वर्ग फुट' WHERE title LIKE '%Kitchen%';
      UPDATE services SET title = 'बेड व बेडरूम फर्नीचर', description = 'असली ठोस सागौन और शीशम की लकड़ी के किंग-साइज बेड, हाइड्रोलिक स्टोरेज, अपहोल्स्टर्ड हेडबोर्ड, फ्लोटिंग नाइटस्टैंड और मैचिंग ड्रेसिंग टेबल।', starting_price = '₹45,000 से शुरू' WHERE title LIKE '%Bed%';
      UPDATE services SET title = 'डाइनिंग टेबल और कुर्सियां', description = 'सिंगल-स्लैब ठोस अखरोट (अमेरिकन वॉलनट) या परिपक्व सागौन से हस्तनिर्मित 6 से 12 सीटर डाइनिंग टेबल और आरामदायक नक्काशीदार कुर्सियां।', starting_price = '₹68,000 से शुरू' WHERE title LIKE '%Dining%';
      UPDATE services SET title = 'सोफा और लिविंग रूम फर्नीचर', description = 'भट्ठी में सुखाई गई अनुभवी दृढ़ लकड़ी (हार्डवुड) के फ्रेम से बने सोफा सेट, लाउंज चेयर्स, सेंटर टेबल और क्रेडेंज़ा।', starting_price = '₹35,000 से शुरू' WHERE title LIKE '%Sofa%';
      UPDATE services SET title = 'टीवी यूनिट व वॉल पैनल्स', description = 'आधुनिक एकॉस्टिक वुडन स्लैटेड वॉल पैनलिंग, फ्लोटिंग टीवी क्रेडेंज़ा, छुपा हुआ केबल मैनेजमेंट और बैक-लिट शेल्विंग।', starting_price = '₹850 / वर्ग फुट' WHERE title LIKE '%TV Unit%';
      UPDATE services SET title = 'मुख्य लकड़ी के दरवाजे और चौखट', description = 'शाही ठोस सागौन के प्रवेश द्वार, कस्टम सीएनजी ब्रास इनले, पारंपरिक नक्काशी और उच्च सुरक्षा मल्टी-लॉक मोर्टिज़ हार्डवेयर।', starting_price = '₹32,000 से शुरू' WHERE title LIKE '%Door%';
      UPDATE services SET title = 'ऑफिस और कमर्शियल काष्ठकला', description = 'एग्जीक्यूटिव डेस्क सुइट्स, बोर्डरूम कॉन्फ्रेंस टेबल्स, एकॉस्टिक पार्टीशन और आधुनिक ऑफिस रिसेप्शन डेस्क।', starting_price = '₹55,000 से शुरू' WHERE title LIKE '%Office%';
      UPDATE services SET title = 'कस्टम अलमारियां और बार कंसोल', description = 'इन-बिल्ट वाइन रैक, मिरर बैक पैनल्स, पीतल के ग्लास हैंगर और पुश-टू-ओपन टेम्पर्ड ग्लास डिस्प्ले कैबिनेट।', starting_price = '₹42,000 से शुरू' WHERE title LIKE '%Cabinet%';
      UPDATE services SET title = 'फर्नीचर मरम्मत, पॉलिश और नवीनीकरण', description = 'पुराने फर्नीचर का कायाकल्प, इतालियन पीयू (PU) पॉलिश, स्ट्रक्चरल मरम्मत और ऑन-साइट कस्टम बढ़ईगिरी कार्य।', starting_price = 'निरीक्षण के बाद' WHERE title LIKE '%Restoration%';
    `);

    // Update projects to Hindi
    db.exec(`
      UPDATE projects SET title = 'पंचशील पार्क अखरोट डाइनिंग व लिविंग सुइट', category = 'लिविंग रूम', completion_date = 'अक्टूबर 2025', description = 'दक्षिण दिल्ली के पंचशील पार्क में पेंटहाउस के लिए हस्तनिर्मित 10-सीटर सॉलिड अमेरिकन वॉलनट डाइनिंग टेबल, बांसुरीदार क्रेडेंज़ा और वेलवेट आर्मचेयर।' WHERE title LIKE '%Panchsheel%';
      UPDATE projects SET title = 'जोर बाग फ्लूटेड टीक वार्डरोब सुइट', category = 'बेडरूम', completion_date = 'दिसंबर 2025', description = 'बर्मा टीक की ठोस लकड़ी से फर्श से छत तक बनी 4-डोर स्लाइडिंग अलमारी, सैटिन ब्रास हैंडल, सेंसर एलईडी लाइट्स और इनबिल्ट वैनिटी।' WHERE title LIKE '%Jor Bagh%';
      UPDATE projects SET title = 'वसंत विहार मॉडर्न हार्डवुड किचन', category = 'रसोई', completion_date = 'जनवरी 2026', description = 'अखरोट की लकड़ी की कैबिनेट, वॉटरफॉल एज ब्रेकफास्ट आइलैंड और ब्लम हार्डवेयर के साथ लक्जरी मॉड्यूलर किचन रेनोवेशन।' WHERE title LIKE '%Vasant Vihar%';
      UPDATE projects SET title = 'कारीगर कार्यशाला और वास्तुशिल्प जोड़', category = 'कस्टम फर्नीचर', completion_date = 'मार्च 2026', description = 'हमारी दिल्ली कार्यशाला में हस्तनिर्मित पारंपरिक मोर्टिज़-एंड-टेनन जोड़ों और शुद्ध काष्ठकला का उत्कृष्ट प्रदर्शन।' WHERE title LIKE '%Artisan Workshop%';
    `);

    // Update team members to Hindi
    db.exec(`
      UPDATE team_members SET name = 'ओमप्रकाश शर्मा', role = 'मास्टर कारीगर एवं संस्थापक', short_bio = 'दिल्ली एनसीआर में काष्ठकला और कस्टम फर्नीचर निर्माण का 35 से अधिक वर्षों का अनुभव। ठोस सागौन, शीशम और पारंपरिक जोड़ तकनीक के विशेषज्ञ।' WHERE name LIKE '%Omprakash%';
      UPDATE team_members SET name = 'राकेश शर्मा', role = 'प्रमुख डिजाइनर एवं मॉड्यूलर विशेषज्ञ', short_bio = 'आधुनिक एर्गोनॉमिक्स, 3D सीएडी लेआउट डिजाइन और लक्जरी इंटीरियर्स के लिए हार्डवेयर इंटीग्रेशन के विशेषज्ञ।' WHERE name LIKE '%Rakesh%';
      UPDATE team_members SET name = 'सुनील कुमार', role = 'वरिष्ठ पॉलिशिंग व फिनिशिंग विशेषज्ञ', short_bio = 'हाथ से की जाने वाली तेल फिनिशिंग, इटालियन पीयू (PU) कोटिंग, प्राकृतिक वुड स्टेंस और प्राचीन फर्नीचर जीर्णोद्धार के माहिर।' WHERE name LIKE '%Sunil%';
    `);

    // Update testimonials to Hindi
    db.exec(`
      UPDATE testimonials SET client_name = 'विक्रम और अनन्या मल्होत्रा', location_or_project = 'वसंत विहार निवास', content = 'शर्मा वुडक्राफ्ट ने हमारे मास्टर बेडरूम की अलमारियां और 10-सीटर डाइनिंग टेबल बनाई। लकड़ी की गुणवत्ता, प्राकृतिक चमक और सॉफ्ट-क्लोजिंग जोड़ अंतरराष्ट्रीय स्तर के हैं।' WHERE client_name LIKE '%Vikram%';
      UPDATE testimonials SET client_name = 'आर्किटेक्ट दीपाली सेन', location_or_project = 'हौज खास एन्क्लेव प्रोजेक्ट', content = 'एक इंटीरियर आर्किटेक्ट के रूप में मेरे लिए परिशुद्धता और फिनिशिंग सबसे महत्वपूर्ण है। शर्मा जी और उनकी टीम ने समय पर बेहतरीन काम सौंपा। लकड़ी के रेशों की ऐसी समझ बहुत दुर्लभ है।' WHERE client_name LIKE '%Deepali%';
      UPDATE testimonials SET client_name = 'राजेश सिंघानिया', location_or_project = 'डीएलएफ फेज 5, गुरुग्राम', content = 'हमारे नए घर के लिए कस्टम वॉलनट बार कैबिनेट और लिविंग रूम की टीवी यूनिट तैयार की गई। वायरिंग छुपाने का तरीका और मैट पीयू पॉलिश वाकई तारीफ के काबिल है।' WHERE client_name LIKE '%Rajesh%';
    `);
  }
}

function seedInitialData() {
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get() as { count: number };
  const now = new Date().toISOString();

  if (adminCount.count === 0) {
    const defaultPasswordHash = bcrypt.hashSync('SharmaAdmin2026!', 10);
    db.prepare(`
      INSERT INTO admins (id, email, password_hash, full_name, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      'admin@sharmawoodcraft.com',
      defaultPasswordHash,
      'ओमप्रकाश शर्मा (मालिक)',
      'super_admin',
      now,
      now
    );
  }

  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM website_settings').get() as { count: number };
  if (settingsCount.count === 0) {
    const initialSettings: Record<string, string> = {
      business_name: 'शर्मा वुडक्राफ्ट',
      phone: '+91 98100 12345',
      whatsapp: '919810012345',
      email: 'contact@sharmawoodcraft.in',
      address: 'कीर्ति नगर फर्नीचर ब्लॉक, नई दिल्ली, दिल्ली 110015, भारत',
      business_hours: 'सोमवार - शनिवार: सुबह 10:00 से रात 8:00 बजे तक (रविवार केवल अपॉइंटमेंट द्वारा)',
      headline: 'हर कोने को सुंदर बनाएं, एक-एक शिल्परूप के साथ।',
      hero_description: 'दिल्ली में 35+ वर्षों के अनुभव के साथ हस्तनिर्मित ठोस सागौन व शीशम का फर्नीचर, वास्तुशिल्प काष्ठकला, लक्ज़री मॉड्यूलर किचन और कस्टम वार्डरोब।',
      footer_text: 'शर्मा वुडक्राफ्ट — दिल्ली एनसीआर में हस्तनिर्मित वास्तुशिल्प काष्ठकला और पीढ़ियों तक चलने वाला कस्टम फर्नीचर।',
      seo_title: 'शर्मा वुडक्राफ्ट | प्रीमियम कस्टम फर्नीचर और काष्ठकला दिल्ली',
      seo_description: 'दिल्ली में हस्तनिर्मित कस्टम वार्डरोब, ठोस लकड़ी के डाइनिंग टेबल, मॉड्यूलर किचन और वास्तुशिल्प काष्ठकला। आज ही फ्री कोटेशन प्राप्त करें।',
      facebook_url: 'https://facebook.com',
      instagram_url: 'https://instagram.com',
      pinterest_url: 'https://pinterest.com'
    };

    const insertSetting = db.prepare('INSERT OR REPLACE INTO website_settings (key, value, updated_at) VALUES (?, ?, ?)');
    for (const [key, value] of Object.entries(initialSettings)) {
      insertSetting.run(key, value, now);
    }
  } else {
    // Ensure social links exist if already initialized
    const checkPinterest = db.prepare("SELECT value FROM website_settings WHERE key = 'pinterest_url'").get();
    if (!checkPinterest) {
      db.prepare("INSERT INTO website_settings (key, value, updated_at) VALUES ('pinterest_url', 'https://pinterest.com', ?)").run(now);
    }
  }

  const servicesCount = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
  if (servicesCount.count === 0) {
    const defaultServices = [
      {
        title: 'कस्टम वार्डरोब (अलमारियां)',
        description: 'दीवार के सटीक नाप के अनुसार फर्श से छत तक वॉक-इन और स्लाइडिंग अलमारियां, ब्लम सॉफ्ट-क्लोज़ फिटिंग्स, वेलवेट ज्वेलरी ड्रॉअर और बांसुरीदार लकड़ी की फिनिशिंग।',
        image_url: '/src/assets/images/custom_teak_wardrobe_bedroom_1793256792751.jpg',
        starting_price: '₹1,450 / वर्ग फुट',
        display_order: 1
      },
      {
        title: 'मॉड्यूलर किचन (आधुनिक रसोई)',
        description: 'नमी प्रतिरोधी मरीन प्लाईवुड मॉड्यूलर किचन, ठोस सागौन शटर, ऐक्रेलिक फिनिश, स्पाइस पुल-आउट्स और सीमलेस क्वार्ट्ज़ काउंटरटॉप इंटीग्रेशन।',
        image_url: '/src/assets/images/modular_wooden_kitchen_1793256793895.jpg',
        starting_price: '₹1,850 / वर्ग फुट',
        display_order: 2
      },
      {
        title: 'बेड व बेडरूम फर्नीचर',
        description: 'असली ठोस सागौन और शीशम की लकड़ी के किंग-साइज बेड, हाइड्रोलिक स्टोरेज, अपहोल्स्टर्ड हेडबोर्ड, फ्लोटिंग नाइटस्टैंड और मैचिंग ड्रेसिंग टेबल।',
        image_url: '/src/assets/images/custom_teak_wardrobe_bedroom_1793256792751.jpg',
        starting_price: '₹45,000 से शुरू',
        display_order: 3
      },
      {
        title: 'डाइनिंग टेबल और कुर्सियां',
        description: 'सिंगल-स्लैब ठोस अखरोट (अमेरिकन वॉलनट) या परिपक्व सागौन से हस्तनिर्मित 6 से 12 सीटर डाइनिंग टेबल और आरामदायक नक्काशीदार कुर्सियां।',
        image_url: '/src/assets/images/hero_walnut_furniture_living_1793256792332.jpg',
        starting_price: '₹68,000 से शुरू',
        display_order: 4
      },
      {
        title: 'सोफा और लिविंग रूम फर्नीचर',
        description: 'भट्ठी में सुखाई गई अनुभवी दृढ़ लकड़ी (हार्डवुड) के फ्रेम से बने सोफा सेट, लाउंज चेयर्स, सेंटर टेबल और क्रेडेंज़ा।',
        image_url: '/src/assets/images/hero_walnut_furniture_living_1793256792332.jpg',
        starting_price: '₹35,000 से शुरू',
        display_order: 5
      },
      {
        title: 'टीवी यूनिट व वॉल पैनल्स',
        description: 'आधुनिक एकॉस्टिक वुडन स्लैटेड वॉल पैनलिंग, फ्लोटिंग टीवी क्रेडेंज़ा, छुपा हुआ केबल मैनेजमेंट और बैक-लिट शेल्विंग।',
        image_url: '/src/assets/images/hero_walnut_furniture_living_1793256792332.jpg',
        starting_price: '₹850 / वर्ग फुट',
        display_order: 6
      },
      {
        title: 'मुख्य लकड़ी के दरवाजे और चौखट',
        description: 'शाही ठोस सागौन के प्रवेश द्वार, कस्टम सीएनजी ब्रास इनले, पारंपरिक नक्काशी और उच्च सुरक्षा मल्टी-लॉक मोर्टिज़ हार्डवेयर।',
        image_url: '/src/assets/images/artisan_woodworking_workshop_1793256795276.jpg',
        starting_price: '₹32,000 से शुरू',
        display_order: 7
      },
      {
        title: 'ऑफिस और कमर्शियल काष्ठकला',
        description: 'एग्जीक्यूटिव डेस्क सुइट्स, बोर्डरूम कॉन्फ्रेंस टेबल्स, एकॉस्टिक पार्टीशन और आधुनिक ऑफिस रिसेप्शन डेस्क।',
        image_url: '/src/assets/images/artisan_woodworking_workshop_1793256795276.jpg',
        starting_price: '₹55,000 से शुरू',
        display_order: 8
      },
      {
        title: 'कस्टम अलमारियां और बार कंसोल',
        description: 'इन-बिल्ट वाइन रैक, मिरर बैक पैनल्स, पीतल के ग्लास हैंगर और पुश-टू-ओपन टेम्पर्ड ग्लास डिस्प्ले कैबिनेट।',
        image_url: '/src/assets/images/modular_wooden_kitchen_1793256793895.jpg',
        starting_price: '₹42,000 से शुरू',
        display_order: 9
      },
      {
        title: 'फर्नीचर मरम्मत, पॉलिश और नवीनीकरण',
        description: 'पुराने फर्नीचर का कायाकल्प, इतालियन पीयू (PU) पॉलिश, स्ट्रक्चरल मरम्मत और ऑन-साइट कस्टम बढ़ईगिरी कार्य।',
        image_url: '/src/assets/images/artisan_woodworking_workshop_1793256795276.jpg',
        starting_price: 'निरीक्षण के बाद',
        display_order: 10
      }
    ];

    const insertService = db.prepare(`
      INSERT INTO services (id, title, description, image_url, starting_price, display_order, is_published, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    defaultServices.forEach(s => {
      insertService.run(crypto.randomUUID(), s.title, s.description, s.image_url, s.starting_price, s.display_order, now, now);
    });
  }

  const projectsCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  if (projectsCount.count === 0) {
    const defaultProjects = [
      {
        title: 'पंचशील पार्क अखरोट डाइनिंग व लिविंग सुइट',
        description: 'दक्षिण दिल्ली के पंचशील पार्क में पेंटहाउस के लिए हस्तनिर्मित 10-सीटर सॉलिड अमेरिकन वॉलनट डाइनिंग टेबल, बांसुरीदार क्रेडेंज़ा और वेलवेट आर्मचेयर।',
        category: 'लिविंग रूम',
        completion_date: 'अक्टूबर 2025',
        is_featured: 1,
        images: [
          '/src/assets/images/hero_walnut_furniture_living_1793256792332.jpg'
        ]
      },
      {
        title: 'जोर बाग फ्लूटेड टीक वार्डरोब सुइट',
        description: 'बर्मा टीक की ठोस लकड़ी से फर्श से छत तक बनी 4-डोर स्लाइडिंग अलमारी, सैटिन ब्रास हैंडल, सेंसर एलईडी लाइट्स और इनबिल्ट वैनिटी।',
        category: 'बेडरूम',
        completion_date: 'दिसंबर 2025',
        is_featured: 1,
        images: [
          '/src/assets/images/custom_teak_wardrobe_bedroom_1793256792751.jpg'
        ]
      },
      {
        title: 'वसंत विहार मॉडर्न हार्डवुड किचन',
        description: 'अखरोट की लकड़ी की कैबिनेट, वॉटरफॉल एज ब्रेकफास्ट आइलैंड और ब्लम हार्डवेयर के साथ लक्जरी मॉड्यूलर किचन रेनोवेशन।',
        category: 'रसोई',
        completion_date: 'जनवरी 2026',
        is_featured: 1,
        images: [
          '/src/assets/images/modular_wooden_kitchen_1793256793895.jpg'
        ]
      },
      {
        title: 'कारीगर कार्यशाला और वास्तुशिल्प जोड़',
        description: 'हमारी दिल्ली कार्यशाला में हस्तनिर्मित पारंपरिक मोर्टिज़-एंड-टेनन जोड़ों और शुद्ध काष्ठकला का उत्कृष्ट प्रदर्शन।',
        category: 'कस्टम फर्नीचर',
        completion_date: 'मार्च 2026',
        is_featured: 0,
        images: [
          '/src/assets/images/artisan_woodworking_workshop_1793256795276.jpg'
        ]
      }
    ];

    const insertProject = db.prepare(`
      INSERT INTO projects (id, title, description, category, completion_date, is_published, is_featured, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
    `);

    const insertImg = db.prepare(`
      INSERT INTO project_images (id, project_id, image_url, display_order, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    defaultProjects.forEach((p, idx) => {
      const pid = crypto.randomUUID();
      insertProject.run(pid, p.title, p.description, p.category, p.completion_date, p.is_featured, idx + 1, now, now);
      p.images.forEach((img, imgIdx) => {
        insertImg.run(crypto.randomUUID(), pid, img, imgIdx + 1, now);
      });
    });
  }

  const teamCount = db.prepare('SELECT COUNT(*) as count FROM team_members').get() as { count: number };
  if (teamCount.count === 0) {
    const defaultTeam = [
      {
        name: 'ओमप्रकाश शर्मा',
        role: 'मास्टर कारीगर एवं संस्थापक',
        photo_url: '/src/assets/images/artisan_woodworking_workshop_1793256795276.jpg',
        short_bio: 'दिल्ली एनसीआर में काष्ठकला और कस्टम फर्नीचर निर्माण का 35 से अधिक वर्षों का अनुभव। ठोस सागौन, शीशम और पारंपरिक जोड़ तकनीक के विशेषज्ञ।',
        display_order: 1
      },
      {
        name: 'राकेश शर्मा',
        role: 'प्रमुख डिजाइनर एवं मॉड्यूलर विशेषज्ञ',
        photo_url: '/src/assets/images/artisan_woodworking_workshop_1793256795276.jpg',
        short_bio: 'आधुनिक एर्गोनॉमिक्स, 3D सीएडी लेआउट डिजाइन और लक्जरी इंटीरियर्स के लिए हार्डवेयर इंटीग्रेशन के विशेषज्ञ।',
        display_order: 2
      },
      {
        name: 'सुनील कुमार',
        role: 'वरिष्ठ पॉलिशिंग व फिनिशिंग विशेषज्ञ',
        photo_url: '/src/assets/images/artisan_woodworking_workshop_1793256795276.jpg',
        short_bio: 'हाथ से की जाने वाली तेल फिनिशिंग, इटालियन पीयू (PU) कोटिंग, प्राकृतिक वुड स्टेंस और प्राचीन फर्नीचर जीर्णोद्धार के माहिर।',
        display_order: 3
      }
    ];

    const insertTeam = db.prepare(`
      INSERT INTO team_members (id, name, role, photo_url, short_bio, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    defaultTeam.forEach(t => {
      insertTeam.run(crypto.randomUUID(), t.name, t.role, t.photo_url, t.short_bio, t.display_order, now, now);
    });
  }

  const testimonialsCount = db.prepare('SELECT COUNT(*) as count FROM testimonials').get() as { count: number };
  if (testimonialsCount.count === 0) {
    const defaultTestimonials = [
      {
        client_name: 'विक्रम और अनन्या मल्होत्रा',
        location_or_project: 'वसंत विहार निवास',
        content: 'शर्मा वुडक्राफ्ट ने हमारे मास्टर बेडरूम की अलमारियां और 10-सीटर डाइनिंग टेबल बनाई। लकड़ी की गुणवत्ता, प्राकृतिक चमक और सॉफ्ट-क्लोजिंग जोड़ अंतरराष्ट्रीय स्तर के हैं।',
        rating: 5
      },
      {
        client_name: 'आर्किटेक्ट दीपाली सेन',
        location_or_project: 'हौज खास एन्क्लेव प्रोजेक्ट',
        content: 'एक इंटीरियर आर्किटेक्ट के रूप में मेरे लिए परिशुद्धता और फिनिशिंग सबसे महत्वपूर्ण है। शर्मा जी और उनकी टीम ने समय पर बेहतरीन काम सौंपा। लकड़ी के रेशों की ऐसी समझ बहुत दुर्लभ है।',
        rating: 5
      },
      {
        client_name: 'राजेश सिंघानिया',
        location_or_project: 'डीएलएफ फेज 5, गुरुग्राम',
        content: 'हमारे नए घर के लिए कस्टम वॉलनट बार कैबिनेट और लिविंग रूम की टीवी यूनिट तैयार की गई। वायरिंग छुपाने का तरीका और मैट पीयू पॉलिश वाकई तारीफ के काबिल है।',
        rating: 5
      }
    ];

    const insertTestimonial = db.prepare(`
      INSERT INTO testimonials (id, client_name, location_or_project, content, rating, is_published, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `);

    defaultTestimonials.forEach(t => {
      insertTestimonial.run(crypto.randomUUID(), t.client_name, t.location_or_project, t.content, t.rating, now);
    });
  }
}
