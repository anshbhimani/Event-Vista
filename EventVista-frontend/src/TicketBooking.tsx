import { useState, useEffect } from "react";
import "./TicketBooking.css";

export function TicketBooking() {
  const [eventName, setEventName] = useState<string>("");
  const [event_id, setEventId] = useState<string>("");
  const [eventPrice, setEventPrice] = useState(0);
  const [eventLocation, setEventLocation] = useState<string>("");
  const [eventCity, setEventCity] = useState<string>("");
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedEvent = JSON.parse(localStorage.getItem("selectedEvent") || "");
    setEventName(storedEvent.name || "");
    setEventId(storedEvent.event_id || "");
    setEventPrice(storedEvent.price || 0);
    setEventLocation(storedEvent.location || "");
    setEventCity(storedEvent.city || "");
    setEventDate(new Date(storedEvent.date) || null);
  }, []);

  const bookTicket = async () => {
    try {
       var attendee_id = JSON.parse(localStorage.getItem('selectedEvent'))["attendeeId"];
        
      const response = await fetch(`http://localhost:5000/api/book_ticket/${attendee_id}/${event_id}/${ticketQuantity}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Price: eventPrice,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text(); // Get the error message from response body
        throw new Error(errorMessage || `${response.statusText}`);
      }

      console.log("Registration Successful");
    } catch (error) {
      console.error("Error registering:", error);
    }
  };

  return (
    <div className="Ticket-Booking">
      <div className="Booking-Event-Details">
        <div className="poster">
          <img
            src={`http://127.0.0.1:5000/api/get_event_poster/${event_id}`}
            alt="Event Poster"
            className="poster"
          />
        </div>
        <div className="Event-Details">
          <h1>{eventName}</h1>
          <p>
            <strong>Event Id:</strong> {event_id}
          </p>
          <p>
            <strong>Event Price:</strong> {eventPrice}
          </p>
          <p>
            <strong>Event Location:</strong> {eventLocation}
          </p>
          <p>
            <strong>Event City:</strong> {eventCity}
          </p>
          <p>
            <strong>Event Date:</strong> {eventDate?.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="Attendee-Details">
        <form onSubmit={(e) => { e.preventDefault(); bookTicket(); }}>
          <label htmlFor="ticketNumber">Number of Tickets:</label>
          <input
            type="number"
            id="ticketNumber"
            placeholder="Enter number of tickets"
            min={1}
            value={ticketQuantity}
            onChange={(e) => setTicketQuantity(Number(e.target.value))}
          />
          <button type="submit">
            Book Tickets
          </button>
        </form>
      </div>
    </div>
  );
}
