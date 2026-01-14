
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
import Login from './components/Login/Login';
import PrivacyPolicy from './components/Resources/PrivacyPolicy';
import DataDeletion from './components/Resources/DataDeletion';
import ProtectedRoute from './components/ProtectedRoute';
import LessonPage from './components/Lesson/LessonPage';
import FriendProfile from './components/Friends/FriendProfile';
import TermsOfService from './components/Resources/TermsOfService'; 
import ResponsibleGaming from './components/Resources/ResponsibleGaming'; 
import HowToPlay from './components/Resources/HowToPlay'; 
import StrategyChart from './components/Resources/StrategyChart'; 
import Glossary from './components/Resources/Glossary';
import Achievements from './components/Achievements/Achievements';


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
        <Route path="lesson/:id" element={
          <ProtectedRoute><LessonPage /></ProtectedRoute>
        } />
        <Route path="statistics" element={
          <ProtectedRoute><Statistics /></ProtectedRoute>
        } />
        <Route path="friends" element={
          <ProtectedRoute><Friends /></ProtectedRoute>
        } />
        <Route path="profile/:friendId" element={
          <ProtectedRoute><FriendProfile /></ProtectedRoute>
        } />
        <Route path="/achievements" element={
          <ProtectedRoute><Achievements /></ProtectedRoute>
        } />
        <Route path="resources" element={
          <ProtectedRoute><Resources /></ProtectedRoute>
        } />
        <Route path="offline" element={
          <ProtectedRoute><Offline /></ProtectedRoute>
        } />
        

        {/* Opcjonalne strony publiczne */}
        <Route path="resources/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="resources/data-deletion" element={<DataDeletion />} />
        <Route path="resources/responsible-gaming" element={<ResponsibleGaming />} /> 
        <Route path="resources/terms-of-service" element={<TermsOfService />} /> 
        <Route path="resources/how-to-play" element={<HowToPlay />} /> 
        <Route path="resources/strategy-chart" element={<StrategyChart />} />
        <Route path="resources/glossary" element={<Glossary />} />
      </Route>
    </Routes>
  );
}

export default App;