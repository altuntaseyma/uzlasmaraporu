import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    OutlinedInput,
    FormControlLabel,
    RadioGroup,
    Radio,
    Button,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import trLocale from 'date-fns/locale/tr';

const steps = [
    'Dosya Bilgileri',
    'Kişi Bilgileri',
    'Uzlaşma Detayları'
];

const kisiTipleri = [
    'Müşteki',
    'Mağdurun Kanuni Temsilcisi',
    'Suçtan Zarar Gören',
    'Suçtan Zarar Görenin Kanuni Temsilcisi',
    'Şüpheli',
    'Sanık',
    'Şüphelinin Kanuni Temsilcisi',
    'Sanığın Kanuni Temsilcisi',
    'Müştekinin Kanuni Temsilcisi'
];

const DosyaBilgileri = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedUser, formType } = location.state || {};
    const { formData: existingFormData } = location.state || {};
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 10}, (_, i) => currentYear - i);
    
    const [formData, setFormData] = useState(existingFormData || {
        savcilik_adi: {
            il: '',
            ilce: ''
        },
        yil: currentYear,
        uzlastirma_no: '',
        sorusturma_yil: currentYear,
        sorusturma_no: '',
        gorevlendirme_tarihi: new Date(),
        rapor_duzenleme_tarihi: new Date(),
        uzlasmaya_konu_suc: '',
        savci_sicil_no: '',
        kisiler: [],
        durum: 'sağlanmıştır',
        durum_uppercase: 'SAĞLANMIŞTIR',
        metin: ''
    });

    const [iller, setIller] = useState([]);
    const [ilceler, setIlceler] = useState([]);
    const [suclar, setSuclar] = useState([]);
    const [errors, setErrors] = useState({});
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const illerResponse = await window.electron.lokasyonService.tumIlleriGetir();
                setIller(illerResponse);

                const suclarResponse = await window.electron.sucService.tumSuclariGetir();
                setSuclar(suclarResponse);
            } catch (error) {
                console.error('Veri getirilirken hata:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchIlceler = async () => {
            if (formData.savcilik_adi.il) {
                try {
                    const response = await window.electron.lokasyonService.ilceleriGetir(formData.savcilik_adi.il);
                    setIlceler(response);
                } catch (error) {
                    console.error('İlçeler getirilirken hata:', error);
                }
            } else {
                setIlceler([]);
            }
        };
        fetchIlceler();
    }, [formData.savcilik_adi.il]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'savci_sicil_no') {
            if (!/^\d*$/.test(value) || value.length > 11) return;
            
            // TC Kimlik No validasyonu
            if (value.length === 11) {
                const isValid = validateTCKN(value);
                setErrors(prev => ({
                    ...prev,
                    savci_sicil_no: isValid ? '' : 'Geçersiz TC Kimlik No'
                }));
            } else if (value.length > 0) {
                setErrors(prev => ({
                    ...prev,
                    savci_sicil_no: 'TC Kimlik No 11 haneli olmalıdır'
                }));
            }
        }
        
        if (name === 'uzlastirma_no' || name === 'sorusturma_no') {
            if (!/^\d*$/.test(value) || value.length > 10) return;
        }

        if (name === 'durum') {
            setFormData(prev => ({
                ...prev,
                durum: value,
                durum_uppercase: value.toUpperCase()
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSavcilikChange = (type, value) => {
        console.log('Savcılık değişikliği:', { type, value });
        setFormData(prev => ({
            ...prev,
            savcilik_adi: {
                ...prev.savcilik_adi,
                [type]: value
            }
        }));

        // İl değiştiğinde ilçeyi sıfırla
        if (type === 'il') {
            setFormData(prev => ({
                ...prev,
                savcilik_adi: {
                    il: value,
                    ilce: ''
                }
            }));
        }

        if (errors.il) {
            setErrors(prev => ({
                ...prev,
                il: ''
            }));
        }
    };

    const handleDateChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleKisiEkle = () => {
        setFormData(prev => ({
            ...prev,
            kisiler: [...prev.kisiler, {
                kisi_tipi: [],
                kisi_adi: '',
                kisi_tc: '',
                kisi_adres: '',
                kisi_baba_adi: '',
                kisi_anne_adi: '',
                kisi_dogum_yeri: {
                    il: '',
                    ilce: ''
                },
                kisi_dogum_tarihi: new Date(),
                kisi_telefon: ''
            }]
        }));
    };

    // TC Kimlik No Validasyon Fonksiyonu
    const validateTCKN = (value) => {
        if (!value) return false;
        if (value.length !== 11) return false;
        if (value[0] === '0') return false;
        
        let tek = 0, cift = 0;
        for (let i = 0; i < 9; i++) {
            if (i % 2 === 0) {
                tek += parseInt(value[i]);
            } else {
                cift += parseInt(value[i]);
            }
        }
        
        const digit10 = (tek * 7 - cift) % 10;
        const digit11 = (tek + cift + parseInt(value[9])) % 10;
        
        return digit10 === parseInt(value[9]) && digit11 === parseInt(value[10]);
    };

    const handleKisiChange = (index, field, value) => {
        if (field === 'kisi_tc') {
            // Sadece rakam girişine izin ver ve 11 karakterle sınırla
            if (!/^\d*$/.test(value) || value.length > 11) return;
        }

        setFormData(prev => ({
            ...prev,
            kisiler: prev.kisiler.map((kisi, i) => 
                i === index ? { 
                    ...kisi, 
                    [field]: value,
                    [`${field}_error`]: field === 'kisi_tc' && value.length === 11 ? !validateTCKN(value) : undefined
                } : kisi
            )
        }));
    };

    const handleKisiSil = (index) => {
        setFormData(prev => ({
            ...prev,
            kisiler: prev.kisiler.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Her aşama için farklı validasyon kuralları
        switch (activeStep) {
            case 0: // Dosya Bilgileri
                if (!formData.savcilik_adi.il) {
                    newErrors.il = 'İl seçimi zorunludur';
                }
                if (!formData.uzlastirma_no) {
                    newErrors.uzlastirma_no = 'Uzlaştırma no zorunludur';
                }
                if (!formData.sorusturma_no) {
                    newErrors.sorusturma_no = 'Soruşturma no zorunludur';
                }
                if (!formData.gorevlendirme_tarihi) {
                    newErrors.gorevlendirme_tarihi = 'Görevlendirme tarihi zorunludur';
                }
                if (!formData.rapor_duzenleme_tarihi) {
                    newErrors.rapor_duzenleme_tarihi = 'Rapor düzenleme tarihi zorunludur';
                }
                break;

            case 1: // Kişi Bilgileri
                return true;

            case 2: // Uzlaşma Detayları
                if (!formData.savci_sicil_no) {
                    newErrors.savci_sicil_no = 'Savcı sicil no zorunludur';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateForm()) {
            if (activeStep === steps.length - 1) {
                if (formType === 'offer') {
                    navigate('/create-offer-forms', { 
                        state: { 
                            selectedUser,
                            formData
                        } 
                    });
                } else {
                    navigate('/create-report', { 
                        state: { 
                            selectedUser,
                            formData
                        } 
                    });
                }
            } else {
                setActiveStep((prevStep) => prevStep + 1);
            }
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0: // Dosya Bilgileri
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Savcılık Adı
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel>İl</InputLabel>
                            <Select
                                value={formData.savcilik_adi.il}
                                label="İl"
                                onChange={(e) => handleSavcilikChange('il', e.target.value)}
                                error={!!errors.il}
                            >
                                {iller.map((il) => (
                                    <MenuItem key={il.id} value={il.id}>
                                        {il.il_adi}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>İlçe (Opsiyonel)</InputLabel>
                            <Select
                                value={formData.savcilik_adi.ilce}
                                label="İlçe (Opsiyonel)"
                                onChange={(e) => handleSavcilikChange('ilce', e.target.value)}
                                disabled={!formData.savcilik_adi.il}
                            >
                                {ilceler.map((ilce) => (
                                    <MenuItem key={ilce.id} value={ilce.id}>
                                        {ilce.ilce_adi}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl sx={{ width: '30%' }}>
                                <InputLabel>Yıl</InputLabel>
                                <Select
                                    value={formData.yil}
                                    label="Yıl"
                                    onChange={(e) => handleInputChange({ target: { name: 'yil', value: e.target.value } })}
                                >
                                    {years.map(year => (
                                        <MenuItem key={year} value={year}>
                                            {year}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                sx={{ width: '70%' }}
                                label="Uzlaştırma No"
                                name="uzlastirma_no"
                                value={formData.uzlastirma_no}
                                onChange={handleInputChange}
                                error={!!errors.uzlastirma_no}
                                helperText={errors.uzlastirma_no || `${formData.yil}/${formData.uzlastirma_no}`}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl sx={{ width: '30%' }}>
                                <InputLabel>Yıl</InputLabel>
                                <Select
                                    value={formData.sorusturma_yil}
                                    label="Yıl"
                                    onChange={(e) => handleInputChange({ target: { name: 'sorusturma_yil', value: e.target.value } })}
                                >
                                    {years.map(year => (
                                        <MenuItem key={year} value={year}>
                                            {year}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                sx={{ width: '70%' }}
                                label="Soruşturma No"
                                name="sorusturma_no"
                                value={formData.sorusturma_no}
                                onChange={handleInputChange}
                                error={!!errors.sorusturma_no}
                                helperText={errors.sorusturma_no || `${formData.sorusturma_yil}/${formData.sorusturma_no}`}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <DatePicker
                                label="Görevlendirme Tarihi"
                                value={formData.gorevlendirme_tarihi}
                                onChange={(newValue) => handleDateChange('gorevlendirme_tarihi', newValue)}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        fullWidth 
                                        error={!!errors.gorevlendirme_tarihi}
                                        helperText={errors.gorevlendirme_tarihi}
                                    />
                                )}
                            />
                            <DatePicker
                                label="Rapor Düzenleme Tarihi"
                                value={formData.rapor_duzenleme_tarihi}
                                onChange={(newValue) => handleDateChange('rapor_duzenleme_tarihi', newValue)}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        fullWidth 
                                        error={!!errors.rapor_duzenleme_tarihi}
                                        helperText={errors.rapor_duzenleme_tarihi}
                                    />
                                )}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="Uzlaşmaya Konu Suç"
                            multiline
                            rows={4}
                            value={formData.uzlasmaya_konu_suc}
                            onChange={(e) => handleInputChange({ target: { name: 'uzlasmaya_konu_suc', value: e.target.value } })}
                            error={!!errors.uzlasmaya_konu_suc}
                            helperText={errors.uzlasmaya_konu_suc}
                        />

                        <TextField
                            fullWidth
                            label="Savcı Sicil No"
                            name="savci_sicil_no"
                            value={formData.savci_sicil_no}
                            onChange={handleInputChange}
                            error={!!errors.savci_sicil_no}
                            helperText={errors.savci_sicil_no}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 10 }}
                        />
                    </Box>
                );

            case 1: // Kişi Bilgileri
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6">Kişi Bilgileri</Typography>

                        {formData.kisiler.map((kisi, index) => (
                            <Card key={index} sx={{ p: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="subtitle1">Kişi #{index + 1}</Typography>
                                    <Button
                                        color="error"
                                        onClick={() => handleKisiSil(index)}
                                    >
                                        Sil
                                    </Button>
                                </Box>

                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Kişi Tipi</InputLabel>
                                    <Select
                                        multiple
                                        value={kisi.kisi_tipi}
                                        onChange={(e) => handleKisiChange(index, 'kisi_tipi', e.target.value)}
                                        input={<OutlinedInput label="Kişi Tipi" />}
                                        renderValue={(selected) => selected.join(', ')}
                                    >
                                        {kisiTipleri.map((tip) => (
                                            <MenuItem key={tip} value={tip}>
                                                <Checkbox checked={kisi.kisi_tipi.indexOf(tip) > -1} />
                                                <ListItemText primary={tip} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    label="Ad Soyad"
                                    value={kisi.kisi_adi}
                                    onChange={(e) => handleKisiChange(index, 'kisi_adi', e.target.value)}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    label="T.C. Kimlik No"
                                    value={kisi.kisi_tc}
                                    onChange={(e) => handleKisiChange(index, 'kisi_tc', e.target.value)}
                                    error={kisi.kisi_tc_error}
                                    helperText={kisi.kisi_tc_error ? 'Geçersiz T.C. Kimlik No' : ''}
                                    sx={{ mb: 2 }}
                                    inputProps={{ 
                                        maxLength: 11,
                                        inputMode: 'numeric',
                                        pattern: '[0-9]*'
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Adres"
                                    multiline
                                    rows={3}
                                    value={kisi.kisi_adres}
                                    onChange={(e) => handleKisiChange(index, 'kisi_adres', e.target.value)}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    label="Baba Adı"
                                    value={kisi.kisi_baba_adi}
                                    onChange={(e) => handleKisiChange(index, 'kisi_baba_adi', e.target.value)}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    label="Anne Adı"
                                    value={kisi.kisi_anne_adi}
                                    onChange={(e) => handleKisiChange(index, 'kisi_anne_adi', e.target.value)}
                                    sx={{ mb: 2 }}
                                />

                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Doğum Yeri - İl</InputLabel>
                                        <Select
                                            value={kisi.kisi_dogum_yeri.il}
                                            onChange={async (e) => {
                                                const selectedIl = e.target.value;
                                                // İl değiştiğinde ilçeleri getir
                                                try {
                                                    const ilceResponse = await window.electron.lokasyonService.ilceleriGetir(selectedIl);
                                                    setIlceler(ilceResponse);
                                                } catch (error) {
                                                    console.error('İlçeler getirilirken hata:', error);
                                                }
                                                handleKisiChange(index, 'kisi_dogum_yeri', {
                                                    il: selectedIl,
                                                    ilce: ''
                                                });
                                            }}
                                            label="Doğum Yeri - İl"
                                        >
                                            {iller.map((il) => (
                                                <MenuItem key={il.id} value={il.id}>
                                                    {il.il_adi}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth>
                                        <InputLabel>Doğum Yeri - İlçe</InputLabel>
                                        <Select
                                            value={kisi.kisi_dogum_yeri.ilce}
                                            onChange={(e) => handleKisiChange(index, 'kisi_dogum_yeri', {
                                                ...kisi.kisi_dogum_yeri,
                                                ilce: e.target.value
                                            })}
                                            disabled={!kisi.kisi_dogum_yeri.il}
                                            label="Doğum Yeri - İlçe"
                                        >
                                            {ilceler.map((ilce) => (
                                                <MenuItem key={ilce.id} value={ilce.id}>
                                                    {ilce.ilce_adi}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                <DatePicker
                                    label="Doğum Tarihi"
                                    value={kisi.kisi_dogum_tarihi}
                                    onChange={(newValue) => handleKisiChange(index, 'kisi_dogum_tarihi', newValue)}
                                    renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                                />

                                <TextField
                                    fullWidth
                                    label="Telefon"
                                    value={kisi.kisi_telefon}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 10) {
                                            const formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                                            handleKisiChange(index, 'kisi_telefon', formattedValue);
                                        }
                                    }}
                                    placeholder="(5XX) XXX-XXXX"
                                />
                            </Card>
                        ))}

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleKisiEkle}
                                size="large"
                            >
                                Kişi Ekle
                            </Button>
                        </Box>
                    </Box>
                );

            case 2: // Uzlaşma Detayları
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl component="fieldset">
                            <RadioGroup
                                name="durum"
                                value={formData.durum}
                                onChange={handleInputChange}
                                row
                            >
                                <FormControlLabel 
                                    value="sağlanmıştır" 
                                    control={<Radio />} 
                                    label="Sağlanmıştır" 
                                />
                                <FormControlLabel 
                                    value="sağlanmamıştır" 
                                    control={<Radio />} 
                                    label="Sağlanmamıştır" 
                                />
                            </RadioGroup>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Metin"
                            multiline
                            rows={4}
                            value={formData.metin}
                            onChange={(e) => handleInputChange({ target: { name: 'metin', value: e.target.value } })}
                        />
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
            <Box sx={{ maxWidth: 800, margin: '0 auto', mt: 4 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Dosya Bilgileri
                        </Typography>

                        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {renderStepContent(activeStep)}

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                            >
                                Geri
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleNext}
                            >
                                {activeStep === steps.length - 1 ? 'Tamamla' : 'İleri'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </LocalizationProvider>
    );
};

export default DosyaBilgileri; 