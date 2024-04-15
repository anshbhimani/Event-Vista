import { useState, useEffect } from 'react';
import './EventDashboard2.css'; 
import { navigate } from 'wouter/use-browser-location';

type Event = {
  averageRating: number;
};

export function EventDashboardBackup2() {
  const [eventName, setEventName] = useState<string>('');
  const [event_id, setEventId] = useState<string>('');
  const [eventLocation, setEventLocation] = useState<string>('');
  const [eventCity, setEventCity] = useState<string>('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [numberofEventImages, setNumberofEventImages] = useState<number>(0);
  const [eventDescription, setEventDescription] = useState<string>('');
  const [eventTags, setEventTags] = useState<string>('');
  const [event, setEvent] = useState<Event | null>(null);
  const [interestedAudience, setInterestedAudience] = useState<number>(0);
  const [interested, setInterested] = useState<boolean>(false);
  const [eventPrice, setEventPrice] = useState<number>(0);
  const [attendeeId, setAttendeeId] = useState<string>('');
  const [ratings, setRatings] = useState<any[]>([]);
  const [eventReview, setEventReview] = useState<string>('');
  const [userRating, setUserRating] = useState<number>(0);

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

  const BookTicket = async () => {
    const storedEvent = JSON.stringify({
      event_id,
      name: eventName,
      location: eventLocation,
      city: eventCity,
      date: eventDate,
      description: eventDescription,
      tags: eventTags.split(',').map(tag => tag.trim()),
      price: eventPrice,
      interested,
      attendeeId,
    });

    localStorage.clear();
    localStorage.setItem('selectedEvent', storedEvent);
    // Redirect or navigate to the booking page
    navigate('/ticket-booking');
  };

  const toggleInterest = async () => {
    const storedEvent = JSON.parse(localStorage.getItem('selectedEvent') || '{}');
    let newInterested = !interested;

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

  const submitRating = async () => {
    const storedEvent = JSON.parse(localStorage.getItem('selectedEvent') || '{}');
    try {
      const response = await fetch(`http://localhost:5000/api/submit_review/${storedEvent.event_id}/${attendeeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: userRating, review: eventReview, attendeeId }),
      });

      if (response.ok) {
        // Refresh ratings
        fetchRatings(storedEvent.event_id);
      } else {
        console.error('Failed to submit rating:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const fetchRatings = async (event_id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get_reviews/${event_id}`);

      if (response.ok) {
        const data = await response.json();
        setRatings(data.reviews); // Assuming data has a 'reviews' field
        calculateAverageRating(data.reviews);
      } else {
        console.error('Failed to fetch ratings:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const calculateAverageRating = (ratings: any[]) => {
    const totalRating = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;
    setEvent((prevEvent) => ({ ...prevEvent, averageRating }));
  };

  useEffect(() => {
    const storedEvent = JSON.parse(localStorage.getItem('selectedEvent') || '{}');
    setEventId(storedEvent.event_id);
    setEventName(storedEvent.name);
    setEventLocation(storedEvent.location);
    setEventCity(storedEvent.city);
    setEventDate(new Date(storedEvent.date));
    setEventDescription(storedEvent.description);
    setEventTags(storedEvent.tags?.join(', ') || '');
    setEventPrice(storedEvent.price);
    setInterested(storedEvent.interested);
    setAttendeeId(storedEvent.attendeeId);

    SetNumberofEventImages(storedEvent.event_id);
    SetInterestedAudience(storedEvent.event_id);
    fetchRatings(storedEvent.event_id);
  }, []);

  return (
    <div className="event-dashboard-container">
      <h1>{eventName}</h1>
      <div className="event-details">
        <p>
          <strong>Location:</strong> {eventLocation}, {eventCity}
        </p>
        <p>
          <strong>Date:</strong> {eventDate?.toLocaleDateString()}
        </p>
        <p>
          <strong>Price:</strong> ${eventPrice}
        </p>
        <p>
          <strong>Description:</strong> {eventDescription}
        </p>
        <p>
          <strong>Tags:</strong> {eventTags}
        </p>
        <p>
          <strong>Interested Audience:</strong> {interestedAudience}
        </p>
        <p>
          <strong>Number of Event Images:</strong> {numberofEventImages}
        </p>
      </div>
      <button onClick={toggleInterest}>
        {interested ? 'Not Interested' : 'Interested'}
      </button>
      <button onClick={BookTicket}>Book Ticket</button>
      <div className="event-ratings">
        <h2>Event Ratings</h2>
        <div className="rating-input">
          <label>
            Your Rating:
            <select
              value={userRating}
              onChange={(e) => setUserRating(Number(e.target.value))}
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </label>
          <label>
            Your Review:
            <textarea
              value={eventReview}
              onChange={(e) => setEventReview(e.target.value)}
            />
          </label>
          <button onClick={submitRating}>Submit Rating</button>
        </div>
        <div className="average-rating">
          <strong>Average Rating:</strong> {event?.averageRating}
        </div>
        <div className="all-ratings">
          {ratings.map((rating, index) => (
            <div key={index} className="rating-item">
              <br/>
              <div>
                <strong>Rating:</strong> {rating.rating}
              </div>
              <div>
                <strong>Review:</strong> {rating.review}
              </div>
              <div>
                <strong>Rated By:</strong> {rating.attendee_id}
              </div>
              <br/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
