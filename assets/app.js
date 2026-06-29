/* =============================================================
 * Calculator · vanilla JS
 * Features: keyboard support, history (localStorage), dark mode
 * ============================================================= */

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  // ---------- State ----------
  const state = {
    expression: "",
    result: "0",
    justEvaluated: false,
  };

  const HISTORY_KEY = "calculator.history";
  const THEME_KEY = "calculator.theme";
  const MAX_HISTORY = 50;

  // ---------- DOM refs ----------
  const expressionEl = $("#expression");
  const resultEl = $("#result");
  const historyListEl = $("#historyList");
  const historyEmptyEl = $("#historyEmpty");
  const themeToggleBtn = $("#themeToggle");
  const themeToggleIcon = themeToggleBtn.querySelector(".theme-toggle__icon");
  const clearHistoryBtn = $("#clearHistory");

  // ---------- Operators ----------
  const OPERATORS = new Set(["+", "-", "*", "/"]);
  const OPERATOR_SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

  // ---------- Helpers ----------
  const formatNumber = (num) => {
    if (!isFinite(num) || isNaN(num)) return "Error";
    // Avoid scientific notation for reasonably-sized numbers
    const str = Number(num.toFixed(10)).toString();
    return str;
  };

  const sanitizeExpression = (expr) => {
    // Replace symbols for display
    return expr.replace(/\*/g, "×").replace(/\//g, "÷").replace(/-/g, "−");
  };

  // ---------- Safe evaluation ----------
  // Tokenize and evaluate with a shunting-yard inspired parser
  // (avoids the dangers of `eval` and `Function` constructor)
  const tokenize = (expr) => {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
      const c = expr[i];
      if (c === " ") {
        i++;
        continue;
      }
      if (OPERATORS.has(c)) {
        // Handle unary minus at start or after operator
        if (
          c === "-" &&
          (tokens.length === 0 ||
            (tokens[tokens.length - 1] &&
              OPERATORS.has(tokens[tokens.length - 1].value)))
        ) {
          let num = "-";
          i++;
          while (i < expr.length && /[0-9.]/.test(expr[i])) {
            num += expr[i];
            i++;
          }
          tokens.push({ type: "number", value: parseFloat(num) });
        } else {
          tokens.push({ type: "operator", value: c });
          i++;
        }
        continue;
      }
      if (/[0-9.]/.test(c)) {
        let num = "";
        while (i < expr.length && /[0-9.]/.test(expr[i])) {
          num += expr[i];
          i++;
        }
        tokens.push({ type: "number", value: parseFloat(num) });
        continue;
      }
      // Unknown char — skip
      i++;
    }
    return tokens;
  };

  const evaluateTokens = (tokens) => {
    if (tokens.length === 0) return null;
    let i;
    // First pass: * and /
    let pass = tokens;
    for (const op of ["*", "/"]) {
      const next = [];
      i = 0;
      while (i < pass.length) {
        const t = pass[i];
        if (t.type === "operator" && t.value === op) {
          const left = next.pop();
          const right = pass[i + 1];
          if (!left || !right || left.type !== "number" || right.type !== "number") {
            throw new Error("Invalid expression");
          }
          const result = op === "*" ? left.value * right.value : left.value / right.value;
          next.push({ type: "number", value: result });
          i += 2;
        } else {
          next.push(t);
          i++;
        }
      }
      pass = next;
    }
    // Second pass: + and -
    let acc = pass[0];
    if (!acc || acc.type !== "number") throw new Error("Invalid expression");
    let value = acc.value;
    i = 1;
    while (i < pass.length) {
      const op = pass[i];
      const right = pass[i + 1];
      if (!op || op.type !== "operator" || !right || right.type !== "number") {
        throw new Error("Invalid expression");
      }
      if (op.value === "+") value += right.value;
      else if (op.value === "-") value -= right.value;
      i += 2;
    }
    return value;
  };

  const evaluate = (expr) => {
    const tokens = tokenize(expr);
    return evaluateTokens(tokens);
  };

  // ---------- Render ----------
  const render = () => {
    expressionEl.textContent = sanitizeExpression(state.expression);
    resultEl.textContent = state.result;
  };

  // ---------- Input handlers ----------
  const inputDigit = (digit) => {
    if (state.justEvaluated && /[0-9.]/.test(digit)) {
      state.expression = "";
      state.result = "0";
      state.justEvaluated = false;
    } else if (state.justEvaluated) {
      state.justEvaluated = false;
    }

    if (digit === ".") {
      // Get current number being typed
      const match = state.expression.match(/(\d*\.?\d*)$/);
      if (match && match[1].includes(".")) return;
      if (state.expression === "" || OPERATORS.has(state.expression.slice(-1))) {
        state.expression += "0.";
      } else {
        state.expression += ".";
      }
    } else {
      if (state.expression === "0") {
        state.expression = digit;
      } else if (state.result === "0" && state.expression === "") {
        state.expression = digit;
      } else {
        state.expression += digit;
      }
    }
    state.result = state.expression || "0";
    render();
  };

  const inputOperator = (op) => {
    state.justEvaluated = false;
    if (state.expression === "" && op !== "-") return;
    if (OPERATORS.has(state.expression.slice(-1))) {
      // Replace last operator
      state.expression = state.expression.slice(0, -1) + op;
    } else {
      state.expression += op;
    }
    state.result = state.expression;
    render();
  };

  const inputPercent = () => {
    if (state.expression === "") return;
    try {
      const value = evaluate(state.expression);
      if (value === null || !isFinite(value)) return;
      const percentValue = value / 100;
      state.expression = formatNumber(percentValue);
      state.result = state.expression;
      render();
    } catch {
      // ignore
    }
  };

  const deleteLast = () => {
    state.justEvaluated = false;
    state.expression = state.expression.slice(0, -1);
    state.result = state.expression || "0";
    render();
  };

  const clearAll = () => {
    state.expression = "";
    state.result = "0";
    state.justEvaluated = false;
    render();
  };

  const equals = () => {
    if (state.expression === "") return;
    try {
      const value = evaluate(state.expression);
      if (value === null || !isFinite(value)) {
        state.result = "Error";
        render();
        return;
      }
      const formatted = formatNumber(value);
      addHistory(state.expression, formatted);
      state.result = formatted;
      state.expression = formatted;
      state.justEvaluated = true;
      render();
    } catch (err) {
      state.result = "Error";
      render();
    }
  };

  // ---------- History ----------
  const loadHistory = () => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const saveHistory = (items) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch {
      // storage may be full or unavailable
    }
  };

  const addHistory = (expr, result) => {
    const items = loadHistory();
    items.unshift({ expression: expr, result, ts: Date.now() });
    if (items.length > MAX_HISTORY) items.length = MAX_HISTORY;
    saveHistory(items);
    renderHistory();
  };

  const renderHistory = () => {
    const items = loadHistory();
    historyListEl.innerHTML = "";
    if (items.length === 0) {
      historyEmptyEl.style.display = "block";
      return;
    }
    historyEmptyEl.style.display = "none";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "history__item";
      li.innerHTML = `
        <div class="history__item-expression">${sanitizeExpression(item.expression)} =</div>
        <div class="history__item-result">${item.result}</div>
      `;
      li.addEventListener("click", () => {
        state.expression = item.result;
        state.result = item.result;
        state.justEvaluated = true;
        render();
      });
      historyListEl.appendChild(li);
    });
  };

  clearHistoryBtn.addEventListener("click", () => {
    saveHistory([]);
    renderHistory();
  });

  // ---------- Theme ----------
  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggleIcon.textContent = theme === "light" ? "☀️" : "🌙";
  };

  const initTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      applyTheme(saved);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      applyTheme("light");
    } else {
      applyTheme("dark");
    }
  };

  themeToggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  // ---------- Button clicks ----------
  $$(".key").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { digit, operator, action } = btn.dataset;
      if (digit !== undefined) inputDigit(digit);
      else if (operator !== undefined) inputOperator(operator);
      else if (action === "clear") clearAll();
      else if (action === "delete") deleteLast();
      else if (action === "percent") inputPercent();
      else if (action === "equals") equals();
    });
  });

  // ---------- Keyboard support ----------
  const flashKey = (selector) => {
    const btn = document.querySelector(selector);
    if (!btn) return;
    btn.classList.add("is-pressed");
    setTimeout(() => btn.classList.remove("is-pressed"), 120);
  };

  document.addEventListener("keydown", (e) => {
    const k = e.key;
    if (/^[0-9]$/.test(k)) {
      inputDigit(k);
      flashKey(`[data-digit="${k}"]`);
    } else if (k === ".") {
      inputDigit(".");
      flashKey('[data-digit="."]');
    } else if (OPERATORS.has(k)) {
      inputOperator(k);
      flashKey(`[data-operator="${k}"]`);
    } else if (k === "Enter" || k === "=") {
      e.preventDefault();
      equals();
      flashKey('[data-action="equals"]');
    } else if (k === "Backspace") {
      deleteLast();
      flashKey('[data-action="delete"]');
    } else if (k === "Escape") {
      clearAll();
      flashKey('[data-action="clear"]');
    } else if (k === "%") {
      inputPercent();
      flashKey('[data-action="percent"]');
    }
  });

  // ---------- Init ----------
  initTheme();
  renderHistory();
  render();
})();
