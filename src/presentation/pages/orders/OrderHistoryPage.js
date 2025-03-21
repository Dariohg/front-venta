import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    AppBar,
    Toolbar,
    IconButton,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { OrderRepository } from '../../../data/repositories/OrderRepository';
import { GetClientOrdersUseCase } from '../../../core/useCases/orders/GetClientOrdersUseCase';
import { useAuth } from '../../hooks/useAuth';

// Repositorio y caso de uso
const orderRepository = new OrderRepository();
const getClientOrdersUseCase = new GetClientOrdersUseCase(orderRepository);

// Función para formatear la fecha (asumiendo que la API no devuelve fecha, pero podríamos agregarla)
const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
};

// Mapa de colores para los estados
const statusColors = {
    'Pending': 'warning',
    'Completed': 'success',
    'Cancelled': 'error',
    'Processing': 'info'
};

export const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    const { user } = useAuth();
    const navigate = useNavigate();

    // En src/presentation/pages/orders/OrderHistoryPage.js (fragmento relevante)

    const fetchOrders = async () => {
        try {
            setLoading(true);

            // Obtener el ID del cliente del usuario autenticado
            const clientId = user?.Id || 1; // Asegúrate de que estás usando la propiedad correcta (Id con I mayúscula)

            console.log("Obteniendo órdenes para el cliente ID:", clientId); // Añadir log para depuración

            const result = await getClientOrdersUseCase.execute(clientId);

            if (result.success) {
                console.log("Órdenes obtenidas:", result.data); // Añadir log para depuración
                setOrders(result.data);
            } else {
                // Si hay un error, mostrar mensaje
                setSnackbar({
                    open: true,
                    message: result.error || 'Error al cargar las órdenes',
                    severity: 'error'
                });

                // Si estamos en desarrollo, usar datos de ejemplo
                if (process.env.NODE_ENV === 'development') {
                    setOrders([
                        // Datos de ejemplo...
                    ]);
                }
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setSnackbar({
                open: true,
                message: 'Error al cargar las órdenes: ' + (error.message || 'Error desconocido'),
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Cargar órdenes al montar el componente
    useEffect(() => {
        fetchOrders();
    }, []);

    const handleRefresh = () => {
        fetchOrders();
    };

    const handleBack = () => {
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
                        onClick={handleBack}
                        aria-label="back"
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Historial de Órdenes
                    </Typography>
                    <IconButton
                        color="inherit"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Contenido principal */}
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom>
                        Mis Órdenes
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Consulta el historial de tus compras y su estado actual
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : orders.length > 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Orden #</TableCell>
                                        <TableCell>Producto ID</TableCell>
                                        <TableCell>Cantidad</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.id}</TableCell>
                                            <TableCell>{order.product_id}</TableCell>
                                            <TableCell>{order.quantity}</TableCell>
                                            <TableCell>${order.total_price.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.status}
                                                    color={statusColors[order.status] || 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                                No se encontraron órdenes en tu historial
                            </Typography>
                        </Box>
                    )}
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