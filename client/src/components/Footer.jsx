import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>About Us</h3>
          <p>Your premier platform for discovering and managing events. Connect, celebrate, and create memorable experiences.</p>
        </div>

        <div className={styles.footerSection}>
          <h3>Contact</h3>
          <ul>
            <li><i className="fas fa-envelope"></i> support@eventplatform.com</li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Follow Us</h3>
          <div className={styles.socialLinks}>
            <a href="#" className={styles.socialLink}><i className="fab fa-facebook"></i></a>
            <a href="#" className={styles.socialLink}><i className="fab fa-twitter"></i></a>
            <a href="#" className={styles.socialLink}><i className="fab fa-instagram"></i></a>
            <a href="#" className={styles.socialLink}><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <p>&copy; 2024 Event Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 