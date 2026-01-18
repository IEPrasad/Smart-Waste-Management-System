import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import backgroundImage from '../../assets/images/background.jpg';
import emblem from '../../assets/images/Emblem.png';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import EyeIcon from '@mui/icons-material/RemoveRedEye';
import EyeSlashIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import Alert from '@mui/material/Alert';

import { signInAdmin } from '../../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'error', message: '' });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setAlert({ show: false, type: 'error', message: '' });

        const result = await signInAdmin(email, password);

        if (result.success) {
            setAlert({ show: true, type: 'success', message: 'Login successful! Redirecting...' });
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } else {
            setAlert({ show: true, type: 'error', message: result.error });
            // Auto-hide error after 5 seconds
            setTimeout(() => {
                setAlert({ show: false, type: 'error', message: '' });
            }, 5000);
        }

        setIsLoading(false);
    };

    return (
        <div className="login-wrapper">
            {alert.show && (
                <Alert
                    severity={alert.type}
                    onClose={() => setAlert({ show: false, type: 'error', message: '' })}
                    sx={{
                        position: 'fixed',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        minWidth: '300px',
                        maxWidth: '500px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                >
                    {alert.message}
                </Alert>
            )}
            <div className="background-blur-overlay"></div>

            <div className="login-container">
                <div className="left-section">
                    <div className="logo-container">
                        <img src={emblem} alt="Emblem" className="emblem-logo" />
                    </div>
                    <div className="text-container">
                        <h1 className="sinhala-title">
                            බෝපේ පෝද්දල <br /> ප්‍රාදේශීය සභාව
                        </h1>
                        <h2 className="english-title">
                            Bope Poddala Pradeshiya Sabha
                        </h2>
                        <h3 className="sub-title">
                            Waste Management Admin Portal
                        </h3>
                    </div>
                </div>

                <div className="vertical-divider"></div>

                <div className="right-section">
                    <div className="login-box">
                        <h2 className="login-header">Admin Portal Login</h2>

                        <form className="login-form" onSubmit={handleLogin}>
                            <div className="input-group">
                                <label>Email</label>
                                <div className="input-wrapper">
                                    <span className="icon-left"><EmailIcon /></span>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <span className="icon-left"><LockIcon /></span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="************"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <span className="icon-right" onClick={togglePasswordVisibility}>
                                        {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                                    </span>
                                </div>
                            </div>

                            <div className="forgot-password">
                                <a href="#">Forgot Password?</a>
                            </div>

                            <button type="submit" className="login-btn" disabled={isLoading}>
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="access-warning">
                            <span className="lock-icon">🔒</span> Authorized Access Only
                        </div>
                    </div>
                </div>
            </div>

            <footer className="login-footer">
                © 2025 Bope Poddala PS
            </footer>
        </div>
    );
};

export default Login;
