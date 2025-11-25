// src/components/DataDeletion/DataDeletion.js
import React from 'react';

function DataDeletion() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#f0f0f0', backgroundColor: '#1e1e1e', minHeight: '100vh' }}>
      <h1>Instrukcje Usunięcia Danych Użytkownika Mathsino</h1>
      
      <h2>Procedura Usunięcia Konta</h2>
      <p>Zgodnie z wymogami Meta (Facebook), aby trwale usunąć wszystkie dane powiązane z Twoim kontem Mathsino, postępuj zgodnie z poniższymi instrukcjami:</p>
      
      <ol>
        <li>Zaloguj się do aplikacji Mathsino. (Jeśli nie możesz się zalogować, przejdź do kroku 3).</li>
        <li>Przejdź do strony profilu i poszukaj opcji "Usuń Konto" (jeszcze niezaimplementowane).</li>
        <li>**Aby zażądać usunięcia natychmiast:** Wyślij wiadomość e-mail na adres <a href="mailto:support@mathsino.com" style={{ color: '#1877f2' }}>support@mathsino.com</a>.</li>
      </ol>

      <h2>Wymagane Informacje w E-mailu</h2>
      <p>W tytule wiadomości wpisz "Prośba o usunięcie danych - [Twój Adres E-mail]". W treści wiadomości, podaj:</p>
      <ul>
        <li>Adres e-mail użyty do logowania przez Google/Facebook.</li>
        <li>Potwierdzenie chęci trwałego usunięcia konta.</li>
      </ul>
      <p>Potwierdzamy, że po otrzymaniu Twojej prośby, wszystkie Twoje dane osobowe zostaną trwale usunięte z naszej bazy danych w ciągu 7 dni roboczych.</p>
    </div>
  );
}

export default DataDeletion;