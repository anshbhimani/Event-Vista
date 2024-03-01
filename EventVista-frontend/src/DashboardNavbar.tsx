import { Link } from 'wouter';

export function DashboardNavbar() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard Home</Link>
      &nbsp;
      <Link href="/dashboard/profile">Profile</Link>
      &nbsp;
      <Link href="/dashboard/settings">Settings</Link>
      &nbsp;
      <Link href='/login'>Logout</Link>
    </nav>
  );
}

