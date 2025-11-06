// src/Layout.js (PEŁNA, POPRAWNA WERSJA)

import './App.css'; 
import React, { useEffect, useRef } from 'react';
// 1. Poprawny import NavLink i Outlet
import { Outlet, NavLink } from 'react-router-dom';

// Importy zasobów
import awatar from './assets/profilowe_smok.png';
import logo from './assets/logo.png';

function Layout() {
  
  const menuRef = useRef(null);

  // 2. Poprawiony useEffect dla animacji menu
  //    (teraz celuje w linki <a>, a nie <li>)
  useEffect(() => {
    // Celujemy w linki <a> wewnątrz <li>
    if (!menuRef.current) {
      return; // Jeśli menu jeszcze nie istnieje, przerwij
    }
    const menuLinks = menuRef.current.querySelectorAll('li a');

    const mouseEnterHandler = (e) => {
      const item = e.currentTarget; // 'item' to teraz link <a>
      const highlight = document.createElement('div');
      highlight.classList.add('highlight');
      highlight.style.position = 'absolute';
      highlight.style.top = '0';
      highlight.style.left = '0';
      highlight.style.width = '100%';
      highlight.style.height = '100%';
      highlight.style.borderRadius = '12px'; // Używamy radiusu linku
      
      // Poprawione obliczanie pozycji myszy względem linku
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      highlight.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`;
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
      menuLinks.forEach(item => {
        item.removeEventListener('mouseenter', mouseEnterHandler);
      });
    };
  }, []); // Pusta tablica = uruchom tylko raz


  return (
    <> 
      <div className="container">
        <aside className="sidebar">
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>
          
          {/* 3. Poprawne menu z NavLink */}
          <nav className="menu" ref={menuRef}>
            <ul>
              <li>
                <NavLink 
                  to="/"
                  className={({ isActive }) => isActive ? 'active-link' : ''}
                >
                  <i className="fa-solid fa-play" />
                  <span>Play</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/learn"
                  className={({ isActive }) => isActive ? 'active-link' : ''}
                >
                  <i className="fa-solid fa-graduation-cap" />
                  <span>Learn</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/statistics"
                  className={({ isActive }) => isActive ? 'active-link' : ''}
                >
                  <i className="fas fa-chart-simple" />
                  <span>Statistics</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/friends"
                  className={({ isActive }) => isActive ? 'active-link' : ''}
                >
                  <i className="fa-solid fa-user-group" />
                  <span>Friends</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/resources"
                  className={({ isActive }) => isActive ? 'active-link' : ''}
                >
                  <i className="fa-solid fa-gear" />
                  <span>Resources</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Profil zostaje bez zmian */}
          <div className="profile">
            <div className="avatar">
                <img src={awatar} alt="Profile" />
            </div>
            <div className="user-info">
                <h3>User</h3>
            </div>
          </div>
        </aside>
        
        <main className="content">
          <header>
            <h1>Welcome Back, User</h1>
            <p>log in to save your progress</p>
          </header>
          
          {/* 4. Miejsce na podstrony (Play, Learn, itd.) */}
          <Outlet />

        </main>
      </div>
    </>
  );
}

export default Layout;