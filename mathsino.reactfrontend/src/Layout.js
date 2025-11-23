// src/Layout.js (Gotowa, zaktualizowana wersja)

import './App.css'; 
import React, { useEffect, useRef, useState } from 'react';

// === ZMIANA 1: Dodajemy 'Link' do importów ===
// Będziemy go używać do podlinkowania logo
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';

// Importy zasobów
import awatar from './assets/profilowe_smok.png';
import logo from './assets/logo.png';

const BACKEND_URL = 'http://localhost:5126';

function Layout() {
  
  const [user, setUser] = useState({
    name: "",
    email: ""
  });
  const location = useLocation();
  const menuRef = useRef(null);


    useEffect(() => {
        fetch(`${BACKEND_URL}/api/auth/profile`, {
            method: "GET",
            credentials: "include" // Wysłanie ciasteczka
        })
        .then(res => {
            // Jeśli użytkownik jest niezalogowany (401), rzucamy błąd, 
            // aby przejść do .catch i ustawić "Gość".
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            // Parsujemy JSON dla statusów 2xx.
            return res.json(); 
        })
        .then(data => {
            // Ta sekcja działa tylko, jeśli status był 200 OK
            console.log("Layout API response:", data);
              setUser({ 
                  name: data.userName || "Brak imienia",
                  email: data.email,
                  isAuthenticated: true
              });
        })
        .catch(err => {
            // Obsługa błędu 401 lub błędu sieciowego
            if (err.message === "Unauthorized") {
                 console.log("Użytkownik niezalogowany. Ustawiam 'Gość'.");
            } else {
                 console.error("Layout user load error:", err);
            }
            setUser({ name: "Gość", isAuthenticated: false });
        });
        
    }, []);
  // 2. Poprawiony useEffect dla animacji menu (bez zmian)
  useEffect(() => {
    if (!menuRef.current) {
      return; 
    }
    const menuLinks = menuRef.current.querySelectorAll('li a');

    const mouseEnterHandler = (e) => {
      const item = e.currentTarget; 
      const highlight = document.createElement('div');
      highlight.style.background = `radial-gradient(circle at ${e.offsetX}px ${e.offsetY}px, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`;
      highlight.style.pointerEvents = 'none';
      
      item.appendChild(highlight);
      
      setTimeout(() => {
        highlight.style.opacity = '0';
        setTimeout(() => {
          if (item.contains(highlight)) {
            item.removeChild(highlight);
          }
        }, 300);
      }, 500);
    };

    menuLinks.forEach(item => {
      item.addEventListener('mouseenter', mouseEnterHandler);
    });

    // Funkcja czyszcząca
    return () => {
      if (menuLinks) { // Dodatkowe sprawdzenie
        menuLinks.forEach(item => {
          item.removeEventListener('mouseenter', mouseEnterHandler);
        });
      }
    };
  }, []); // Pusta tablica = uruchom tylko raz

  const hideMenu = location.pathname === '/online' || location.pathname === '/offline';
return (
  <>
    <div className="container">
      {!hideMenu && (
        <aside className="sidebar">
          {/* Logo z linkiem do strony głównej */}
          <div className="logo">
            <Link to="/">
              <img src={logo} alt="Logo" />
            </Link>
          </div>

          {/* Nawigacja */}
          <nav className="menu" ref={menuRef}>
            <ul>
              <li>
                <NavLink
                  to="/play"
                  className={({ isActive }) => (isActive ? 'active-link' : '')}
                >
                  <i className="fa-solid fa-play" />
                  <span>Play</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/learn"
                  className={({ isActive }) => (isActive ? 'active-link' : '')}
                >
                  <i className="fa-solid fa-graduation-cap" />
                  <span>Learn</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/statistics"
                  className={({ isActive }) => (isActive ? 'active-link' : '')}
                >
                  <i className="fas fa-chart-simple" />
                  <span>Statistics</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/friends"
                  className={({ isActive }) => (isActive ? 'active-link' : '')}
                >
                  <i className="fa-solid fa-user-group" />
                  <span>Friends</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/resources"
                  className={({ isActive }) => (isActive ? 'active-link' : '')}
                >
                  <i className="fa-solid fa-gear" />
                  <span>Resources</span>
                </NavLink>
              </li>
            </ul>
          </nav>

            <Link to={user.isAuthenticated ? "/profile" : "/login"} className="profile">
                <div className="avatar">
                    <img src={awatar} alt="Profile" />
                </div>
                <div className="user-info">
                   
                    <h3>{user.name}</h3> 
                </div>
            </Link>
        </aside>
      )}

      {/* Główna zawartość (podstrony) */}
      <main className="content">
        <Outlet context={{ user }} />
      </main>
    </div>
  </>
);
}

export default Layout;