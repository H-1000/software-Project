import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import HomeButton from '../components/HomeButton';
import axios from '../utils/axios';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            await axios.post('/users/register', {
                name,
                email,
                password,
                role
            });
            
            setIsLoading(false);
            navigate('/login');
        } catch (error) {
            setIsLoading(false);
            setError(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <>
            <HomeButton />
            <div className={styles.registerContainer}>
                <h1>Register</h1>
                <form onSubmit={handleRegister}>
                    <input
                        className={styles.name}
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        className={styles.email}
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className={styles.password}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        className={styles.confirmPassword}
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <select
                        className={styles.role}
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="" disabled>Select Role</option>
                        <option value="user">User</option>
                        <option value="organizer">Organizer</option>
                    </select>
                    <button className={styles.registerButton} type="submit">Register</button>
                </form>
                <p className={styles.loginText}>
                    Already have an account?
                    <Link to="/login" className={styles.loginLink}>Login</Link>
                </p>
            </div>
        </>
    );
}

export default Register;
