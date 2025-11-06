import './App.css';

import React, { useState, useEffect, useRef } from 'react';
import awatar from '../../assets/profilowe_smok.png';
import logo from '../../assets/logo.png';
import offline from '../../assets/offline.jpg';
import online from '../../assets/online.jpg';
function GlassmorphismLayout() {

  const [activeIndex, setActiveIndex] = useState(0);

  const handleMenuClick = (e, index) => {
    setActiveIndex(index);
    
    const icon = e.currentTarget.querySelector('i');
    if (icon) {
      icon.style.transform = 'scale(1.2)';
      setTimeout(() => {
        icon.style.transform = 'scale(1)';
      }, 200);
    }
  };


  const menuRef = useRef(null);
  const cardContainerRef = useRef(null);

  useEffect(() => {
    
    const menuItems = menuRef.current.querySelectorAll('li');

    const mouseEnterHandler = (e) => {
      const item = e.currentTarget;
      const highlight = document.createElement('div');
      highlight.classList.add('highlight');
      highlight.style.position = 'absolute';
      highlight.style.top = '0';
      highlight.style.left = '0';
      highlight.style.width = '100%';
      highlight.style.height = '100%';
      highlight.style.borderRadius = '16px';
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

    menuItems.forEach(item => {
      item.addEventListener('mouseenter', mouseEnterHandler);
    });

    const cards = cardContainerRef.current.querySelectorAll('.card');

    const mouseMoveHandler = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = (x / rect.width - 0.5) * 10;
      const rotateX = (y / rect.height - 0.5) * -10;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      card.style.transition = 'transform 0s'; 
    };
    
    const mouseLeaveHandler = (e) => {
      const card = e.currentTarget;
      card.style.transform = 'translateY(0) scale(1)';
      card.style.transition = 'transform 0.5s ease'; 
    };

    cards.forEach(card => {
      card.addEventListener('mousemove', mouseMoveHandler);
      card.addEventListener('mouseleave', mouseLeaveHandler);
    });


    return () => {
      menuItems.forEach(item => {
        item.removeEventListener('mouseenter', mouseEnterHandler);
      });
      cards.forEach(card => {
        card.removeEventListener('mousemove', mouseMoveHandler);
        card.removeEventListener('mouseleave', mouseLeaveHandler);
      });
    };
  }, []);


  return (
    <> 
      <div className="container">
        {}
        <aside className="sidebar">
          <div className="logo">
            <img src={logo}/>
          </div>
          
          {}
          <nav className="menu" ref={menuRef}>
            <ul>
              {
              }
              <li 
                className={activeIndex === 0 ? 'active' : ''} 
                onClick={(e) => handleMenuClick(e, 0)}
              >
                <a href="#">
                  <i className="fa-solid fa-play" />
                  <span>Play</span>
                </a>
              </li>
              <li 
                className={activeIndex === 1 ? 'active' : ''} 
                onClick={(e) => handleMenuClick(e, 1)}
              >
                <a href="#">
                  
                  <i className="fa-solid fa-graduation-cap" />
                  <span>Learn</span>
                </a>
              </li>
              <li 
                className={activeIndex === 2 ? 'active' : ''} 
                onClick={(e) => handleMenuClick(e, 2)}
              >
                <a href="#">
                  <i className="fas fa-chart-simple" />
                  <span>statistics</span>
                </a>
              </li>
              <li 
                className={activeIndex === 3 ? 'active' : ''} 
                onClick={(e) => handleMenuClick(e, 3)}
              >
                <a href="#">
                  <i className="fa-solid fa-user-group" />
                  <span>Friends</span>
                </a>
              </li>
              <li 
                className={activeIndex === 4 ? 'active' : ''} 
                onClick={(e) => handleMenuClick(e, 4)}
              >
                <a href="#">
                  <i className="fa-solid fa-gear" />
                  <span>Resources</span>
                </a>
              </li>
            </ul>
          </nav>
          <div className="profile">
            <div className="avatar">
              <img
                src={awatar}
                alt="Profile"
              />
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
          
          {}
          <div className="card-container" ref={cardContainerRef}>
            <div className="card">
              
              <div className="card-info">
                <img src = {offline}/>
              </div>
            </div>
            
            <div className="card">
              <div className="card-info">
                <img src = {online}/>
              </div>
              
            </div>
            
          </div>
        </main>
      </div>
    </>
  );
}

export default GlassmorphismLayout;