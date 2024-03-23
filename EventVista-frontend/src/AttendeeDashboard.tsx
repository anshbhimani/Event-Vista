import { useState, useEffect } from 'react';
import './AttendeeDashboard.css';
import { navigate } from 'wouter/use-browser-location';

export function AttendeeDashboard() {
  const [attendeeName] = useState(() => localStorage.getItem('organizerName') ?? '');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/get_attendee_events`);

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
          images: event.images || []
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
    // Encode the event details as a query parameter
    localStorage.setItem('selectedEvent', JSON.stringify(event));
    console.log('Selected Event: ', JSON.stringify(event))
    // Navigate to the event dashboard with event details in the URL
    navigate(`/event-dashboard`);
  };

  const handleLogout = () => {
    localStorage.removeItem('organizerId');
    localStorage.removeItem('organizerName');
    window.location.href = '/login';
  };


  return (
    <div className="Attendee-dashboard">
      <nav>
        <h2>Welcome {attendeeName}</h2>
      </nav>
      <div className="logout-container">
        <button onClick={handleLogout}>Logout</button>
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
