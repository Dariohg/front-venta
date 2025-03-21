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

const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
};

const statusColors = {
    'pending': 'warning',
    'completed': 'success',
    'cancelled': 'error',
    'processing': 'info'
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

    // Este efecto se ejecutará cada vez que cambie el objeto user
    useEffect(() => {
        // Si no hay usuario autenticado, redirigir al login
        if (!user) {
            navigate('/login');
            return;
        }

        fetchOrders();
    }, [user, navigate]); // Dependencias importantes

    const fetchOrders = async () => {
        try {
            setLoading(true);

            // Asegurarse de usar el ID correcto del usuario actual
            const clientId = user?.Id;

            // Si no hay ID de cliente, no continuar
            if (!clientId) {
                setSnackbar({
                    open: true,
                    message: 'No se pudo identificar al usuario actual',
                    severity: 'error'
                });
                setLoading(false);
                return;
            }

            console.log("Obteniendo órdenes para el cliente ID:", clientId);

            const result = await getClientOrdersUseCase.execute(clientId);

            if (result.success) {
                console.log("Órdenes obtenidas:", result.data);
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
                    setOrders([]);
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
                                        <TableCell>Nº</TableCell>
                                        <TableCell>Producto ID</TableCell>
                                        <TableCell>Cantidad</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((order, index) => (
                                        <TableRow key={order.id || index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{order.product_id}</TableCell>
                                            <TableCell>{order.quantity}</TableCell>
                                            <TableCell>${parseFloat(order.total_price).toFixed(2)}</TableCell>
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