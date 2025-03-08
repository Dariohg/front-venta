import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#38A169', // Verde principal
        },
        secondary: {
            main: '#9EEECA', // Verde más claro
        },
        background: {
            default: '#121212',
            paper: '#1E1E1E',
        },
    },
    typography: {
        fontFamily: "'Roboto', 'Segoe UI', sans-serif",
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                },
            },
        },
    },
});

export default theme;