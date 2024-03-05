import React, { useState, useEffect } from 'react';
import './OrganizerDashboard.css';

type Event = {
  name: string;
  location: string;
  city: string;
  images: File[] | null;
  description: string;
  poster: File | null;
  tags: string[];
  event_id?: string; // Make event_id optional
};

export function OrganizerDashboard() {
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventCity, setEventCity] = useState('');
  const [eventImages, setEventImages] = useState<File[] | null>(null);
  const [eventDescription, setEventDescription] = useState('');
  const [eventPoster, setEventPoster] = useState<File | null>(null);
  const [eventTags, setEventTags] = useState<string>('');
  const [attendeeCount, setAttendeeCount] = useState<number>(0);
  const [events, setEvents] = useState<Event[]>([]);

  const handleInterestClick = () => {
    setAttendeeCount(attendeeCount => attendeeCount + 1);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/get_events');
      if (response.ok) {
        const eventData = await response.json();
        setEvents(eventData);
      } else {
        console.error('Failed to fetch events:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleAddEvent = async () => {
    try {
      const formData = new FormData();
      formData.append('name', eventName);
      formData.append('location', eventLocation);
      formData.append('city', eventCity);

      // Append image files to formData
      if (eventImages) {
        for (let i = 0; i < eventImages.length; i++) {
          formData.append(`images[]`, eventImages[i]);
        }
      }
      formData.append('description', eventDescription);
      formData.append('tags', eventTags);

      // Add event poster if available
      if (eventPoster) {
        formData.append('poster', eventPoster);
      }

      const response = await fetch('http://127.0.0.1:5000/api/add_event', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // If the event was added successfully, update the events list
        const eventData = await response.json()
        setEvents([...events, eventData])
        await fetchEvents();

        // Reset form fields after adding event
        setEventName(''); 
        setEventLocation('');
        setEventCity('');
        setEventImages(null);
        setEventDescription('');
        setEventPoster(null);
        setEventTags('');
      } else {
        console.error('Failed to add event:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleEditEvent = async (index: number) => {
    try {
      const eventToUpdate = events[index];
      const updatedEvent = {
        ...eventToUpdate,
        name: eventName,
        location: eventLocation,
        city: eventCity,
        images: eventImages,
        description: eventDescription,
        poster: eventPoster,
        tags: eventTags.split(',').map(tag => tag.trim())
      };
  
      // Make a PUT request to update the event in the database
      const response = await fetch(`http://127.0.0.1:5000/api/update_event/${eventToUpdate.event_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });
  
      if (response.ok) {
        // If the event was updated successfully, update the events list
        const eventData = await response.json();
        const updatedEvents = [...events];
        updatedEvents[index] = { ...updatedEvent, event_id: eventToUpdate.event_id };
        setEvents(updatedEvents);
  
        // Reset form fields after editing event
        setEventName('');
        setEventLocation('');
        setEventCity('');
        setEventImages(null);
        setEventDescription('');
        setEventPoster(null);
        setEventTags('');
      } else {
        console.error('Failed to update event:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };
  
  const handleDeleteEvent = async (index: number) => {
    try {
      const eventToDelete = events[index];
  
      // Make a DELETE request to delete the event from the database
      const response = await fetch(`http://127.0.0.1:5000/api/delete_event/${eventToDelete.event_id}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        // If the event was deleted successfully, update the events list
        const updatedEvents = events.filter((event, i) => i !== index);
        setEvents(updatedEvents);
      } else {
        console.error('Failed to delete event:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleMultiImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEventImages(Array.from(e.target.files));
    }
  };
  
  return (
    <div className="organizer-dashboard">
      <div className="event-details">
        <h2>Add New Event</h2>
        <form>
          <input type="text" placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
          <input type="text" placeholder="Location" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} />
          <input type="text" placeholder="City" value={eventCity} onChange={(e) => setEventCity(e.target.value)} />
          <label>Event Images :</label>
          <input type="file" placeholder="Event Images" onChange={(e) => setEventImages(e.target.files)} multiple />
          <textarea placeholder="Description" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
          <label>Event Poster :</label>
          <input type="file" placeholder="Event Poster" onChange={(e) => setEventPoster(e.target.files ? e.target.files[0] : null)} />
          <input type="text" placeholder="Tags (comma-separated)" value={eventTags} onChange={(e) => setEventTags(e.target.value)} />
          <button type="button" onClick={handleAddEvent}>Add Event</button>
        </form>
      </div>

      <div className="event-list">
        <h2>Event List</h2>
        {events.map((event, index) => (
          <div key={index} className="event">
            <h3>{event.name}</h3>
            <p>Name: {event.name}</p>
            <p>Location: {event.location}</p>
            <p>City: {event.city}</p>
            <p>Description: {event.description}</p>
            <p>Tags: {event.tags}</p>

            {event.poster && (
              <div>
                <p>Poster:</p>
                <img src={`http://127.0.0.1:5000/api/get_event_poster/${event.event_id}`} alt="Event Poster" height="85%" width="15%"/>
              </div>
            )}
            {event.images && (
              <div>
                <p>Images:</p>
                <img src={`http://127.0.0.1:5000/api/get_event_images/${event.event_id}`} alt="Event Images" height="120"/>
              </div>
            )}
            
            <div className="button-container">
              <button onClick={() => handleEditEvent(index)}>Edit</button>
              <button onClick={() => handleDeleteEvent(index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
