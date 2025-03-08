import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    TextField,
    AppBar,
    Toolbar,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Snackbar,
    Alert
} from '@mui/material';
import {
    ShoppingCart as ShoppingCartIcon,
    Menu as MenuIcon,
    Logout as LogoutIcon,
    AccountCircle as AccountCircleIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import { ProductRepository } from '../../../data/repositories/ProductRepository';
import { OrderRepository } from '../../../data/repositories/OrderRepository';
import { GetProductsUseCase } from '../../../core/useCases/products/GetProductsUseCase';
import { CreateOrderUseCase } from '../../../core/useCases/orders/CreateOrderUseCase';
import { useAuth } from '../../hooks/useAuth';

// Repositorios
const productRepository = new ProductRepository();
const orderRepository = new OrderRepository();

// Casos de uso
const getProductsUseCase = new GetProductsUseCase(productRepository);
const createOrderUseCase = new CreateOrderUseCase(orderRepository);

// Componente para tarjeta de producto
const ProductCard = ({ product, onAddToCart, isSelected, selectedQuantity, onQuantityChange }) => {
    return (
        <Card
            elevation={3}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: isSelected ? '2px solid' : '1px solid',
                borderColor: isSelected ? 'primary.main' : 'divider'
            }}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div" gutterBottom>
                    {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                    ${product.price.toFixed(2)}
                </Typography>
                <Typography variant="body2" color={product.stock > 0 ? "success.main" : "error.main"}>
                    {product.stock > 0 ? `Disponible: ${product.stock}` : "Agotado"}
                </Typography>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0 }}>
                {isSelected ? (
                    <TextField
                        type="number"
                        label="Cantidad"
                        variant="outlined"
                        fullWidth
                        InputProps={{ inputProps: { min: 1, max: product.stock } }}
                        value={selectedQuantity}
                        onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
                        size="small"
                    />
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        startIcon={<ShoppingCartIcon />}
                        disabled={product.stock <= 0}
                        onClick={() => onAddToCart(product.id)}
                    >
                        Comprar
                    </Button>
                )}
            </CardActions>
        </Card>
    );
};

export const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [anchorEl, setAnchorEl] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const navigate = useNavigate();

    // Cargar productos
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const result = await getProductsUseCase.execute();

                if (result.success) {
                    setProducts(result.data);
                } else {
                    // Si hay un error, mostrar mensaje
                    setSnackbar({
                        open: true,
                        message: result.error || 'Error al cargar los productos',
                        severity: 'error'
                    });

                    // Usar datos ficticios para desarrollo mientras tanto
                    setProducts([
                        {
                            id: 1,
                            name: "Manzana",
                            description: "Manzana roja fresca",
                            price: 10.5,
                            stock: 8
                        },
                        {
                            id: 2,
                            name: "Pera",
                            description: "Pera dulce y jugosa",
                            price: 14.5,
                            stock: 5
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                setSnackbar({
                    open: true,
                    message: 'Error al cargar los productos',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        // Implementar lógica de logout
        navigate('/login');
    };

    const handleAddToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setSelectedProduct(product);
            setQuantity(1);
        }
    };

    const handleQuantityChange = (newQuantity) => {
        const maxStock = selectedProduct?.stock || 1;
        const validQuantity = Math.min(Math.max(1, newQuantity), maxStock);
        setQuantity(validQuantity);
    };

    const handlePurchase = async () => {
        if (selectedProduct && quantity > 0) {
            try {
                // Calcular el precio total
                const totalPrice = selectedProduct.price * quantity;

                // Crear la orden usando el caso de uso
                const clientId = user?.id || 1; // Usar ID del usuario autenticado o un valor por defecto

                const result = await createOrderUseCase.execute(
                    clientId,
                    selectedProduct.id,
                    quantity,
                    totalPrice
                );

                if (result.success) {
                    // Mostrar mensaje de éxito
                    setSnackbar({
                        open: true,
                        message: `¡Compra realizada! ${quantity} ${selectedProduct.name}(s) por $${totalPrice.toFixed(2)}`,
                        severity: 'success'
                    });

                    // Actualizar la lista de productos (idealmente deberíamos recargar desde la API)
                    // Pero por ahora, simularemos actualizando el stock localmente
                    setProducts(products.map(p => {
                        if (p.id === selectedProduct.id) {
                            return {
                                ...p,
                                stock: p.stock - quantity
                            };
                        }
                        return p;
                    }));

                    // Reseteamos la selección
                    setSelectedProduct(null);
                    setQuantity(1);
                } else {
                    // Mostrar error
                    setSnackbar({
                        open: true,
                        message: result.error || 'Error al procesar la compra',
                        severity: 'error'
                    });
                }
            } catch (error) {
                console.error('Error processing purchase:', error);
                setSnackbar({
                    open: true,
                    message: 'Error al procesar la compra',
                    severity: 'error'
                });
            }
        }
    };

    const handleCancelSelection = () => {
        setSelectedProduct(null);
        setQuantity(1);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Navbar */}
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Punto de Venta
                    </Typography>
                    <Button
                        color="inherit"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/products/add')}
                        sx={{ mr: 2 }}
                    >
                        Nuevo Producto
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<ReceiptIcon />}
                        onClick={() => navigate('/orders/history')}
                        sx={{ mr: 2 }}
                    >
                        Mis Órdenes
                    </Button>
                    <div>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <AccountCircleIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleCloseMenu}
                        >
                            <MenuItem onClick={handleCloseMenu}>Perfil</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                                Cerrar Sesión
                            </MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>

            {/* Contenido principal */}
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Productos Disponibles
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Selecciona un producto para comprar
                    </Typography>
                </Box>

                {/* Productos */}
                {loading ? (
                    <Typography>Cargando productos...</Typography>
                ) : (
                    <Grid container spacing={3}>
                        {products.map((product) => (
                            <Grid item key={product.id} xs={12} sm={6} md={3}>
                                <ProductCard
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                    isSelected={selectedProduct?.id === product.id}
                                    selectedQuantity={quantity}
                                    onQuantityChange={handleQuantityChange}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Panel de compra cuando hay un producto seleccionado */}
                {selectedProduct && (
                    <Box mt={4} p={3} bgcolor="background.paper" borderRadius={2} boxShadow={3}>
                        <Typography variant="h5" gutterBottom>
                            Resumen de Compra
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1">
                                    <strong>Producto:</strong> {selectedProduct.name}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Precio unitario:</strong> ${selectedProduct.price.toFixed(2)}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Cantidad:</strong> {quantity}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h6" color="primary" sx={{ mr: 2 }}>
                                    Total: ${(selectedProduct.price * quantity).toFixed(2)}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handlePurchase}
                                    sx={{ mr: 1 }}
                                >
                                    Confirmar Compra
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleCancelSelection}
                                >
                                    Cancelar
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Container>

            {/* Notificación */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({...snackbar, open: false})}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};