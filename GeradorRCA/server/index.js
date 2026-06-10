import express from 'express'
import pg from 'pg'
import cors from 'cors'

const { Pool } = pg

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  host: process.env.DB_HOST || 'rcagen-postgres-gmcocz',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'rcagen',
  user: process.env.DB_USER || 'rcagen',
  password: process.env.DB_PASSWORD || 'RcaGen2026Secure',
})

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
    console.log('Database tables initialized')
  } finally {
    client.release()
  }
}

// GET /api/clients - List all active clients
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

// POST /api/clients - Create a client
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

// DELETE /api/clients/:id - Soft delete a client
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

// Health check
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
