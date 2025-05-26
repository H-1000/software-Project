import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import styles from './MyBookings.module.css';
import BookingDetails from './BookingDetails';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        
        const response = await axios.get('/bookings/my');
        console.log('Response from server:', response.data); // Debug log
        
        if (!Array.isArray(response.data)) {
          console.error('Invalid response format:', response.data);
          throw new Error('Invalid response format from server');
        }

        // Sort bookings: Active first, then Canceled, then Deleted
        const sortedBookings = response.data.sort((a, b) => {
          // Put deleted events at the bottom
          if (!a.event && b.event) return 1;
          if (a.event && !b.event) return -1;
          
          // Then put canceled ones above deleted but below others
          if (a.status === 'Canceled' && b.status !== 'Canceled' && b.event) return 1;
          if (a.status !== 'Canceled' && b.status === 'Canceled' && a.event) return -1;
          
          // For same status bookings, sort by date
          const dateA = a.event ? new Date(a.event.date) : new Date(a.BookedAt);
          const dateB = b.event ? new Date(b.event.date) : new Date(b.BookedAt);
          return dateB - dateA;
        });
        
        setBookings(sortedBookings);
      } catch (error) {
        console.error('Error details:', error.response || error);
        if (error.response?.status === 401) {
          navigate('/login', {
            state: {
              message: 'Please log in to view your bookings',
              from: '/bookings'
            }
          });
          return;
        }
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error 
          || error.message 
          || 'Failed to load bookings';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      console.log('Attempting to cancel booking:', bookingId); // Debug log
      const response = await axios.delete(`/bookings/${bookingId}`);
      
      if (response.data && response.data.booking) {
        // Update the booking in the state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking._id === bookingId ? response.data.booking : booking
          )
        );
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel booking';
      setError(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading your bookings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="fas fa-exclamation-circle"></i>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className={styles.backButton}>
            <i className="fas fa-arrow-left"></i> Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>My Bookings</h1>
        
        {bookings.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-ticket-alt"></i>
            <h2>No Bookings Yet</h2>
            <p>You haven't made any bookings yet. Explore our events and book your tickets!</p>
            <button onClick={() => navigate('/')} className={styles.exploreButton}>
              <i className="fas fa-search"></i> Explore Events
            </button>
          </div>
        ) : (
          <div className={styles.bookingsList}>
            {bookings.map((booking) => (
              <div key={booking._id} className={styles.bookingCard}>
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
                
                <div className={styles.bookingInfo}>
                  {booking.event ? (
                    <>
                      <h2>{booking.event.title}</h2>
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
                      <h2 className={styles.deletedEvent}>Event Deleted</h2>
                      <p className={styles.deletedEventNote}>
                        <i className="fas fa-info-circle"></i>
                        This event has been removed by the organizer
                      </p>
                    </>
                  )}
                  <p>
                    <i className="fas fa-ticket-alt"></i>
                    {booking.ticketsBooked} {booking.ticketsBooked === 1 ? 'ticket' : 'tickets'}
                  </p>
                  <p className={styles.totalPrice}>
                    <i className="fas fa-money-bill-wave"></i>
                    Total: ${booking.totalPrice.toFixed(2)}
                  </p>
                  <div className={styles.bookingStatus}>
                    <span className={`${styles.status} ${styles[(!booking.event ? 'deleted' : booking.status.toLowerCase())]}`}>
                      {!booking.event ? 'Deleted' : booking.status}
                    </span>
                  </div>
                </div>

                <div className={styles.bookingActions}>
                  {booking.event ? (
                    <button
                      onClick={() => navigate(`/events/${booking.event._id}`)}
                      className={styles.viewButton}
                    >
                      <i className="fas fa-eye"></i> View Event
                    </button>
                  ) : (
                    <button
                      className={`${styles.viewButton} ${styles.disabled}`}
                      disabled
                    >
                      <i className="fas fa-eye-slash"></i> Event Unavailable
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className={styles.detailsButton}
                  >
                    <i className="fas fa-info-circle"></i> View Details
                  </button>
                  {booking.status !== 'Canceled' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className={`${styles.cancelButton} ${!booking.event ? styles.disabled : ''}`}
                      disabled={!booking.event}
                      title={!booking.event ? "Cannot cancel booking for deleted event" : ""}
                    >
                      <i className="fas fa-times"></i> Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default MyBookings;