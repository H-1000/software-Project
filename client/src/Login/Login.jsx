import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './Login.module.css';
import { useState, useEffect } from 'react';
import HomeButton from '../components/HomeButton';
import axios from '../utils/axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Set message if redirected from a protected route
        if (location.state?.message) {
            setMessage(location.state.message);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post('/users/login', {
                email,
                password
            });
            
            // If login successful, redirect to the intended page or home
            const redirectTo = location.state?.from || '/';
            navigate(redirectTo);
        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                // Server responded with an error
                setError(error.response.data.message || 'Login failed');
            } else if (error.request) {
                // Request was made but no response received
                setError('No response from server. Please try again.');
              } else {
                // Something else went wrong
                setError('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
            }
          };
            
          return (
        <>
            <HomeButton />
            <div className={styles.loginContainer}>
              <h1>Login</h1>
                {message && (
                    <div className={styles.message}>
                        {message}
                    </div>
                )}
                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                <input
                  className={styles.email}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                        disabled={isLoading}
                />
                <input
                  className={styles.password}
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                        disabled={isLoading}
                />
                    <button 
                        className={styles.loginButton} 
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
              </form>
                <div className={styles.links}>
                    <Link to="/forgot-password" className={styles.forgotPassword}>
                        Forgot Password?
                    </Link>
              <p className={styles.registerText}>
                Don't have an account?{' '}
                        <Link to="/register" className={styles.registerLink}>
                            Register
                        </Link>
              </p>
                </div>
            </div>
        </>
          );
        }

export default Login;