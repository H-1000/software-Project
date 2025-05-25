import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomeButton.module.css';

const HomeButton = () => {
  return (
    <Link to="/" className={styles.homeButton}>
      <i className="fas fa-home"></i>
      Home
    </Link>
  );
};

export default HomeButton; 