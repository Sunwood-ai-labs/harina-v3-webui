const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'receipt_db',
  user: process.env.POSTGRES_USER || 'receipt_user',
  password: process.env.POSTGRES_PASSWORD || 'receipt_password',
  ssl: false,
});

async function waitForDatabase(maxRetries = 30, delay = 2000) {
  console.log('Waiting for database to be ready...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✓ Database is ready!');
      process.exit(0);
    } catch (error) {
      console.log(`Database connection attempt ${i + 1}/${maxRetries} failed: ${error.message}`);
      if (i === maxRetries - 1) {
        console.error('✗ Database connection failed after maximum retries');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

waitForDatabase().catch(error => {
  console.error('Error waiting for database:', error);
  process.exit(1);
});
