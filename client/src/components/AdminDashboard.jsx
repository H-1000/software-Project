import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import axios from '../utils/axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [pendingEvents, setPendingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndPendingEvents = async () => {
      try {
        const userResponse = await axios.get('/users/profile');
        
        if (userResponse.data.role !== 'admin') {
          navigate('/');
          return;
        }
        
        setUser(userResponse.data);

        // Fetch events with pending status
        const response = await axios.get('/events', { params: { status: 'pending' } });
        setPendingEvents(response.data);
      } catch (err) {
        console.error('Error fetching pending events:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndPendingEvents();
  }, [navigate]);

  const handleEventAction = async (eventId, action) => {
    try {
      await axios.patch(`/events/${eventId}/status`, { status: action });
      
      // Update the local state to remove the approved/rejected event
      setPendingEvents(prevEvents => 
        prevEvents.filter(event => event._id !== eventId)
      );
    } catch (err) {
      console.error(`Error ${action} event:`, err);
      setError(err.response?.data?.message || err.message);
    }
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="fas fa-exclamation-circle"></i>
          <h2>Error Loading Events</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className={styles.backButton}>
            Back to Home
          </button>
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
          <h1>Admin Dashboard</h1>
        </div>
      </div>

      <div className={styles.dashboardCard}>
        <h2>Pending Events</h2>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Loading pending events...</span>
          </div>
        ) : pendingEvents.length > 0 ? (
          <div className={styles.eventsList}>
            {pendingEvents.map(event => (
              <div key={event._id} className={styles.eventCard}>
                <div className={styles.eventInfo}>
                  <h3>{event.title}</h3>
                  <p className={styles.organizer}>
                    <i className="fas fa-user"></i> {event.organizer.name}
                  </p>
                  <p className={styles.details}>
                    <i className="fas fa-calendar"></i> {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className={styles.details}>
                    <i className="fas fa-map-marker-alt"></i> {event.location}
                  </p>
                  <p className={styles.details}>
                    <i className="fas fa-ticket-alt"></i> {event.totalTickets} tickets at ${event.ticketPrice}
                  </p>
                  <p className={styles.description}>{event.description}</p>
                </div>
                <div className={styles.actions}>
                  <button
                    onClick={() => handleEventAction(event._id, 'approved')}
                    className={styles.approveButton}
                  >
                    <i className="fas fa-check"></i> Approve
                  </button>
                  <button
                    onClick={() => handleEventAction(event._id, 'rejected')}
                    className={styles.rejectButton}
                  >
                    <i className="fas fa-times"></i> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noEvents}>
            <i className="fas fa-check-circle"></i>
            <h3>No Pending Events</h3>
            <p>All events have been reviewed</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 