const subjects = document.getElementById('subjects');
const errorBox = document.getElementById('error');

function addSubject(name = '', scored = '', maximum = '100') {
  const row = document.createElement('div');
  row.className = 'subject-row';
  row.innerHTML = `
    <label>Subject <input class="subject-name" type="text" placeholder="e.g. History"></label>
    <label>Scored <input class="scored" type="number" min="0" step="any" placeholder="0"></label>
    <label>Maximum <input class="maximum" type="number" min="1" step="any" placeholder="100"></label>
    <button class="remove-btn" type="button" aria-label="Remove subject">×</button>`;
  row.querySelector('.subject-name').value = name;
  row.querySelector('.scored').value = scored;
  row.querySelector('.maximum').value = maximum;
  subjects.appendChild(row);
}

document.getElementById('add-subject').addEventListener('click', () => addSubject());
subjects.addEventListener('click', event => {
  if (event.target.classList.contains('remove-btn')) {
    if (subjects.querySelectorAll('.subject-row').length === 1) {
      errorBox.textContent = 'Keep at least one subject.';
      return;
    }
    event.target.closest('.subject-row').remove();
    errorBox.textContent = '';
  }
});

function getGrade(percentage) {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

document.getElementById('calculate').addEventListener('click', () => {
  errorBox.textContent = '';
  const rows = [...subjects.querySelectorAll('.subject-row')];
  let scoredTotal = 0;
  let maximumTotal = 0;

  for (let i = 0; i < rows.length; i++) {
    const scoredInput = rows[i].querySelector('.scored');
    const maximumInput = rows[i].querySelector('.maximum');
    const scored = Number(scoredInput.value);
    const maximum = Number(maximumInput.value);
    if (scoredInput.value.trim() === '' || maximumInput.value.trim() === '' ||
        !Number.isFinite(scored) || !Number.isFinite(maximum) ||
        scored < 0 || maximum <= 0 || scored > maximum) {
      errorBox.textContent = `Check subject ${i + 1}: marks must be valid, and scored marks cannot exceed maximum marks.`;
      return;
    }
    scoredTotal += scored;
    maximumTotal += maximum;
  }

  const percentage = maximumTotal ? (scoredTotal / maximumTotal) * 100 : 0;
  document.getElementById('total-scored').textContent = formatNumber(scoredTotal);
  document.getElementById('total-maximum').textContent = formatNumber(maximumTotal);
  document.getElementById('percentage').textContent = `${percentage.toFixed(2)}%`;
  document.getElementById('average').textContent = formatNumber(scoredTotal / rows.length);
  document.getElementById('grade').textContent = getGrade(percentage);
});

function formatNumber(value) {
  return Number(value.toFixed(2)).toString();
}

// Basic calculator: accepts only calculator buttons, never arbitrary typed expressions.
const display = document.getElementById('display');
let expression = '';
document.querySelector('.keypad').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.action === 'clear') {
    expression = '';
    display.value = '';
    return;
  }
  if (button.dataset.action === 'backspace') {
    expression = expression.slice(0, -1);
    display.value = expression;
    return;
  }
  if (button.id === 'equals') {
    calculateExpression();
    return;
  }
  const value = button.dataset.value;
  if (!value) return;
  expression += value;
  display.value = expression;
});

function calculateExpression() {
  try {
    const normalized = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (!normalized || !/^[0-9+*/%.()\- ]+$/.test(normalized)) throw new Error('Invalid input');
    // Only arithmetic characters are accepted from the calculator keypad.
    const result = Function(`"use strict"; return (${normalized})`)();
    if (typeof result !== 'number' || !Number.isFinite(result)) throw new Error('Invalid result');
    expression = String(Number(result.toFixed(10)));
    display.value = expression;
  } catch {
    display.value = 'Error';
    expression = '';
  }
}

document.querySelectorAll('.keypad button[data-value="%"]').forEach(button => {
  button.addEventListener('click', () => {
    // Percentage converts the current numeric expression into a fraction.
    const value = Number(expression);
    if (expression && Number.isFinite(value)) {
      expression = String(value / 100);
      display.value = expression;
    }
  });
});
