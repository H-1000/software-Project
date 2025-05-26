import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './BookingForm.module.css';
import axios from '../utils/axios';

const BookingForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    numberOfTickets: 1,
    name: '',
    email: '',
    phone: '',
    specialRequirements: ''
  });
  const [displayedRemainingTickets, setDisplayedRemainingTickets] = useState(0);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/events/${eventId}`);
        setEvent(response.data);
        setDisplayedRemainingTickets(response.data.remainingTickets);
        
        // If no tickets remaining, show error
        if (response.data.remainingTickets === 0) {
          setError('Sorry, this event is sold out!');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numberOfTickets') {
      const numTickets = value === '' ? 0 : parseInt(value);
      // Only update if the value is valid and doesn't exceed remaining tickets
      if (!isNaN(numTickets) && numTickets >= 0 && numTickets <= event.remainingTickets) {
        setDisplayedRemainingTickets(event.remainingTickets - numTickets);
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double check if tickets are still available
    if (formData.numberOfTickets > event.remainingTickets) {
      setError('Sorry, the requested number of tickets is no longer available.');
      return;
    }
    
    try {
      const bookingData = {
        eventId: eventId,
        ticketsBooked: parseInt(formData.numberOfTickets),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialRequirements: formData.specialRequirements
      };

      console.log('Sending booking data:', bookingData); // Debug log
      
      const response = await axios.post('/bookings', bookingData);
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setError(null);
        // Navigate after showing success message for 2 seconds
        setTimeout(() => {
          navigate(`/booking-confirmation/${response.data.booking._id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.response?.data?.message || 'Failed to book tickets');
      setSuccess(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading booking form...</span>
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
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <i className="fas fa-arrow-left"></i> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <i className="fas fa-check-circle"></i>
          <h2>Booking Successful!</h2>
          <p>Your tickets have been booked successfully. Redirecting to confirmation page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1>Book Tickets</h1>
        {event && (
          <div className={styles.eventSummary}>
            <h2>{event.title}</h2>
            <p>
              <i className="fas fa-calendar-alt"></i>
              {new Date(event.date).toLocaleDateString('en-US', {
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
              {event.location}
            </p>
            <div className={styles.ticketInfo}>
              {event.ticketPrice && (
                <p className={styles.price}>
                  <i className="fas fa-ticket-alt"></i>
                  ${event.ticketPrice} per ticket
                </p>
              )}
              <p className={`${styles.remainingTickets} ${displayedRemainingTickets < 10 ? styles.lowStock : ''}`}>
                <i className="fas fa-users"></i>
                {displayedRemainingTickets} tickets remaining
                {formData.numberOfTickets > 1 && (
                  <span className={styles.ticketNote}>
                    (after your selection)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="numberOfTickets">
              Number of Tickets
              <span className={styles.maxTickets}>
                (Max: {event?.remainingTickets || 0})
              </span>
            </label>
            <input
              type="number"
              id="numberOfTickets"
              name="numberOfTickets"
              min="1"
              max={event?.remainingTickets || 0}
              value={formData.numberOfTickets}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="specialRequirements">Special Requirements (Optional)</label>
            <textarea
              id="specialRequirements"
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          {event && event.ticketPrice && (
            <div className={styles.totalPrice}>
              <h3>Total Price: ${(event.ticketPrice * formData.numberOfTickets).toFixed(2)}</h3>
            </div>
          )}

          <div className={styles.formActions}>
            <button type="button" onClick={() => navigate(-1)} className={styles.backButton}>
              <i className="fas fa-arrow-left"></i> Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={event?.remainingTickets === 0}
            >
              <i className="fas fa-ticket-alt"></i> Book Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
