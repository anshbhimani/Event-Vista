import { useState, useEffect } from 'react';
import './TicketBooking.css'

export function TicketBooking(){
    const [eventName, setEventName] = useState<string>('');
    const [event_id, setEventId] = useState<string>('');
    const [eventPrice, setEventPrice] = useState(0);
   
    useEffect(()=>{
        const storedEvent = JSON.parse(localStorage.getItem('selectedEvent') || "");
        setEventName(storedEvent.name || '');
        setEventId(storedEvent.event_id || "");
        setEventPrice(storedEvent.eventPrice || 0);
    })

    return (
        <div>
            {eventName}
            <br/>
            {event_id}
            <br/>
            {eventPrice}
        </div>
    )
}