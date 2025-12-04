// src/services/gameService.js

// WAŻNE: Sprawdź w backendzie (plik launchSettings.json), na jakim porcie działa Twoja aplikacja.
// Zazwyczaj jest to 5000, 5001, 7000 lub podobny. Wpisz go tutaj:
const API_URL = "http://localhost:5000"; 

export const gameService = {
  // Odpowiada endpointowi: /games/create-singleplayer (z parametrem userId)
  createGame: async (userId) => {
    try {
      // Używamy fetch do wysłania zapytania do C#
      const response = await fetch(`${API_URL}/games/create-singleplayer?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Błąd tworzenia gry: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Błąd w createGame:", error);
      throw error;
    }
  },

  // Odpowiada endpointowi: /games/{gameId}/player-hit/{playerId}
  hit: async (gameId, playerId) => {
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/player-hit/${playerId}`);
      
      if (!response.ok) {
        throw new Error(`Błąd podczas dobierania karty: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Błąd w hit:", error);
      throw error;
    }
  },

  // Odpowiada endpointowi: /games/{gameId}/player-pass/{playerId}
  pass: async (gameId, playerId) => {
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/player-pass/${playerId}`);
      
      if (!response.ok) {
        throw new Error(`Błąd podczas pasowania: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Błąd w pass:", error);
      throw error;
    }
  }
};