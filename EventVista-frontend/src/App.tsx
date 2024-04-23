// App.tsx
import { Route, Switch } from 'wouter'; // Import Switch from wouter
import { ForgotPassword } from './ForgotPassword';
import { AttendeeDashboard } from './AttendeeDashboard';
import { EventDashboardBackup } from './EventDashboard2';
import { OrganizerDashboard } from './OrganizerDashboard';
import { LoginSignup } from './Login';
import { EventDashboard } from './EventDashboard';
import { AdminDashboard } from './AdminDashboard';
import { TicketBooking } from './TicketBooking';
import {EventDashboardBackup2} from './test';
import { TicketBooking2 } from './TicketBooking2';
import { OrganizerEventDashboard } from './Organizer_Event_Dashboard';

function App() {
  return (
      <Switch> {/* Use Switch to ensure only one route is rendered */}
        <Route path="/" component={HomePage} />
        // <Route path="/login" component={LoginSignup} />
        <Route path='login' component={LoginSignup}/>
        <Route path="/register" component={LoginSignup} />
        
        <Route path='/testing-event-dashboard' component={EventDashboardBackup2} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/organizer-dashboard" component={OrganizerDashboard} />
        <Route path="/attendee-dashboard" component={AttendeeDashboard} /> {/*New route for AttendeeDashboard*/}
        <Route path='/event-dashboard-backup' component={EventDashboard} />
        <Route path="/organizer-dashboard" component={OrganizerDashboard} />
        <Route path="/organizer-event-dashboard/:event_id" component={OrganizerEventDashboard} />
        <Route path='/admin-dashboard' component={AdminDashboard} />
        <Route path='/event-dashboard' component={EventDashboardBackup} />
        <Route path='/ticket-booking' component={TicketBooking}/>
        <Route path='/ticket-booking' component={TicketBooking}/>
      </Switch>
  );
}

// You may define HomePage as a separate component or use it inline
const HomePage = () => <div>Hello</div>;

export default App;
