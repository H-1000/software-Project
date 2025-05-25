import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Users.module.css';
import axios from '../utils/axios';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // First check if user is admin
        const userResponse = await axios.get('/users/profile');
        if (userResponse.data.role !== 'admin') {
          navigate('/');
          return;
        }

        // Fetch all users
        const response = await axios.get('/users');
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const userToUpdate = users.find(user => user._id === userId);
      
      // Don't allow modifying admin users
      if (userToUpdate.role === 'admin') {
        setError("Admin roles cannot be modified");
        return;
      }

      // Don't allow setting role to admin
      if (newRole === 'admin') {
        setError("Cannot promote users to admin role");
        return;
      }

      const response = await axios.put(`/users/${userId}`, { 
        role: newRole 
      });
      
      if (response.status === 200) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );
        setError(null);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setError(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const userToDelete = users.find(user => user._id === userId);
      
      if (userToDelete.role === 'admin') {
        setError("Admin users cannot be deleted");
        return;
      }

      if (!window.confirm('Are you sure you want to delete this user?')) {
        return;
      }

      await axios.delete(`/users/${userId}`);
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      setError(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: 
        prevConfig.key === key && prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return 'fas fa-sort';
    return sortConfig.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  };

  const sortedAndFilteredUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });

    return filtered.sort((a, b) => {
      if (sortConfig.key === 'name') {
        const comparison = a.name.localeCompare(b.name);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      } else if (sortConfig.key === 'role') {
        const comparison = a.role.localeCompare(b.role);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return styles.roleAdmin;
      case 'organizer':
        return styles.roleOrganizer;
      default:
        return styles.roleUser;
    }
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="fas fa-exclamation-circle"></i>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => setError(null)} className={styles.backButton}>
            Dismiss Error
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = sortedAndFilteredUsers();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => navigate('/')} className={styles.homeButton}>
            <i className="fas fa-arrow-left"></i> Back to Home
          </button>
          <h1>Manage Users</h1>
        </div>
        <div className={styles.headerRight}>
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

      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterAndSort}>
          <div className={styles.roleFilters}>
            <button
              className={`${styles.filterButton} ${roleFilter === 'all' ? styles.active : ''}`}
              onClick={() => setRoleFilter('all')}
            >
              All Roles
            </button>
            <button
              className={`${styles.filterButton} ${roleFilter === 'user' ? styles.active : ''}`}
              onClick={() => setRoleFilter('user')}
            >
              Users
            </button>
            <button
              className={`${styles.filterButton} ${roleFilter === 'organizer' ? styles.active : ''}`}
              onClick={() => setRoleFilter('organizer')}
            >
              Organizers
            </button>
            <button
              className={`${styles.filterButton} ${roleFilter === 'admin' ? styles.active : ''}`}
              onClick={() => setRoleFilter('admin')}
            >
              Admins
            </button>
          </div>
          <div className={styles.sortButtons}>
            <button
              className={`${styles.sortButton} ${sortConfig.key === 'name' ? styles.active : ''}`}
              onClick={() => handleSort('name')}
            >
              Sort by Name <i className={getSortIcon('name')}></i>
            </button>
            <button
              className={`${styles.sortButton} ${sortConfig.key === 'role' ? styles.active : ''}`}
              onClick={() => handleSort('role')}
            >
              Sort by Role <i className={getSortIcon('role')}></i>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading users...</span>
        </div>
      ) : (
        <>
          <div className={styles.resultCount}>
            Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
          </div>
          <div className={`${styles.usersGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
            {filteredUsers.map(user => (
              <div key={user._id} className={styles.userCard}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} />
                    ) : (
                      <i className="fas fa-user"></i>
                    )}
                  </div>
                  <div className={styles.userDetails}>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                    <span className={`${styles.userRole} ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className={styles.userActions}>
                  {user.role !== 'admin' && (
                    <>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                        className={styles.roleSelect}
                      >
                        <option value="user">User</option>
                        <option value="organizer">Organizer</option>
                      </select>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className={styles.deleteButton}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <div className={styles.adminBadge}>
                      <i className="fas fa-shield-alt"></i> Administrator
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Users; 