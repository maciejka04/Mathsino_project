// src/Layout.js (Gotowa, zaktualizowana wersja)

import './App.css'; 
import React, { useEffect, useRef } from 'react';

// === ZMIANA 1: Dodajemy 'Link' do importów ===
// Będziemy go używać do podlinkowania logo
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';

// Importy zasobów
import awatar from './assets/profilowe_smok.png';
import logo from './assets/logo.png';

function Layout() {
  
  const location = useLocation();
  const menuRef = useRef(null);

  // 2. Poprawiony useEffect dla animacji menu (bez zmian)
  useEffect(() => {
    if (!menuRef.current) {
      return; 
    }
    const menuLinks = menuRef.current.querySelectorAll('li a');

    const mouseEnterHandler = (e) => {
      const item = e.currentTarget; 
      const highlight = document.createElement('div');
      // ... (reszta kodu animacji zostaje bez zmian) ...
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
      {/* Sidebar (menu) pojawia się tylko wtedy, gdy NIE jesteś w /online ani /offline */}
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

          {/* Profil użytkownika */}
          <Link to="/profile" className="profile">
            <div className="avatar">
              <img src={awatar} alt="Profile" />
            </div>
            <div className="user-info">
              <h3>User</h3>
            </div>
          </Link>
        </aside>
      )}

      {/* Główna zawartość (podstrony) */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  </>
);
}

export default Layout;