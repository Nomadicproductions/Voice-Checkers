# Voice-Checkers

**Checkers - Voice Controlled Labels**

A web-based checkers game designed for voice control and accessibility, featuring custom piece and board labels optimized for speech recognition. Built for two players to play physically or virtually, with all moves and actions controllable by spoken commands.

---

## Features

- **Voice Recognition:** Control the game with voice commands using browser’s built-in speech recognition (Chrome/Edge recommended).
- **Accessible Labels:** All board squares and pieces are labeled to optimize voice recognition (labels avoid number "2" for clarity).
- **Dual-View Design:** Piece and square labels are oriented for both players—Player 2’s pieces/labels are rotated for easy viewing.
- **Visual & Voice Feedback:** The app gives spoken feedback for moves, errors, captures, and game status.
- **Highlight Moves:** Click a piece to highlight possible moves. Click a highlighted square to move.
- **Kinged Pieces:** King status is visually indicated (gold for Player 1, cyan for Player 2).
- **Turn Management:** Switch turns with a command or button.
- **No External Dependencies:** Runs fully client-side in modern browsers.

---

## Board & Piece Labeling

- **Board Squares:** Labeled `a1` to `h8` (row `a` is top, `1` is leftmost). Squares with `2` in the number are skipped (for voice clarity).
- **Player 1 (Light/Red):** Pieces labeled `L1, L3, L4...` (no label contains `2`, up to 12 pieces).
- **Player 2 (Dark/Black):** Pieces labeled `N1, N3, N4...` (no label contains `2`, up to 12 pieces), rotated 180° on the board.
- **Move Example:** Say `"move L3 to e4"` (never use number `2` in labels).

---

## Voice Commands

- **Move a piece:** `"move L3 to e4"`
- **Select a piece:** `"select L5"`
- **Switch player/turn:** `"next turn"` or `"next player"`
- **Restart game:** `"new game"` or `"restart"`
- **Toggle voice feedback:** Button provided.
- **General actions:** Click pieces/squares for manual play, with voice feedback.

---

## Getting Started

### Prerequisites

- A modern browser with support for [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) (Chrome/Edge recommended).

### Usage

1. **Open the `index.html` file** in your browser (or use GitHub Pages).
2. **Start Voice Control** by clicking the "Start Voice Control" button.
3. **Play checkers** using voice commands or mouse clicks.
4. **Switch turns** using the button or voice.
5. **Restart** or begin a new game as needed.

---

## How It Works

- **Speech Recognition:** Built on browser APIs, listens for mapped phrases and executes moves.
- **Label Filtering:** Labels avoid the number `2` for both pieces and squares to reduce speech misrecognition.
- **Adaptive UI:** Piece and coordinate labels are visually spun for Player 2’s perspective.
- **Error Handling:** Invalid moves, unrecognized commands, or unavailable pieces/squares trigger spoken and visual error messages.

---

## Contribution

Contributions are welcome! To contribute:

1. Fork this repository.
2. Create your feature branch (`git checkout -b feature/name`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request describing your changes.

Bug reports and feature requests can be submitted via [Issues](https://github.com/Nomadicproductions/Voice-Checkers/issues).

---

## License

No license specified. Unless otherwise stated, see repository for usage terms.

---

## Maintainers

- **Nomadicproductions** ([GitHub Profile](https://github.com/Nomadicproductions))
- Main contributor: [joeyaugust1](https://github.com/joeyaugust1)

---

## Live Demo

Coming soon. For now, clone or download and open `index.html` in a supported browser.

---

## Credits

Inspired by a need for accessible, voice-driven board games. If you use or modify this project, please reference the original repo.
