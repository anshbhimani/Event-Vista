import { useState, useEffect } from 'react';
import { navigate } from 'wouter/use-browser-location';

type Event = {
  event_id: string;
  name: string;
  location: string;
  city: string;
  date: string;
  description: string;
  tags: string[];
  interested: boolean;
  images: string[];
  attendeeId: string;
};

export function EventDashboard() {
  const [eventName, setEventName] = useState<string>('');
  const [eventLocation, setEventLocation] = useState<string>('');
  const [eventCity, setEventCity] = useState<string>('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [numberofEventImages, setNumberofEventImages] = useState<number>(0);
  const [eventDescription, setEventDescription] = useState<string>('');
  const [eventTags, setEventTags] = useState<string>('');
  const [event, setEvent] = useState<Event | null>(null);
  const [interestedAudience, setInterestedAudience] = useState<number>(0);
  const [interested, setInterested] = useState<boolean>(false);
  const [attendeeId, setAttendeeId] = useState<string>('');

  const SetNumberofEventImages = async (event_id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get_event_image_count/${event_id}`);

      if (response.ok) {
        const data = await response.json();
        setNumberofEventImages(data);
      } else {
        console.error('Failed to fetch n:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching n:', error);
    }
  };

  const toggleInterest = async () => {
    const storedEvent = JSON.parse(localStorage.getItem('selectedEvent') || '{}');
    const newInterested = !interested;

    try {
      const response = await fetch(`http://localhost:5000/api/send_interested/${storedEvent.event_id}/${newInterested}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interested: newInterested, attendeeId }),
      });

      if (!response.ok) {
        console.error('Failed to update interest status:', response.statusText);
        return;
      }

      setInterested(newInterested);
      SetInterestedAudience(storedEvent.event_id);

    } catch (error) {
      console.error('Error updating interest status:', error);
    }
  };

  const SetInterestedAudience = async (event_id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get_interested/${event_id}`);

      if (response.ok) {
        const number_of_interested = await response.json();
        setInterestedAudience(number_of_interested);
      } else {
        console.error('Failed to fetch interested audience:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching interested audience:', error);
    }
  };

  const goBack = async() => {
    navigate('/attendee-dashboard');
  }

  useEffect(() => {
    const storedEvent = JSON.parse(localStorage.getItem('selectedEvent') || '{}');
    console.log(storedEvent);
    setEvent(storedEvent);
    setEventName(storedEvent.name || '');
    setEventLocation(storedEvent.location || '');
    setEventCity(storedEvent.city || '');
    setEventDate(new Date(storedEvent.date) || null);
    setEventDescription(storedEvent.description || '');
    setEventTags(storedEvent.tags ? storedEvent.tags.join(', ') : '');
    setInterested(storedEvent.interested || false);
    setAttendeeId(storedEvent.attendeeId || '');  // Corrected the property name

    if (storedEvent.event_id) {
      SetNumberofEventImages(storedEvent.event_id);
      SetInterestedAudience(storedEvent.event_id);
    }
  }, []);

  return (
    <div>
    <nav>
      <button onClick={goBack}>Back</button>
    </nav>
      {event && (
        <div>
          <h2>{eventName}</h2>
          <div className='interested-toggle-button-container'>
            <button onClick={toggleInterest}>
              {interested ? 'Not Interested' : 'Interested'}
            </button>
            <p>Interested Audience: {interestedAudience}</p>
          </div>
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
