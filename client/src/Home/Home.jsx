import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import axios from '../utils/axios';

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [myEventsViewMode, setMyEventsViewMode] = useState('grid');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all approved events first (public route)
        const eventsResponse = await axios.get('/events');
        const eventsData = eventsResponse.data;
        setEvents(eventsData);
        setFilteredEvents(eventsData);

        // Try to get user profile if logged in (optional)
        try {
          const userResponse = await axios.get('/users/profile');
          const userData = userResponse.data;
          setUser(userData);

          // If user is an organizer, fetch their events and merge only approved ones
          if (userData.role === 'organizer') {
            try {
              const organizerEventsResponse = await axios.get('/users/events');
              const organizerEvents = organizerEventsResponse.data;
              
              // Merge only approved organizer events with public events
              const existingEventIds = new Set(eventsData.map(e => e._id));
              const newApprovedEvents = organizerEvents.filter(e => 
                !existingEventIds.has(e._id) && e.status === 'approved'
              );
              const mergedEvents = [...eventsData, ...newApprovedEvents];
              
              setEvents(mergedEvents);
              setFilteredEvents(mergedEvents);
            } catch (error) {
              console.error('Error fetching organizer events:', error);
            }
          }
        } catch (error) {
          // If not logged in or error getting profile, continue with public events
          console.log('User not logged in or error getting profile');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter events based on search term and time
  useEffect(() => {
    let filtered = [...events];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower)
      );
    }

    // Apply time filter
    const now = new Date();
    switch (selectedTimeFilter) {
      case 'today':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= now && eventDate <= nextWeek;
        });
        break;
      case 'month':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= now && eventDate <= nextMonth;
        });
        break;
      default:
        break;
    }

    setFilteredEvents(filtered);
  }, [searchTerm, selectedTimeFilter, events]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by the useEffect above
  };

  const handleTimeFilterClick = (filter) => {
    setSelectedTimeFilter(filter === selectedTimeFilter ? 'all' : filter);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post('/users/logout', {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setUser(null);
        navigate('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <button 
          className={`${styles.toggleButton} ${!isSidebarOpen ? styles.toggleButtonShifted : ''}`}
          onClick={toggleSidebar}
        >
          <i className={`fas ${isSidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
        </button>

        <aside className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarClosed : ''}`}>
          <div className={styles.sidebarContent}>
            <div className={styles.sidebarTop}>
              <div className={styles.sidebarHeader}>
                {user ? (
                  <div className={styles.userProfile}>
                    <div className={styles.profilePicture}>
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" />
                      ) : (
                        <i className="fas fa-user"></i>
                      )}
                    </div>
                    <div className={styles.userInfo}>
                      <h3>{user.name}</h3>
                      <p>{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <h2>Welcome</h2>
                )}
                <button className={styles.closeButton} onClick={toggleSidebar}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <nav className={styles.sidebarNav}>
                <Link to="/" className={styles.sidebarLink}>
                  <i className="fas fa-home"></i>
                  <span className={styles.linkText}>Home</span>
                </Link>
                {user ? (
                  <>
                    <Link to="/profile" className={styles.sidebarLink}>
                      <i className="fas fa-user"></i>
                      <span className={styles.linkText}>Profile</span>
                    </Link>
                    <Link to="/profile/edit" className={styles.sidebarLink}>
                      <i className="fas fa-user-edit"></i>
                      <span className={styles.linkText}>Edit Profile</span>
                    </Link>
                    {user.role === 'user' && (
                      <Link to="/bookings" className={styles.sidebarLink}>
                        <i className="fas fa-ticket-alt"></i>
                        <span className={styles.linkText}>My Bookings</span>
                      </Link>
                    )}
                    {user.role === 'organizer' && (
                      <Link to="/my-events" className={styles.sidebarLink}>
                        <i className="fas fa-calendar-alt"></i>
                        <span className={styles.linkText}>My Events</span>
                      </Link>
                    )}
                    {user && user.role === 'admin' && (
                      <>
                        <Link to="/admin/events" className={styles.sidebarLink}>
                          <i className="fas fa-calendar-check"></i>
                          <span className={styles.linkText}>All Events</span>
                        </Link>
                        <Link to="/admin/users" className={styles.sidebarLink}>
                          <i className="fas fa-users"></i>
                          <span className={styles.linkText}>Users</span>
                        </Link>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/login" className={styles.sidebarLink}>
                      <i className="fas fa-sign-in-alt"></i>
                      <span className={styles.linkText}>Login</span>
                    </Link>
                    <Link to="/register" className={styles.sidebarLink}>
                      <i className="fas fa-user-plus"></i>
                      <span className={styles.linkText}>Register</span>
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {user && (
              <div className={styles.sidebarBottom}>
                <button className={styles.logoutButton} onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </aside>
        
        <main className={`${styles.mainContent} ${!isSidebarOpen ? styles.mainContentExpanded : ''}`}>
          <div className={styles.heroSection}>
            <div className={styles.heroContent}>
              <h1>Discover Amazing Events</h1>
              <p>Join exciting events and create unforgettable memories</p>
              {!user ? (
                <div className={styles.ctaButtons}>
                  <Link to="/login" className={styles.ctaButton}>
                    <span>Get Started</span>
                    <i className="fas fa-arrow-right"></i>
                  </Link>
                  <Link to="/register" className={styles.ctaButtonOutline}>
                    <span>Create Account</span>
                    <i className="fas fa-user-plus"></i>
                  </Link>
                </div>
              ) : user.role === 'organizer' && (
                <div className={styles.ctaButtons}>
                  <Link to="/my-events/new" className={styles.ctaButton}>
                    <span>Create Event</span>
                    <i className="fas fa-plus"></i>
                  </Link>
                </div>
              )}
            </div>
            <div className={styles.searchSection}>
              <form onSubmit={handleSearch} className={styles.searchBar}>
                <i className="fas fa-search"></i>
                <input 
                  type="text" 
                  placeholder="Search for events..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className={styles.searchButton}>Search</button>
              </form>
              <div className={styles.quickFilters}>
                <button 
                  className={`${styles.filterButton} ${selectedTimeFilter === 'all' ? styles.active : ''}`}
                  onClick={() => handleTimeFilterClick('all')}
                >
                  All Events
                </button>
                <button 
                  className={`${styles.filterButton} ${selectedTimeFilter === 'today' ? styles.active : ''}`}
                  onClick={() => handleTimeFilterClick('today')}
                >
                  Today
                </button>
                <button 
                  className={`${styles.filterButton} ${selectedTimeFilter === 'week' ? styles.active : ''}`}
                  onClick={() => handleTimeFilterClick('week')}
                >
                  This Week
                </button>
                <button 
                  className={`${styles.filterButton} ${selectedTimeFilter === 'month' ? styles.active : ''}`}
                  onClick={() => handleTimeFilterClick('month')}
                >
                  This Month
                </button>
              </div>
            </div>
          </div>

          <section className={styles.eventsSection}>
            {user && user.role === 'organizer' && (
              <>
                <div className={styles.sectionHeader}>
                  <h2>My Events</h2>
                  <div className={styles.viewOptions}>
                    <button 
                      className={`${styles.viewButton} ${myEventsViewMode === 'grid' ? styles.active : ''}`}
                      onClick={() => setMyEventsViewMode('grid')}
                    >
                      <i className="fas fa-th-large"></i>
                    </button>
                    <button 
                      className={`${styles.viewButton} ${myEventsViewMode === 'list' ? styles.active : ''}`}
                      onClick={() => setMyEventsViewMode('list')}
                    >
                      <i className="fas fa-list"></i>
                    </button>
                  </div>
                </div>
                <div className={`${styles.eventsGrid} ${myEventsViewMode === 'list' ? styles.listView : ''}`}>
                  {events
                    .filter(event => event.organizer?._id === user._id || event.organizer === user._id)
                    .map(event => (
                      <EventCard key={event._id} event={event} viewMode={myEventsViewMode} currentUser={user} />
                    ))}
                </div>
              </>
            )}
            <div className={styles.sectionHeader}>
              <h2>Featured Events</h2>
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
            {isLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <span>Loading amazing events...</span>
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className={`${styles.eventsGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
                {filteredEvents.map(event => (
                  <EventCard key={event._id} event={event} viewMode={viewMode} currentUser={user} />
                ))}
              </div>
            ) : (
              <div className={styles.noEvents}>
                <i className="fas fa-calendar-times"></i>
                <p>No events found matching your criteria.</p>
                <p>Try adjusting your filters or search terms.</p>
              </div>
            )}
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Home;