-- Uzlaştırmacı tablosu
CREATE TABLE uzlastirmacilar (
    id SERIAL PRIMARY KEY,
    uzlastirmaci_ad_soyad VARCHAR(100) NOT NULL,
    uzlastirmaci_tc CHAR(11) NOT NULL CHECK (length(uzlastirmaci_tc) = 11),
    uzlastirmaci_sicil_no VARCHAR(10) NOT NULL,
    uzlastirmaci_adres TEXT NOT NULL,
    rapor_duzenleme_il VARCHAR(50) NOT NULL,
    rapor_duzenleme_ilce VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TC ve Sicil numarası için unique constraint
ALTER TABLE uzlastirmacilar ADD CONSTRAINT unique_tc UNIQUE (uzlastirmaci_tc);
ALTER TABLE uzlastirmacilar ADD CONSTRAINT unique_sicil_no UNIQUE (uzlastirmaci_sicil_no);

-- İl-İlçe tabloları (il/ilçe seçimleri için referans olarak kullanılacak)
CREATE TABLE iller (
    id SERIAL PRIMARY KEY,
    il_adi VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE ilceler (
    id SERIAL PRIMARY KEY,
    il_id INTEGER REFERENCES iller(id),
    ilce_adi VARCHAR(50) NOT NULL,
    UNIQUE(il_id, ilce_adi)
);

-- Suçlar tablosu (suç seçimi için referans olarak kullanılacak)
CREATE TABLE suclar (
    id SERIAL PRIMARY KEY,
    suc_adi VARCHAR(200) NOT NULL UNIQUE
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_uzlastirmaci_updated_at
    BEFORE UPDATE ON uzlastirmacilar
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 