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
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Function to handle edit event
  const handleEditEvent = (index: number) => {
    const eventToEdit = events[index];
    setEditIndex(index);

    // Populate input fields with event details
    setEventName(eventToEdit.name);
    setEventLocation(eventToEdit.location);
    setEventCity(eventToEdit.city);
    setEventImages(null); // You might want to handle images separately
    setEventDescription(eventToEdit.description);
    setEventPoster(null); // You might want to handle poster separately
    setEventTags(eventToEdit.tags.join(', '));
  };

  // Function to handle add or edit event
  const handleAddOrEditEvent = async () => {
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

      let url = 'http://127.0.0.1:5000/api/add_event';
      let method = 'POST';

      // If editing, modify url and method
      if (editIndex !== null) {
        url = `http://127.0.0.1:5000/api/update_event/${events[editIndex].event_id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (response.ok) {
        const eventData = await response.json();

        if (editIndex !== null) {
          // Update events list if editing
          const updatedEvents = [...events];
          updatedEvents[editIndex] = eventData;
          setEvents(updatedEvents);
        } else {
          // Add new event to events list
          setEvents([...events, eventData]);
        }

        // Clear input fields
        setEventName('');
        setEventLocation('');
        setEventCity('');
        setEventImages(null);
        setEventDescription('');
        setEventPoster(null);
        setEventTags('');
        setEditIndex(null);


        window.location.reload()
      } else {
        console.error('Failed to add/update event:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding/updating event:', error);
    }
  };


  // Function to handle delete event
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

  return (
    <div className="organizer-dashboard">
      <div className="event-details">
        {editIndex !== null ? (
          <h2>Edit Event</h2>
        ) : (
          <h2>Add New Event</h2>
        )}
        <form>
          <input type="text" placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
          <input type="text" placeholder="Location" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} />
          <input type="text" placeholder="City" value={eventCity} onChange={(e) => setEventCity(e.target.value)} />
          <label>Event Images :</label>
          <input type="file" placeholder="Event Images" onChange={(e) => setEventImages(e.target.files)} multiple />
          <label>Event Poster :</label>
          <input type="file" placeholder="Event Poster" onChange={(e) => setEventPoster(e.target.files ? e.target.files[0] : null)} />
          <textarea placeholder="Description" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
          <input type="text" placeholder="Tags (comma-separated)" value={eventTags} onChange={(e) => setEventTags(e.target.value)} />
          <button type="button" onClick={handleAddOrEditEvent}>{editIndex !== null ? 'Save' : 'Add Event'}</button>
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
                <img src={`http://127.0.0.1:5000/api/get_event_poster/${event.event_id}`} alt="Event Poster" height="150" />
              </div>
            )}
            {event.images && (
              <div>
                <p>Images:</p>
                {event.images.map((image, i) => (
                  <img key={i} src={`http://127.0.0.1:5000/api/get_event_image/${event.event_id}?index=${i}`} alt={`Event Image ${i + 1}`} height="150" />
                ))}
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
