
import React from "react";
import { useNavigate } from "react-router-dom";
import "./sidebar.css";
import logo from '../../assets/images/logo.png';
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink } from "react-router-dom";
import { signOutAdmin } from "../../services/authService";

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const result = await signOutAdmin();
        if (result.success) {
            navigate('/login');
        } else {
            alert('Failed to logout. Please try again.');
        }
    };

    return (
        <div className="sidebar">
            <div className="top-header">
                <img src={logo} alt="Waste Wise Logo" className="sidebar-logo" />
                <span className="sidebar-title">Waste Wise</span>
            </div>
            <div className="sidebar-menu">
                <ul className="list">
                    <NavLink to="/dashboard" className="link" end>
                        {({ isActive }) => (
                            <li className={isActive ? "active-item" : "list-item"}>
                                <HomeIcon className="icon" />
                                <span>Dashboard</span>
                            </li>
                        )}
                    </NavLink>

                    <NavLink to="/dashboard/citizen" className="link">
                        {({ isActive }) => (
                            <li className={isActive ? "active-item" : "list-item"}>
                                <GroupsIcon className="icon" />
                                <span>Citizens</span>
                            </li>
                        )}
                    </NavLink>
                    <NavLink to="/dashboard/drivers" className="link">
                        {({ isActive }) => (
                            <li className={isActive ? "active-item" : "list-item"}>
                                <AgricultureIcon className="icon" />
                                <span>Drivers</span>
                            </li>
                        )}
                    </NavLink>
                    <NavLink to="/dashboard/schedule" className="link">
                        {({ isActive }) => (
                            <li className={isActive ? "active-item" : "list-item"}>
                                <CalendarMonthIcon className="icon" />
                                <span>Schedules</span>
                            </li>
                        )}
                    </NavLink>
                    <NavLink to="/dashboard/issues" className="link">
                        {({ isActive }) => (
                            <li className={isActive ? "active-item" : "list-item"}>
                                <SyncProblemIcon className="icon" />
                                <span>Issues</span>
                            </li>
                        )}
                    </NavLink>
                </ul>
            </div>
            <div className="sidebar-bottom">
                <div className="logout-container" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    <LogoutIcon className="icon logout-icon" />
                    <span>Logout</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

