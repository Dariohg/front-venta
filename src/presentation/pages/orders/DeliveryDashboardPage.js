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
    Button,
    Snackbar,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Card,
    CardContent,
    CardActions,
    Grid
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Home as HomeIcon,
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    CancelOutlined as CancelIcon
} from '@mui/icons-material';
import { LocalShipping as LocalShippingIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { NotificationRepository } from '../../../data/repositories/NotificationRepository';
import { GetNotificationsUseCase } from '../../../core/useCases/notifications/GetNotificationsUseCase';
import { UpdateOrderStatusUseCase } from '../../../core/useCases/notifications/UpdateOrderStatusUseCase';

// Repositorio y casos de uso
const notificationRepository = new NotificationRepository();
const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(notificationRepository);

export const DeliveryDashboardPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const result = await getNotificationsUseCase.execute();

            if (result.success) {
                setNotifications(result.data);
            } else {
                setSnackbar({
                    open: true,
                    message: result.error || 'Error al cargar las notificaciones',
                    severity: 'error'
                });

                // Datos de prueba para desarrollo
                if (process.env.NODE_ENV === 'development') {
                    setNotifications([
                        {id: 2, client_id: 1, total_price: 1499.99, status: "Pending", product_id: 1, quantity: 1},
                        {id: 3, client_id: 1, total_price: 149.99, status: "pending", product_id: 10, quantity: 1},
                        {id: 16, client_id: 5, total_price: 159.98, status: "pending", product_id: 5, quantity: 2}
                    ]);
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setSnackbar({
                open: true,
                message: 'Error al cargar las notificaciones: ' + (error.message || 'Error desconocido'),
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Actualizar cada 30 segundos
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        fetchNotifications();
    };

    const handleHome = () => {
        navigate('/home');
    };

    const handleOrderSelect = (order) => {
        setSelectedOrder(order);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedOrder(null);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const result = await updateOrderStatusUseCase.execute(orderId, newStatus);

            if (result.success) {
                // Actualizar el estado localmente
                setNotifications(prev =>
                    prev.map(order =>
                        order.id === orderId
                            ? {...order, status: newStatus}
                            : order
                    )
                );

                setSnackbar({
                    open: true,
                    message: `Pedido ${orderId} actualizado a ${newStatus}`,
                    severity: 'success'
                });
            } else {
                setSnackbar({
                    open: true,
                    message: result.error || 'Error al actualizar el estado del pedido',
                    severity: 'error'
                });
            }

            setDialogOpen(false);
        } catch (error) {
            console.error('Error updating order status:', error);
            setSnackbar({
                open: true,
                message: 'Error al actualizar el estado del pedido',
                severity: 'error'
            });
        }
    };

    const getStatusColor = (status) => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'pending':
                return 'warning';
            case 'delivered':
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'error';
            case 'in_transit':
            case 'processing':
                return 'info';
            default:
                return 'default';
        }
    };

    const renderOrderCards = () => {
        return (
            <Grid container spacing={3}>
                {notifications.map((order) => (
                    <Grid item xs={12} sm={6} md={4} key={order.id || Math.random()}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderLeft: '4px solid',
                                borderColor: theme => {
                                    const color = getStatusColor(order.status);
                                    return theme.palette[color]?.main || theme.palette.grey[500];
                                }
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    Pedido #{order.id}
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Chip
                                        label={order.status}
                                        color={getStatusColor(order.status)}
                                        size="small"
                                        sx={{ mb: 1 }}
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    <strong>Cliente:</strong> {order.client_id}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    <strong>Producto:</strong> {order.product_id}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    <strong>Cantidad:</strong> {order.quantity}
                                </Typography>
                                <Typography variant="body1" color="primary" fontWeight="bold" sx={{ mt: 2 }}>
                                    Total: ${parseFloat(order.total_price).toFixed(2)}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleOrderSelect(order)}
                                    startIcon={<AssignmentIcon />}
                                    fullWidth
                                >
                                    Gestionar Pedido
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            {/* Barra de navegación */}
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleHome}
                        aria-label="home"
                        sx={{ mr: 2 }}
                    >
                        <HomeIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Panel de Entregas
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

            {/* Dashboard Header */}
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    pt: 4,
                    pb: 3,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    mb: 3
                }}
            >
                <Container>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocalShippingIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Centro de Entregas
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Gestiona y actualiza el estado de las entregas
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                            {loading ? 'Cargando...' : `${notifications.length} pedidos disponibles`}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleRefresh}
                            startIcon={<RefreshIcon />}
                            disabled={loading}
                        >
                            Actualizar
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Contenido principal */}
            <Container sx={{ mt: 4, mb: 8 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : notifications.length > 0 ? (
                    renderOrderCards()
                ) : (
                    <Paper elevation={2} sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
                        <Typography variant="h6" color="text.secondary">
                            No hay pedidos pendientes de entrega
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Las nuevas órdenes aparecerán aquí
                        </Typography>
                    </Paper>
                )}
            </Container>

            {/* Dialog para gestionar pedido */}
            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                maxWidth="sm"
                fullWidth
            >
                {selectedOrder && (
                    <>
                        <DialogTitle>
                            Gestionar Pedido #{selectedOrder.id}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText component="div">
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Información del Pedido</strong>
                                    </Typography>
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                <strong>Cliente ID:</strong> {selectedOrder.client_id}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                <strong>Estado Actual:</strong>{' '}
                                                <Chip
                                                    label={selectedOrder.status}
                                                    color={getStatusColor(selectedOrder.status)}
                                                    size="small"
                                                />
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                <strong>Producto ID:</strong> {selectedOrder.product_id}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                <strong>Cantidad:</strong> {selectedOrder.quantity}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body1" color="primary" fontWeight="bold">
                                                Total: ${parseFloat(selectedOrder.total_price).toFixed(2)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Actualizar Estado</strong>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Selecciona una acción para este pedido:
                                    </Typography>
                                </Box>
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 2 }}>
                            <Button
                                onClick={() => handleStatusChange(selectedOrder.id, 'in_transit')}
                                variant="contained"
                                color="info"
                                startIcon={<LocalShippingIcon />}
                                sx={{ flex: 1 }}
                            >
                                En Tránsito
                            </Button>
                            <Button
                                onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                sx={{ flex: 1 }}
                            >
                                Entregado
                            </Button>
                            <Button
                                onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}
                                variant="contained"
                                color="error"
                                startIcon={<CancelIcon />}
                                sx={{ flex: 1 }}
                            >
                                Cancelar
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

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