import express from 'express'
import pg from 'pg'
import cors from 'cors'
import crypto from 'crypto'

const { Pool } = pg

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const pool = new Pool({
  host: process.env.DB_HOST || 'rcagen-postgres-gmcocz',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'rcagen',
  user: process.env.DB_USER || 'rcagen',
  password: process.env.DB_PASSWORD || 'RcaGen2026Secure',
})

// Hash password with SHA-256 (one-way, not reversible)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Initialize database tables
async function initDB() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS rcas (
        id VARCHAR(20) PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL
      )
    `)

    // Seed default admin password if not exists
    const pwResult = await client.query("SELECT key FROM settings WHERE key = 'admin_password'")
    if (pwResult.rows.length === 0) {
      const defaultHash = hashPassword('Olos@123!')
      await client.query("INSERT INTO settings (key, value) VALUES ('admin_password', $1)", [defaultHash])
    }

    console.log('Database tables initialized')
  } finally {
    client.release()
  }
}

// ========== CLIENTS ==========

app.get('/api/clients', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, active FROM clients ORDER BY name ASC'
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Error fetching clients:', err)
    res.status(500).json({ error: 'Failed to fetch clients' })
  }
})

app.post('/api/clients', async (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' })
  }
  try {
    const result = await pool.query(
      'INSERT INTO clients (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET active = true RETURNING id, name, active',
      [name.trim()]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Error creating client:', err)
    res.status(500).json({ error: 'Failed to create client' })
  }
})

app.delete('/api/clients/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM clients WHERE id = $1', [id])
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting client:', err)
    res.status(500).json({ error: 'Failed to delete client' })
  }
})

// ========== RCAs ==========

// Generate next RCA ID for today: RCAYYYYMMDD-nn
async function generateRCAId() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const prefix = `RCA${yyyy}${mm}${dd}`

  const result = await pool.query(
    `SELECT id FROM rcas WHERE id LIKE $1 ORDER BY id DESC LIMIT 1`,
    [`${prefix}-%`]
  )

  let nextNum = 1
  if (result.rows.length > 0) {
    const lastId = result.rows[0].id
    const lastNum = parseInt(lastId.split('-')[1], 10)
    nextNum = lastNum + 1
  }

  return `${prefix}-${String(nextNum).padStart(2, '0')}`
}

// GET /api/rcas - List all RCAs (summary)
app.get('/api/rcas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, 
             data->>'title' as title, 
             data->>'incidentId' as incident_id,
             data->>'affectedClients' as affected_clients,
             created_at, 
             updated_at
      FROM rcas 
      ORDER BY created_at DESC
    `)
    res.json(result.rows)
  } catch (err) {
    console.error('Error fetching RCAs:', err)
    res.status(500).json({ error: 'Failed to fetch RCAs' })
  }
})

// GET /api/rcas/:id - Get a single RCA
app.get('/api/rcas/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('SELECT * FROM rcas WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'RCA not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error fetching RCA:', err)
    res.status(500).json({ error: 'Failed to fetch RCA' })
  }
})

// POST /api/rcas - Create (publish) a new RCA
app.post('/api/rcas', async (req, res) => {
  const { data } = req.body
  if (!data) {
    return res.status(400).json({ error: 'RCA data is required' })
  }
  try {
    const id = await generateRCAId()
    const result = await pool.query(
      'INSERT INTO rcas (id, data) VALUES ($1, $2) RETURNING id, created_at',
      [id, JSON.stringify(data)]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Error creating RCA:', err)
    res.status(500).json({ error: 'Failed to create RCA' })
  }
})

// PUT /api/rcas/:id - Update an existing RCA
app.put('/api/rcas/:id', async (req, res) => {
  const { id } = req.params
  const { data } = req.body
  if (!data) {
    return res.status(400).json({ error: 'RCA data is required' })
  }
  try {
    const result = await pool.query(
      'UPDATE rcas SET data = $1, updated_at = NOW() WHERE id = $2 RETURNING id, updated_at',
      [JSON.stringify(data), id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'RCA not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error updating RCA:', err)
    res.status(500).json({ error: 'Failed to update RCA' })
  }
})

// DELETE /api/rcas/:id - Delete an RCA
app.delete('/api/rcas/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM rcas WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'RCA not found' })
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting RCA:', err)
    res.status(500).json({ error: 'Failed to delete RCA' })
  }
})

// ========== AUTH ==========

// POST /api/auth/login - Verify password
app.post('/api/auth/login', async (req, res) => {
  const { password } = req.body
  if (!password) {
    return res.status(400).json({ error: 'Password is required' })
  }
  try {
    const result = await pool.query("SELECT value FROM settings WHERE key = 'admin_password'")
    if (result.rows.length === 0) {
      return res.status(500).json({ error: 'Password not configured' })
    }
    const storedHash = result.rows[0].value
    const inputHash = hashPassword(password)
    if (inputHash === storedHash) {
      res.json({ success: true })
    } else {
      res.status(401).json({ error: 'Invalid password' })
    }
  } catch (err) {
    console.error('Error verifying password:', err)
    res.status(500).json({ error: 'Failed to verify password' })
  }
})

// POST /api/auth/change-password - Change admin password
app.post('/api/auth/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' })
  }
  try {
    const result = await pool.query("SELECT value FROM settings WHERE key = 'admin_password'")
    if (result.rows.length === 0) {
      return res.status(500).json({ error: 'Password not configured' })
    }
    const storedHash = result.rows[0].value
    const currentHash = hashPassword(currentPassword)
    if (currentHash !== storedHash) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }
    const newHash = hashPassword(newPassword)
    await pool.query("UPDATE settings SET value = $1 WHERE key = 'admin_password'", [newHash])
    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    console.error('Error changing password:', err)
    res.status(500).json({ error: 'Failed to change password' })
  }
})

// ========== HEALTH ==========

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' })
  }
})

// Seed initial clients
async function seedClients() {
  const initialClients = [
    'Pagbank', 'Redebrasil', 'Novaquest Tel', 'Actionline',
    'Atento', 'Paschoalotto', 'Athena', 'Energisa', 'Return'
  ]
  const client = await pool.connect()
  try {
    for (const name of initialClients) {
      await client.query(
        'INSERT INTO clients (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [name]
      )
    }
    console.log('Initial clients seeded')
  } finally {
    client.release()
  }
}

const PORT = process.env.API_PORT || 3001

initDB()
  .then(() => seedClients())
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to start server:', err)
    process.exit(1)
  })
