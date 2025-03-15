const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');
const { dialog } = require('electron');

class WordService {
    async createReport(data, fileName) {
        try {
            const templatePath = '/Users/seymanuraltuntas/uzlastirma/public/templates/uzlasmaraporusablon.docx';
            
            // Şablon dosyasının varlığını kontrol et
            if (!fs.existsSync(templatePath)) {
                console.error('Şablon dosyası bulunamadı:', templatePath);
                throw new Error('Rapor şablonu bulunamadı');
            }

            let content;
            try {
                // Şablon dosyasını buffer olarak oku
                content = fs.readFileSync(templatePath);
                console.log('Şablon dosyası başarıyla okundu, boyut:', content.length);
            } catch (readError) {
                console.error('Şablon dosyası okuma hatası:', readError);
                throw new Error(`Şablon dosyası okunamadı: ${readError.message}`);
            }

            let zip;
            try {
                // PizZip ile içeriği kontrol et
                zip = new PizZip(content);
                console.log('PizZip başarıyla oluşturuldu');
            } catch (zipError) {
                console.error('PizZip hatası:', zipError);
                throw new Error(`Şablon dosyası geçerli bir Word belgesi değil: ${zipError.message}`);
            }

            // Docxtemplater nesnesini oluştur
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true
            });

            // Debug için gelen veriyi yazdır
            console.log('Gelen veriler:', JSON.stringify(data, null, 2));

            // İl ve ilçe adlarını al
            const il = data.savcilik_adi?.il ? await this.getIlAdi(data.savcilik_adi.il) : '';
            const ilce = data.savcilik_adi?.ilce ? await this.getIlceAdi(data.savcilik_adi.ilce) : '';

            // Debug logları
            console.log('Savcılık ID Değerleri:', {
                il_id: data.savcilik_adi?.il,
                ilce_id: data.savcilik_adi?.ilce
            });
            console.log('Savcılık Adları:', {
                il: il,
                ilce: ilce,
                secilen_deger: ilce || il
            });

            // Uzlaştırmacının il ve ilçe bilgilerini al
            const uzlastirmaciIl = data.selectedUser?.rapor_duzenleme_il ? await this.getIlAdi(data.selectedUser.rapor_duzenleme_il) : '';
            const uzlastirmaciIlce = data.selectedUser?.rapor_duzenleme_ilce ? await this.getIlceAdi(data.selectedUser.rapor_duzenleme_ilce) : '';

            console.log('İl:', il);
            console.log('İlçe:', ilce);

            // Verileri hazırla
            const templateData = {
                // Uzlaştırmacı bilgileri
                "uzlastirmaci_ad_soyad": data.selectedUser?.uzlastirmaci_ad_soyad || '',
                "uzlastirmaci_tc": data.selectedUser?.uzlastirmaci_tc || '',
                "uzlastirmaci_sicil_no": data.selectedUser?.uzlastirmaci_sicil_no || '',
                "uzlastirmaci_adres": data.selectedUser?.uzlastirmaci_adres || '',

                // Savcılık ve rapor düzenleme yeri bilgileri
                "rapor_duzenleme_yeri": uzlastirmaciIlce ? `${uzlastirmaciIl} ${uzlastirmaciIlce}` : uzlastirmaciIl,
                "savcilik_adi": (ilce || il).toLocaleUpperCase('tr-TR'),
                "savcilik_adi_baslik": `${ilce || il} CUMHURİYET BAŞSAVCILIĞI`,
                "savcilik_adi_tam": `${ilce || il} Cumhuriyet Başsavcılığı`,

                // Dosya numaraları
                "yil": data.yil?.toString() || '',
                "uzlastirma_no": data.uzlastirma_no || '',
                "sorusturma_yil": data.sorusturma_yil?.toString() || '',
                "sorusturma_no": data.sorusturma_no || '',

                // Tarihler
                "gorevlendirme_tarihi": data.gorevlendirme_tarihi ? new Date(data.gorevlendirme_tarihi).toLocaleDateString('tr-TR') : '',
                "rapor_duzenleme_tarihi": data.rapor_duzenleme_tarihi ? new Date(data.rapor_duzenleme_tarihi).toLocaleDateString('tr-TR') : '',

                // Uzlaşma bilgileri
                "uzlasmaya_konu_suc": data.uzlasmaya_konu_suc || '',
                "durum": data.durum || '',
                "durum_uppercase": data.durum ? data.durum.toUpperCase() : '',
                "metin": data.metin || '',
                "savci_sicil_no": data.savci_sicil_no || '',

                // Kişi listesi - basit döngü için
                "kisiler": [],
                // İmzalar için kişi listesi
                "imza_kisiler": []
            };

            // Kişileri ekle - hiçbir filtreleme yapmadan
            if (data.kisiler && data.kisiler.length > 0) {
                for (const kisi of data.kisiler) {
                    const dogumIl = kisi.kisi_dogum_yeri?.il ? await this.getIlAdi(kisi.kisi_dogum_yeri.il) : '';
                    const dogumIlce = kisi.kisi_dogum_yeri?.ilce ? await this.getIlceAdi(kisi.kisi_dogum_yeri.ilce) : '';

                    // Ana kişi listesi için
                    templateData.kisiler.push({
                        kisi_tipi: Array.isArray(kisi.kisi_tipi) ? kisi.kisi_tipi.join(', ') : (kisi.kisi_tipi || ''),
                        kisi_adi: kisi.kisi_adi || '',
                        kisi_tc: kisi.kisi_tc || '',
                        kisi_adres: kisi.kisi_adres || '',
                        kisi_baba_adi: kisi.kisi_baba_adi || '',
                        kisi_anne_adi: kisi.kisi_anne_adi || '',
                        kisi_dogum_yeri: dogumIlce ? `${dogumIl} ${dogumIlce}` : dogumIl,
                        kisi_dogum_tarihi: kisi.kisi_dogum_tarihi ? new Date(kisi.kisi_dogum_tarihi).toLocaleDateString('tr-TR') : '',
                        kisi_telefon: kisi.kisi_telefon || ''
                    });

                    // İmzalar için kişi listesi
                    templateData.imza_kisiler.push({
                        kisi_tipi: Array.isArray(kisi.kisi_tipi) ? kisi.kisi_tipi.join(', ') : (kisi.kisi_tipi || ''),
                        kisi_adi: kisi.kisi_adi || ''
                    });
                }
            }

            console.log('Şablona gönderilen veriler:', JSON.stringify(templateData, null, 2));

            // Şablonu doldur
            doc.render(templateData);

            // Dosya kaydetme dialogunu aç
            const { filePath } = await dialog.showSaveDialog({
                defaultPath: `${fileName}.docx`,
                filters: [
                    { name: 'Word Dosyası', extensions: ['docx'] }
                ]
            });

            if (filePath) {
                const buf = doc.getZip().generate({
                    type: 'nodebuffer',
                    compression: 'DEFLATE'
                });

                // Dosyayı kaydet
                fs.writeFileSync(filePath, buf);
                return { success: true, message: 'Rapor başarıyla oluşturuldu.' };
            }
            
            return { success: false, message: 'Dosya kaydedilmedi.' };
        } catch (error) {
            console.error('Word dosyası oluşturulurken hata:', error);
            throw new Error(`Rapor oluşturulurken hata: ${error.message}`);
        }
    }

    async getIlAdi(ilId) {
        // İl adını getir
        try {
            console.log('İl ID için sorgu yapılıyor:', ilId);
            const il = await global.db.query('SELECT il_adi FROM iller WHERE id = $1', [ilId]);
            console.log('İl sorgu sonucu:', il.rows[0]);
            return il.rows[0]?.il_adi || '';
        } catch (error) {
            console.error('İl adı getirilirken hata:', error);
            return '';
        }
    }

    async getIlceAdi(ilceId) {
        // İlçe adını getir
        try {
            console.log('İlçe ID için sorgu yapılıyor:', ilceId);
            const ilce = await global.db.query('SELECT ilce_adi FROM ilceler WHERE id = $1', [ilceId]);
            console.log('İlçe sorgu sonucu:', ilce.rows[0]);
            return ilce.rows[0]?.ilce_adi || '';
        } catch (error) {
            console.error('İlçe adı getirilirken hata:', error);
            return '';
        }
    }

    async createOfferForm(data, fileName) {
        try {
            const templatePath = '/Users/seymanuraltuntas/uzlastirma/public/templates/uzlasmateklifformusablon.docx';
            
            if (!fs.existsSync(templatePath)) {
                console.error('Teklif formu şablonu bulunamadı:', templatePath);
                throw new Error('Teklif formu şablonu bulunamadı');
            }

            // İl ve ilçe adlarını al
            const il = data.savcilik_adi?.il ? await this.getIlAdi(data.savcilik_adi.il) : '';
            const ilce = data.savcilik_adi?.ilce ? await this.getIlceAdi(data.savcilik_adi.ilce) : '';

            // Uzlaştırmacının il ve ilçe bilgilerini al
            const uzlastirmaciIl = data.selectedUser?.rapor_duzenleme_il ? await this.getIlAdi(data.selectedUser.rapor_duzenleme_il) : '';
            const uzlastirmaciIlce = data.selectedUser?.rapor_duzenleme_ilce ? await this.getIlceAdi(data.selectedUser.rapor_duzenleme_ilce) : '';

            // Her kişi için ayrı form oluştur
            for (const kisi of (data.kisiler || [])) {
                let content;
                try {
                    content = fs.readFileSync(templatePath);
                } catch (readError) {
                    console.error('Teklif formu şablonu okuma hatası:', readError);
                    throw new Error(`Teklif formu şablonu okunamadı: ${readError.message}`);
                }

                let zip;
                try {
                    zip = new PizZip(content);
                } catch (zipError) {
                    console.error('PizZip hatası:', zipError);
                    throw new Error(`Teklif formu şablonu geçerli bir Word belgesi değil: ${zipError.message}`);
                }

                const doc = new Docxtemplater(zip, {
                    paragraphLoop: true,
                    linebreaks: true
                });

                const dogumIl = kisi.kisi_dogum_yeri?.il ? await this.getIlAdi(kisi.kisi_dogum_yeri.il) : '';
                const dogumIlce = kisi.kisi_dogum_yeri?.ilce ? await this.getIlceAdi(kisi.kisi_dogum_yeri.ilce) : '';

                // Debug: Kişi tiplerini kontrol et
                console.log('Kişi tipleri:', kisi.kisi_tipi);
                console.log('Kişi tipi array mi?:', Array.isArray(kisi.kisi_tipi));
                
                // Kişi tiplerini normalize et
                const kisiTipleri = Array.isArray(kisi.kisi_tipi) ? kisi.kisi_tipi : [kisi.kisi_tipi];
                console.log('Normalize edilmiş kişi tipleri:', kisiTipleri);

                // Kişiye özel verileri hazırla
                const templateData = {
                    // Uzlaştırmacı bilgileri
                    "uzlastirmaci_ad_soyad": data.selectedUser?.uzlastirmaci_ad_soyad || '',
                    "uzlastirmaci_tc": data.selectedUser?.uzlastirmaci_tc || '',
                    "uzlastirmaci_sicil_no": data.selectedUser?.uzlastirmaci_sicil_no || '',
                    "uzlastirmaci_adres": data.selectedUser?.uzlastirmaci_adres || '',

                    // Savcılık ve rapor düzenleme yeri bilgileri
                    "rapor_duzenleme_yeri": uzlastirmaciIlce ? `${uzlastirmaciIl} ${uzlastirmaciIlce}` : uzlastirmaciIl,
                    "savcilik_adi": (ilce || il).toLocaleUpperCase('tr-TR'),
                    "savcilik_adi_baslik": `${ilce || il} CUMHURİYET BAŞSAVCILIĞI`,
                    "savcilik_adi_tam": `${ilce || il} Cumhuriyet Başsavcılığı`,

                    // Kişi tipi işaretlemeleri
                    "1": kisiTipleri.includes('Müşteki') ? 'X' : '...',
                    "2": kisiTipleri.includes('Mağdurun Kanuni Temsilcisi') ? 'X' : '...',
                    "3": kisiTipleri.includes('Suçtan Zarar Gören') ? 'X' : '...',
                    "4": kisiTipleri.includes('Suçtan Zarar Görenin Kanuni Temsilcisi') ? 'X' : '...',
                    "5": kisiTipleri.includes('Şüpheli') || kisiTipleri.includes('Sanık') ? 'X' : '...',
                    "6": kisiTipleri.includes('Şüphelinin Kanuni Temsilcisi') || kisiTipleri.includes('Sanığın Kanuni Temsilcisi') ? 'X' : '...',

                    // Debug: İşaretleme durumlarını kontrol et
                    "debug_1": kisiTipleri.includes('Müşteki'),
                    "debug_2": kisiTipleri.includes('Mağdurun Kanuni Temsilcisi'),
                    "debug_3": kisiTipleri.includes('Suçtan Zarar Gören'),
                    "debug_4": kisiTipleri.includes('Suçtan Zarar Görenin Kanuni Temsilcisi'),
                    "debug_5": kisiTipleri.includes('Şüpheli') || kisiTipleri.includes('Sanık'),
                    "debug_6": kisiTipleri.includes('Şüphelinin Kanuni Temsilcisi') || kisiTipleri.includes('Sanığın Kanuni Temsilcisi'),

                    // Dosya numaraları
                    "yil": data.yil?.toString() || '',
                    "uzlastirma_no": data.uzlastirma_no || '',
                    "sorusturma_yil": data.sorusturma_yil?.toString() || '',
                    "sorusturma_no": data.sorusturma_no || '',

                    // Tarihler
                    "gorevlendirme_tarihi": data.gorevlendirme_tarihi ? new Date(data.gorevlendirme_tarihi).toLocaleDateString('tr-TR') : '',
                    "rapor_duzenleme_tarihi": data.rapor_duzenleme_tarihi ? new Date(data.rapor_duzenleme_tarihi).toLocaleDateString('tr-TR') : '',

                    // Uzlaşma bilgileri
                    "uzlasmaya_konu_suc": Array.isArray(data.uzlasmaya_konu_suc) 
                        ? data.uzlasmaya_konu_suc.join(', ') 
                        : (data.uzlasmaya_konu_suc || ''),
                    "savci_sicil_no": data.savci_sicil_no || '',

                    // Kişi bilgileri
                    "kisi_tipi": Array.isArray(kisi.kisi_tipi) ? kisi.kisi_tipi.join(', ') : (kisi.kisi_tipi || ''),
                    "kisi_adi": kisi.kisi_adi || '',
                    "kisi_tc": kisi.kisi_tc || '',
                    "kisi_adres": kisi.kisi_adres || '',
                    "kisi_baba_adi": kisi.kisi_baba_adi || '',
                    "kisi_anne_adi": kisi.kisi_anne_adi || '',
                    "kisi_dogum_yeri": dogumIlce ? `${dogumIl} ${dogumIlce}` : dogumIl,
                    "kisi_dogum_tarihi": kisi.kisi_dogum_tarihi ? new Date(kisi.kisi_dogum_tarihi).toLocaleDateString('tr-TR') : '',
                    "kisi_telefon": kisi.kisi_telefon || '',

                    // Tarih
                    "tarih": new Date().toLocaleDateString('tr-TR')
                };

                // Debug için veriyi yazdır
                console.log(`${kisi.kisi_adi} için teklif formuna gönderilen veriler:`, JSON.stringify(templateData, null, 2));

                // Şablonu doldur
                doc.render(templateData);

                // Kişiye özel dosya adı oluştur
                const kisiFileName = `${fileName}_${kisi.kisi_adi.replace(/\s+/g, '_')}`;

                // Dosya kaydetme dialogunu aç
                const { filePath } = await dialog.showSaveDialog({
                    defaultPath: `${kisiFileName}.docx`,
                    filters: [
                        { name: 'Word Dosyası', extensions: ['docx'] }
                    ]
                });

                if (filePath) {
                    const buf = doc.getZip().generate({
                        type: 'nodebuffer',
                        compression: 'DEFLATE'
                    });

                    // Dosyayı kaydet
                    fs.writeFileSync(filePath, buf);
                }
            }

            return { success: true, message: 'Teklif formları başarıyla oluşturuldu.' };
        } catch (error) {
            console.error('Teklif formu oluşturulurken hata:', error);
            throw new Error(`Teklif formu oluşturulurken hata: ${error.message}`);
        }
    }
}

module.exports = new WordService(); 