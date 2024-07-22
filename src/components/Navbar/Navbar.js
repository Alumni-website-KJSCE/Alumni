import React from 'react';
import logo from '../../Assets/logo.png';
import './Navbar.css';

export default function Navbar() {
  return (
    <div>
      <nav className='main-nav'>
        <div className='logo'>
          <img src={logo} alt='logo' />
        </div>
        <div className='menu'>
          <ul>
            <li><Link to="/">Home</Link></li>
          </ul>
          <ul>
            <li><Link to="/careers">Careers</Link></li>
          </ul>
          <ul>
            <li><Link to="/newsletter">Newsletter</Link></li>
          </ul>
          <ul>
            <li><Link to="/alumni">Alumni</Link></li>
          </ul>
          <ul>
            <li><Link to="/events">Events</Link></li>
          </ul>
          <ul>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
