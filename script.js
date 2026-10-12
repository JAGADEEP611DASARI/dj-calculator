const screen = document.querySelector('#screen');
const history = document.querySelector('#history');
const keys = document.querySelector('#keys');
const themeToggle = document.querySelector('#themeToggle');

let current = '0';
let storedValue = null;
let operator = null;
let waitingForOperand = false;
let justCalculated = false;

function render() {
  screen.textContent = current;
}

function reset() {
  current = '0';
  storedValue = null;
  operator = null;
  waitingForOperand = false;
  justCalculated = false;
  history.textContent = '';
  render();
}

function showError(message) {
  current = message;
  storedValue = null;
  operator = null;
  waitingForOperand = true;
  justCalculated = false;
  render();
}

function inputDigit(digit) {
  if (current === 'Error' || current === 'Cannot divide by zero') reset();
  if (waitingForOperand || justCalculated) {
    current = digit;
    waitingForOperand = false;
    justCalculated = false;
  } else {
    current = current === '0' ? digit : current + digit;
  }
  render();
}

function inputDecimal() {
  if (current === 'Error' || current === 'Cannot divide by zero') reset();
  if (waitingForOperand || justCalculated) {
    current = '0.';
    waitingForOperand = false;
    justCalculated = false;
  } else if (!current.includes('.')) {
    current += '.';
  }
  render();
}

function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷':
      if (b === 0) return null;
      return a / b;
    default: return b;
  }
}

function formatNumber(number) {
  if (!Number.isFinite(number)) return 'Error';
  const rounded = Number.parseFloat(number.toPrecision(11));
  return String(rounded);
}

function chooseOperator(nextOperator) {
  const value = Number(current);
  if (!Number.isFinite(value)) return;
  if (operator && !waitingForOperand) {
    const result = calculate(storedValue, value, operator);
    if (result === null) {
      showError('Cannot divide by zero');
      history.textContent = '';
      return;
    }
    current = formatNumber(result);
    storedValue = result;
    render();
  } else {
    storedValue = value;
  }
  operator = nextOperator;
  waitingForOperand = true;
  justCalculated = false;
  history.textContent = `${formatNumber(storedValue)} ${operator}`;
}

function doEquals() {
  if (!operator || storedValue === null || waitingForOperand) return;
  const a = storedValue;
  const b = Number(current);
  const op = operator;
  const result = calculate(a, b, op);
  history.textContent = `${formatNumber(a)} ${op} ${formatNumber(b)} =`;
  if (result === null) {
    showError('Cannot divide by zero');
    history.textContent = `${formatNumber(a)} ÷ 0`;
    return;
  }
  current = formatNumber(result);
  storedValue = null;
  operator = null;
  waitingForOperand = true;
  justCalculated = true;
  render();
}

function performAction(action) {
  switch (action) {
    case 'clear': reset(); break;
    case 'delete':
      if (waitingForOperand || justCalculated || current === 'Error' || current === 'Cannot divide by zero') {
        current = '0';
        waitingForOperand = false;
        justCalculated = false;
      } else {
        current = current.length > 1 ? current.slice(0, -1) : '0';
        if (current === '-') current = '0';
      }
      render();
      break;
    case 'decimal': inputDecimal(); break;
    case 'equals': doEquals(); break;
    case 'sign':
      if (current !== 'Error' && current !== 'Cannot divide by zero' && Number(current) !== 0) {
        current = formatNumber(-Number(current));
        render();
      }
      break;
    case 'percent':
      if (current !== 'Error' && current !== 'Cannot divide by zero') {
        current = formatNumber(Number(current) / 100);
        render();
      }
      break;
  }
}

keys.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.digit !== undefined) inputDigit(button.dataset.digit);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else if (button.dataset.action) performAction(button.dataset.action);
});

document.addEventListener('keydown', (event) => {
  if (/^[0-9]$/.test(event.key)) inputDigit(event.key);
  else if (event.key === '.') inputDecimal();
  else if (event.key === '+') chooseOperator('+');
  else if (event.key === '-') chooseOperator('−');
  else if (event.key === '*') chooseOperator('×');
  else if (event.key === '/') { event.preventDefault(); chooseOperator('÷'); }
  else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); doEquals(); }
  else if (event.key === 'Backspace') performAction('delete');
  else if (event.key === 'Escape') reset();
  else if (event.key === '%') performAction('percent');
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  themeToggle.title = isDark ? 'Switch to light theme' : 'Switch to dark theme';
});

render();
