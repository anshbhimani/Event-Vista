import { useState, useEffect } from 'react';
import './OrganizerDashboard.css';
import { navigate } from 'wouter/use-hash-location';

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
  const [events, setEvents] = useState<Event[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [OrganizerId] = useState<string>(() => localStorage.getItem('organizerId') ?? '');
  const [OrganizerName] = useState<string>(() => localStorage.getItem('organizerName') ?? '')

  useEffect(() => {
    // Fetch organizer ID from local storage
    const organizerId = localStorage.getItem('organizerId');
    if (organizerId) {
      // Fetch events using organizer ID
      fetchEvents(organizerId);
    }
  }, [OrganizerId]);

  const fetchEvents = async (organizerId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/get_events?organizer_id=${organizerId}`);
      if (response.ok) {
        const eventData = await response.json();
        const mappedEvents = eventData.map((event: any) => ({
          name: event.name || '', // Handle null values appropriately
          location: event.location || '', // Handle null values appropriately
          city: event.city || '', // Handle null values appropriately
          description: event.description || '', // Handle null values appropriately
          tags: event.tags ? event.tags.split(',') : [], // Convert tags string to array
          event_id: event.event_id || '', // Handle null values appropriately
        }));
        setEvents(mappedEvents);
      } else {
        console.error('Failed to fetch events:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };


  const handleEditEvent = (index: number) => {
    const eventToEdit = events[index];
    setEditIndex(index);

    setEventName(eventToEdit.name);
    setEventLocation(eventToEdit.location);
    setEventCity(eventToEdit.city);
    setEventImages(null);
    setEventDescription(eventToEdit.description);
    setEventPoster(null);
    setEventTags(eventToEdit.tags.join(', '));  
  };

  const handleAddOrEditEvent = async () => {
    try {
      const formData = new FormData();
      formData.append('name', eventName);
      formData.append('location', eventLocation);
      formData.append('city', eventCity);

      if (eventImages) {
        for (let i = 0; i < eventImages.length; i++) {
          formData.append(`images[]`, eventImages[i]);
        }
      }
      formData.append('description', eventDescription);
      formData.append('tags', eventTags);

      if (eventPoster) {
        formData.append('poster', eventPoster);
      }

      formData.append('organizer_id', OrganizerId);
      formData.append('organizer_name', OrganizerName);

      let url = `http://127.0.0.1:5000/api/add_event?organizer_id=${OrganizerId}`;
      let method = 'POST';

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
          const updatedEvents = [...events];
          updatedEvents[editIndex] = eventData;
          setEvents(updatedEvents);
        } else {
          setEvents([...events, eventData]);
        }

        setEventName('');
        setEventLocation('');
        setEventCity('');
        setEventImages(null);
        setEventDescription('');
        setEventPoster(null);
        setEventTags('');
        setEditIndex(null);
      } else {
        console.error('Failed to add/update event:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding/updating event:', error);
    }
  };

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
        const updatedEvents = events.filter((event, i) => i !== index);
        setEvents(updatedEvents);
      } else {
        console.error('Failed to delete event:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  
  return (
    <div className="organizer-dashboard">
      <h2 className='Welcome'>
        Welcome {OrganizerName}!!
        <br/>
        Organizer Id: {OrganizerId}
      </h2>
      <div className='logout-container'>
        <button onClick={handleLogout}>Logout</button>
      </div>
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
          <input type="file" placeholder="Event Images" onChange={(e) => setEventImages(e.target.files ? e.target.files[0] : null)} />
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
            <p><u>Name</u>: {event.name}</p>
            <p><u>Location</u>: {event.location}</p>
            <p><u>City</u>: {event.city}</p>
            <p><u>Description</u>: {event.description}</p>
            <p><u>Tags</u>: {event.tags}</p>
            <p><u>Event Id</u>: {event.event_id}</p>
            <p><u>Poster</u>:</p>
            <img src={`http://127.0.0.1:5000/api/get_event_poster/${event.event_id}`} height="256"/>
            <p>Event Images: </p>
            {event.images && (
              <div>
                <p>Images:</p>
                {event.images.map((image, i) => (
                  <img key={i} src={`http://127.0.0.1:5000/api/get_event_image/${event.event_id}?index=${i}`} alt={`Event Image ${i + 1}`} height="12" />
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