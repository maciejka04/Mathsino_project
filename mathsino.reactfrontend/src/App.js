
import React from 'react';
import { Routes, Route } from 'react-router-dom';


import Layout from './Layout'; 
import Profile from './components/Profile/Profile';
import Home from './components/Home/Home';
import Play from './components/Play/Play';
import Learn from './components/Learn/Learn';


const Statistics = () => <h2>Statystyki (w budowie)</h2>;
const Friends = () => <h2>Znajomi (w budowie)</h2>;
const Resources = () => <h2>Zasoby (w budowie)</h2>;

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

      </Route>
    </Routes>
  );
}

export default App;