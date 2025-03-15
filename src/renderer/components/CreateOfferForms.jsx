import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    Snackbar,
    Divider,
    List,
    ListItem,
    ListItemText
} from '@mui/material';

const CreateOfferForms = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedUser, formData } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    if (!selectedUser || !formData) {
        navigate('/');
        return null;
    }

    const handleCreateOfferForms = async () => {
        try {
            setLoading(true);
            setError(null);

            // Her kişi için teklif formu oluştur
            for (const kisi of formData.kisiler) {
                const teklifDosyaAdi = `uzlasma_teklif_${formData.yil}_${formData.uzlastirma_no}_${kisi.kisi_adi.replace(/\s+/g, '_')}`;
                const teklifData = {
                    ...formData,
                    selectedUser,
                    kisiler: [kisi] // Sadece ilgili kişiyi gönder
                };
                await window.electron.wordService.createOfferForm(teklifData, teklifDosyaAdi);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/main', { state: { selectedUser } });
            }, 2000);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        navigate('/dosya-bilgileri', { 
            state: { 
                selectedUser,
                formData,
                formType: 'offer'
            } 
        });
    };

    const handleClose = () => {
        navigate('/main', { state: { selectedUser } });
    };

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Teklif Formları Oluştur
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            <strong>Uzlaştırmacı:</strong> {selectedUser.uzlastirmaci_ad_soyad}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            <strong>Dosya No:</strong> {formData.yil}/{formData.uzlastirma_no}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            <strong>Soruşturma No:</strong> {formData.sorusturma_yil}/{formData.sorusturma_no}
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Teklif Formu Oluşturulacak Kişiler:
                        </Typography>
                        <List>
                            {formData.kisiler.map((kisi, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={kisi.kisi_adi}
                                        secondary={`${Array.isArray(kisi.kisi_tipi) ? kisi.kisi_tipi.join(', ') : kisi.kisi_tipi}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            onClick={handleClose}
                            color="inherit"
                        >
                            İptal
                        </Button>
                        <Box>
                            <Button
                                onClick={handleEdit}
                                sx={{ mr: 2 }}
                            >
                                Düzenle
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleCreateOfferForms}
                                disabled={loading}
                            >
                                {loading ? 'Formlar Oluşturuluyor...' : 'Teklif Formlarını Oluştur'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={success}
                autoHideDuration={2000}
                onClose={() => setSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" sx={{ width: '100%' }}>
                    Teklif formları başarıyla oluşturuldu!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CreateOfferForms; 