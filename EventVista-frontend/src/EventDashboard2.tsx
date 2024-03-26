import { useState, useEffect } from 'react';
import './AttendeeDashboardBackup.css'

export function EventDashboardBackup() {
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
    <div className='attendee-dashboard'>
      <header>
        {event && <div className="popular-movie-slider" style={{ height: '100vh' }}>
          <img src={`http://127.0.0.1:5000/api/get_event_poster/65f91a212c347dac780cd369`} className="poster" alt="Movie Poster" />

          <div className="popular-movie-slider-content">
            <p className="release">2017</p>
            <h2 className="movie-name">{eventName}</h2>
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
                &nbsp;&nbsp;&nbsp;<span>164 min.</span>
              </i>
              <i className="fa fa-volume-up">
                {' '}
                &nbsp;&nbsp;&nbsp;<span>Subtitles</span>
              </i>
              <i className="fa fa-circle">
                {' '}
                &nbsp;&nbsp;&nbsp;<span>Imdb: <b>9.1/10</b></span>
              </i>
            </div>

            <div className="movie-btns">
              <button>
                <i className="fa fa-play"></i> &nbsp; Watch trailer
              </button>
              <button className="read-more" onClick={toggleInterest}>
                <i className="fa fa-circle"></i> <i className="fa fa-circle"></i> <i className="fa fa-circle"></i>&nbsp; {interested ? 'Not Interested' : 'Interested'}
              </button>
            </div>
          </div>
        </div>
  }
      </header>
    </div>
  );
}
