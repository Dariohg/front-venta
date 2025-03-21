import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { HomePage } from '../pages/home/HomePage';
import { AddProductPage } from '../pages/products/AddProductPage';
import { OrderHistoryPage } from '../pages/orders/OrderHistoryPage';
import {DeliveryDashboardPage} from "../pages/orders/DeliveryDashboardPage";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/products/add" element={<AddProductPage />} />
            <Route path="/orders/history" element={<OrderHistoryPage />} />
            <Route path="/delivery" element={<DeliveryDashboardPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;