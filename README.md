<<<<<<< HEAD
<<<<<<< HEAD
# SNAKE-GAME-C-
=======
# Snake Game
=======
# 🐍 SNAKE GAME — C++ & Responsive Web Arcade
>>>>>>> 02f92f4 (Update README.md with detailed documentation, features, C++ OOP breakdown, and control guides)

![C++](https://img.shields.io/badge/C%2B%2B-11%2B-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A complete, dual-engine **Snake Game** project featuring both a **Modern Responsive Web Application** and a clean **Object-Oriented C++ Console Game**.

---

## 🌟 Highlights & Features

<<<<<<< HEAD
## Notes
- The web frontend does not require any external dependencies.
- The C++ version uses native Windows console functions and is compatible with typical Windows compilers.
>>>>>>> 9f43de8 (Initial commit: Snake Game in C++ and Responsive Web)
=======
### 🖥️ C++ Console Version (`snake.cpp`)
* **Object-Oriented Architecture**: Clean class structures (`Snake`, `Food`, `Position`, `Game`, `Direction`, `GameState`).
* **Flicker-Free Console Rendering**: Utilizes Windows Console Buffer API (`SetConsoleCursorPosition`) to eliminate screen flickering.
* **Dual Control Schemes**: Full support for both **WASD** and **Arrow Keys** (with lower & upper case detection).
* **Anti-180° Direction Blocking**: Prevents accidental self-collision when reversing direction rapidly.
* **Score & High-Score System**: Real-time score calculation and session high-score persistence.
* **Standard Library**: Built using `std::deque`, `std::vector`, and standard C++ algorithms.

### 🌐 Web Browser Version (`index.html`, `styles.css`, `script.js`)
* **Fully Responsive Design**: Fluid UI using CSS `clamp()` and media queries that adapts seamlessly from smartphones to 4K displays.
* **On-Screen Touch D-Pad**: Virtual controller buttons (▲, ◀, ⏸, ▶, ▼) with active feedback for mobile and tablet play.
* **Touch Swipe Controls**: Direct gesture controls on the game canvas grid (`touchstart` and `touchend`).
* **Particle Effects & Synthesized Audio**: Food explosion particle bursts and Web Audio API retro sound effects.
* **High Score Local Storage**: Automatically saves your personal best score in browser storage.
* **Pause & Restart Controls**: Header action buttons + key bindings (`Space`/`P` to pause, `R` to restart).

---

## 🎮 Game Controls

| Action | C++ Console Version | Web Browser Version |
| :--- | :--- | :--- |
| **Move Up** | `W` / `Up Arrow` | `W` / `Up Arrow` / Touch D-Pad / Swipe Up |
| **Move Down** | `S` / `Down Arrow` | `S` / `Down Arrow` / Touch D-Pad / Swipe Down |
| **Move Left** | `A` / `Left Arrow` | `A` / `Left Arrow` / Touch D-Pad / Swipe Left |
| **Move Right** | `D` / `Right Arrow` | `D` / `Right Arrow` / Touch D-Pad / Swipe Right |
| **Pause / Resume** | N/A | `Space` / `P` / `Pause` Button |
| **Restart Game** | `R` (on Game Over) | `R` / `Restart` Button |
| **Quit Game** | `Q` / `ESC` | Close Tab |

---

## 🛠️ Installation & Execution

### 1. Running the C++ Console Game

#### Prerequisites
* Windows OS
* Any C++ Compiler (`g++`, `clang++`, or MSVC `cl.exe`)

#### Compilation & Execution Steps (GCC / MinGW):
```powershell
# Navigate to the repository directory
cd SNAKE-GAME-C-

# Compile the C++ source code
g++ -O2 snake.cpp -o snake.exe

# Run the compiled binary
.\snake.exe
```

---

### 2. Running the Web Version

#### Option A: Direct Open
Simply double-click `index.html` to open the game in your default web browser.

#### Option B: Local PowerShell Web Server
Run the included PowerShell server script:
```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```
Then visit **`http://localhost:8000/`** in your browser.

---

## 📁 Project Structure

```
SNAKE-GAME-C-/
├── snake.cpp         # Complete C++ Object-Oriented Snake Game
├── index.html        # Main HTML5 web interface with mobile D-Pad layout
├── styles.css        # Responsive CSS layout & glassmorphic aesthetics
├── script.js         # Canvas game engine, particles, Web Audio, & touch handlers
├── serve.ps1         # Local HTTP web server script
├── README.md         # Documentation
└── .gitignore        # Git ignore rules for build binaries
```

---

## 🧩 C++ Code Architecture & Concepts Used

1. **`Position` (`struct`)**: Stores grid coordinates $(x, y)$ with an overloaded `operator==`.
2. **`Direction` & `GameState` (`enum class`)**: Strongly typed state enumerations.
3. **`Snake` (`class`)**: Encapsulates body segment deque (`std::deque<Position>`), directional updates, growth logic, and self-collision checks.
4. **`Food` (`class`)**: Generates random food coordinates ensuring no overlap with snake segments.
5. **`Game` (`class`)**: Main game loop, double-buffered console rendering, score tracking, and keyboard input handler.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
>>>>>>> 02f92f4 (Update README.md with detailed documentation, features, C++ OOP breakdown, and control guides)
