import { useState, useEffect } from 'react';

export function EventDashboard() {
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventCity, setEventCity] = useState('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [eventImages, setEventImages] = useState<File[] | null>(null);
  const [numberofEventImages, setNumberofEventImages] = useState(0);
  const [eventDescription, setEventDescription] = useState('');
  const [eventTags, setEventTags] = useState<string>('');
  const [event, setEvent] = useState<any>(null);

  // Define SetNumberofEventImages before using it in useEffect
  const SetNumberofEventImages = async (event_id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get_event_image_count/${event_id}`);

      if (response.ok) {
        const data = await response.json();
        console.log("Number of images : " + data);
        setNumberofEventImages(data);
      } else {
        console.error('Failed to fetch n:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching n:', error);
    }
  };

  useEffect(() => {
    // Retrieve the selected event details from localStorage
    const storedEvent = JSON.parse(localStorage.getItem('selectedEvent') || '{}');

    // Set individual event properties
    setEvent(storedEvent);
    setEventName(storedEvent.name || '');
    setEventLocation(storedEvent.location || '');
    setEventCity(storedEvent.city || '');
    setEventDate(new Date(storedEvent.date) || null);
    setEventDescription(storedEvent.description || '');
    setEventTags(storedEvent.tags ? storedEvent.tags.join(', ') : '');

    // Call SetNumberofEventImages after setting event_id
    if (storedEvent.event_id) {
      SetNumberofEventImages(storedEvent.event_id);
    }
  }, []); // No dependency here

  return (
    <div>
      {event && (
        <div>
          <h2>{eventName}</h2>
          <p>Event Name: {eventName}</p>
          <p>Event Id: {event.event_id}</p>
          <p>Location: {eventLocation}</p>
          <p>City: {eventCity}</p>
          <p>Event Date: {eventDate?.toLocaleString()}</p>
          <p>Description: {eventDescription}</p>
          <p>Tags: {eventTags}</p>
          
          <div className="event-images">
            {event.images && event.images.map((imageUrl: string, index: number) => (
              <img key={index} src={imageUrl} alt={`Event Image ${index + 1}`} />
            ))}
          </div>

          <p>Poster: </p>
          <img src={`http://127.0.0.1:5000/api/get_event_poster/${event.event_id}`} height="350" width="256" alt="Poster" />
          
          <p>Event Images: </p>
          {Array.from({ length: numberofEventImages }).map((_, index) => (
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
      )}
    </div>
  );
}
