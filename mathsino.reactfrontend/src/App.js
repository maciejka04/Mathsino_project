// src/App.js (PEŁNA, POPRAWNA WERSJA)

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importujemy nasz główny szablon
import Layout from './Layout'; 

// Importujemy nasze "podstrony"
import Play from './components/Play/Play';
import Learn from './components/Learn/Learn';

// Możemy dodać proste komponenty-zaślepki tutaj,
// albo stworzyć dla nich pliki w /components/
const Statistics = () => <h2>Statystyki (w budowie)</h2>;
const Friends = () => <h2>Znajomi (w budowie)</h2>;
const Resources = () => <h2>Zasoby (w budowie)</h2>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        
        {/* Strona główna */}
        <Route index element={<Play />} />
        
        {/* Pozostałe podstrony */}
        <Route path="learn" element={<Learn />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="friends" element={<Friends />} />
        <Route path="resources" element={<Resources />} />

      </Route>
    </Routes>
  );
}

export default App;