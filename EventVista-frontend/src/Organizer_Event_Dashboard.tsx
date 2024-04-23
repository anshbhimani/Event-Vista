import React, { useState, useEffect } from 'react';
import './Organizer_Event_Dashboard.css';
import { navigate } from 'wouter/use-browser-location';

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

export function OrganizerEventDashboard() {
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventCity, setEventCity] = useState('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [eventImages, setEventImages] = useState<File[] | null>(null);
  const [eventPrice, setEventPrice] = useState<number>(0);
  const [eventId, setEventId] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventPoster, setEventPoster] = useState<File | null>(null);
  const [eventTags, setEventTags] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [OrganizerId] = useState<string>(() => localStorage.getItem('organizerId') ?? '');
  const [OrganizerName] = useState<string>(() => localStorage.getItem('organizerName') ?? '');
  const [showForm, setShowForm] = useState(false);
  const [number_of_event_images, setNumberofEventImages] = useState<number>(0);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<number[]>([]);

  useEffect(() => {
    const organizerId = localStorage.getItem('organizerId');
    const eventId = localStorage.getItem('eventId');
    setEventName(localStorage.getItem('eventName') ?? '');
    setEventLocation(localStorage.getItem('eventLocation') ?? '');
    setEventCity(localStorage.getItem('eventCity') ?? '');
    setEventDate(new Date(localStorage.getItem('eventDate') ?? ''));
    setEventImages([]);
    setEventDescription(localStorage.getItem('eventDescription') ?? '');
    setEventPoster(null);
    setEventTags(localStorage.getItem('eventTags') ?? '');
    setEventPrice(parseFloat(localStorage.getItem('eventPrice') ?? '0'));
    setEventId(eventId ?? '');
    fetchNumberofEventImages(eventId);
  }, [OrganizerId]);

  const fetchNumberofEventImages = async (event_id: string | null) => {
    if (event_id) {
      try {
        const response = await fetch(`http://localhost:5000/api/get_event_image_count/${event_id}`);

        if (response.ok) {
          const data = await response.json();
          setNumberofEventImages(data);
        } else {
          console.error('Failed to fetch image count:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching image count:', error);
      }
    }
  };

  const handleEventImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files).map((file) => URL.createObjectURL(file));
      setSelectedImages(fileList);
      setEventImages(files);
    }
  };

  const handleImageCheckboxChange = (index: number, isChecked: boolean) => {
    if (isChecked) {
      setRemovedImages([...removedImages, index]);
    } else {
      setRemovedImages(removedImages.filter((i) => i !== index));
    }
  };

  const handleEventPosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setEventPoster(file);
    }
  };

  const toggleForm = (editIndex: number | null) => {
    setEditIndex(editIndex ?? null);
    setShowForm(!showForm);
  };

  const handleEditEvent = (index: number) => {
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
    setSelectedImages(eventToEdit.images ?? []);
    fetchNumberofEventImages(eventToEdit.event_id);
    toggleForm(index);
  };

  const handleAddOrEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let url = null;
      let method = null;

      if (eventDate && eventDate.getTime() < Date.now()) {
        alert('Please select a date in the future!!');
        return;
      }

      const formData = new FormData();
      formData.append('event_id', eventId);
      formData.append('organizer_id', OrganizerId);
      formData.append('name', eventName);
      formData.append('location', eventLocation);
      formData.append('city', eventCity);
      formData.append('date', eventDate?.toISOString() ?? '');
      formData.append('price', eventPrice.toString());

      if (eventImages) {
        for (let i = 0; i < eventImages.length; i++) {
          formData.append('image', eventImages[i]);
        }
      }

      formData.append('description', eventDescription);
      formData.append('tags', eventTags);

      if (eventPoster) {
        formData.append('poster', eventPoster);
      }

      formData.append('organizer_name', OrganizerName);

      url = `http://127.0.0.1:5000/api/update_event/${OrganizerId}/${eventId}`;
      method = 'PUT';

      if (editIndex === null) {
        url = `http://127.0.0.1:5000/api/add_event?organizer_id=${OrganizerId}`;
        method = 'POST';
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
        setEventDate(null);
        setEventImages(null);
        setEventDescription('');
        setEventPoster(null);
        setEventTags('');
        setEventPrice(0);
        setEditIndex(null);
        setShowForm(false);
        setEventId('');
      } else {
        console.error('Failed to add/update event:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding/updating event:', error);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      var event_id = localStorage.getItem('eventId')
      const response = await fetch(`http://127.0.0.1:5000/api/delete_event/${event_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Successfully Deleeted Event :');
      } else {
        console.error('Failed to delete event:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const closeForm = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains("form-popup")) {
      setShowForm(!showForm);
    }
  };

  const renderForm = () => (
    <div onClick={closeForm} className={showForm ? "form-popup active" : "form-popup"}>
      <form onSubmit={handleAddOrEditEvent} className="form-container" style={{ transform: 'scale(0.70)' }}>
        <h2>{editIndex != null ? 'Edit Event' : 'Add New Event'}</h2>
        <div className="form-row">
          <div className="form-column">
            <label>Event Name:</label>
            <input type="text" placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} required />
            
            <label>Event Location:</label>
            <input type="text" placeholder="Location" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} required />
            
            <label>Event City:</label>
            <input type="text" placeholder="City" value={eventCity} onChange={(e) => setEventCity(e.target.value)} required />
            
            <label>Event Date:</label>
            <input type="datetime-local" placeholder="Select Date and Time" onChange={(e) => setEventDate(new Date(e.target.value))} required />
            
            <label>Event Price:</label>
            <input type="number" placeholder="Price" value={eventPrice} onChange={(e) => setEventPrice(parseFloat(e.target.value))} required />
          </div>
          <div className="form-column">
            {editIndex != null ? (
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

            <button type="submit">{editIndex != null ? 'Save Event' : 'Add Event'}</button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div>
      <br/>
      <div>
        <button className='back-button' onClick={() => navigate('/organizer-dashboard')}>Back</button>
      </div>
      <br/>
      <br/>
      <div className="event-details">
        <button className="btn btn-dark" onClick={() => handleDeleteEvent()}>Delete Event</button>   
        &nbsp;&nbsp;
        <button className="btn btn-dark" onClick={() => toggleForm(0)}>Edit Event</button>
        {showForm && renderForm()}
      </div>
      {eventId}
      <br />
      {eventName}
      <br />
      {eventDate?.toString()}
      <br />
      {eventCity}
      <br />
      {eventDescription}
      <br />
      {eventTags}
      <br />
      {eventLocation}
      <br />
      {eventPrice}
      <br />
      <img src={`http://127.0.0.1:5000/api/get_event_poster/${eventId}`} alt="Poster" height="350" />
      <br />

      <p>Event Images: </p>
      Number of event images : {number_of_event_images}
      <br/>
      {Array.from({ length: number_of_event_images }).map((_, index) => (
        <img
          key={index}
          src={`http://127.0.0.1:5000/api/get_event_image/${eventId}/${index}`}
          height="500"
          width="450"
          alt={`Event Image ${index + 1}`}
          className='event-image'
        />
      ))}
      
    </div>
  );
}
