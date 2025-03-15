const { pool } = require('../config');

class LokasyonService {
    // Tüm illeri getir
    async tumIlleriGetir() {
        const query = 'SELECT * FROM iller ORDER BY il_adi';
        try {
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            throw new Error(`İller getirilirken hata oluştu: ${error.message}`);
        }
    }

    // İl ID'sine göre ilçeleri getir
    async ilceleriGetir(ilId) {
        const query = 'SELECT * FROM ilceler WHERE il_id = $1 ORDER BY ilce_adi';
        try {
            const { rows } = await pool.query(query, [ilId]);
            return rows;
        } catch (error) {
            throw new Error(`İlçeler getirilirken hata oluştu: ${error.message}`);
        }
    }

    // Yeni il ekle
    async ilEkle(ilAdi) {
        const query = 'INSERT INTO iller (il_adi) VALUES ($1) RETURNING *';
        try {
            const { rows } = await pool.query(query, [ilAdi]);
            return rows[0];
        } catch (error) {
            throw new Error(`İl eklenirken hata oluştu: ${error.message}`);
        }
    }

    // Yeni ilçe ekle
    async ilceEkle(ilId, ilceAdi) {
        const query = 'INSERT INTO ilceler (il_id, ilce_adi) VALUES ($1, $2) RETURNING *';
        try {
            const { rows } = await pool.query(query, [ilId, ilceAdi]);
            return rows[0];
        } catch (error) {
            throw new Error(`İlçe eklenirken hata oluştu: ${error.message}`);
        }
    }

    // İl adına göre il bilgisini getir
    async ilGetirByAd(ilAdi) {
        const query = 'SELECT * FROM iller WHERE il_adi = $1';
        try {
            const { rows } = await pool.query(query, [ilAdi]);
            return rows[0];
        } catch (error) {
            throw new Error(`İl bilgisi getirilirken hata oluştu: ${error.message}`);
        }
    }

    // İlçe adına göre ilçe bilgisini getir
    async ilceGetirByAd(ilId, ilceAdi) {
        const query = 'SELECT * FROM ilceler WHERE il_id = $1 AND ilce_adi = $2';
        try {
            const { rows } = await pool.query(query, [ilId, ilceAdi]);
            return rows[0];
        } catch (error) {
            throw new Error(`İlçe bilgisi getirilirken hata oluştu: ${error.message}`);
        }
    }
}

module.exports = new LokasyonService(); 