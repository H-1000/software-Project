import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './EventDetails.module.css';
import axios from '../utils/axios';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [canManageEvent, setCanManageEvent] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch event details first
        const eventResponse = await axios.get(`/events/${eventId}`);
        const eventData = eventResponse.data;
        setEvent(eventData);

        // Try to get user profile if logged in
        try {
          const userResponse = await axios.get('/users/profile');
          const userData = userResponse.data;
          setUser(userData);

          // Check if user can manage event (admin or event organizer)
          const isAdmin = userData.role === 'admin';
          const isOrganizer = eventData.organizer && userData._id === eventData.organizer._id;
          setCanManageEvent(isAdmin || isOrganizer);
        } catch (userError) {
          // If user is not logged in, just continue showing the event
          console.log('User not logged in');
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.response?.data?.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  const handleDelete = async () => {
    if (!user) {
      navigate('/login', { 
        state: { 
          message: 'Please log in to delete events',
          from: `/events/${eventId}`
        } 
      });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await axios.delete(`/events/${eventId}`);
      navigate('/');
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(console.error);
    }
  };

  const handleRegister = () => {
    if (!user) {
      navigate('/login', { 
        state: { 
          message: 'Please log in to register for events',
          from: `/events/${eventId}`,
        }, 
      });
      return;
    }

    // Only allow standard users to register
    if (user.role !== 'user') {
      setError('Only standard users can register for events.');
      return;
    }

    navigate(`/events/${eventId}/book`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading event details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="fas fa-exclamation-circle"></i>
          <h2>Error Loading Event</h2>
          <p>{error}</p>
          <Link to="/" className={styles.backButton}>
            <i className="fas fa-arrow-left"></i> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="fas fa-calendar-times"></i>
          <h2>Event Not Found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className={styles.backButton}>
            <i className="fas fa-arrow-left"></i> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/" className={styles.backButton}>
          <i className="fas fa-arrow-left"></i> Back to Events
        </Link>
        {canManageEvent && (
          <div className={styles.organizerActions}>
            <button 
              onClick={() => navigate(`/events/${eventId}/edit`)}
              className={styles.editButton}
            >
              <i className="fas fa-edit"></i> Edit Event
            </button>
            <button 
              onClick={handleDelete}
              className={styles.deleteButton}
            >
              <i className="fas fa-trash"></i> Delete Event
            </button>
          </div>
        )}
      </div>
      
      <div className={styles.eventContent}>
        <div className={styles.imageSection}>
          <img 
            src={event.image || 'https://via.placeholder.com/800x400'} 
            alt={event.title} 
            className={styles.eventImage}
          />
          {event.category && (
            <span className={styles.category}>{event.category}</span>
          )}
        </div>

        <div className={styles.detailsSection}>
          <h1 className={styles.title}>{event.title}</h1>
          
          <div className={styles.metadata}>
            <div className={styles.metaItem}>
              <i className="fas fa-map-marker-alt"></i>
              <span>{event.location}</span>
            </div>
            <div className={styles.metaItem}>
              <i className="fas fa-calendar-alt"></i>
              <span>{new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            {event.ticketPrice && (
              <div className={styles.metaItem}>
                <i className="fas fa-ticket-alt"></i>
                <span>${event.ticketPrice}</span>
              </div>
            )}
            {event.remainingTickets !== undefined && (
              <div className={styles.metaItem}>
                <i className="fas fa-users"></i>
                <span>{event.remainingTickets} tickets remaining</span>
              </div>
            )}
          </div>

          <div className={styles.description}>
            <h2>About This Event</h2>
            <p>{event.description}</p>
          </div>

          {event.organizer && (
            <div className={styles.organizer}>
              <h2>Event Organizer</h2>
              <div className={styles.organizerInfo}>
                <div className={styles.organizerImage}>
                  {event.organizer.profilePicture ? (
                    <img 
                      src={event.organizer.profilePicture} 
                      alt={event.organizer.name} 
                      className={styles.organizerAvatar}
                    />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
                <div className={styles.organizerDetails}>
                  <h3>{event.organizer.name}</h3>
                  {event.organizer.email && <p>{event.organizer.email}</p>}
                </div>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            {event.status === 'approved' && (
              <>
                <button 
                  onClick={handleRegister}
                  className={styles.registerButton}
                  disabled={event.remainingTickets === 0 || user?.role === 'admin' || user?.role === 'organizer'}
                >
                  {event.remainingTickets === 0 ? 'Sold Out' : 
                   user?.role === 'admin' ? 'Admins Cannot Register' :
                   user?.role === 'organizer' ? 'Organizers Cannot Register' :
                   'Register for Event'}
                  <i className="fas fa-arrow-right"></i>
                </button>
                <button 
                  className={styles.shareButton}
                  onClick={handleShare}
                >
                  <i className="fas fa-share-alt"></i>
                  Share Event
                </button>
              </>
            )}
            {event.status !== 'approved' && user && (user.role === 'admin' || (user.role === 'organizer' && user._id === event.organizer?._id)) && (
              <div className={styles.statusBadge}>
                <i className={`fas ${
                  event.status === 'pending' ? 'fa-clock' : 'fa-times-circle'
                }`}></i>
                Event {event.status === 'pending' ? 'Pending Approval' : 'Rejected'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;