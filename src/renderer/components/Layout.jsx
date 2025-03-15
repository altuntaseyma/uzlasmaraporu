import React from 'react';
import { Container, Box } from '@mui/material';

const Layout = ({ children }) => {
    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '20px'
        }}>
            <Container maxWidth="lg">
                {children}
            </Container>
        </Box>
    );
};

export default Layout; 