# Mathsino

Mathsino to innowacyjna platforma edukacyjna .NET Aspire, zaprojektowana do nauki zasad i strategii gier kasynowych w bezpiecznym, symulowanym środowisku. Projekt łączy teorię prawdopodobieństwa z interaktywną rozgrywką, oferując analizę decyzji gracza w czasie rzeczywistym bez ryzyka finansowego.

---

## Kluczowe Funkcje

* Moduł Nauki i Symulacji: Interaktywne lekcje zasad z dynamicznym obliczaniem prawdopodobieństwa sukcesu każdego ruchu.
* Trening i Analityka: Zaawansowany silnik analizujący błędy gracza, generujący raporty postępów i rekomendacje strategiczne.
* System Gamifikacji: Rankingi, poziomy doświadczenia i odznaki motywujące do nauki.
* Bezpieczeństwo: Symulacja przeznaczona wyłącznie do celów edukacyjnych dla osób pełnoletnich.

---

## 🛠️ Wymagania Wstępne

Przed uruchomieniem upewnij się, że masz zainstalowane:
1. .NET SDK 9.0+
2. Docker Desktop (musi być uruchomiony!)
3. Node.js (wersja LTS)

---

## 🚀 Instalacja i Uruchomienie

### Krok 1: Instalacja Workloadów .NET
Otwórz terminal i wykonaj poniższe komendy (wymagane tylko przy pierwszym uruchomieniu):

dotnet workload install aspire
dotnet workload install wasm-tools

### Krok 2: Konfiguracja Frontendu (React)
Przejdź do folderu frontendu, aby zainstalować wszystkie niezbędne biblioteki graficzne i funkcyjne:

cd Mathsino.reactfrontend

# Instalacja podstawowych zależności
npm install

# Instalacja bibliotek dodatkowych (Routing, Wykresy, Animacje, Tłumaczenia)
npm install react-router-dom chart.js react-chartjs-2 fireworks-js
npm install framer-motion@12.23.24
npm install i18next react-i18next i18next-browser-languagedetector

# Opcjonalne dla użytkowników Windows (odblokowanie skryptów)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

cd ..

### Krok 3: Uruchomienie Projektu
Wróć do głównego katalogu i uruchom orkiestrator .NET Aspire:

cd Mathsino.host
dotnet run

### Krok 4: Dashboard
W terminalu pojawi się unikalny link do Aspire Dashboard (np. http://localhost:15888/login?t=...).

1. Skopiuj link i otwórz go w przeglądarce.
2. W sekcji Resources zobaczysz status Backend API oraz Frontendu.
3. Kliknij w odpowiedni Endpoint, aby otworzyć aplikację.

---

## 📁 Struktura Projektu

* Mathsino.host: Orkiestrator .NET Aspire – zarządza uruchamianiem wszystkich usług.
* Mathsino.Backend: Web API – serce aplikacji (logika gier i obliczenia statystyczne).
* Mathsino.reactfrontend: React UI – nowoczesny i responsywny interfejs użytkownika.
* Mathsino.ServiceDefaults: Wspólna konfiguracja – telemetryka, logging i standardy sieciowe.

---

## 👥 Zespół Projektowy

* Oliwier Goluda
* Paulina Maciejewska
* Aleksandra Nowak
* Daniel Pasternak
* Mateusz Swędra

Wersja .NET: 9.0 | Wersja Aspire: 9.0
