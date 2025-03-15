const { pool } = require('../config');

class UzlastirmaciService {
    // Yeni uzlaştırmacı ekleme
    async ekle(uzlastirmaciData) {
        const {
            uzlastirmaci_ad_soyad,
            uzlastirmaci_tc,
            uzlastirmaci_sicil_no,
            uzlastirmaci_adres,
            rapor_duzenleme_il,
            rapor_duzenleme_ilce
        } = uzlastirmaciData;

        const query = `
            INSERT INTO uzlastirmacilar (
                uzlastirmaci_ad_soyad,
                uzlastirmaci_tc,
                uzlastirmaci_sicil_no,
                uzlastirmaci_adres,
                rapor_duzenleme_il,
                rapor_duzenleme_ilce
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        try {
            const { rows } = await pool.query(query, [
                uzlastirmaci_ad_soyad,
                uzlastirmaci_tc,
                uzlastirmaci_sicil_no,
                uzlastirmaci_adres,
                rapor_duzenleme_il,
                rapor_duzenleme_ilce
            ]);
            return rows[0];
        } catch (error) {
            throw new Error(`Uzlaştırmacı eklenirken hata oluştu: ${error.message}`);
        }
    }

    // Tüm uzlaştırmacıları getirme
    async tumunuGetir() {
        const query = 'SELECT * FROM uzlastirmacilar ORDER BY created_at DESC';
        try {
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            throw new Error(`Uzlaştırmacılar getirilirken hata oluştu: ${error.message}`);
        }
    }

    // ID'ye göre uzlaştırmacı getirme
    async getirById(id) {
        const query = 'SELECT * FROM uzlastirmacilar WHERE id = $1';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            throw new Error(`Uzlaştırmacı getirilirken hata oluştu: ${error.message}`);
        }
    }

    // Uzlaştırmacı güncelleme
    async guncelle(id, uzlastirmaciData) {
        const {
            uzlastirmaci_ad_soyad,
            uzlastirmaci_tc,
            uzlastirmaci_sicil_no,
            uzlastirmaci_adres,
            rapor_duzenleme_il,
            rapor_duzenleme_ilce
        } = uzlastirmaciData;

        const query = `
            UPDATE uzlastirmacilar
            SET uzlastirmaci_ad_soyad = $1,
                uzlastirmaci_tc = $2,
                uzlastirmaci_sicil_no = $3,
                uzlastirmaci_adres = $4,
                rapor_duzenleme_il = $5,
                rapor_duzenleme_ilce = $6
            WHERE id = $7
            RETURNING *
        `;

        try {
            const { rows } = await pool.query(query, [
                uzlastirmaci_ad_soyad,
                uzlastirmaci_tc,
                uzlastirmaci_sicil_no,
                uzlastirmaci_adres,
                rapor_duzenleme_il,
                rapor_duzenleme_ilce,
                id
            ]);
            return rows[0];
        } catch (error) {
            throw new Error(`Uzlaştırmacı güncellenirken hata oluştu: ${error.message}`);
        }
    }

    // Uzlaştırmacı silme
    async sil(id) {
        const query = 'DELETE FROM uzlastirmacilar WHERE id = $1 RETURNING *';
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0];
        } catch (error) {
            throw new Error(`Uzlaştırmacı silinirken hata oluştu: ${error.message}`);
        }
    }
}

module.exports = new UzlastirmaciService(); 