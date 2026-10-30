// Estado
let deg = true;   // true = grados, false = radianes
let expr = "";    // expresión actual
let ans = 0;      // último resultado

// Definición de teclas: [texto del botón, valor que inserta, clase CSS]
const keys = [
  ["sin", "sin(", "f"], ["cos", "cos(", "f"], ["tan", "tan(", "f"], ["ln", "ln(", "f"], ["log", "log(", "f"],
  ["√", "√(", "f"], ["x²", "^2", "f"], ["xʸ", "^", "f"], ["π", "π", "f"], ["e", "e", "f"],
  ["(", "(", "f"], [")", ")", "f"], ["n!", "!", "f"], ["Ans", "Ans", "f"], ["DEL", "DEL", "ac"],
  ["7", "7"], ["8", "8"], ["9", "9"], ["÷", "÷", "o"], ["AC", "AC", "ac"],
  ["4", "4"], ["5", "5"], ["6", "6"], ["×", "×", "o"], ["1/x", "1/(", "f"],
  ["1", "1"], ["2", "2"], ["3", "3"], ["−", "−", "o"], ["%", "%", "f"],
  ["0", "0"], [".", "."], ["EXP", "E", "f"], ["+", "+", "o"], ["=", "=", "eq"]
];

const exprEl = document.getElementById("expr");
const resEl = document.getElementById("res");
const modeBtn = document.getElementById("mode");
const grid = document.getElementById("grid");

// Crear los botones
keys.forEach(([label, value, cls]) => {
  const b = document.createElement("button");
  b.className = "k " + (cls || "");
  b.textContent = label;
  b.addEventListener("click", () => press(value));
  grid.appendChild(b);
});

// Cambiar entre grados y radianes
modeBtn.addEventListener("click", () => {
  deg = !deg;
  modeBtn.textContent = deg ? "DEG" : "RAD";
  show();
});

// Soporte de teclado
document.addEventListener("keydown", (e) => {
  const k = e.key;
  if (/^[0-9.()+]$/.test(k)) press(k);
  else if (k === "-") press("−");
  else if (k === "*") press("×");
  else if (k === "/") { e.preventDefault(); press("÷"); }
  else if (k === "^") press("^");
  else if (k === "%") press("%");
  else if (k === "Enter" || k === "=") press("=");
  else if (k === "Backspace") press("DEL");
  else if (k === "Escape") press("AC");
});

function fact(n) {
  if (n < 0 || n % 1 !== 0 || n > 170) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// Convierte la expresión a JavaScript y la evalúa
function calc(s) {
  let t = s
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/\^/g, "**")
    .replace(/π/g, "(Math.PI)")
    .replace(/Ans/g, "(" + ans + ")")
    .replace(/(\d)E(-?\d)/g, "$1e$2")
    .replace(/(\d+(\.\d+)?)%/g, "($1/100)")
    .replace(/(\d+)!/g, "fact($1)")
    .replace(/√\(/g, "sqrt(")
    .replace(/\be\b/g, "(Math.E)");

  // Cerrar paréntesis pendientes
  const abiertos = (t.match(/\(/g) || []).length;
  const cerrados = (t.match(/\)/g) || []).length;
  t += ")".repeat(Math.max(0, abiertos - cerrados));

  // Validación: solo caracteres permitidos
  if (!/^[0-9+\-*\/.()eE,a-z_]*$/.test(t.replace(/Math\.(PI|E)/g, "0"))) throw new Error("Expresión inválida");

  const k = deg ? Math.PI / 180 : 1;
  const f = new Function("sin", "cos", "tan", "ln", "log", "sqrt", "fact",
    '"use strict"; return (' + t + ");");

  return f(
    (x) => Math.sin(x * k),
    (x) => Math.cos(x * k),
    (x) => Math.tan(x * k),
    Math.log,
    Math.log10,
    Math.sqrt,
    fact
  );
}

function fmt(n) {
  if (!isFinite(n)) throw new Error("Resultado no válido");
  return String(parseFloat(n.toPrecision(12)));
}

// Actualiza pantalla con resultado en vivo
function show() {
  exprEl.textContent = expr;
  if (!expr) { resEl.textContent = "0"; return; }
  try { resEl.textContent = fmt(calc(expr)); } catch (e) { /* expresión incompleta */ }
}

function press(v) {
  if (v === "AC") {
    expr = "";
    exprEl.textContent = "";
    resEl.textContent = "0";
    return;
  }
  if (v === "DEL") {
    expr = expr.replace(/(sin\(|cos\(|tan\(|ln\(|log\(|√\(|Ans|.)$/, "");
    show();
    return;
  }
  if (v === "=") {
    try {
      const r = calc(expr);
      ans = r;
      exprEl.textContent = expr + " =";
      resEl.textContent = fmt(r);
      expr = fmt(r);
    } catch (e) {
      resEl.textContent = "Error";
      expr = "";
    }
    return;
  }
  expr += v;
  show();
}
