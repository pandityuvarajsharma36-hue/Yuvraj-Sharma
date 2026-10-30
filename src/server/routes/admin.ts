import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { requireAdmin, AuthenticatedRequest } from '../auth.js';
import { upload } from '../upload.js';

export const adminRouter = Router();

// Apply requireAdmin to all routes in adminRouter
adminRouter.use(requireAdmin);

// -------------------------------------------------------------
// IMAGE UPLOAD (Admin files)
// -------------------------------------------------------------
adminRouter.post('/upload', upload.single('image'), (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }
  const fileUrl = `/api/uploads/${req.file.filename}`;
  return res.json({ url: fileUrl, filename: req.file.filename });
});

// -------------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------------
adminRouter.get('/dashboard', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const totalInquiries = (db.prepare('SELECT COUNT(*) as count FROM inquiries').get() as { count: number }).count;
    const newInquiries = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'").get() as { count: number }).count;
    const inProgressInquiries = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'in_progress'").get() as { count: number }).count;
    const completedInquiries = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'completed'").get() as { count: number }).count;
    const pendingCallbacks = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE is_callback = 1 AND status = 'new'").get() as { count: number }).count;
    const totalCallbacks = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE is_callback = 1").get() as { count: number }).count;

    const publishedProjects = (db.prepare('SELECT COUNT(*) as count FROM projects WHERE is_published = 1').get() as { count: number }).count;
    const totalProjects = (db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }).count;
    const totalServices = (db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number }).count;

    const recentInquiries = db.prepare(`
      SELECT id, customer_name, phone, service_needed, location_area, status, is_callback, preferred_time, created_at
      FROM inquiries
      ORDER BY created_at DESC
      LIMIT 6
    `).all();

    return res.json({
      stats: {
        totalInquiries,
        newInquiries,
        inProgressInquiries,
        completedInquiries,
        pendingCallbacks,
        totalCallbacks,
        publishedProjects,
        totalProjects,
        totalServices
      },
      recentInquiries
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to calculate dashboard statistics.' });
  }
});

// -------------------------------------------------------------
// PROJECTS CRUD
// -------------------------------------------------------------
adminRouter.get('/projects', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = db.prepare(`
      SELECT id, title, description, category, completion_date, is_published, is_featured, display_order, created_at, updated_at
      FROM projects
      ORDER BY display_order ASC, created_at DESC
    `).all() as any[];

    const images = db.prepare('SELECT id, project_id, image_url, display_order FROM project_images ORDER BY display_order ASC').all() as any[];

    const result = projects.map(p => ({
      ...p,
      is_published: Boolean(p.is_published),
      is_featured: Boolean(p.is_featured),
      images: images.filter(i => i.project_id === p.id)
    }));

    return res.json({ projects: result });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve projects.' });
  }
});

adminRouter.post('/projects', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category, completion_date, is_published, is_featured, display_order, images } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required.' });
    }

    const projectId = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO projects (id, title, description, category, completion_date, is_published, is_featured, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      title.trim(),
      description.trim(),
      category.trim(),
      completion_date ? completion_date.trim() : null,
      is_published ? 1 : 0,
      is_featured ? 1 : 0,
      Number(display_order) || 0,
      now,
      now
    );

    if (Array.isArray(images)) {
      const insertImg = db.prepare('INSERT INTO project_images (id, project_id, image_url, display_order, created_at) VALUES (?, ?, ?, ?, ?)');
      images.forEach((url: string, idx: number) => {
        if (url && typeof url === 'string') {
          insertImg.run(crypto.randomUUID(), projectId, url.trim(), idx + 1, now);
        }
      });
    }

    return res.status(201).json({ id: projectId, message: 'Project created successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create project.' });
  }
});

adminRouter.put('/projects/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category, completion_date, is_published, is_featured, display_order, images } = req.body;
    const projectId = req.params.id;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required.' });
    }

    const now = new Date().toISOString();

    const info = db.prepare(`
      UPDATE projects
      SET title = ?, description = ?, category = ?, completion_date = ?, is_published = ?, is_featured = ?, display_order = ?, updated_at = ?
      WHERE id = ?
    `).run(
      title.trim(),
      description.trim(),
      category.trim(),
      completion_date ? completion_date.trim() : null,
      is_published ? 1 : 0,
      is_featured ? 1 : 0,
      Number(display_order) || 0,
      now,
      projectId
    );

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (Array.isArray(images)) {
      db.prepare('DELETE FROM project_images WHERE project_id = ?').run(projectId);
      const insertImg = db.prepare('INSERT INTO project_images (id, project_id, image_url, display_order, created_at) VALUES (?, ?, ?, ?, ?)');
      images.forEach((url: string, idx: number) => {
        if (url && typeof url === 'string') {
          insertImg.run(crypto.randomUUID(), projectId, url.trim(), idx + 1, now);
        }
      });
    }

    return res.json({ message: 'Project updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update project.' });
  }
});

adminRouter.delete('/projects/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const info = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    return res.json({ message: 'Project deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete project.' });
  }
});

// -------------------------------------------------------------
// SERVICES CRUD
// -------------------------------------------------------------
adminRouter.get('/services', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const services = db.prepare(`
      SELECT id, title, description, image_url, starting_price, display_order, is_published, created_at, updated_at
      FROM services
      ORDER BY display_order ASC, created_at ASC
    `).all() as any[];

    return res.json({
      services: services.map(s => ({ ...s, is_published: Boolean(s.is_published) }))
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

adminRouter.post('/services', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, image_url, starting_price, display_order, is_published } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO services (id, title, description, image_url, starting_price, display_order, is_published, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title.trim(),
      description.trim(),
      image_url ? image_url.trim() : '/src/assets/images/custom_teak_wardrobe_bedroom_1793256792751.jpg',
      starting_price ? starting_price.trim() : null,
      Number(display_order) || 0,
      is_published ? 1 : 0,
      now,
      now
    );

    return res.status(201).json({ id, message: 'Service created successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create service.' });
  }
});

adminRouter.put('/services/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, image_url, starting_price, display_order, is_published } = req.body;
    const now = new Date().toISOString();

    const info = db.prepare(`
      UPDATE services
      SET title = ?, description = ?, image_url = ?, starting_price = ?, display_order = ?, is_published = ?, updated_at = ?
      WHERE id = ?
    `).run(
      title.trim(),
      description.trim(),
      image_url ? image_url.trim() : '',
      starting_price ? starting_price.trim() : null,
      Number(display_order) || 0,
      is_published ? 1 : 0,
      now,
      req.params.id
    );

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    return res.json({ message: 'Service updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update service.' });
  }
});

adminRouter.delete('/services/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const info = db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    return res.json({ message: 'Service deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete service.' });
  }
});

// -------------------------------------------------------------
// TEAM MEMBERS CRUD
// -------------------------------------------------------------
adminRouter.get('/team', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const team = db.prepare(`
      SELECT id, name, role, photo_url, short_bio, display_order, created_at, updated_at
      FROM team_members
      ORDER BY display_order ASC, created_at ASC
    `).all();
    return res.json({ team });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch team members.' });
  }
});

adminRouter.post('/team', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, role, photo_url, short_bio, display_order } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required.' });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO team_members (id, name, role, photo_url, short_bio, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name.trim(),
      role.trim(),
      photo_url ? photo_url.trim() : '/src/assets/images/artisan_woodworking_workshop_1793256795276.jpg',
      short_bio ? short_bio.trim() : null,
      Number(display_order) || 0,
      now,
      now
    );

    return res.status(201).json({ id, message: 'Team member added successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to add team member.' });
  }
});

adminRouter.put('/team/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, role, photo_url, short_bio, display_order } = req.body;
    const now = new Date().toISOString();

    const info = db.prepare(`
      UPDATE team_members
      SET name = ?, role = ?, photo_url = ?, short_bio = ?, display_order = ?, updated_at = ?
      WHERE id = ?
    `).run(
      name.trim(),
      role.trim(),
      photo_url ? photo_url.trim() : '',
      short_bio ? short_bio.trim() : null,
      Number(display_order) || 0,
      now,
      req.params.id
    );

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Team member not found.' });
    }

    return res.json({ message: 'Team member updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update team member.' });
  }
});

adminRouter.delete('/team/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const info = db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Team member not found.' });
    }
    return res.json({ message: 'Team member removed successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete team member.' });
  }
});

// -------------------------------------------------------------
// TESTIMONIALS CRUD
// -------------------------------------------------------------
adminRouter.get('/testimonials', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const testimonials = db.prepare(`
      SELECT id, client_name, location_or_project, content, rating, is_published, created_at
      FROM testimonials
      ORDER BY created_at DESC
    `).all() as any[];

    return res.json({
      testimonials: testimonials.map(t => ({ ...t, is_published: Boolean(t.is_published) }))
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch testimonials.' });
  }
});

adminRouter.post('/testimonials', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { client_name, location_or_project, content, rating, is_published } = req.body;
    if (!client_name || !content) {
      return res.status(400).json({ error: 'Client name and testimonial content are required.' });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO testimonials (id, client_name, location_or_project, content, rating, is_published, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      client_name.trim(),
      location_or_project ? location_or_project.trim() : 'Delhi NCR',
      content.trim(),
      Number(rating) || 5,
      is_published ? 1 : 0,
      now
    );

    return res.status(201).json({ id, message: 'Testimonial created successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create testimonial.' });
  }
});

adminRouter.put('/testimonials/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { client_name, location_or_project, content, rating, is_published } = req.body;

    const info = db.prepare(`
      UPDATE testimonials
      SET client_name = ?, location_or_project = ?, content = ?, rating = ?, is_published = ?
      WHERE id = ?
    `).run(
      client_name.trim(),
      location_or_project ? location_or_project.trim() : 'Delhi NCR',
      content.trim(),
      Number(rating) || 5,
      is_published ? 1 : 0,
      req.params.id
    );

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Testimonial not found.' });
    }

    return res.json({ message: 'Testimonial updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update testimonial.' });
  }
});

adminRouter.delete('/testimonials/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const info = db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Testimonial not found.' });
    }
    return res.json({ message: 'Testimonial deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete testimonial.' });
  }
});

// -------------------------------------------------------------
// INQUIRIES MANAGEMENT
// -------------------------------------------------------------
adminRouter.get('/inquiries', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search, callbacks } = req.query;

    let query = `
      SELECT id, customer_name, phone, email, service_needed, dimensions,
             budget_range, location_area, details, preferred_contact,
             reference_image_url, status, admin_notes, is_callback, preferred_time, created_at, updated_at
      FROM inquiries
      WHERE 1=1
    `;
    const params: any[] = [];

    if (callbacks === 'true') {
      query += ` AND is_callback = 1`;
    }

    if (status && status !== 'all' && status !== 'callbacks') {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (search && typeof search === 'string' && search.trim()) {
      query += ` AND (customer_name LIKE ? OR phone LIKE ? OR location_area LIKE ? OR service_needed LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY created_at DESC`;

    const inquiries = db.prepare(query).all(...params);
    return res.json({ inquiries });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch inquiries.' });
  }
});

adminRouter.put('/inquiries/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, admin_notes } = req.body;
    const now = new Date().toISOString();

    const info = db.prepare(`
      UPDATE inquiries
      SET status = COALESCE(?, status),
          admin_notes = COALESCE(?, admin_notes),
          updated_at = ?
      WHERE id = ?
    `).run(status || null, admin_notes !== undefined ? admin_notes : null, now, req.params.id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }

    return res.json({ message: 'Inquiry updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update inquiry.' });
  }
});

adminRouter.delete('/inquiries/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const info = db.prepare('DELETE FROM inquiries WHERE id = ?').run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }
    return res.json({ message: 'Inquiry deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete inquiry.' });
  }
});

adminRouter.get('/inquiries/export-csv', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const inquiries = db.prepare(`
      SELECT id, customer_name, phone, email, service_needed, dimensions,
             budget_range, location_area, details, preferred_contact,
             reference_image_url, status, admin_notes, is_callback, preferred_time, created_at
      FROM inquiries
      ORDER BY created_at DESC
    `).all() as any[];

    const headers = [
      'Inquiry ID',
      'Date',
      'Type',
      'Customer Name',
      'Phone',
      'Email',
      'Service Needed',
      'Preferred Callback Time',
      'Location / Area',
      'Dimensions',
      'Budget Range',
      'Preferred Contact',
      'Status',
      'Project Details',
      'Admin Private Notes'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = inquiries.map(inq => [
      escapeCsv(inq.id),
      escapeCsv(inq.created_at),
      escapeCsv(inq.is_callback ? 'Callback Request' : 'Standard Inquiry'),
      escapeCsv(inq.customer_name),
      escapeCsv(inq.phone),
      escapeCsv(inq.email),
      escapeCsv(inq.service_needed),
      escapeCsv(inq.preferred_time || 'N/A'),
      escapeCsv(inq.location_area),
      escapeCsv(inq.dimensions),
      escapeCsv(inq.budget_range),
      escapeCsv(inq.preferred_contact),
      escapeCsv(inq.status),
      escapeCsv(inq.details),
      escapeCsv(inq.admin_notes)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sharma-woodcraft-inquiries-${Date.now()}.csv"`);
    return res.send(csvContent);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to generate CSV export.' });
  }
});

// -------------------------------------------------------------
// WEBSITE SETTINGS
// -------------------------------------------------------------
adminRouter.get('/settings', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const rawSettings = db.prepare('SELECT key, value FROM website_settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    rawSettings.forEach(s => {
      settings[s.key] = s.value;
    });
    return res.json({ settings });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve website settings.' });
  }
});

adminRouter.put('/settings', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required.' });
    }

    const now = new Date().toISOString();
    const updateStmt = db.prepare(`
      INSERT INTO website_settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `);

    const updateMany = db.transaction((entries: [string, any][]) => {
      for (const [key, value] of entries) {
        updateStmt.run(key, String(value ?? ''), now);
      }
    });

    updateMany(Object.entries(settings));

    return res.json({ message: 'Website settings updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update website settings.' });
  }
});
