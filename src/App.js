import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './Pages/Home/Home'; 
import Alumni from './Pages/Alumni/Alumni'; 
import Layout from './components/Layout/Layout';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/Alumni" element={<Alumni />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
