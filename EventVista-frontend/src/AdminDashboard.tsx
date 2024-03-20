import './AdminDashboard.css';
import { useState, useEffect } from 'react';

type Event = {
  name: string;
  location: string;
  city: string;
  date: Date;
  images: string[] | null;
  description: string;
  poster: File | null;
  tags: string[];
  event_id: string;
  number_of_event_images: number;
};

export function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [organizerName, setOrganizerName] = useState<string>(() => localStorage.getItem('organizerName') ?? '');

  useEffect(() => {
    // Fetch events when component mounts
    fetchEvents();
  }, []);

  useEffect(() => {
    // Update organizer name when it changes
    setOrganizerName(localStorage.getItem('organizerName') ?? '');
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/get_admin_events`);
      if (response.ok) {
        const eventData = await response.json();
        const mappedEvents = eventData.map(async (event: any) => {
          const number_of_event_images = await getNumberOfEventImages(event.event_id)
          return {
            name: event.name || '',
            location: event.location || '',
            city: event.city || '',
            date: new Date(event.date),
            description: event.description || '',
            tags: event.tags ? event.tags.split(',') : [],
            event_id: event.event_id || '',
            images: event.images || [],
            number_of_event_images: number_of_event_images
          };
        });
        const resolvedEvents = await Promise.all(mappedEvents);
        setEvents(resolvedEvents);
      } else {
        console.error('Failed to fetch events:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const getNumberOfEventImages = async (event_id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get_event_image_count/${event_id}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Number of images : " + data);
        return data;
      } else {
        console.error('Failed to fetch number of images:', response.statusText);
        return 0;
      }
    } catch (error) {
      console.error('Error fetching number of images:', error);
      return 0;
    }
;  }

  const handleLogout = () => {
    localStorage.removeItem('organizerId');
    localStorage.removeItem('organizerName');
    window.location.href = '/login';
  };

  const handleDeleteEvent = async (index: number) => {
    try {
      const eventToDelete = events[index];
      const response = await fetch(`http://127.0.0.1:5000/api/delete_event/${eventToDelete.event_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedEvents = [...events.slice(0, index), ...events.slice(index + 1)];
        setEvents(updatedEvents);
      } else {
        console.error('Failed to delete event:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="admin-dashboard" style={{ backgroundColor: '#17591865' }}>
      <h2 className="Welcome">
        Welcome {organizerName}!!
      </h2>
      <div className="logout-container">
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="event-list">
        <h2>Event List</h2>
        {events.map((event, index) => (
          <div key={index} className="event">
            <h3>{event.name}</h3>
            <p>
              <u>Name</u>: {event.name}
            </p>
            <p>
              <u>Location</u>: {event.location}
            </p>
            <p>
              <u>Event Date</u>: {event.date.toLocaleString()}
            </p>
            <p>
              <u>City</u>: {event.city}
            </p>
            <p>
              <u>Description</u>: {event.description}
            </p>
            <p>
              <u>Tags</u>: {event.tags.join(', ')}
            </p>
            <p>
              <u>Event Id</u>: {event.event_id}
            </p>
            <p>
              <u>Event Poster</u>:
            </p>
            <img src={`http://127.0.0.1:5000/api/get_event_poster/${event.event_id}`} height="256" width="256" alt="Poster" />
            <p>
              <u>Event Images</u>:
            </p>
              <div className="event-images">
              {Array.from({ length: event.number_of_event_images }).map((_, index) => (
                <img
                  key={index}
                  src={`http://127.0.0.1:5000/api/get_event_image/${event.event_id}/${index}`}
                  height="500"
                  width="450"
                  alt={`Event Image ${index + 1}`}
                  className='event-image'
                />
              ))}
            </div>
            <div className="button-container">
              <button onClick={() => handleDeleteEvent(index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
