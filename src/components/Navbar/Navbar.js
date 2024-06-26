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
            <li><a href="#">Home</a></li>
          </ul>
          <ul>
            <li><a href="#">Careers</a></li>
          </ul>
          <ul>
            <li><a href="#">Newsletter</a></li>
          </ul>
          <ul>
            <li><a href="#">Events</a></li>
          </ul>
          <ul>
            <li><a href="#">Login</a></li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
