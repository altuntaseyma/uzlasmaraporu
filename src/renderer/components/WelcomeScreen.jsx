import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [iller, setIller] = useState([]);
    const [ilceler, setIlceler] = useState([]);
    const [errors, setErrors] = useState({});
    const [newUser, setNewUser] = useState({
        uzlastirmaci_ad_soyad: '',
        uzlastirmaci_tc: '',
        uzlastirmaci_sicil_no: '',
        uzlastirmaci_adres: '',
        rapor_duzenleme_il: '',
        rapor_duzenleme_ilce: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Kullanıcıları getir
                const usersResponse = await window.electron.uzlastirmaciService.tumunuGetir();
                setUsers(usersResponse);
                
                // İlleri getir
                const illerResponse = await window.electron.lokasyonService.tumIlleriGetir();
                setIller(illerResponse);
            } catch (error) {
                console.error('Veri getirilirken hata:', error);
            }
        };
        fetchData();
    }, []);

    // İl seçildiğinde ilçeleri getir
    useEffect(() => {
        const fetchIlceler = async () => {
            if (newUser.rapor_duzenleme_il) {
                try {
                    const response = await window.electron.lokasyonService.ilceleriGetir(newUser.rapor_duzenleme_il);
                    setIlceler(response);
                } catch (error) {
                    console.error('İlçeler getirilirken hata:', error);
                }
            } else {
                setIlceler([]);
            }
        };
        fetchIlceler();
    }, [newUser.rapor_duzenleme_il]);

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

    const validateForm = () => {
        const newErrors = {};

        // TC Kimlik No kontrolü
        if (!newUser.uzlastirmaci_tc) {
            newErrors.uzlastirmaci_tc = 'TC Kimlik No zorunludur';
        } else if (!/^\d{11}$/.test(newUser.uzlastirmaci_tc)) {
            newErrors.uzlastirmaci_tc = 'TC Kimlik No 11 haneli olmalıdır';
        } else if (!validateTCKN(newUser.uzlastirmaci_tc)) {
            newErrors.uzlastirmaci_tc = 'Geçersiz TC Kimlik No';
        }

        // Sicil No kontrolü
        if (!newUser.uzlastirmaci_sicil_no) {
            newErrors.uzlastirmaci_sicil_no = 'Sicil No zorunludur';
        } else if (!/^\d{1,10}$/.test(newUser.uzlastirmaci_sicil_no)) {
            newErrors.uzlastirmaci_sicil_no = 'Sicil No en fazla 10 haneli olmalıdır';
        }

        // Ad Soyad kontrolü
        if (!newUser.uzlastirmaci_ad_soyad.trim()) {
            newErrors.uzlastirmaci_ad_soyad = 'Ad Soyad zorunludur';
        }

        // Adres kontrolü
        if (!newUser.uzlastirmaci_adres.trim()) {
            newErrors.uzlastirmaci_adres = 'Adres zorunludur';
        }

        // İl kontrolü
        if (!newUser.rapor_duzenleme_il) {
            newErrors.rapor_duzenleme_il = 'İl seçimi zorunludur';
        }

        // İlçe kontrolü
        if (!newUser.rapor_duzenleme_ilce) {
            newErrors.rapor_duzenleme_ilce = 'İlçe seçimi zorunludur';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUserSelect = (user) => {
        navigate('/main', { state: { selectedUser: user } });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // TC ve Sicil No için sadece rakam girişine izin ver
        if ((name === 'uzlastirmaci_tc' || name === 'uzlastirmaci_sicil_no') && !/^\d*$/.test(value)) {
            return;
        }

        // TC No için 11 karakter sınırı
        if (name === 'uzlastirmaci_tc' && value.length > 11) {
            return;
        }

        // Sicil No için 10 karakter sınırı
        if (name === 'uzlastirmaci_sicil_no' && value.length > 10) {
            return;
        }

        setNewUser(prev => ({
            ...prev,
            [name]: value
        }));

        // Hata mesajını temizle
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleNewUser = async () => {
        if (validateForm()) {
            try {
                await window.electron.uzlastirmaciService.ekle(newUser);
                setOpenDialog(false);
                // Form alanlarını temizle
                setNewUser({
                    uzlastirmaci_ad_soyad: '',
                    uzlastirmaci_tc: '',
                    uzlastirmaci_sicil_no: '',
                    uzlastirmaci_adres: '',
                    rapor_duzenleme_il: '',
                    rapor_duzenleme_ilce: ''
                });
                // Kullanıcı listesini yenile
                const response = await window.electron.uzlastirmaciService.tumunuGetir();
                setUsers(response);
            } catch (error) {
                console.error('Kullanıcı eklenirken hata:', error);
            }
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: '0 auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" component="h1" gutterBottom>
                        Uzlaştırma Rapor Sistemi
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => setOpenDialog(true)}
                            fullWidth
                        >
                            Yeni Uzlaştırmacı Ekle
                        </Button>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                        Kayıtlı Uzlaştırmacılar
                    </Typography>
                    
                    <List>
                        {users.map((user) => (
                            <ListItem 
                                key={user.id}
                                button
                                onClick={() => handleUserSelect(user)}
                                sx={{ 
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1,
                                    mb: 1
                                }}
                            >
                                <ListItemText 
                                    primary={user.uzlastirmaci_ad_soyad}
                                    secondary={`Sicil No: ${user.uzlastirmaci_sicil_no}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>

            {/* Yeni Uzlaştırmacı Ekleme Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Yeni Uzlaştırmacı Ekle</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="uzlastirmaci_ad_soyad"
                        label="Ad Soyad"
                        fullWidth
                        value={newUser.uzlastirmaci_ad_soyad}
                        onChange={handleInputChange}
                        error={!!errors.uzlastirmaci_ad_soyad}
                        helperText={errors.uzlastirmaci_ad_soyad}
                    />
                    <TextField
                        margin="dense"
                        name="uzlastirmaci_tc"
                        label="T.C. Kimlik No"
                        fullWidth
                        value={newUser.uzlastirmaci_tc}
                        onChange={handleInputChange}
                        error={!!errors.uzlastirmaci_tc}
                        helperText={errors.uzlastirmaci_tc}
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    />
                    <TextField
                        margin="dense"
                        name="uzlastirmaci_sicil_no"
                        label="Sicil No"
                        fullWidth
                        value={newUser.uzlastirmaci_sicil_no}
                        onChange={handleInputChange}
                        error={!!errors.uzlastirmaci_sicil_no}
                        helperText={errors.uzlastirmaci_sicil_no}
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    />
                    <TextField
                        margin="dense"
                        name="uzlastirmaci_adres"
                        label="Adres"
                        fullWidth
                        multiline
                        rows={3}
                        value={newUser.uzlastirmaci_adres}
                        onChange={handleInputChange}
                        error={!!errors.uzlastirmaci_adres}
                        helperText={errors.uzlastirmaci_adres}
                    />
                    <FormControl 
                        fullWidth 
                        margin="dense"
                        error={!!errors.rapor_duzenleme_il}
                    >
                        <InputLabel>İl</InputLabel>
                        <Select
                            name="rapor_duzenleme_il"
                            value={newUser.rapor_duzenleme_il}
                            label="İl"
                            onChange={handleInputChange}
                        >
                            {iller.map((il) => (
                                <MenuItem key={il.id} value={il.id}>
                                    {il.il_adi}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.rapor_duzenleme_il && (
                            <FormHelperText>{errors.rapor_duzenleme_il}</FormHelperText>
                        )}
                    </FormControl>
                    <FormControl 
                        fullWidth 
                        margin="dense"
                        error={!!errors.rapor_duzenleme_ilce}
                        disabled={!newUser.rapor_duzenleme_il}
                    >
                        <InputLabel>İlçe</InputLabel>
                        <Select
                            name="rapor_duzenleme_ilce"
                            value={newUser.rapor_duzenleme_ilce}
                            label="İlçe"
                            onChange={handleInputChange}
                        >
                            {ilceler.map((ilce) => (
                                <MenuItem key={ilce.id} value={ilce.id}>
                                    {ilce.ilce_adi}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.rapor_duzenleme_ilce && (
                            <FormHelperText>{errors.rapor_duzenleme_ilce}</FormHelperText>
                        )}
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>İptal</Button>
                    <Button onClick={handleNewUser} variant="contained">Kaydet</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WelcomeScreen; 