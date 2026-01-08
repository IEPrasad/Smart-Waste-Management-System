
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
// Import Login if needed, or other pages. 
// Assuming Login exists in pages/login/login.jsx based on file listing.
import Login from './pages/login/login';

const Dashboard = () => <h2>Dashboard</h2>;
const Citizen = () => <h2>Citizens List</h2>;
const Drivers = () => <h2>Drivers List</h2>;
const Schedule = () => <h2>Schedules</h2>;
const Issues = () => <h2>Issues</h2>;

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes utilizing the Layout */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="citizen" element={<Citizen />} />
                    <Route path="drivers" element={<Drivers />} />
                    <Route path="schedule" element={<Schedule />} />
                    <Route path="issues" element={<Issues />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
