const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Bağlantıyı test et
pool.connect((err, client, release) => {
    if (err) {
        console.error('Veritabanına bağlanırken hata oluştu:', err.stack);
    } else {
        console.log('Veritabanına başarıyla bağlanıldı');
        release();
    }
});

module.exports = { pool }; 