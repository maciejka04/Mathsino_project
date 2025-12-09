# README.md wygenerowane przy pomocy Claude, na remote labs wmi nie trzeba nic robić wystarczy odpalić projekt

# Mathsino

Projekt .NET Aspire składający się z backendu (WebAPI), frontendu (Blazor WebAssembly) i orkiestratora Aspire.

## 📋 Wymagania

Przed uruchomieniem projektu musisz zainstalować następujące narzędzia:

### 1. .NET SDK 9.0 (lub nowszy)

- **Windows & macOS**: Pobierz z [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)
- Pobierz najnowszą wersję .NET SDK
- Uruchom instalator i postępuj zgodnie z instrukcjami

### 2. Docker Desktop

Docker jest **wymagany** do uruchomienia .NET Aspire.

#### Windows:

1. Pobierz Docker Desktop z [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Uruchom instalator
3. Po instalacji uruchom Docker Desktop
4. Poczekaj aż Docker całkowicie wystartuje (ikona w zasobniku systemowym powinna być zielona)

#### macOS:

1. Pobierz Docker Desktop z [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Przeciągnij aplikację do folderu Applications
3. Uruchom Docker Desktop
4. Poczekaj aż Docker całkowicie wystartuje (ikona w menu bar powinna być zielona)

#### 2.5. Nodejs

1. Pobierz [https://nodejs.org/en/download]

**Alternatywa (macOS)**: Możesz użyć Podman Desktop zamiast Docker Desktop

### 3. IDE/Edytor (opcjonalnie, ale zalecane)

- Visual Studio 2022 (Windows/macOS)
- Visual Studio Code z rozszerzeniem C#
- JetBrains Rider

## 🚀 Uruchomienie projektu

### Krok 1: Sprawdź czy wszystko jest zainstalowane

Otwórz terminal (Command Prompt/PowerShell na Windows, Terminal na macOS) i wykonaj:

```bash
dotnet --version
```

Powinieneś zobaczyć wersję .NET (np. `9.0.100`)

```bash
docker --version
```

Powinieneś zobaczyć wersję Docker (np. `Docker version 24.0.7`)

### Krok 2: Sklonuj repozytorium

```bash
git clone [URL_DO_REPOZYTORIUM]
cd Mathsino
```

### Krok 3: Zainstaluj .NET Aspire workload

**WAŻNE**: Ten krok musisz wykonać tylko raz na swoim komputerze.

```bash
dotnet workload install aspire
```

### Krok 4: Zainstaluj WASM Tools

**WAŻNE**: Ten krok musisz wykonać tylko raz na swoim komputerze (potrzebne dla Blazor WebAssembly).

```bash
dotnet workload install wasm-tools
```

### Krok 5: Upewnij się że Docker jest uruchomiony

- **Windows**: Sprawdź czy ikona Docker Desktop w zasobniku systemowym jest zielona
- **macOS**: Sprawdź czy ikona Docker Desktop w menu bar jest zielona

Jeśli Docker nie jest uruchomiony, uruchom aplikację Docker Desktop i poczekaj aż wystartuje.

### Krok 6: Uruchom projekt

Przejdź do folderu głównego projektu (Mathsino) i wykonaj:

```bash
cd Mathsino.reactfrontend
npm install
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install react-router-dom
npm install chart.js react-chartjs-2
npm install framer-motion@12.23.24
npm install fireworks-js
npm install i18next react-i18next i18next-browser-languagedetector
```

```bash
cd ..
```

```bash
cd Mathsino.host
dotnet run
```

### Krok 7: Otwórz aplikację

Po uruchomieniu w terminalu zobaczysz URL do Aspire Dashboard, np.:

```
Login to the dashboard at http://localhost:15888/login?t=xxxxx
```

1. Skopiuj cały URL (wraz z tokenem `?t=...`)
2. Otwórz go w przeglądarce
3. W dashboardzie zobaczysz wszystkie uruchomione serwisy
4. Kliknij na odpowiedni endpoint żeby otworzyć:
   - Frontend (Blazor WebAssembly)
   - Backend API

## 🛑 Zatrzymanie projektu

W terminalu gdzie uruchomiłeś projekt naciśnij:

- **Windows/macOS**: `Ctrl + C`

## ❓ Problemy i rozwiązania

### "Docker daemon is not running"

**Rozwiązanie**: Uruchom Docker Desktop i poczekaj aż całkowicie wystartuje.

### "Workload 'aspire' not found"

**Rozwiązanie**: Wykonaj ponownie:

```bash
dotnet workload install aspire
```

### "The process cannot access the file because it is being used by another process" (Windows)

**Rozwiązanie**:

1. Zamknij wszystkie instancje Visual Studio / VS Code
2. Otwórz Task Manager (Ctrl+Shift+Esc)
3. Zakończ wszystkie procesy `dotnet.exe`
4. Spróbuj ponownie

### Port jest już zajęty

**Rozwiązanie**: Zamknij inne aplikacje które mogą używać portów lub zrestartuj komputer.

### Blazor WebAssembly nie buduje się

**Rozwiązanie**: Upewnij się że zainstalowałeś wasm-tools:

```bash
dotnet workload install wasm-tools
```

## 📁 Struktura projektu

```
Mathsino/
├── Mathsino.sln                    # Solution file
├── Mathsino.host/                  # Aspire AppHost (orkiestrator)
├── Mathsino.Backend/               # Web API (backend)
├── Mathsino.Frontend/              # Blazor WebAssembly (frontend)
└── Mathsino.ServiceDefaults/       # Wspólna konfiguracja dla serwisów
```

## 🔧 Komendy developerskie

### Zbudowanie całego solution

```bash
dotnet build
```

### Czyszczenie buildu

```bash
dotnet clean
```

### Przywrócenie pakietów NuGet

```bash
dotnet restore
```

## 📚 Dodatkowe informacje

- **Aspire Dashboard**: To graficzny interfejs do zarządzania i monitorowania wszystkich serwisów w projekcie
- **ServiceDefaults**: Zawiera wspólną konfigurację (logging, health checks, telemetry) dla wszystkich serwisów
- Projekt automatycznie konfiguruje komunikację między frontendem a backendem

## 🆘 Potrzebujesz pomocy?

Jeśli masz problemy:

1. Sprawdź czy Docker jest uruchomiony
2. Sprawdź czy zainstalowałeś wszystkie workloads (aspire, wasm-tools)
3. Spróbuj zrestartować Docker Desktop
4. Spróbuj zrestartować terminal/komputer

---

**Wersja .NET**: 9.0+  
**Wersja Aspire**: 9.0+
