import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import Login from './pages/login/login';
import { checkAdminAuth } from './services/authService';

import Drivers from './pages/Driver/Drivers';
import Citizen from './pages/citizen/Citizen';
import Schedule from './pages/Schedule/Schedule';
import Issues from './pages/Issues/Issues';

import Dashboard from './pages/dashboard/dashboard';
import Finance from './pages/Finance/Finance';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const verifyAuth = async () => {
            const result = await checkAdminAuth();
            setIsAuthenticated(result.isAdmin);
        };
        verifyAuth();
    }, []);

    // Show loading while checking auth
    if (isAuthenticated === null) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Login as the default/first page */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes utilizing the Layout */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="citizens" element={<Citizen />} />
                    <Route path="drivers" element={<Drivers />} />
                    <Route path="schedule" element={<Schedule />} />
                    <Route path="issues" element={<Issues />} />
                    <Route path="finance" element={<Finance />} />
                </Route>

                {/* Redirect root to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
