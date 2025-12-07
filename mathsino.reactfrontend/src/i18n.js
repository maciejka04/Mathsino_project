import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "exit": "Exit",
      "bet_must_place": "You must place a bet to play!",
      "not_enough_funds": "Insufficient funds!",
      "hand": "Hand",
      "dealer": "Dealer",
      "winner": "WINNER!",
      "loser": "LOSER",
      "push": "PUSH",
      "blackjack": "BLACKJACK!",
      "lang_en": "EN",
      "lang_pl": "PL",
      "welcome_back": "Welcome back, {{name}} 👋",
      "welcome": "Welcome!",
      "login_prompt": "Log in to save progress and unlock full statistics.",
      "login_button": "Log in",
      "your_progress": "Your progress",
      "weeks_performance": "Here's how you're doing this week.",
      "hands_played": "Hands",
      "accuracy": "Accuracy",
      "days_streak": "Days streak",
      "start_game": "Start Game",
      "choose_mode": "Choose game mode",
      "login_title": "Log in to continue",
      "login_subtitle": "Track progress and save your results.",
      "login_google": "Log in with Google",
      "login_facebook": "Log in with Facebook",
      "login_info": "By continuing, you agree to our Privacy Policy.",
      "play_online_alt": "Play Online",
      "friends_title": "Friends",
      "friends_add_friend": "Add Friend",
      "friends_placeholder": "Type username...",
      "friends_add": "Add",
      "friends_requests": "Friend Requests ({{count}})",
      "friends_no_requests": "You have no new friend requests.",
      "friends_accept": "Accept",
      "friends_decline": "Decline",
      "friends_your": "Your Friends ({{count}})",
      "friends_no": "You have no friends.",
      "friends_online": "Online",
      "friends_offline": "Offline",
      "friends_check": "Check Profile",
      "friends_delete": "Delete"
    }
  },
  pl: {
    translation: {
      "exit": "Wyjdź",
      "bet_must_place": "Musisz postawić zakład, aby zagrać!",
      "not_enough_funds": "Nie masz wystarczająco środków!",
      "hand": "Ręka",
      "dealer": "Krupier",
      "winner": "WYGRANA!",
      "loser": "PRZEGRANA",
      "push": "REMIS",
      "blackjack": "BLACKJACK!",
      "lang_en": "EN",
      "lang_pl": "PL",
      "welcome_back": "Witaj ponownie, {{name}} 👋",
      "welcome": "Witaj!",
      "login_prompt": "Zaloguj się, aby zapisywać progres i odblokować pełne statystyki.",
      "login_button": "Zaloguj się",
      "your_progress": "Twoje postępy",
      "weeks_performance": "Oto jak Ci idzie w tym tygodniu.",
      "hands_played": "Rozdania",
      "accuracy": "Trafność",
      "days_streak": "Dni z rzędu",
      "start_game": "Zacznij Grę",
      "choose_mode": "Wybierz tryb gry",
      "login_title": "Zaloguj się, aby kontynuować",
      "login_subtitle": "Osiągaj postępy i zapisuj swoje wyniki.",
      "login_google": "Zaloguj się z Google",
      "login_facebook": "Zaloguj się z Facebook",
      "login_info": "Kontynuując, zgadzasz się na naszą Politykę Prywatności.",
      "play_online_alt": "Graj Online",
      "friends_title": "Znajomi",
      "friends_add_friend": "Dodaj znajomego",
      "friends_placeholder": "Wpisz nazwę użytkownika...",
      "friends_add": "Dodaj",
      "friends_requests": "Zaproszenia do znajomych ({{count}})",
      "friends_no_requests": "Nie masz nowych zaproszeń.",
      "friends_accept": "Akceptuj",
      "friends_decline": "Odrzuć",
      "friends_your": "Twoi znajomi ({{count}})",
      "friends_no": "Nie masz znajomych.",
      "friends_online": "Online",
      "friends_offline": "Offline",
      "friends_check": "Profil",
      "friends_delete": "Usuń"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
