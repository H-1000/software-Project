import React from 'react';
import styles from './BookingDetails.module.css';

const BookingDetails = ({ booking, onClose }) => {
  if (!booking) return null;

  console.log('Booking data in modal:', booking); // Debug log

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className={styles.modalHeader}>
          <h2>Booking Details</h2>
          <span className={`${styles.status} ${styles[!booking.event ? 'deleted' : booking.status.toLowerCase()]}`}>
            {!booking.event ? 'Deleted' : booking.status}
          </span>
        </div>

        <div className={styles.eventDetails}>
          <div className={styles.eventImage}>
            {booking.event ? (
              booking.event.image ? (
                <img src={booking.event.image} alt={booking.event.title} />
              ) : (
                <div className={styles.placeholderImage}>
                  <i className="fas fa-calendar-alt"></i>
                </div>
              )
            ) : (
              <div className={styles.deletedEventImage}>
                <i className="fas fa-exclamation-circle"></i>
              </div>
            )}
          </div>

          <div className={styles.eventInfo}>
            {booking.event ? (
              <>
                <h3>{booking.event.title}</h3>
                <p>
                  <i className="fas fa-calendar-alt"></i>
                  {new Date(booking.event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p>
                  <i className="fas fa-map-marker-alt"></i>
                  {booking.event.location}
                </p>
              </>
            ) : (
              <>
                <h3 className={styles.deletedEvent}>Event Deleted</h3>
                <p className={styles.deletedEventNote}>
                  <i className="fas fa-info-circle"></i>
                  This event has been removed by the organizer
                </p>
                <p className={styles.deletedEventNote}>
                  <i className="fas fa-exclamation-triangle"></i>
                  Event details are no longer available
                </p>
              </>
            )}
          </div>
        </div>

        <div className={styles.bookingDetails}>
          <div className={styles.detailRow}>
            <span className={styles.label}>Booking ID:</span>
            <span className={styles.value}>{booking._id}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Tickets:</span>
            <span className={styles.value}>{booking.ticketsBooked}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Total Price:</span>
            <span className={styles.value}>${booking.totalPrice.toFixed(2)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Booked On:</span>
            <span className={styles.value}>
              {new Date(booking.bookedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        <div className={styles.personalDetails}>
          <h4>Personal Details</h4>
          <div className={styles.detailRow}>
            <span className={styles.label}>Name:</span>
            <span className={styles.value}>{booking.name || 'Not provided'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{booking.email || 'Not provided'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Phone:</span>
            <span className={styles.value}>{booking.phone || 'Not provided'}</span>
          </div>
          {booking.specialRequirements && (
            <div className={styles.detailRow}>
              <span className={styles.label}>Special Requirements:</span>
              <span className={styles.value}>{booking.specialRequirements}</span>
            </div>
          )}
        </div>

        {booking.event?.description && (
          <div className={styles.eventDescription}>
            <h4>Event Description</h4>
            <p>{booking.event.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;