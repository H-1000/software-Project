import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from './EventCard';
import styles from './Events.module.css';
import axios from '../utils/axios';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [selectedOrganizer, setSelectedOrganizer] = useState('all');
  const [organizers, setOrganizers] = useState([]);

  useEffect(() => {
    const fetchUserAndEvents = async () => {
      try {
        // First fetch user profile to ensure admin access
        const userResponse = await axios.get('/users/profile');
        
        if (userResponse.data.role !== 'admin') {
          navigate('/');
          return;
        }
        
        setUser(userResponse.data);

        // Fetch all events
        const response = await axios.get('/events/all');
        const data = response.data;
        setEvents(data);
        
        // Extract unique organizers
        const uniqueOrganizers = data
          .filter(event => event.organizer && event.organizer.name && event.organizer._id)
          .map(event => ({
            name: event.organizer.name,
            id: event.organizer._id
          }))
          .filter((organizer, index, self) => 
            index === self.findIndex((o) => o.id === organizer.id)
          );
        
        setOrganizers(uniqueOrganizers);
      } catch (err) {
        console.error('Error in fetchUserAndEvents:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndEvents();
  }, [navigate]);

  const handleEventAction = async (eventId, action) => {
    try {
      await axios.patch(`/events/${eventId}/status`, { status: action });
      // Update the local state to reflect the change
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === eventId 
            ? { ...event, status: action }
            : event
        )
      );
    } catch (error) {
      console.error(`Error ${action} event:`, error);
      setError(error.response?.data?.message || `Failed to ${action} event`);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter !== 'all' && event.status !== filter) {
      return false;
    }
    if (selectedOrganizer !== 'all') {
      if (!event.organizer || event.organizer._id !== selectedOrganizer) {
        return false;
      }
    }
    return true;
  });

  const handleStatusFilter = (status) => {
    setFilter(status);
  };

  const handleOrganizerFilter = (organizerId) => {
    setSelectedOrganizer(organizerId);
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="fas fa-exclamation-circle"></i>
          <h2>Error Loading Events</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/')}
            className={styles.backButton}
          >
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
          <button 
            onClick={() => navigate('/')}
            className={styles.homeButton}
          >
            <i className="fas fa-arrow-left"></i> Back to Home
          </button>
          <h1>All Events</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.filters}>
            <div className={styles.statusFilter}>
              <button
                className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                onClick={() => handleStatusFilter('all')}
              >
                All
              </button>
              <button
                className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
                onClick={() => handleStatusFilter('pending')}
              >
                Pending
              </button>
              <button
                className={`${styles.filterButton} ${filter === 'approved' ? styles.active : ''}`}
                onClick={() => handleStatusFilter('approved')}
              >
                Approved
              </button>
              <button
                className={`${styles.filterButton} ${filter === 'rejected' ? styles.active : ''}`}
                onClick={() => handleStatusFilter('rejected')}
              >
                Rejected
              </button>
            </div>
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
      </div>

      <div className={styles.organizerFilter}>
        <h3>Filter by Organizer</h3>
        <div className={styles.organizerButtons}>
          <button
            className={`${styles.organizerButton} ${selectedOrganizer === 'all' ? styles.active : ''}`}
            onClick={() => handleOrganizerFilter('all')}
          >
            All Organizers
          </button>
          {organizers.length > 0 ? (
            organizers.map(organizer => (
              <button
                key={organizer.id}
                className={`${styles.organizerButton} ${selectedOrganizer === organizer.id ? styles.active : ''}`}
                onClick={() => handleOrganizerFilter(organizer.id)}
              >
                {organizer.name || 'Unknown Organizer'}
              </button>
            ))
          ) : (
            <div className={styles.noOrganizers}>
              <p>No organizers found</p>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading events...</span>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className={`${styles.eventsGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
          {filteredEvents.map(event => (
            <div key={event._id} className={styles.eventCardWrapper}>
              <EventCard 
                event={event} 
                viewMode={viewMode} 
                currentUser={user}
                onApprove={user?.role === 'admin' && event.status === 'pending' && viewMode === 'list' ? 
                  () => handleEventAction(event._id, 'approved') : undefined}
                onReject={user?.role === 'admin' && event.status === 'pending' && viewMode === 'list' ? 
                  () => handleEventAction(event._id, 'rejected') : undefined}
              />
              {user?.role === 'admin' && event.status === 'pending' && viewMode === 'grid' && (
                <div className={styles.adminActions}>
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
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noEvents}>
          <i className="fas fa-calendar-times"></i>
          <h2>No Events Found</h2>
          <p>There are no events matching the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default Events; 