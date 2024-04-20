import { useState, useEffect } from 'react';
import './EventDashboard2.css';
import { navigate } from 'wouter/use-browser-location';

export function EventDashboardBackup() {
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
  const [averageRating, setAverageRating] = useState<number>(0);

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
      attendeeId
    });
    
    localStorage.setItem('selectedEvent', storedEvent);
    // Redirect or navigate to the booking page
    navigate('/ticket-booking');
  }

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
    try {
      const response = await fetch(`http://localhost:5000/api/submit_review/${event_id}/${attendeeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: userRating, review: eventReview }),
      });

      if (response.ok) {
        fetchRatings(event_id);  // Fetch ratings after submitting a new one
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
        setRatings(data.reviews);
        setAverageRating(data.average_rating);
      } else {
        console.error('Failed to fetch ratings:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const calculateAverageRating = (ratings: any[]) => {
    if (ratings.length === 0) {
      setAverageRating(0);
      return;
    }
    
    const totalRating = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = totalRating / ratings.length;
    setAverageRating(averageRating);
  };


  useEffect(() => {
    const storedEvent = JSON.parse(localStorage.getItem('selectedEvent') || '{}');
    setEventId(storedEvent.event_id);
    setEvent(storedEvent);
    setEventName(storedEvent.name || '');
    setEventLocation(storedEvent.location || '');
    setEventCity(storedEvent.city || '');
    setEventDate(new Date(storedEvent.date) || null);
    setEventDescription(storedEvent.description || '');
    setEventTags(storedEvent.tags ? storedEvent.tags.join(', ') : '');
    setEventPrice(storedEvent.price || 0);
    setInterested(storedEvent.interested || false);
    setAttendeeId(storedEvent.attendeeId || '');


    if (storedEvent.event_id) {
      SetNumberofEventImages(storedEvent.event_id);
      SetInterestedAudience(storedEvent.event_id);
      fetchRatings(storedEvent.event_id);  // Fetch ratings when component mounts
    }
    
  }, []);

  useEffect(() => {
    calculateAverageRating(ratings);
  }, [ratings]);

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector('nav');
      if (nav) {
        if (window.pageYOffset >= 20) {
          nav.classList.add('nav');
        } else {
          nav.classList.remove('nav');
        }

        if (window.pageYOffset >= 700) {
          nav.classList.add('navBlack');
        } else {
          nav.classList.remove('navBlack');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className='event-dashboard'>
      <header>
      <button className='back-button' onClick={() => navigate('/attendee-dashboard')}>Back</button>
        {event && <div className="popular-movie-slider">
          <img src={`http://127.0.0.1:5000/api/get_event_poster/${event_id}`} className="poster" alt="Movie Poster" />

          <div className="popular-movie-slider-content">
            <h2 className="movie-name">{eventName}</h2>
            <p className="release"></p>
            <ul className="category">
              <p>{eventTags}</p>
              <li>{eventTags}</li>
              <li>{eventTags}</li>
            </ul>
            <p className="desc">
              {eventDescription}
            </p>

            <div className="movie-info">
              <i className="fa fa-clock-o">
                {' '}
                &nbsp;&nbsp;&nbsp;<span><b><u>Location</u> :</b> {eventLocation}</span>
              </i>
              <i className="fa fa-volume-up">
                {' '}
                &nbsp;&nbsp;&nbsp;<span><b><u>City</u> : </b>{eventCity}</span>
              </i>
              <i className="fa fa-circle">
                {' '}
                &nbsp;&nbsp;&nbsp;<span><b><u>Date and Time</u> : </b>{eventDate?.toLocaleString()}</span>
              </i>
              <i className="fa fa-circle">
                {' '}
                &nbsp;&nbsp;&nbsp;<span><b><u>Price</u> : </b>{eventPrice}</span>
              </i>
            </div>

            <div className="movie-btns">
              <button className="read-more" onClick={toggleInterest}>
                <i className="fa fa-play"></i> <i className="fa fa-play"></i> <i className="fa fa-play"></i>&nbsp; {interested ? 'Not Interested' : 'Interested'}
              </button>
              <button onClick={BookTicket}>
                <i className="fa fa-circle"></i> &nbsp; Book Tickets
              </button>
            </div>
          </div>
        </div>
        }
      </header>
      <div className="event-ratings">
        <center>
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
            <strong>Average Rating:</strong> {averageRating}
          </div>
          <div className="all-ratings">
          {ratings && ratings.length > 0 ? (
            ratings.map((rating, index) => (
              <div key={index} className="rating-item">
                <div>
                  <strong>Rating:</strong> {rating.rating}
                </div>
                <div>
                  <strong>Review:</strong> {rating.review}
                </div>
                <div>
                  <strong>Rated By:</strong> {rating.attendee_id}
                </div>
              </div>
            ))
          ) : (
            <p>No ratings yet</p>
          )}
          </div>
        </center>
      </div>
    </div>
  );
}
