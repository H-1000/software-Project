import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Profile.module.css';
import HomeButton from '../components/HomeButton';
import Footer from '../components/Footer';
import axios from '../utils/axios';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/users/profile');
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.response?.data?.message || 'Failed to fetch profile');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post('/users/logout');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setError(error.response?.data?.message || 'Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>No user data found</div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <HomeButton />
      <div className={styles.profileContainer}>
        <h1>Profile</h1>
        <div className={styles.profileInfo}>
          <div className={`${styles.profileField} ${styles.profilePictureContainer}`}>
            <div className={styles.pictureWrapper}>
              <img
                src={user.profilePicture || 'https://via.placeholder.com/150'} 
                alt='Profile Picture'
                className={styles.profilePicture} 
              />
            </div>
            <span className={styles.userName}>{user.name}</span>
          </div>
          <div className={styles.profileField}>
            <label>Name:</label>
            <span>{user.name}</span>
          </div>
          <div className={styles.profileField}>
            <label>Email:</label>
            <span>{user.email}</span>
          </div>
          <div className={styles.profileField}>
            <label>Role:</label>
            <span className={styles.roleTag}>{user.role}</span>
          </div>
          <div className={styles.profileField}>
            <label>Member Since:</label>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={styles.editButton} onClick={() => navigate('/profile/edit')}>
            Edit Profile
          </button>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Profile;
