import { useState, useEffect } from 'react';
import './EventDashboard2.css'
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
  const [ratings, setRatings] = useState([]);
  const [eventReview, setEventReview] = useState('');

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

  const BookTicket = async() => {
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

    localStorage.clear();
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


  // const fetchRatings = async() => {
  //   try{
      
  //   }
  // }

  useEffect(() => {
    const storedEvent = JSON.parse(localStorage.getItem('selectedEvent') || '{}');
    console.log(storedEvent);
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
    <div className='event-dashboard'>
      <header>
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
      <div className='Rating'>
        <div>
        Ansh
        </div>
        <div class="container-fluid px-1 py-5 mx-auto">
          <div class="row justify-content-center">
            <div class="col-xl-7 col-lg-8 col-md-10 col-12 text-center mb-5">
              <div className="card">
                      <div className="row justify-content-left d-flex">
                          <div className="col-md-4 d-flex flex-column">
                              <div className="rating-box">
                                  <h1 className="pt-4">4.0</h1>
                                  <p className="">out of 5</p>
                              </div>
                              <div> <span className="fa fa-star star-active mx-1"></span> <span class="fa fa-star star-active mx-1"></span> <span class="fa fa-star star-active mx-1"></span> <span class="fa fa-star star-active mx-1"></span> <span class="fa fa-star star-inactive mx-1"></span> </div>
                          </div>
                          <div className="col-md-8">
                              <div className="rating-bar0 justify-content-center">
                                  <table className="text-left mx-auto">
                                      <tr>
                                          <td className="rating-label">Excellent</td>
                                          <td className="rating-bar">
                                              <div className="bar-container">
                                                  <div className="bar-5"></div>
                                              </div>
                                          </td>
                                          <td className="text-right">123</td>
                                      </tr>
                                      <tr>
                                          <td className="rating-label">Good</td>
                                          <td className="rating-bar">
                                              <div className="bar-container">
                                                  <div className="bar-4"></div>
                                              </div>
                                          </td>
                                          <td className="text-right">23</td>
                                      </tr>
                                      <tr>
                                          <td className="rating-label">Average</td>
                                          <td className="rating-bar">
                                              <div className="bar-container">
                                                  <div className="bar-3"></div>
                                              </div>
                                          </td>
                                          <td className="text-right">10</td>
                                      </tr>
                                      <tr>
                                          <td className="rating-label">Poor</td>
                                          <td className="rating-bar">
                                              <div className="bar-container">
                                                  <div className="bar-2"></div>
                                              </div>
                                          </td>
                                          <td className="text-right">3</td>
                                      </tr>
                                      <tr>
                                          <td className="rating-label">Terrible</td>
                                          <td className="rating-bar">
                                              <div className="bar-container">
                                                  <div className="bar-1"></div>
                                              </div>
                                          </td>
                                          <td className="text-right">0</td>
                                      </tr>
                                  </table>
                              </div>
                          </div>
                      </div>
                  </div>
              <div>
              Bhimani
              </div>
            </div>
          </div>
        </div>
      </div>    
    </div>
  );
}
