import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './Pages/Home/Home'; 
import Career from './Pages/Careers/career'; 
import Layout from './components/Layout/Layout';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="careers" element={<Career />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
