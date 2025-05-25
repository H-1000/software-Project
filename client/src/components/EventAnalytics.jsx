import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EventAnalytics.module.css';
import axios from '../utils/axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EventAnalytics = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchUserAndEvents = async () => {
      try {
        const userResponse = await axios.get('/users/profile');
        
        if (userResponse.data.role !== 'organizer') {
          navigate('/');
          return;
        }
        
        setUser(userResponse.data);

        // Fetch events
        const response = await axios.get('/users/events');
        const eventsData = response.data;
        setEvents(eventsData);

        // Prepare analytics data
        const analyticsData = {
          labels: eventsData.map(event => event.title),
          datasets: [
            {
              label: 'Tickets Sold',
              data: eventsData.map(event => event.totalTickets - event.remainingTickets),
              backgroundColor: 'rgba(156, 39, 176, 0.6)',
              borderColor: 'rgba(156, 39, 176, 1)',
              borderWidth: 1
            },
            {
              label: 'Total Tickets',
              data: eventsData.map(event => event.totalTickets),
              backgroundColor: 'rgba(224, 64, 251, 0.3)',
              borderColor: 'rgba(224, 64, 251, 1)',
              borderWidth: 1
            }
          ]
        };
        setAnalyticsData(analyticsData);
      } catch (err) {
        console.error('Error in fetchUserAndEvents:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndEvents();
  }, [navigate]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white'
        }
      },
      title: {
        display: true,
        text: 'Ticket Sales by Event',
        color: 'white',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      }
    }
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="fas fa-exclamation-circle"></i>
          <h2>Error Loading Analytics</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/my-events')} className={styles.backButton}>
            Back to My Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate('/my-events')} className={styles.backButton}>
          <i className="fas fa-arrow-left"></i> Back to My Events
        </button>
        <h1>Event Analytics</h1>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading analytics...</span>
        </div>
      ) : (
        <div className={styles.analyticsSection}>
          <div className={styles.analyticsCard}>
            <div className={styles.chartContainer}>
              <Bar data={analyticsData} options={chartOptions} />
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Events</h3>
                <p>{events.length}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Total Tickets</h3>
                <p>{events.reduce((sum, event) => sum + event.totalTickets, 0)}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Tickets Sold</h3>
                <p>{events.reduce((sum, event) => sum + (event.totalTickets - event.remainingTickets), 0)}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Available Tickets</h3>
                <p>{events.reduce((sum, event) => sum + event.remainingTickets, 0)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventAnalytics; 