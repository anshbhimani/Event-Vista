// App.tsx
import { Route, Switch } from 'wouter'; // Import Switch from wouter
import { Dashboard } from './Dashboard';
import { DashboardNavbar } from './DashboardNavbar';
import { ForgotPassword } from './ForgotPassword';
import { AttendeeDashboard } from './AttendeeDashboard';
import { EventDashboardBackup } from './EventDashboard2';
import { OrganizerDashboard } from './OrganizerDashboard';
import { LoginSignup } from './Login';
import { EventDashboard } from './EventDashboard';
import { AdminDashboard } from './AdminDashboard';
import { TicketBooking } from './TicketBooking';

function App() {
  return (
    <div className="app">
      <Switch> {/* Use Switch to ensure only one route is rendered */}
        <Route path="/" component={HomePage} />
        // <Route path="/login" component={LoginSignup} />
        <Route path='login' component={LoginSignup}/>
        <Route path="/register" component={LoginSignup} />
        <Route path="/dashboard">
          <DashboardNavbar />
          <Dashboard />
        </Route>
        
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/organizer-dashboard" component={OrganizerDashboard} />
        <Route path="/attendee-dashboard" component={AttendeeDashboard} /> {/*New route for AttendeeDashboard*/}
        <Route path='/event-dashboard-backup' component={EventDashboard} />
        <Route path='/admin-dashboard' component={AdminDashboard} />
        <Route path='/event-dashboard' component={EventDashboardBackup} />
        <Route path='/ticket-booking' component={TicketBooking}/>
      </Switch>
    </div>
  );
}

// You may define HomePage as a separate component or use it inline
const HomePage = () => <div>Hello</div>;

export default App;
