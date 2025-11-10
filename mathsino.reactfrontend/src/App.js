
import React from 'react';
import { Routes, Route } from 'react-router-dom';


import Layout from './Layout'; 
import Profile from './components/Profile/Profile';
import Home from './components/Home/Home';
import Play from './components/Play/Play';
import Learn from './components/Learn/Learn';
import Friends from './components/Friends/Friends';
import Statistics from './components/Statistics/Statistics';
import Resources from './components/Resources/Resources';
import Offline from './components/Offline/Offline';
import Online from './components/Online/Online';




function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        
        {/* Strona główna */}
        <Route index element={<Home />} />
        
        {/* Pozostałe podstrony */}
        <Route path="play" element={<Play />} />
        <Route path="profile" element={<Profile />} />
        <Route path="learn" element={<Learn />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="friends" element={<Friends />} />
        <Route path="resources" element={<Resources />} />
        <Route path="online" element={<Online />} />
        <Route path="offline" element={<Offline />} />
      </Route>
    </Routes>
  );
}

export default App;