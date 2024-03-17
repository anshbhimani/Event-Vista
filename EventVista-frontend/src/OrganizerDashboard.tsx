import { useState, useEffect } from 'react';
import './OrganizerDashboard.css';

type Event = {
  name: string;
  location: string;
  city: string;
  date: Date;
  images: string[] | null;
  description: string;
  poster: File | null;
  tags: string[];
  event_id?: string; // Make event_id optional
};

export function OrganizerDashboard() {
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventCity, setEventCity] = useState('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [eventImages, setEventImages] = useState<File[] | null>(null);
  const [numberofEventImages,setNumberofEventImages] = useState(0);
  const [eventDescription, setEventDescription] = useState('');
  const [eventPoster, setEventPoster] = useState<File | null>(null);
  const [eventTags, setEventTags] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [OrganizerId] = useState<string>(() => localStorage.getItem('organizerId') ?? '');
  const [OrganizerName] = useState<string>(() => localStorage.getItem('organizerName') ?? '');

  useEffect(() => {
    // Fetch organizer ID from local storage
    const organizerId = localStorage.getItem('organizerId');
    if (organizerId) {
      // Fetch events using organizer ID
      fetchEvents(organizerId);
    }
  }, [OrganizerId]);

  const SetNumberofEventImages = async (event_id: string) => {
    try{
      const response = await fetch(`http://localhost:5000/api/get_event_image_count/${event_id}`);

      if(response.ok){
        const data = await response.json();
        console.log("Number of images : " + data)
        setNumberofEventImages(data)
      }
      else{
        console.error('Failed to fetch n:', response.statusText);
      }
    }
    catch(error){
      console.error('Error fetching n:', error);
    }
  }
  
  const fetchEvents = async (organizerId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/get_events?organizer_id=${organizerId}`);
      if (response.ok) {
        const eventData = await response.json();
        const mappedEvents = eventData.map(async (event: any) => {
          // Call SetNumberofEventImages here
          await SetNumberofEventImages(event.event_id); // Await here to ensure completion
          return {
            name: event.name || '',
            location: event.location || '',
            city: event.city || '',
            date: new Date(event.date),
            description: event.description || '',
            tags: event.tags ? event.tags.split(',') : [],
            event_id: event.event_id || '',
            images: event.images || [],
          };
        });
        // Resolve all promises
        const resolvedEvents = await Promise.all(mappedEvents);
        setEvents(resolvedEvents);
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
    setEventDate(eventToEdit.date);
    setEventImages(null);
    setEventDescription(eventToEdit.description);
    setEventPoster(null);
    setEventTags(eventToEdit.tags.join(', '));
  };

  const handleAddOrEditEvent = async () => {
    try {
      
      if(eventDate && eventDate.getTime() < Date.now())
      {
        alert('Please select a date in future!!')
        return;
      }

      const formData = new FormData();
      formData.append('name', eventName);
      formData.append('location', eventLocation);
      formData.append('city', eventCity);
      formData.append('date', eventDate?.toISOString() ?? '');

      if (eventImages) {
        for (let i = 0; i < eventImages.length; i++) {
          // formData.append(`event_image_${i}`, eventImages[i]);
          formData.append('image',eventImages[i])
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

      console.log(formData.get('organizer_name'))
      console.log(formData.get('poster'))
      console.log(formData.get('image'))
      
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (response.ok) {
        const eventData = await response.json();
        // window.location.reload()
        // temporary uncomment above code afterwards

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
        setEventDate(null);
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
    <div className="organizer-dashboard" style={{ backgroundColor: '#17591865' }}>
      <h2 className="Welcome">
        Welcome {OrganizerName}!!
        <br />
        Organizer Id: {OrganizerId}
      </h2>
      <div className="logout-container">
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="event-details">
        {editIndex !== null ? (
          <h2>Edit Event</h2>
        ) : (
          <h2>Add New Event</h2>
        )}
        <form>
          <label>Event Name : </label>
          <input type="text" placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
          &nbsp;&nbsp;
          <label>Event Location : </label>
          <input type="text" placeholder="Location" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} />
          &nbsp;&nbsp;
          <label>Event City : </label>
          <input type="text" placeholder="City" value={eventCity} onChange={(e) => setEventCity(e.target.value)} />
          &nbsp;&nbsp;
          <label>Event Date : </label>
          <input type="datetime-local" placeholder="Date" onChange={(e) => setEventDate(new Date(e.target.value))} />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <label>Event Images : </label>
          <input type="file" placeholder="Event Images" multiple onChange={(e) => setEventImages(e.target.files)} />
          <label>Event Poster :</label>
          <input type="file" placeholder="Event Poster" onChange={(e) => setEventPoster(e.target.files ? e.target.files[0] : null)} />
          <label>Event Description :</label>
          <textarea placeholder="Description" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
          <label>Event Tags :</label>
          <input type="text" placeholder="Tags (comma-separated)" value={eventTags} onChange={(e) => setEventTags(e.target.value)} />
          <br/>
          <button type="button" onClick={handleAddOrEditEvent}>{editIndex !== null ? 'Save' : 'Add Event'}</button>
        </form>
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
              <u>Tags</u>: {event.tags}
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
            {Array.from({ length: numberofEventImages }).map((_, index) => (
              <img
                key={index}
                src={`http://127.0.0.1:5000/api/get_event_image/${event.event_id}/${index}`}
                height="256"
                width="256"
                alt={`Event Image ${index + 1}`}
              />
            ))}
            
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
