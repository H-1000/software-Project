import React from 'react';
import { Link } from 'react-router-dom';
import styles from './EventCard.module.css';

const EventCard = ({ event, viewMode = 'grid', currentUser, onApprove, onReject }) => {
  const isListView = viewMode === 'list';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = isListView ? 
      { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      } : 
      {
        month: 'short',
        day: 'numeric'
      };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return styles.statusApproved;
      case 'rejected':
        return styles.statusRejected;
      case 'pending':
        return styles.statusPending;
      default:
        return '';
    }
  };

  return (
    <div className={`${styles.card} ${isListView ? styles.listView : ''}`}>
      <div className={styles.imageContainer}>
        <img 
          src={event.image || '/default-event.jpg'} 
          alt={event.title} 
          className={styles.image}
        />
        {event.category && (
          <div className={styles.category}>{event.category}</div>
        )}
        {event.status && (
          <div className={`${styles.status} ${getStatusClass(event.status)}`}>
            {event.status}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{event.title}</h3>
        
        {/* Show description only in list view */}
        {isListView && (
          <p className={styles.description}>
            {event.description?.length > 150 
              ? `${event.description.substring(0, 150)}...` 
              : event.description}
          </p>
        )}

        <div className={styles.details}>
          {/* Always show date and location */}
          <div className={styles.date}>
            <i className="fas fa-calendar-alt"></i>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className={styles.location}>
            <i className="fas fa-map-marker-alt"></i>
            <span>{isListView ? event.location : 
              event.location?.length > 20 
                ? `${event.location.substring(0, 20)}...` 
                : event.location}
            </span>
          </div>

          {/* Show additional details only in list view */}
          {isListView && (
            <>
              <div className={styles.price}>
                <i className="fas fa-ticket-alt"></i>
                <span>${event.ticketPrice}</span>
              </div>
              {event.organizer && (
                <div className={styles.organizer}>
                  <i className="fas fa-user"></i>
                  <span>{event.organizer.name}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.actions}>
          <Link to={`/events/${event._id}`} className={styles.button}>
            <i className="fas fa-eye"></i>
            {isListView ? 'View Details' : 'View'}
          </Link>

          {isListView && onApprove && onReject && (
            <div className={styles.listViewAdminActions}>
              <button
                onClick={onApprove}
                className={styles.approveButton}
              >
                <i className="fas fa-check"></i> Approve
              </button>
              <button
                onClick={onReject}
                className={styles.rejectButton}
              >
                <i className="fas fa-times"></i> Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard; 