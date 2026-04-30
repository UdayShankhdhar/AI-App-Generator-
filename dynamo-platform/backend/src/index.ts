import express from 'express';
import { registerHandler, loginHandler, meHandler } from './auth/index';
import { loadConfig } from './config/loader';
import { generateCreateTableSQL } from './db/schema-generator';
import { query } from './db/pool';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

async function setupDatabase() {
  const config = await loadConfig();

  if (!config || !config.database) {
    console.error("Config or database configuration is missing");
    return;
  }

  for (const table of config.database.tables) {
    const sql = generateCreateTableSQL(table);
    console.log("Creating table:", table.name);
    await query(sql);
  }
}

// Load config at startup (optional, can also be lazy-loaded in routes)
(async () => {
  const config = await loadConfig();
  if (!config?.database) {
  throw new Error("Missing database configuration");
}
  console.log(
    "Loaded tables:",
    config.database.tables.map(t => t.name)
  );

  await setupDatabase();

  console.log("Database setup complete");
})();

app.get('/api/users', async (req, res) => {
  try {
    const result = await query('SELECT id, email, role FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
app.get('/api/config', async (req, res) => {
  try {
    const config = await loadConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load config' });
  }
});

// Test route
app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});
app.get('/api/:table', async (req, res) => {
  const table = req.params.table;

  try {
    const result = await query(`SELECT * FROM "${table}"`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.post('/api/:table', async (req, res) => {

  const table = req.params.table;

  const data = req.body;

  try {

    const keys =
      Object.keys(data);

    const values =
      Object.values(data);

    const columns =
      keys.map(
        (k) => `"${k}"`
      ).join(',');

    const placeholders =
      values.map(
        (_, i) => `$${i + 1}`
      ).join(',');

    const sql = `
      INSERT INTO "${table}"
      (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await query(
      sql,
      values
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Insert failed'
    });

  }

});
app.delete('/api/:table/:id', async (req, res) => {

  const { table, id } = req.params;

  try {

    await query(
      `DELETE FROM "${table}" WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
    });

  } catch (err) {

    res.status(500).json({
      error: 'Delete failed',
    });
  }
});

app.put('/api/:table/:id', async (req, res) => {

  const { table, id } =
    req.params;

  const data = req.body;

  try {

    const keys =
      Object.keys(data);

    const values =
      Object.values(data);

    const setClause =
      keys.map(
        (key, index) =>
          `"${key}" = $${index + 1}`
      ).join(',');

    const sql = `
      UPDATE "${table}"
      SET ${setClause}
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;

    const result =
      await query(
        sql,
        [...values, id]
      );

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Update failed'
    });

  }

});
// Auth routes
app.post('/api/register', registerHandler);
app.post('/api/login', loginHandler);
app.get('/api/me', meHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});