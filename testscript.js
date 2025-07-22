// testscript.js
import mysql from 'mysql2/promise';

(async () => {
  try {
    console.log('Attempting to connect to MySQL...');
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,  // Explicitly set port
      user: 'root',
      password: '',
      database: 'zeeder',
      connectTimeout: 10000, // 10 seconds timeout
      ssl: false  // Disable SSL if not needed
    });
    
    console.log('Successfully connected to MySQL!');
    console.log('Connection details:', {
      host: connection.config.host,
      port: connection.config.port,
      database: connection.config.database
    });
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Test query result:', rows);
    
    await connection.end();
  } catch (error) {
    console.error('Connection error details:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
})();