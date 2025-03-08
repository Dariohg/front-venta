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
    Alert,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const steps = ['Información personal', 'Credenciales'];

    // Esquema de validación con Yup
    const validationSchema = [
        Yup.object({
            name: Yup.string()
                .required('El nombre es requerido')
                .min(3, 'El nombre debe tener al menos 3 caracteres'),
            address: Yup.string()
                .required('La dirección es requerida')
                .min(6, 'La dirección debe tener al menos 6 caracteres')
        }),
        Yup.object({
            email: Yup.string()
                .email('Correo electrónico inválido')
                .required('El correo electrónico es requerido'),
            password: Yup.string()
                .required('La contraseña es requerida')
                .min(8, 'La contraseña debe tener al menos 8 caracteres'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
                .required('Confirmar contraseña es requerido')
        })
    ];

    const formik = useFormik({
        initialValues: {
            name: '',
            address: '',
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationSchema: validationSchema[activeStep],
        onSubmit: async (values, { setSubmitting }) => {
            if (activeStep === 0) {
                setActiveStep(1);
                setSubmitting(false);
            } else {
                try {
                    await register(
                        values.name,
                        values.email,
                        values.password,
                        values.address
                    );
                    navigate('/home');
                } catch (err) {
                    setError(err.message || 'Error al registrarse');
                } finally {
                    setSubmitting(false);
                }
            }
        }
    });

    const handleBack = () => {
        setActiveStep(0);
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Crear Cuenta
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Completa tus datos para registrarte
                    </Typography>
                </Box>

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={formik.handleSubmit}>
                    <Stack spacing={3}>
                        {activeStep === 0 ? (
                            // Paso 1: Información personal
                            <>
                                <TextField
                                    fullWidth
                                    id="name"
                                    name="name"
                                    label="Nombre completo"
                                    variant="outlined"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                />

                                <TextField
                                    fullWidth
                                    id="address"
                                    name="address"
                                    label="Dirección"
                                    variant="outlined"
                                    multiline
                                    rows={3}
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.address && Boolean(formik.errors.address)}
                                    helperText={formik.touched.address && formik.errors.address}
                                />
                            </>
                        ) : (
                            // Paso 2: Credenciales
                            <>
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

                                <TextField
                                    fullWidth
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    label="Confirmar contraseña"
                                    type={showPassword ? 'text' : 'password'}
                                    variant="outlined"
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
                            </>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            {activeStep === 1 && (
                                <Button
                                    onClick={handleBack}
                                    variant="outlined"
                                >
                                    Atrás
                                </Button>
                            )}
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={formik.isSubmitting}
                                sx={{
                                    ml: activeStep === 1 ? 'auto' : 0,
                                    flexGrow: activeStep === 0 ? 1 : 0
                                }}
                            >
                                {activeStep === 0 ? 'Siguiente' : 'Registrarse'}
                            </Button>
                        </Box>
                    </Stack>
                </form>

                <Box mt={3} textAlign="center">
                    <Typography variant="body2">
                        ¿Ya tienes una cuenta?{' '}
                        <Link component={RouterLink} to="/login" color="primary">
                            Inicia sesión
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};