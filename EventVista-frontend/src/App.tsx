import { Route } from 'wouter';
import { RegistrationForm } from './RegistrationForm';
import { UserData } from './UserData';
import { LoginForm } from './LoginForm';
import { Dashboard } from './Dashboard';
import { DashboardNavbar } from './DashboardNavbar';

function App() {
  return (
    <div className="app">
      <Route path="/login">
        <LoginForm />
      </Route>
      <Route path="/register">
        <RegistrationForm />
      </Route>
      <Route path="/user-data">
        <UserData />
      </Route>
      <Route path='/dashboard'>
        <DashboardNavbar />
        <Dashboard />
      </Route>
    </div>
  );
}

export default App;
