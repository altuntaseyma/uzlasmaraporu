import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';

const MainScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedUser } = location.state || {};

    if (!selectedUser) {
        navigate('/');
        return null;
    }

    const handleCreateReport = () => {
        navigate('/dosya-bilgileri', { state: { selectedUser, formType: 'report' } });
    };

    const handleCreateOfferForms = () => {
        navigate('/dosya-bilgileri', { state: { selectedUser, formType: 'offer' } });
    };

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto', mt: 4 }}>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Hoş Geldiniz, {selectedUser.uzlastirmaci_ad_soyad}
                    </Typography>
                    <Typography color="textSecondary">
                        Sicil No: {selectedUser.uzlastirmaci_sicil_no}
                    </Typography>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card 
                        sx={{ 
                            height: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                        onClick={handleCreateReport}
                    >
                        <DescriptionIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" align="center">
                            Uzlaştırma Raporu Oluştur
                        </Typography>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card 
                        sx={{ 
                            height: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                        onClick={handleCreateOfferForms}
                    >
                        <AssignmentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" align="center">
                            Teklif Formları Oluştur
                        </Typography>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => navigate('/')}
                >
                    Çıkış Yap
                </Button>
            </Box>
        </Box>
    );
};

export default MainScreen; 