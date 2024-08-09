import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './Pages/Home/Home'; 
import Careers from './Pages/Careers/career'; 
import Layout from './components/Layout/Layout';
import Alumni from './Pages/Alumni/Alumni';
import Newsletter from './Pages/Newsletter/Newsletter';
import Events from './Pages/Events/Events';
import Login from './Pages/Login/Login';
import Signin from './Pages/Signin/Signin';

import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/careers" element={<Careers />}></Route>
          <Route path="/alumni" element={<Alumni />}></Route>
          <Route path="/newsletter" element={<Newsletter />}></Route>
          <Route path="/events" element={<Events />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/signin" element={<Signin />}></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
