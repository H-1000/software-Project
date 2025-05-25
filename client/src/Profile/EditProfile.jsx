import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EditProfile.module.css';
import axios from '../utils/axios';

function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const defaultProfilePicture = 'http://localhost:5000/uploads/defaultPP.JPG';

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/users/profile');
        const userData = response.data;
        setName(userData.name || '');
        setEmail(userData.email || '');
        setProfilePicture(userData.profilePicture || defaultProfilePicture);
        setPreviewUrl(userData.profilePicture || defaultProfilePicture);
        setError(null);
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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage('');
    setLoading(true);

    try {
      // First update profile picture if a new one was selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('profilePicture', selectedFile);

        const pictureResponse = await axios.post('/users/profile/picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setProfilePicture(pictureResponse.data.profilePicture);
      }

      // Then update profile information
      const response = await axios.put('/users/profile', {
        name,
        email
      });

      if (response.data.message) {
        setMessage(response.data.message);
        // Update local state with the returned user data
        if (response.data.user) {
          setName(response.data.user.name);
          setEmail(response.data.user.email);
        }
        // Navigate back to profile after a short delay
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !name && !email) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editProfileContainer}>
      <h1>Edit Profile</h1>
      {error && (
        <div className={styles.error}>
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      )}
      {message && (
        <div className={styles.success}>
          <i className="fas fa-check-circle"></i>
          <p>{message}</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className={styles.profilePictureSection}>
          <div className={styles.pictureWrapper} onClick={handleImageClick}>
            <img
              src={previewUrl || defaultProfilePicture}
              alt="Profile"
              className={styles.profilePicture}
            />
            <div className={styles.uploadOverlay}>
              <i className="fas fa-camera"></i>
              <span>{loading ? 'Saving...' : 'Change Picture'}</span>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className={styles.fileInput}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className={styles.actions}>
          <button type="submit" className={styles.saveButton} disabled={loading}>
            {loading ? (
              <>
                <div className={styles.buttonSpinner}></div>
                <span>Saving...</span>
              </>
            ) : (
              'Save Changes'
            )}
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate('/profile')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile; 