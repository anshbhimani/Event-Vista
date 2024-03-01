import { Route } from 'wouter';
import { RegistrationForm } from './RegistrationForm';
import { UserData } from './UserData';
import { LoginForm } from './LoginForm';
import { Dashboard } from './Dashboard';
import { DashboardNavbar } from './DashboardNavbar';
import { ForgotPassword } from './ForgotPassword';

function App() {
  return (
    <div className="app">
      <Route path="/">
        Hello
      </Route>
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
      <Route path='/forgot-password'>
        <ForgotPassword/>
      </Route>
    </div>
  );
}

export default App;
