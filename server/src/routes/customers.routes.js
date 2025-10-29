import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const customers = db.prepare(query).all(...params);

    const countQuery = 'SELECT COUNT(*) as total FROM customers WHERE 1=1' +
      (search ? ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)' : '') +
      (status ? ' AND status = ?' : '');
    const countParams = [];
    if (search) {
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    if (status) countParams.push(status);

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({ customers, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const interactions = db.prepare(
      'SELECT * FROM customer_interactions WHERE customer_id = ? ORDER BY created_at DESC'
    ).all(req.params.id);

    const quotes = db.prepare(
      'SELECT * FROM quotes WHERE customer_email = ? ORDER BY created_at DESC'
    ).all(customer.email);

    res.json({ ...customer, interactions, quotes });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, email, phone, company, address, city, country, notes, tags, status = 'active' } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }

    const existing = db.prepare('SELECT id FROM customers WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un cliente con ese email' });
    }

    const result = db.prepare(`
      INSERT INTO customers (name, email, phone, company, address, city, country, notes, tags, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, email, phone, company, address, city, country, notes, tags, status);

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, email, phone, company, address, city, country, notes, tags, status } = req.body;

    const existing = db.prepare('SELECT id FROM customers WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    db.prepare(`
      UPDATE customers 
      SET name = ?, email = ?, phone = ?, company = ?, address = ?, city = ?, country = ?, 
          notes = ?, tags = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, email, phone, company, address, city, country, notes, tags, status, req.params.id);

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM customers WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

router.post('/:id/interactions', (req, res) => {
  try {
    const { type, subject, notes, created_by } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Tipo de interacción es requerido' });
    }

    const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const result = db.prepare(`
      INSERT INTO customer_interactions (customer_id, type, subject, notes, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.params.id, type, subject, notes, created_by);

    db.prepare('UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);

    const interaction = db.prepare('SELECT * FROM customer_interactions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(interaction);
  } catch (error) {
    console.error('Error creating interaction:', error);
    res.status(500).json({ error: 'Error al crear interacción' });
  }
});

export default router;
