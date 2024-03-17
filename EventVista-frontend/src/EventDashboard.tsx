import { useState, useEffect } from 'react';
import './EventDashboard.css';

export function EventDashboard() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    // Retrieve the selected event details from localStorage
    const storedEvent = localStorage.getItem('selectedEvent');
    if (storedEvent) {
      setSelectedEvent(JSON.parse(storedEvent));
    }
  }, []);

  return (
    <div className='attendee-dashboard'>
      <header>
        {selectedEvent && (
          <div className="popular-movie-slider" style={{ height: '100vh' }}>
            <img src={`http://127.0.0.1:5000/api/get_event_poster/${selectedEvent.event_id}`} className="poster" alt="Event Poster" />

            <div className="popular-movie-slider-content">
              <h2 className="event-name">{selectedEvent.name}</h2>
              <p className="event-details">
                <span className="event-label">Location:</span> {selectedEvent.location}<br />
                <span className="event-label">City:</span> {selectedEvent.city}<br />
                <span className="event-label">Event Date:</span> {selectedEvent.date.toLocaleString()}<br />
                <span className="event-label">Description:</span> {selectedEvent.description}<br />
                <span className="event-label">Tags:</span> {selectedEvent.tags.join(', ')}
              </p>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
