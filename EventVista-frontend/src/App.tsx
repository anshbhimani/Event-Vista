// App.tsx

import { Route, Switch } from 'wouter'; // Import Switch from wouter
import { RegistrationForm } from './RegistrationForm';
import { UserData } from './UserData';
import { LoginForm } from './LoginForm';
import { Dashboard } from './Dashboard';
import { DashboardNavbar } from './DashboardNavbar';
import { ForgotPassword } from './ForgotPassword';
import { AttendeeDashboard } from './AttendeeDashboard';
import { OrganizerDashboard } from './OrganizerDashboard';

function App() {
  return (
    <div className="app">
      <Switch> {/* Use Switch to ensure only one route is rendered */}
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginForm} />
        <Route path="/register" component={RegistrationForm} />
        <Route path="/user-data" component={UserData} />
        <Route path="/dashboard">
          <DashboardNavbar />
          <Dashboard />
        </Route>
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/organizer-dashboard" component={OrganizerDashboard} />
        <Route path="/attendee-dashboard" component={AttendeeDashboard} /> {/*New route for AttendeeDashboard*/}
      </Switch>
    </div>
  );
}

// You may define HomePage as a separate component or use it inline
const HomePage = () => <div>Hello</div>;

export default App;
