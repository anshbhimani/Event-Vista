import { useState, useEffect } from 'react';
import './TicketBooking.css'

export function TicketBooking(){
    const [eventName, setEventName] = useState<string>('');
    const [event_id, setEventId] = useState<string>('');
    const [eventPrice, setEventPrice] = useState(0);
    const [eventLocation, setEventLocation] = useState<string>("");
    const [eventCity, setEventCity] = useState<string>('');
    const [eventDate, setEventDate] = useState<Date | null>(null);
   
    useEffect(()=>{
        const storedEvent = JSON.parse(localStorage.getItem('selectedEvent') || "");
        setEventName(storedEvent.name || '');
        setEventId(storedEvent.event_id || "");
        setEventPrice(storedEvent.price || 0);
        setEventLocation(storedEvent.location || "");
        setEventCity(storedEvent.city || "");
        setEventDate(new Date(storedEvent.date) || null);
    })

    return (
        <div className='Ticket-Booking'>
            <div className='Booking-Event-Details'>
                <img src={`http://127.0.0.1:5000/api/get_event_poster/${event_id}`} className="poster"/>
                <br/>
                Event Name : {eventName}
                <br/>
                Event Id : {event_id}
                <br/>
                Event Price : {eventPrice}
                <br/>
                Event Location : {eventLocation}
                <br/>
                Event City : {eventCity}
                <br/>
                Event Date : {eventDate?.toLocaleString()}
            </div>
            <div className='Attendee-Details'>

            </div>
        </div>
    )
}