import React from 'react';
import styles from './BookingDetails.module.css';

const BookingDetails = ({ booking, onClose }) => {
  if (!booking) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Debug log to check the booking data structure
  console.log('Booking data:', {
    BookedAt: booking.BookedAt,
    eventDate: booking.event?.date
  });

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.modalHeader}>
          <h2>Booking Details</h2>
          <span className={styles.status}>
            {!booking.event ? 'Deleted' : booking.status}
          </span>
        </div>

        <div className={styles.eventDetails}>
          <div className={styles.eventImage}>
            {booking.event?.image && <img src={booking.event.image} alt={booking.event.title} />}
          </div>

          <div className={styles.eventInfo}>
            {booking.event ? (
              <>
                <h3>{booking.event.title}</h3>
                <p>{formatDate(booking.event.date)}</p>
                <p>{booking.event.location}</p>
              </>
            ) : (
              <h3>Event Deleted</h3>
            )}
          </div>
        </div>

        <div className={styles.bookingDetails}>
          <h4>Booking Information</h4>
          <div className={styles.detailRow}>
            <span>Booking ID:</span>
            <span>{booking._id}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Tickets:</span>
            <span>{booking.ticketsBooked}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Total Price:</span>
            <span>${booking.totalPrice.toFixed(2)}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Booked On:</span>
            <span>{formatDate(booking.BookedAt)}</span>
          </div>
        </div>

        {(booking.name || booking.email || booking.phone || booking.specialRequirements) && (
          <div className={styles.personalDetails}>
            <h4>Personal Details</h4>
            {booking.name && (
              <div className={styles.detailRow}>
                <span>Name:</span>
                <span>{booking.name}</span>
              </div>
            )}
            {booking.email && (
              <div className={styles.detailRow}>
                <span>Email:</span>
                <span>{booking.email}</span>
              </div>
            )}
            {booking.phone && (
              <div className={styles.detailRow}>
                <span>Phone:</span>
                <span>{booking.phone}</span>
              </div>
            )}
            {booking.specialRequirements && (
              <div className={styles.detailRow}>
                <span>Special Requirements:</span>
                <span>{booking.specialRequirements}</span>
              </div>
            )}
          </div>
        )}

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