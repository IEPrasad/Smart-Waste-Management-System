import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import backgroundImage from '../../assets/images/background.jpg';
import emblem from '../../assets/images/Emblem.png';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import EyeIcon from '@mui/icons-material/RemoveRedEye';
import EyeSlashIcon from '@mui/icons-material/RemoveRedEyeOutlined';



import { supabase } from '../../lib/supabaseClient';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isSignUp, setIsSignUp] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                // Allow the user to act as admin. 
                // Insert into admin table. (Assuming table name is 'admin' and columns 'id', 'email')
                if (data.user) {
                    const { error: insertError } = await supabase
                        .from('admin')
                        .insert([{ id: data.user.id, email: email }]);

                    if (insertError) {
                        console.error("Error adding to admin table:", insertError);
                        // Optional: clean up auth user if admin insert fails
                    }
                }

                alert("Account created! Please check your email to confirm your account before logging in.");
                setIsSignUp(false);
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // Check if user is in admin table
                const { data: adminData, error: adminError } = await supabase
                    .from('admin')
                    .select('id')
                    .eq('id', data.user.id)
                    .single();

                if (adminError || !adminData) {
                    await supabase.auth.signOut();
                    throw new Error("Unauthorized: Access restricted to system administrators.");
                }

                navigate('/');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
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
                        <h2 className="login-header">{isSignUp ? 'Create Admin Account' : 'Admin Portal Login'}</h2>

                        <form className="login-form" onSubmit={handleAuth}>
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

                            {!isSignUp && (
                                <div className="forgot-password">
                                    <a href="#">Forgot Password?</a>
                                </div>
                            )}

                            <button type="submit" className="login-btn" disabled={isLoading}>
                                {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log in')}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem' }}>
                                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                                <span
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    {isSignUp ? "Log In" : "Sign Up"}
                                </span>
                            </div>
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
