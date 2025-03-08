import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Stack,
    Link,
    InputAdornment,
    IconButton,
    Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    // Esquema de validación con Yup
    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Correo electrónico inválido')
            .required('El correo electrónico es requerido'),
        password: Yup.string()
            .required('La contraseña es requerida')
            .min(6, 'La contraseña debe tener al menos 6 caracteres')
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                await login(values.email, values.password);
                navigate('/home');
            } catch (err) {
                setError(err.message || 'Error al iniciar sesión');
            } finally {
                setSubmitting(false);
            }
        }
    });

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Container maxWidth="xs" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Iniciar Sesión
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Ingresa tus credenciales para acceder
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={formik.handleSubmit}>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            id="email"
                            name="email"
                            label="Correo electrónico"
                            variant="outlined"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />

                        <TextField
                            fullWidth
                            id="password"
                            name="password"
                            label="Contraseña"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={formik.isSubmitting}
                        >
                            Iniciar Sesión
                        </Button>
                    </Stack>
                </form>

                <Box mt={3} textAlign="center">
                    <Typography variant="body2">
                        ¿No tienes una cuenta?{' '}
                        <Link component={RouterLink} to="/register" color="primary">
                            Regístrate
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};