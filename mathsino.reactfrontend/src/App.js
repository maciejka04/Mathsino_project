
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
import Login from './components/Login/Login';
import PrivacyPolicy from './components/PrivacyPolicy';
import DataDeletion from './components/DataDeletion';
import ProtectedRoute from './components/ProtectedRoute';




function App() {
  return (
    <Routes>
      {/* Strony dostępne bez logowania */}
      <Route path="login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} /> {/* Home dostępny dla wszystkich */}
        
        {/* Strony chronione */}
        <Route path="play" element={
          <ProtectedRoute><Play /></ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="learn" element={
          <ProtectedRoute><Learn /></ProtectedRoute>
        } />
        <Route path="statistics" element={
          <ProtectedRoute><Statistics /></ProtectedRoute>
        } />
        <Route path="friends" element={
          <ProtectedRoute><Friends /></ProtectedRoute>
        } />
        <Route path="resources" element={
          <ProtectedRoute><Resources /></ProtectedRoute>
        } />
        <Route path="offline" element={
          <ProtectedRoute><Offline /></ProtectedRoute>
        } />
        <Route path="online" element={
          <ProtectedRoute><Online /></ProtectedRoute>
        } />

        {/* Opcjonalne strony publiczne */}
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="data-deletion" element={<DataDeletion />} />
      </Route>
    </Routes>
  );
}

export default App;