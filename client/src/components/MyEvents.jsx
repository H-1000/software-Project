import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from './EventCard';
import styles from './MyEvents.module.css';
import axios from '../utils/axios';

const MyEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [user, setUser] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchUserAndEvents = async () => {
    try {
      setError(null);
      
      // First check if user is logged in and is an organizer
      const userResponse = await axios.get('/users/profile');
      const userData = userResponse.data;
      
      if (userData.role !== 'organizer') {
        console.log('User is not an organizer:', userData.role);
        navigate('/');
        return;
      }
      
      setUser(userData);

      // Then fetch the events
      const response = await axios.get('/users/events');
      const eventsData = response.data;
      setEvents(eventsData);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error in fetchUserAndEvents:', err);
      
      // Handle authentication errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        if (retryCount < 3) {
          console.log('Retrying fetch...', retryCount + 1);
          setRetryCount(prev => prev + 1);
          setTimeout(fetchUserAndEvents, 1000); // Retry after 1 second
        } else {
          console.log('Max retries reached, redirecting to login');
          navigate('/login');
        }
        return;
      }
      
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndEvents();
  }, [navigate]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    fetchUserAndEvents();
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="fas fa-exclamation-circle"></i>
          <h2>Error Loading Events</h2>
          <p>{error}</p>
          <div className={styles.errorActions}>
            <button 
              onClick={handleRetry}
              className={styles.retryButton}
            >
              <i className="fas fa-sync"></i> Retry
            </button>
            <button 
              onClick={() => navigate('/')}
              className={styles.backButton}
            >
              <i className="fas fa-home"></i> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => navigate('/')} className={styles.homeButton}>
            <i className="fas fa-arrow-left"></i> Back to Home
          </button>
          <h1>My Events</h1>
        </div>
        <div className={styles.headerRight}>
          <button 
            onClick={() => navigate('/my-events/analytics')}
            className={styles.analyticsButton}
          >
            <i className="fas fa-chart-bar"></i> View Analytics
          </button>
          <button 
            onClick={() => navigate('/my-events/new')}
            className={styles.createButton}
          >
            <i className="fas fa-plus"></i> Create New Event
          </button>
          <div className={styles.viewOptions}>
            <button 
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button 
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading your events...</span>
        </div>
      ) : events.length > 0 ? (
        <div className={`${styles.eventsGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
          {events.map(event => (
            <EventCard key={event._id} event={event} viewMode={viewMode} currentUser={user} />
          ))}
        </div>
      ) : (
        <div className={styles.noEvents}>
          <i className="fas fa-calendar-times"></i>
          <h2>No Events Yet</h2>
          <p>Start by creating your first event!</p>
          <button 
            onClick={() => navigate('/my-events/new')}
            className={styles.createButton}
          >
            <i className="fas fa-plus"></i> Create Event
          </button>
        </div>
      )}
    </div>
  );
};

export default MyEvents; 