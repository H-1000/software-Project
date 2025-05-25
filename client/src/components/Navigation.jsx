import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navigation.module.css';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user } = useAuth();

  return (
    <nav className={styles.nav}>
      {user?.role === 'admin' && (
        <Link to="/admin" className={styles.navLink}>
          <i className="fas fa-shield-alt"></i>
          Admin Dashboard
        </Link>
      )}
    </nav>
  );
};

export default Navigation; 