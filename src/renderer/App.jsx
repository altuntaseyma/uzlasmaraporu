import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/Layout';
import WelcomeScreen from './components/WelcomeScreen';
import MainScreen from './components/MainScreen';
import CreateReport from './components/CreateReport';
import CreateOfferForms from './components/CreateOfferForms';
import DosyaBilgileri from './components/DosyaBilgileri';

// Özel tema oluştur
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
});

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<WelcomeScreen />} />
                        <Route path="/main" element={<MainScreen />} />
                        <Route path="/dosya-bilgileri" element={<DosyaBilgileri />} />
                        <Route path="/create-report" element={<CreateReport />} />
                        <Route path="/create-offer-forms" element={<CreateOfferForms />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            </Router>
        </ThemeProvider>
    );
};

export default App; 