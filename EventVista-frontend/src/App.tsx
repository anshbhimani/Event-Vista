// App.tsx
import { Route, Switch } from 'wouter'; // Import Switch from wouter
import { Dashboard } from './Dashboard';
import { DashboardNavbar } from './DashboardNavbar';
import { ForgotPassword } from './ForgotPassword';
import { AttendeeDashboard } from './AttendeeDashboard';
import { AttendeeDashboardBackup } from './AttendeeDashboardBackup';
import { OrganizerDashboard } from './OrganizerDashboard';
import { LoginSignup } from './Login';
import { EventDashboard } from './EventDashboard';
import { AdminDashboard } from './AdminDashboard';

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
        <Route path='/attendee-dashboard-backup' component={AttendeeDashboardBackup} />
        <Route path='/admin-dashboard' component={AdminDashboard} />
        <Route path='/event-dashboard' component={EventDashboard} />
      </Switch>
    </div>
  );
}

// You may define HomePage as a separate component or use it inline
const HomePage = () => <div>Hello</div>;

export default App;
