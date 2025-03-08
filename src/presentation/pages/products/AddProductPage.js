import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    AppBar,
    Toolbar,
    IconButton,
    Snackbar,
    Alert,
    InputAdornment
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ProductRepository } from '../../../data/repositories/ProductRepository';
import { CreateProductUseCase } from '../../../core/useCases/products/CreateProductUseCase';

// Repositorio y caso de uso
const productRepository = new ProductRepository();
const createProductUseCase = new CreateProductUseCase(productRepository);

export const AddProductPage = () => {
    const navigate = useNavigate();
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Esquema de validación con Yup
    const validationSchema = Yup.object({
        name: Yup.string()
            .required('El nombre es requerido')
            .min(2, 'El nombre debe tener al menos 2 caracteres'),
        description: Yup.string()
            .required('La descripción es requerida')
            .min(2, 'La descripción debe tener al menos 2 caracteres'),
        price: Yup.number()
            .required('El precio es requerido')
            .positive('El precio debe ser positivo')
            .min(0.01, 'El precio mínimo es 0.01'),
        stock: Yup.number()
            .required('El stock es requerido')
            .integer('El stock debe ser un número entero')
            .min(0, 'El stock no puede ser negativo')
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            price: '',
            stock: ''
        },
        validationSchema,
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            try {
                // Crear producto usando el caso de uso
                const result = await createProductUseCase.execute(
                    values.name,
                    values.description,
                    parseFloat(values.price),
                    parseInt(values.stock)
                );

                if (result.success) {
                    // Mostrar mensaje de éxito
                    setSnackbar({
                        open: true,
                        message: 'Producto creado exitosamente',
                        severity: 'success'
                    });

                    // Limpiar formulario
                    resetForm();

                    // Opcional: redirigir después de unos segundos
                    setTimeout(() => {
                        navigate('/home');
                    }, 2000);
                } else {
                    // Mostrar error
                    setSnackbar({
                        open: true,
                        message: result.error || 'Error al crear el producto',
                        severity: 'error'
                    });
                }
            } catch (error) {
                console.error('Error al crear producto:', error);
                setSnackbar({
                    open: true,
                    message: 'Error al crear el producto: ' + (error.message || 'Error desconocido'),
                    severity: 'error'
                });
            } finally {
                setSubmitting(false);
            }
        }
    });

    const handleClose = () => {
        navigate('/home');
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Barra de navegación */}
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="back"
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Agregar Nuevo Producto
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Contenido principal */}
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                        Información del Producto
                    </Typography>

                    <form onSubmit={formik.handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="name"
                                    name="name"
                                    label="Nombre del producto"
                                    variant="outlined"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="description"
                                    name="description"
                                    label="Descripción"
                                    variant="outlined"
                                    multiline
                                    rows={3}
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.description && Boolean(formik.errors.description)}
                                    helperText={formik.touched.description && formik.errors.description}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    id="price"
                                    name="price"
                                    label="Precio"
                                    variant="outlined"
                                    type="number"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        inputProps: { step: "0.01", min: "0.01" }
                                    }}
                                    value={formik.values.price}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.price && Boolean(formik.errors.price)}
                                    helperText={formik.touched.price && formik.errors.price}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    id="stock"
                                    name="stock"
                                    label="Stock disponible"
                                    variant="outlined"
                                    type="number"
                                    InputProps={{
                                        inputProps: { min: "0" }
                                    }}
                                    value={formik.values.stock}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.stock && Boolean(formik.errors.stock)}
                                    helperText={formik.touched.stock && formik.errors.stock}
                                />
                            </Grid>

                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleClose}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SaveIcon />}
                                        disabled={formik.isSubmitting}
                                    >
                                        {formik.isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Container>

            {/* Notificación */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};