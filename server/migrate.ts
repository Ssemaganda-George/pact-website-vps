import { pool } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    
    // Get list of already applied migrations
    const { rows: appliedMigrations } = await client.query(
      'SELECT name FROM migrations ORDER BY id'
    );
    const appliedMigrationNames = appliedMigrations.map((m: any) => m.name);
    
    // Get list of migration files sorted by name
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    // Start a transaction for the migrations
    await client.query('BEGIN');
    
    // Apply each migration that hasn't been applied yet
    for (const file of migrationFiles) {
      if (!appliedMigrationNames.includes(file)) {
        console.log(`Applying migration: ${file}`);
        
        // Read and execute the migration file
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
        
        // Record that the migration has been applied
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file]
        );
        
        console.log(`Applied migration: ${file}`);
      } else {
        console.log(`Skipping already applied migration: ${file}`);
      }
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('Migrations completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migrations and exit
runMigrations()
  .then(() => {
    console.log('Migration process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration process failed:', error);
    process.exit(1);
  }); 