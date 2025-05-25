import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditEvent.module.css';
import axios from '../utils/axios';

const EditEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: '',
    ticketPrice: '',
    totalTickets: '',
    remainingTickets: '',
    image: ''
  });

  useEffect(() => {
    const fetchEventAndUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user profile first
        const userResponse = await axios.get('/users/profile');
        const userData = userResponse.data;
        setUser(userData);

        // Get event details
        const eventResponse = await axios.get(`/events/${eventId}`);
        const eventData = eventResponse.data;
        setEvent(eventData);

        // Check if user can edit (admin or event organizer)
        const isAdmin = userData.role === 'admin';
        const isOrganizer = eventData.organizer && userData._id === eventData.organizer._id;

        if (!isAdmin && !isOrganizer) {
          navigate('/');
          return;
        }

        // Set form data
        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          date: eventData.date ? new Date(eventData.date).toISOString().split('T')[0] : '',
          location: eventData.location || '',
          category: eventData.category || '',
          ticketPrice: eventData.ticketPrice || '',
          totalTickets: eventData.totalTickets || '',
          remainingTickets: eventData.remainingTickets || '',
          image: eventData.image || ''
        });
      } catch (error) {
        console.error('Error:', error);
        if (error.response?.status === 401) {
          navigate('/login', {
            state: {
              message: 'Please log in to edit events',
              from: `/events/${eventId}/edit`
            }
          });
          return;
        }
        setError(error.response?.data?.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndUser();
  }, [eventId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // If updating totalTickets, calculate the new remainingTickets
      if (name === 'totalTickets') {
        const soldTickets = event.totalTickets - event.remainingTickets;
        const newTotal = parseInt(value);
        const newRemaining = Math.max(0, newTotal - soldTickets);
        return {
          ...prev,
          [name]: value,
          remainingTickets: newRemaining
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        category: formData.category,
        ticketPrice: Number(formData.ticketPrice),
        totalTickets: Number(formData.totalTickets),
        image: formData.image
      };

      await axios.put(`/events/${eventId}`, eventData);
      navigate(`/events/${eventId}`);
    } catch (error) {
      console.error('Error updating event:', error);
      setError(error.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
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
          <button onClick={() => navigate(`/events/${eventId}`)} className={styles.backButton}>
            <i className="fas fa-arrow-left"></i> Back to Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate(`/events/${eventId}`)} className={styles.backButton}>
          <i className="fas fa-arrow-left"></i> Back to Event
        </button>
        <h1>Edit Event</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Event Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="image">Image URL</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="ticketPrice">Ticket Price ($)</label>
            <input
              type="number"
              id="ticketPrice"
              name="ticketPrice"
              value={formData.ticketPrice}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="totalTickets">Total Tickets</label>
            <input
              type="number"
              id="totalTickets"
              name="totalTickets"
              value={formData.totalTickets}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" onClick={() => navigate(`/events/${eventId}`)} className={styles.cancelButton}>
            Cancel
          </button>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent; 