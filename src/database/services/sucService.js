const { pool } = require('../config');

class SucService {
    // Tüm suçları getir
    async tumSuclariGetir() {
        const query = 'SELECT * FROM suclar ORDER BY suc_adi';
        try {
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            throw new Error(`Suçlar getirilirken hata oluştu: ${error.message}`);
        }
    }

    // Yeni suç ekle
    async sucEkle(sucAdi) {
        const query = 'INSERT INTO suclar (suc_adi) VALUES ($1) RETURNING *';
        try {
            const { rows } = await pool.query(query, [sucAdi]);
            return rows[0];
        } catch (error) {
            throw new Error(`Suç eklenirken hata oluştu: ${error.message}`);
        }
    }

    // Suç güncelle
    async sucGuncelle(id, sucAdi) {
        const query = 'UPDATE suclar SET suc_adi = $1 WHERE id = $2 RETURNING *';
        try {
            const { rows } = await pool.query(query, [sucAdi, id]);
            return rows[0];
        } catch (error) {
            throw new Error(`Suç güncellenirken hata oluştu: ${error.message}`);
        }
    }

    // Suç sil
    async sucSil(id) {
        const query = 'DELETE FROM suclar WHERE id = $1 RETURNING *';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            throw new Error(`Suç silinirken hata oluştu: ${error.message}`);
        }
    }

    // Suç adına göre suç bilgisini getir
    async sucGetirByAd(sucAdi) {
        const query = 'SELECT * FROM suclar WHERE suc_adi = $1';
        try {
            const { rows } = await pool.query(query, [sucAdi]);
            return rows[0];
        } catch (error) {
            throw new Error(`Suç bilgisi getirilirken hata oluştu: ${error.message}`);
        }
    }
}

module.exports = new SucService(); 