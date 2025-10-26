import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import AlumniRegistration from './components/AlumniRegistration'
import AlumniList from './components/AlumniList'
import AlumniSearch from './components/AlumniSearch'
import Events from './components/Events'
import Fundraising from './components/Fundraising'
import Login from './components/Login'
import Profile from './components/Profile'
function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(42) // Default value
  const [alumniCount, setAlumniCount] = useState(1250) // Default value
  const [totalDonations, setTotalDonations] = useState(125000) // Default value $125K
  const [isAmountChanging, setIsAmountChanging] = useState(false)
  const [animatedDonationAmount, setAnimatedDonationAmount] = useState(0)
  const prevActiveTab = useRef('home')
  const hasAnimated = useRef(false)
  const isDataLoaded = useRef(false)
  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);
  // Handle dashboard entry animation
  useEffect(() => {
    // Check if we're navigating to the dashboard FROM another tab
    if (activeTab === 'home' && prevActiveTab.current !== 'home') {
      // Reset animation flag when coming to dashboard
      hasAnimated.current = false;
      // Reset animated amount to 0 to trigger animation from start
      setAnimatedDonationAmount(0);
    }
    
    // Update previous active tab
    prevActiveTab.current = activeTab;
  }, [activeTab]);
  // Handle the animation when we have real data and are on the dashboard
  useEffect(() => {
    // Only animate if we're on the dashboard and we have real data
    if (activeTab === 'home' && isDataLoaded.current && totalDonations > 0) {
      // Reset animated amount to 0 and start counting animation
      setAnimatedDonationAmount(0);
      
      // Animate from 0 to current total
      let start = 0;
      const end = parseFloat(totalDonations) || 0;
      
      // Only animate if we have a meaningful amount
      if (end > 0) {
        const duration = 2000; // 2 seconds
        const increment = end / (duration / 16); // ~60fps
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            start = end;
            clearInterval(timer);
            hasAnimated.current = true; // Mark as animated
          }
          setAnimatedDonationAmount(start);
        }, 16); // ~60fps
        
        // Clean up timer
        return () => clearInterval(timer);
      } else {
        // If end is 0 or invalid, just set it directly
        setAnimatedDonationAmount(end);
        hasAnimated.current = true;
      }
    }
  }, [activeTab, totalDonations, isDataLoaded.current]);
  // Handle amount change animation (for live updates)
  useEffect(() => {
    if (activeTab === 'home' && isDataLoaded.current && totalDonations > 0) {
      // Animate when value actually changes significantly
      if (Math.abs(totalDonations - animatedDonationAmount) > 100) {
        setIsAmountChanging(true);
        const timer = setTimeout(() => {
          setIsAmountChanging(false);
          // Update the animated amount to match the new total
          setAnimatedDonationAmount(totalDonations);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [totalDonations, activeTab, animatedDonationAmount, isDataLoaded.current]);
  // Fetch upcoming events count
  useEffect(() => {
    const fetchUpcomingEventsCount = async () => {
      try {
        const response = await fetch('/api/events/count/upcoming');
        if (response.ok) {
          const data = await response.json();
          setUpcomingEventsCount(data.count);
        } else {
          console.error('Failed to fetch upcoming events count:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Network error when fetching upcoming events count:', error);
      }
    };
    fetchUpcomingEventsCount();
    // Refresh the count every 30 seconds
    const interval = setInterval(fetchUpcomingEventsCount, 30000);
    return () => clearInterval(interval);
  }, []);
  // Fetch alumni count
  useEffect(() => {
    const fetchAlumniCount = async () => {
      try {
        const response = await fetch('/api/alumni/count');
        if (response.ok) {
          const data = await response.json();
          setAlumniCount(data.count);
        } else {
          console.error('Failed to fetch alumni count:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Network error when fetching alumni count:', error);
      }
    };
    fetchAlumniCount();
    // Refresh the count every 30 seconds
    const interval = setInterval(fetchAlumniCount, 30000);
    return () => clearInterval(interval);
  }, []);
  // Fetch total donations raised
  useEffect(() => {
    const fetchTotalDonations = async () => {
      try {
        const response = await fetch('/api/fundraising/total-raised');
        if (response.ok) {
          const data = await response.json();
          setTotalDonations(data.total_raised);
          // Mark that we have real data
          isDataLoaded.current = true;
        } else {
          console.error('Failed to fetch total donations:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Network error when fetching total donations:', error);
      }
    };

    fetchTotalDonations();
    
    // Refresh the amount every 30 seconds
    const interval = setInterval(fetchTotalDonations, 30000);
    return () => clearInterval(interval);
  }, []);
  const handleLoginSuccess = (token, user) => {
    // Save to localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Update state
    setIsAuthenticated(true);
    setCurrentUser(user);
    setActiveTab('directory'); // Redirect to directory after login
  }
  const handleLogout = () => {
    // Remove from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Update state
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('home'); // Redirect to home after logout
    // Reset animation flag so it triggers on next visit
    hasAnimated.current = false;
    isDataLoaded.current = false;
    setAnimatedDonationAmount(0);
  }
  const handleRegistrationSuccess = () => {
    // Redirect to login page after successful registration
    setActiveTab('login');
  }
  const handleProfileUpdate = (updatedProfileData) => {
    // Update the current user data
    const updatedUser = {
      ...currentUser,
      ...updatedProfileData
    };
    setCurrentUser(updatedUser);
    // Also update in localStorage
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }
  const renderContent = () => {
    // If user is not authenticated, only show dashboard, login, and register
    if (!isAuthenticated && activeTab !== 'home' && activeTab !== 'register' && activeTab !== 'login') {
      // Redirect to dashboard
      setActiveTab('home')
      return renderDashboard()
    }
    switch (activeTab) {
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} />
      case 'register':
        return <AlumniRegistration onRegistrationSuccess={handleRegistrationSuccess} />
      case 'profile':
        return isAuthenticated ? <Profile currentUser={currentUser} onUpdateProfile={handleProfileUpdate} /> : renderDashboard()
      case 'directory':
        return isAuthenticated ? <AlumniList onRefresh={() => {}} /> : renderDashboard()
      case 'search':
        return isAuthenticated ? <AlumniSearch /> : renderDashboard()
      case 'events':
        return isAuthenticated ? <Events currentUser={currentUser} /> : renderDashboard()
      case 'fundraising':
        return isAuthenticated ? <Fundraising currentUser={currentUser} /> : renderDashboard()
      default:
        return renderDashboard()
    }
  }
  const renderDashboard = () => {
    // Format the total donations as currency
    const formatCurrency = (amount) => {
      // Convert to number if it's a string
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      // Handle invalid numbers
      if (isNaN(numAmount)) return '$0';
      // Format as currency with K/M/B suffixes
      if (numAmount >= 1000000) {
        return `$${(numAmount / 1000000).toFixed(1)}M`;
      } else if (numAmount >= 1000) {
        return `$${(numAmount / 1000).toFixed(1)}K`;
      } else {
        return `$${numAmount.toFixed(0)}`;
      }
    };
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Welcome to AlumniConnect</h2>
          <p>Connect, Engage, and Grow with Your Alumni Network</p>
        </div>
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{alumniCount}+</h3>
              <p>Alumni Members</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{upcomingEventsCount}</h3>
              <p>Upcoming Events</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3 className={`fundraising-amount ${isAmountChanging ? 'changing' : ''}`}>
                {activeTab === 'home' && isDataLoaded.current && animatedDonationAmount > 0 ? formatCurrency(animatedDonationAmount) : formatCurrency(totalDonations || 0)}
              </h3>
              <p>Raised This Year</p>
            </div>
          </div>
        </div>
        <div className="dashboard-features">
          <div className="feature-card">
            <div className="feature-icon">🎓</div>
            <h3>Alumni Directory</h3>
            <p>Find and connect with fellow alumni from your institution</p>
            <button className="feature-btn" onClick={() => {
              if (isAuthenticated) {
                setActiveTab('directory')
              } else {
                alert('Please register or login to access the directory')
              }
            }}>
              Explore Directory
            </button>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗓️</div>
            <h3>Events & Reunions</h3>
            <p>Stay updated with alumni events and networking opportunities</p>
            <button className="feature-btn" onClick={() => {
              if (isAuthenticated) {
                setActiveTab('events')
              } else {
                alert('Please register or login to view events')
              }
            }}>
              View Events
            </button>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Fundraising</h3>
            <p>Support your alma mater through charitable giving</p>
            <button className="feature-btn" onClick={() => {
              if (isAuthenticated) {
                setActiveTab('fundraising')
              } else {
                alert('Please register or login to access fundraising')
              }
            }}>
              View Campaigns
            </button>
          </div>
        </div>
      </div>
    )
  }
  const handleTabChange = (tab) => {
    // Allow access to home (dashboard), login, and registration pages for unauthenticated users
    if (tab === 'home' || tab === 'login' || tab === 'register') {
      setActiveTab(tab)
      return
    }

    // For other pages, check authentication
    if (!isAuthenticated) {
      alert('Please register or login to access this feature')
      return
    }
    
    setActiveTab(tab)
  }
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="logo">
            <h1>AlumniConnect</h1>
            <p className="tagline">Building Lifelong Connections</p>
          </div>
          <nav className="main-nav">
            <button 
              className={activeTab === 'home' ? 'active' : ''}
              onClick={() => handleTabChange('home')}
            >
              Dashboard
            </button>
            {!isAuthenticated ? (
              <>
                <button 
                  className={activeTab === 'login' ? 'active' : ''}
                  onClick={() => handleTabChange('login')}
                >
                  Login
                </button>
                <button 
                  className={activeTab === 'register' ? 'active' : ''}
                  onClick={() => handleTabChange('register')}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                <button 
                  className={activeTab === 'directory' ? 'active' : ''}
                  onClick={() => handleTabChange('directory')}
                >
                  Directory
                </button>
                <button 
                  className={activeTab === 'profile' ? 'active' : ''}
                  onClick={() => handleTabChange('profile')}
                >
                  Profile
                </button>
                <button 
                  className={activeTab === 'search' ? 'active' : ''}
                  onClick={() => handleTabChange('search')}
                >
                  Search
                </button>
                <button 
                  className={activeTab === 'events' ? 'active' : ''}
                  onClick={() => handleTabChange('events')}
                >
                  Events
                </button>
                <button 
                  className={activeTab === 'fundraising' ? 'active' : ''}
                  onClick={() => handleTabChange('fundraising')}
                >
                  Fundraising
                </button>
                <button 
                  onClick={handleLogout}
                >
                  Logout ({currentUser?.first_name})
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>
        {renderContent()}
      </main>
      <footer className="App-footer">
        <p>© 2025 AlumniConnect. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </footer>
    </div>
  )
}
export default App