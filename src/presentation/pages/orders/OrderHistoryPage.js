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

    const fetchOrders = async () => {
        try {
            setLoading(true);

            // Obtener el ID del cliente del usuario autenticado
            const clientId = user?.Id || 1; // Usar 1 como valor predeterminado para desarrollo

            const result = await getClientOrdersUseCase.execute(clientId);

            if (result.success) {
                setOrders(result.data);
            } else {
                // Si hay un error, mostrar mensaje
                setSnackbar({
                    open: true,
                    message: result.error || 'Error al cargar las órdenes',
                    severity: 'error'
                });

                // Usar datos de ejemplo para desarrollo mientras tanto
                setOrders([
                    {
                        id: 11,
                        client_id: 1,
                        product_id: 1,
                        quantity: 2,
                        status: 'Pending',
                        total_price: 21
                    },
                    {
                        id: 12,
                        client_id: 1,
                        product_id: 1,
                        quantity: 2,
                        status: 'Completed',
                        total_price: 21
                    },
                    {
                        id: 13,
                        client_id: 1,
                        product_id: 1,
                        quantity: 2,
                        status: 'Pending',
                        total_price: 21
                    }
                ]);
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