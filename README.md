# Calculator App

> A clean, modern calculator with keyboard support, history panel, and dark mode — built with **vanilla HTML, CSS, and JavaScript** (no frameworks, no build step).

![CI](https://github.com/arjundroid12/calculator-app/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)

## ✨ Features

- **Keyboard support** — type digits, operators, `Enter`, `Backspace`, `Esc` for full control
- **Calculation history** — last 50 calculations stored in `localStorage`; click any entry to reuse its result
- **Dark / light theme** — auto-detects system preference, remembers your choice
- **Safe expression parser** — uses a custom shunting-yard inspired tokenizer (no `eval` or `Function` constructor)
- **Responsive layout** — works on mobile and desktop
- **Zero dependencies** — pure HTML/CSS/JS, runs straight from the file system

## 📸 Screenshot

![Calculator App Screenshot](./assets/screenshot.png)

## 🚀 Live Demo

| Host | URL | Notes |
|------|-----|-------|
| 🥇 Surge.sh | https://arjun-calculator.surge.sh | Bangalore edge — best for India |
| 🥈 GitHub Pages | https://arjundroid12.github.io/calculator-app/ | Primary — may be blocked by some Indian ISPs |

## 🛠️ Tech Stack

| Layer      | Tech                          |
|------------|-------------------------------|
| Markup     | Semantic HTML5                |
| Styling    | CSS Custom Properties (vars)  |
| Logic      | Vanilla JavaScript (ES6+)     |
| Storage    | `localStorage`                |
| Fonts      | Inter, JetBrains Mono         |

## 📦 Run Locally

No build tools required — just open the file:

```bash
git clone https://github.com/arjundroid12/calculator-app.git
cd calculator-app
# Open index.html in your browser, OR:
python3 -m http.server 8000
# Visit http://localhost:8000
```

## ⌨️ Keyboard Shortcuts

| Key            | Action                |
|----------------|-----------------------|
| `0`–`9`        | Enter digit           |
| `.`            | Decimal point         |
| `+` `-` `*` `/` | Operators            |
| `Enter` / `=`  | Evaluate              |
| `Backspace`    | Delete last character |
| `Esc`          | Clear all             |
| `%`            | Convert to percent    |

## 🧪 CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) on every push and PR:

- Validates `index.html` exists
- Validates `assets/styles.css` and `assets/app.js` exist
- Runs basic JS syntax check with `node --check`

## 📁 Project Structure

```
calculator-app/
├── .github/
│   └── workflows/
│       └── ci.yml
├── assets/
│   ├── app.js          # Calculator logic, history, keyboard, theme
│   ├── styles.css      # Theme tokens, layout, components
│   └── screenshot.png  # README screenshot
├── index.html          # App shell
├── LICENSE
├── README.md
└── .gitignore
```

## 📄 License

[MIT](./LICENSE) © Arjun Vashishtha
