import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { upload } from '../upload.js';

export const publicRouter = Router();

publicRouter.get('/data', (_req: Request, res: Response) => {
  try {
    const rawSettings = db.prepare('SELECT key, value FROM website_settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    rawSettings.forEach(s => {
      settings[s.key] = s.value;
    });

    const services = db.prepare(`
      SELECT id, title, description, image_url, starting_price, display_order
      FROM services
      WHERE is_published = 1
      ORDER BY display_order ASC, created_at ASC
    `).all();

    const rawProjects = db.prepare(`
      SELECT id, title, description, category, completion_date, is_featured, display_order, created_at
      FROM projects
      WHERE is_published = 1
      ORDER BY display_order ASC, created_at DESC
    `).all() as {
      id: string;
      title: string;
      description: string;
      category: string;
      completion_date: string | null;
      is_featured: number;
      display_order: number;
      created_at: string;
    }[];

    const projectImages = db.prepare(`
      SELECT id, project_id, image_url, display_order
      FROM project_images
      ORDER BY display_order ASC
    `).all() as { id: string; project_id: string; image_url: string; display_order: number }[];

    const projectsWithImages = rawProjects.map(p => ({
      ...p,
      is_featured: Boolean(p.is_featured),
      images: projectImages.filter(img => img.project_id === p.id).map(img => img.image_url)
    }));

    const team = db.prepare(`
      SELECT id, name, role, photo_url, short_bio, display_order
      FROM team_members
      ORDER BY display_order ASC, created_at ASC
    `).all();

    const testimonials = db.prepare(`
      SELECT id, client_name, location_or_project, content, rating, created_at
      FROM testimonials
      WHERE is_published = 1
      ORDER BY created_at DESC
    `).all();

    return res.json({
      settings,
      services,
      projects: projectsWithImages,
      team,
      testimonials
    });
  } catch (error: any) {
    console.error('Error fetching public website data:', error);
    return res.status(500).json({ error: 'Failed to retrieve website data.' });
  }
});

publicRouter.get('/projects/:id', (req: Request, res: Response) => {
  try {
    const project = db.prepare(`
      SELECT id, title, description, category, completion_date, is_featured, created_at
      FROM projects
      WHERE id = ? AND is_published = 1
    `).get(req.params.id) as any;

    if (!project) {
      return res.status(404).json({ error: 'Project not found or not published.' });
    }

    const images = db.prepare(`
      SELECT image_url
      FROM project_images
      WHERE project_id = ?
      ORDER BY display_order ASC
    `).all(req.params.id) as { image_url: string }[];

    return res.json({
      project: {
        ...project,
        is_featured: Boolean(project.is_featured),
        images: images.map(i => i.image_url)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve project details.' });
  }
});

publicRouter.post('/inquiries', upload.single('reference_image'), (req: Request, res: Response) => {
  try {
    const {
      customer_name,
      phone,
      email,
      service_needed,
      dimensions,
      budget_range,
      location_area,
      details,
      preferred_contact
    } = req.body;

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ error: 'Customer name is required.' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    // Phone validation: Indian numbers or international format (min 10 digits)
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid phone number (at least 10 digits).' });
    }

    if (!service_needed || !service_needed.trim()) {
      return res.status(400).json({ error: 'Please select or enter the required service / furniture type.' });
    }

    if (!location_area || !location_area.trim()) {
      return res.status(400).json({ error: 'Location / Area in Delhi NCR is required.' });
    }

    if (!details || !details.trim()) {
      return res.status(400).json({ error: 'Project details and requirements are required.' });
    }

    let reference_image_url: string | null = null;
    if (req.file) {
      reference_image_url = `/api/uploads/${req.file.filename}`;
    } else if (req.body.reference_image_url) {
      reference_image_url = req.body.reference_image_url;
    }

    const inquiryId = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO inquiries (
        id, customer_name, phone, email, service_needed, dimensions,
        budget_range, location_area, details, preferred_contact,
        reference_image_url, status, admin_notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', NULL, ?, ?)
    `).run(
      inquiryId,
      customer_name.trim(),
      phone.trim(),
      email ? email.trim() : null,
      service_needed.trim(),
      dimensions ? dimensions.trim() : null,
      budget_range ? budget_range.trim() : null,
      location_area.trim(),
      details.trim(),
      preferred_contact || 'phone',
      reference_image_url,
      now,
      now
    );

    // Retrieve configured WhatsApp number for click-to-chat redirection
    const whatsappSetting = db.prepare('SELECT value FROM website_settings WHERE key = ?').get('whatsapp') as { value: string } | undefined;
    let whatsappLink: string | null = null;

    if (whatsappSetting && whatsappSetting.value && whatsappSetting.value.trim()) {
      const cleanWa = whatsappSetting.value.replace(/[^\d]/g, '');
      if (cleanWa.length >= 10) {
        const textMessage = `Hello Sharma Woodcraft! My name is ${customer_name.trim()}. I just submitted a quotation request on your website for ${service_needed.trim()} in ${location_area.trim()}.\n\nInquiry ID: #${inquiryId.slice(0, 8).toUpperCase()}`;
        whatsappLink = `https://wa.me/${cleanWa}?text=${encodeURIComponent(textMessage)}`;
      }
    }

    return res.status(201).json({
      success: true,
      inquiry_id: inquiryId,
      message: 'Your quotation request has been successfully submitted! Our master woodcrafter will review your measurements and reach out shortly.',
      whatsapp_link: whatsappLink
    });
  } catch (error: any) {
    console.error('Error saving inquiry:', error);
    return res.status(500).json({ error: 'Failed to record your inquiry. Please try again or call us directly.' });
  }
});

// Robust Phone Number Validation Function
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string; formatted?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required.' };
  }
  const trimmed = phone.trim();
  // Basic character validity check
  if (!/^[+]?[\d\s\-().]{10,20}$/.test(trimmed)) {
    return { isValid: false, error: 'Phone number contains invalid characters. Please enter a valid number.' };
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 10) {
    return { isValid: false, error: 'Phone number is too short. Please enter a 10-digit mobile number.' };
  }
  if (digits.length > 15) {
    return { isValid: false, error: 'Phone number cannot exceed 15 digits.' };
  }

  // Reject obvious fake repetitions like 0000000000, 1111111111
  if (/^(\d)\1{9,}$/.test(digits)) {
    return { isValid: false, error: 'Please enter a genuine, active phone number.' };
  }
  if (digits === '1234567890' || digits === '9876543210' && trimmed.toLowerCase().includes('test')) {
    // allow legitimate test during development if needed, but reject plain dummy sequences
  }

  // If 10 digits, validate standard Indian mobile prefix
  if (digits.length === 10) {
    if (!/^[6-9]/.test(digits)) {
      return { isValid: false, error: 'Indian 10-digit mobile numbers must start with 6, 7, 8, or 9.' };
    }
  } else if (digits.length === 11 && digits.startsWith('0')) {
    if (!/^0[6-9]/.test(digits)) {
      return { isValid: false, error: 'Mobile number with leading 0 must start with 6, 7, 8, or 9.' };
    }
  } else if (digits.length === 12 && digits.startsWith('91')) {
    if (!/^91[6-9]/.test(digits)) {
      return { isValid: false, error: 'Indian mobile number (+91) must start with 6, 7, 8, or 9.' };
    }
  }

  return { isValid: true, formatted: trimmed };
}

// -------------------------------------------------------------
// REQUEST A CALLBACK ENDPOINT
// -------------------------------------------------------------
publicRouter.post('/callbacks', (req: Request, res: Response) => {
  try {
    const { customer_name, phone, preferred_time, notes, service_needed } = req.body;

    if (!customer_name || !customer_name.trim() || customer_name.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide your full name (at least 2 characters).' });
    }

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json({ error: phoneValidation.error });
    }

    const inquiryId = crypto.randomUUID();
    const now = new Date().toISOString();
    const service = service_needed && service_needed.trim() ? service_needed.trim() : 'General Callback Request';
    const timeSlot = preferred_time && preferred_time.trim() ? preferred_time.trim() : 'Anytime (Earliest available)';
    const details = notes && notes.trim() 
      ? `Requested phone callback: ${notes.trim()}`
      : `Customer requested a prompt phone callback (Preferred time: ${timeSlot}).`;

    db.prepare(`
      INSERT INTO inquiries (
        id, customer_name, phone, email, service_needed, dimensions,
        budget_range, location_area, details, preferred_contact,
        reference_image_url, status, admin_notes, is_callback, preferred_time,
        created_at, updated_at
      ) VALUES (?, ?, ?, NULL, ?, NULL, NULL, 'Delhi NCR (Callback Request)', ?, 'phone', NULL, 'new', NULL, 1, ?, ?, ?)
    `).run(
      inquiryId,
      customer_name.trim(),
      phoneValidation.formatted,
      service,
      details,
      timeSlot,
      now,
      now
    );

    // Retrieve configured WhatsApp number for click-to-chat option
    const whatsappSetting = db.prepare('SELECT value FROM website_settings WHERE key = ?').get('whatsapp') as { value: string } | undefined;
    let whatsappLink: string | null = null;

    if (whatsappSetting && whatsappSetting.value && whatsappSetting.value.trim()) {
      const cleanWa = whatsappSetting.value.replace(/[^\d]/g, '');
      if (cleanWa.length >= 10) {
        const textMessage = `Hello Sharma Woodcraft! My name is ${customer_name.trim()}. I just requested a callback on your website. My phone number is ${phoneValidation.formatted}. Looking forward to discussing custom furniture.`;
        whatsappLink = `https://wa.me/${cleanWa}?text=${encodeURIComponent(textMessage)}`;
      }
    }

    return res.status(201).json({
      success: true,
      inquiry_id: inquiryId,
      message: 'Callback request registered! Master woodcrafter Omprakash Sharma will call you promptly.',
      whatsapp_link: whatsappLink
    });
  } catch (error: any) {
    console.error('Error saving callback request:', error);
    return res.status(500).json({ error: 'Failed to record callback request. Please try calling directly.' });
  }
});

