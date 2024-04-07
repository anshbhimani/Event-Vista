import { useState, useEffect } from 'react';
import './AttendeeDashboard.css';
import { navigate } from 'wouter/use-browser-location';

export function AttendeeDashboard() {
  const [attendeeName] = useState(() => localStorage.getItem('Attendant_Name') ?? '');
  const [events, setEvents] = useState([]);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const queryParams = new URLSearchParams({
        search: searchInput
      }).toString();

      const response = await fetch(`http://127.0.0.1:5000/api/get_attendee_events?${queryParams}`);

      if (response.ok) {
        const eventsData = await response.json();
        const mappedEvents = eventsData.map(event => ({
          name: event.name || '',
          location: event.location || '',
          city: event.city || '',
          date: new Date(event.date),
          description: event.description || '',
          tags: event.tags ? event.tags.split(',') : [],
          event_id: event.event_id || '',
          images: event.images || [],
          price: event.price || 10111,
        }));
        setEvents(mappedEvents);
      } else {
        console.error('Failed to fetch events:', response.status);
      }
    } catch (error) {
      console.error('Error fetching events for attendees:', error);
    }
  };

  const handleEventClick = (event) => {
    // Navigate to the event dashboard with event details in the URL
    const attendeeId = localStorage.getItem('Attendant_ID') ?? '';
    localStorage.setItem('selectedEvent', JSON.stringify({ ...event, attendeeId }));
    localStorage.setItem('AttendeeId', attendeeId);
    console.log('Selected Event: ', JSON.stringify(event));
  
    // Navigate to the event dashboard with event details in the URL
    navigate(`/event-dashboard`);
    console.log('Attendee_id : ', attendeeId)
  };

  const handleLogout = () => {
    localStorage.clear()
    
    window.location.href = '/login';
  };

  const applyFilters = () => {
    fetchEvents();
  };

  const resetFilters = () => {
    setSearchInput('');
    fetchEvents();
  };



  return (
    <div className="Attendee-dashboard">
      <nav>
        <h2>Welcome {attendeeName}</h2>
      </nav>
      <div className="logout-container">
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="search-filter-container">
        <input 
          type="text" 
          placeholder="Search events..." 
          value={searchInput} 
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button onClick={applyFilters}>Search</button>
        <button onClick={resetFilters}>Reset Search</button>
      </div>

      <div className="event-grid">
        {events.map((event, index) => (
          <div key={index} className="event">
            <a href="/event-dashboard" onClick={() => handleEventClick(event)}>
              <img src={`http://127.0.0.1:5000/api/get_event_poster/${event.event_id}`} height="256" alt="Poster" />
              <h3>{event.name}</h3>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
