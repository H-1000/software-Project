import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './ForgotPassword.module.css';
import axios from '../utils/axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters long');
      setLoading(false);
      return;
    }

    // Validate old and new passwords are different
    if (oldPassword === newPassword) {
      setError('New password must be different from old password');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put('/users/forgetPassword', {
        email,
        oldPassword,
        newPassword
      });

      if (response.data.message === "Password updated successfully") {
        setSuccess('Password updated successfully');
        // Only redirect on successful password change
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      // Clear password fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      if (error.response) {
        // Show the specific error message from the server
        setError(error.response.data.message || 'Failed to change password');
      } else if (error.request) {
        setError('No response from server. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <h1>Reset Password</h1>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter your email"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="oldPassword">Current Password</label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter current password"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter new password"
            minLength="4"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="Confirm new password"
            minLength="4"
          />
        </div>
        <div className={styles.actions}>
          <button type="submit" className={styles.resetButton} disabled={loading}>
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
          <Link to="/login" className={styles.backToLogin}>
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword; 