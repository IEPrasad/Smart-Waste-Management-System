
import React from "react";
import "./sidebar.css";
import logo from '../../assets/images/logo.png';
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="top-header">
                <img src={logo} alt="Waste Wise Logo" className="sidebar-logo" />
                <span className="sidebar-title">Waste Wise</span>
            </div>
            <div className="sidebar-menu">
                <ul className="list">
                    <NavLink to="/" className="link" end>
                        {({ isActive }) => (
                            <li className={isActive ? "active-item" : "list-item"}>
                                <HomeIcon className="icon" />
                                <span>Dashboard</span>
                            </li>
                        )}
                    </NavLink>

                    <NavLink to="/citizen" className="link">
                        {({ isActive }) => (
                            <li className={isActive ? "active-item" : "list-item"}>
                                <GroupsIcon className="icon" />
                                <span>Citizens</span>
                            </li>
                        )}
                    </NavLink>
                    <NavLink to="/drivers" className="link">
                        {({ isActive }) => (
                            <li className={isActive ? "active-item" : "list-item"}>
                                <AgricultureIcon className="icon" />
                                <span>Drivers</span>
                            </li>
                        )}
                    </NavLink>
                    <NavLink to="/schedule" className="link">
                        {({ isActive }) => (
                            <li className={isActive ? "active-item" : "list-item"}>
                                <CalendarMonthIcon className="icon" />
                                <span>Schedules</span>
                            </li>
                        )}
                    </NavLink>
                    <NavLink to="/issues" className="link">
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
                <div className="logout-container">
                    <LogoutIcon className="icon logout-icon" />
                    <span>Logout</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
