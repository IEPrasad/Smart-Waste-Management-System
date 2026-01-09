
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header/header';
import Sidebar from '../components/sidebar/sidebar';
import './Layout.css';

const Layout = () => {
    return (
        <div className="layout-container">
            <Header />
            <div className="layout-main">
                <Sidebar />
                <div className="layout-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
