import React, { useState, useEffect } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';

const CreateReport = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedUser, formData } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [reportCreated, setReportCreated] = useState(false);

    useEffect(() => {
        if (!selectedUser || !formData) {
            navigate('/');
        }
    }, [selectedUser, formData, navigate]);

    const handleCreateReport = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Gönderilen form verileri:', formData);

            const dosyaAdi = `uzlastirma_${formData.yil}_${formData.uzlastirma_no}`;
            const result = await window.electron.wordService.createReport({
                ...formData,
                selectedUser
            }, dosyaAdi);

            if (result.success) {
                setSuccess(true);
                setReportCreated(true);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

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

            navigate('/main', { state: { selectedUser } });
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
                formData
            } 
        });
    };

    const handleClose = () => {
        navigate('/main', { state: { selectedUser } });
    };

    if (!selectedUser || !formData) {
        return null;
    }

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Rapor Oluştur
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

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            onClick={handleClose}
                            color="inherit"
                        >
                            İptal
                        </Button>
                        <Box>
                            {!reportCreated ? (
                                <>
                                    <Button
                                        onClick={handleEdit}
                                        sx={{ mr: 2 }}
                                    >
                                        Düzenle
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleCreateReport}
                                        disabled={loading}
                                    >
                                        {loading ? 'Rapor Oluşturuluyor...' : 'Rapor Oluştur'}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleCreateOfferForms}
                                    disabled={loading}
                                >
                                    {loading ? 'Teklif Formları Oluşturuluyor...' : 'Teklif Formlarını Oluştur'}
                                </Button>
                            )}
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
                    Rapor başarıyla oluşturuldu!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CreateReport; 