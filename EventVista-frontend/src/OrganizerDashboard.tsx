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
  price: number;
  number_of_event_images: number;
  number_of_interested_audience: number;
  event_id?: string; // Make event_id optional
};

export function OrganizerDashboard() {
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventCity, setEventCity] = useState('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [eventImages, setEventImages] = useState<File[] | null>(null);
  const [eventPrice, setEventPrice] = useState<number>(0);
  const [eventDescription, setEventDescription] = useState('');
  const [eventPoster, setEventPoster] = useState<File | null>(null);
  const [eventTags, setEventTags] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [editIndex, setEditIndex] = useState<number| null>(0);
  const [OrganizerId] = useState<string>(() => localStorage.getItem('organizerId') ?? '');
  const [OrganizerName] = useState<string>(() => localStorage.getItem('organizerName') ?? '');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Fetch organizer ID from local storage
    const organizerId = localStorage.getItem('organizerId');
    if (organizerId) {
      // Fetch events using organizer ID
      fetchEvents(organizerId);
    }
  }, [OrganizerId]);

  const SetInterestedAudience = async (event_id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get_interested/${event_id}`);

      if (response.ok) {
        const number_of_interested = await response.json();
        return number_of_interested;
      } else {
        console.error('Failed to fetch Interested Audience:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching interested audience:', error);
    }
  };

  const SetNumberofEventImages = async (event_id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get_event_image_count/${event_id}`);

      if (response.ok) {
        const data = await response.json();
        console.log("Number of images : " + data);
        return data;
      } else {
        console.error('Failed to fetch n:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching n:', error);
    }
  };

  const closeForm = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains("form-popup")) {
      setShowForm(!showForm);
    }
  };

  const toggleForm = (editIndex: number | null) => {
    setEditIndex(editIndex ?? null);
    setShowForm(!showForm);
  };
  
  const renderForm = () => (
    <div onClick={closeForm} className={showForm ? "form-popup active" : "form-popup"}>
      <form className="form-container" style={{ transform: 'scale(0.75)' }}>
        <h2>{editIndex != null ? 'Edit Event' : 'Add New Event'}</h2>
        <label>Event Name:</label>
        <input type="text" placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} required />
        
        <label>Event Location:</label>
        <input type="text" placeholder="Location" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} required />
        
        <label>Event City:</label>
        <input type="text" placeholder="City" value={eventCity} onChange={(e) => setEventCity(e.target.value)} required />
        
        <label>Event Date:</label>
        <input type="datetime-local" placeholder="Select Date and Time" onChange={(e) => setEventDate(new Date(e.target.value))} required />
        
        {editIndex !== null ? (
          <>
            <label>Add new Event Images:</label>
            <input type="file" multiple placeholder="Select Images to Update" onChange={handleEventImageUpload} />
            <label>Select images to update or remove:</label>
            {Array.from({ length: events[editIndex]?.number_of_event_images ?? 0 }).map((_, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  onChange={(e) => handleImageCheckboxChange(index, e.target.checked)}
                />
                <img
                  src={`http://127.0.0.1:5000/api/get_event_image/${events[editIndex]?.event_id}/${index}`}
                  height="64"
                  width="64"
                  alt={`Event Image ${index + 1}`}
                />
              </div>
            ))}
          </>
        ) : (
          <>
            <label>Event Images:</label>
            <input type="file" placeholder="Select Images" onChange={handleEventImageUpload} multiple/>
          </>
        )}
        
        <label>Event Poster:</label>
        <input type="file" placeholder="Select Poster" onChange={handleEventPosterUpload} />
        
        <label>Event Description:</label>
        <textarea placeholder="Description" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} required />
        
        <label>Event Tags:</label>
        <input type="text" placeholder="Tags (comma-separated)" value={eventTags} onChange={(e) => setEventTags(e.target.value)} required />
        
        {editIndex !== null ? (
          <button type="button" onClick={() => handleEditEvent(editIndex)}>Save Event</button>
        ) : (
          <button type="button" onClick={handleAddOrEditEvent}>Add Event</button>
        )}
        <button type="button" onClick={() => toggleForm(null)}>Close</button>
      </form>
    </div>
  );
  
  

  const fetchEvents = async (organizerId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/get_events?organizer_id=${organizerId}`);
      if (response.ok) {
        const eventData = await response.json();
        const mappedEvents = eventData.map(async (event: any) => {
          const numImages = await SetNumberofEventImages(event.event_id);
          const numAudience = await SetInterestedAudience(event.event_id);
          return {
            name: event.name || '',
            location: event.location || '',
            city: event.city || '',
            date: new Date(event.date),
            description: event.description || '',
            tags: event.tags ? event.tags.split(',') : [],
            event_id: event.event_id || '',
            images: event.images || [],
            price: parseFloat(event.price) || 0,
            number_of_event_images: numImages,
            number_of_interested_audience: numAudience,
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

  const handleEventImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setEventImages([...(eventImages ?? []), ...Array.from(files)]);
    }
  };

  const handleEventPosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setEventPoster(file);
    }
  };

  const handleEditEvent = (index: number) => {
    if (editIndex !== null) {
      setEventImages(events[index].images.map(image => new File([image], `image${events[index].images.indexOf(image) + 1}.jpg`)));
    }
  
    const eventToEdit = events[index];
    setEditIndex(index);
  
    setEventName(eventToEdit.name);
    setEventLocation(eventToEdit.location);
    setEventCity(eventToEdit.city);
    setEventDate(eventToEdit.date);
    setEventImages([]);
    setEventDescription(eventToEdit.description);
    setEventPoster(null);
    setEventTags(eventToEdit.tags.join(', '));
    setEventPrice(eventToEdit.price);
  
    toggleForm(index);
  };
  
  const handleImageCheckboxChange = (index: number, isChecked: boolean) => {
    const newImages = [...(eventImages ?? [])];
    const selectedImage = events[editIndex]?.images[index];
    if (selectedImage && isChecked) {
      newImages.push(selectedImage);
    } else {
      newImages.splice(index, 1);
    }
    setEventImages(newImages);
  };
  

  const handleAddOrEditEvent = async () => {
    try {
      var url = null;
      var method = null;
      
      if (eventDate && eventDate.getTime() < Date.now()) {
        alert('Please select a date in the future!!');
        return;
      }
  
      const formData = new FormData();
      formData.append('name', eventName);
      formData.append('location', eventLocation);
      formData.append('city', eventCity);
      formData.append('date', eventDate?.toISOString() ?? '');
      formData.append('price', eventPrice.toString());
  
      if (eventImages) {
        for (let i = 0; i < eventImages.length; i++) {
          formData.append('event_images', eventImages[i]);  // Changed key to 'eventImages'
        }
      }
  
      formData.append('description', eventDescription);
      formData.append('tags', eventTags);
  
      if (eventPoster) {
        formData.append('poster', eventPoster);
      }
  
      formData.append('organizer_id', OrganizerId);
      formData.append('organizer_name', OrganizerName);
  
      url = `http://127.0.0.1:5000/api/add_event?organizer_id=${OrganizerId}`;
      method = 'POST';
  
      if (editIndex != null) {
        url = `http://127.0.0.1:5000/api/update_event/${OrganizerId}/${events[editIndex].event_id}`;
        method = 'PUT';
      }
      
      console.log("FormData:", formData); // Log formData to check if images are appended correctly
  
      const response = await fetch(url, {
        method: method,
        body: formData,
      });
  
      console.log("Response:", response); // Log response to check the API response
  
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
        setEventDate(null);
        setEventImages(null);
        setEventDescription('');
        setEventPoster(null);
        setEventTags('');
        setEventPrice(0);
        setEditIndex(null); // Reset editIndex here
        setShowForm(false);
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
    <div className="organizer-dashboard" style={{ backgroundColor: '#17591865', width: "100%" }}>
      <h2 className="Welcome">
        Welcome {OrganizerName}!!
        <br />
        Organizer Id: {OrganizerId}
      </h2>
      <div className="logout-container">
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="event-details">
        <button className="btn btn-dark" onClick={() => toggleForm(null)}>Add New Event</button>
        {showForm && renderForm()}
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
              <u>Number of Interested Audience </u>: {event.number_of_interested_audience}
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
              <u>Price</u>: {event.price}
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
            <div className='Event-Images-Section'>
              {Array.from({ length: event.number_of_event_images }).map((_, index) => (
                <img
                  key={index}
                  src={`http://127.0.0.1:5000/api/get_event_image/${event.event_id}/${index}`}
                  height="256"
                  width="256"
                  alt={`Event Image ${index + 1}`}
                  className='event-image'
                />
              ))}
              
            </div>
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
