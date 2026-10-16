const MILE_KM = 1.609344;
const RACES = [['1 mile', MILE_KM], ['5K', 5], ['10K', 10], ['Half marathon', 21.0975], ['Marathon', 42.195]];
const $ = id => document.getElementById(id);
let mode = 'pace';
let secondsPerKm = 300;
let primaryUnits = 'metric';
try { if (localStorage.getItem('stride-primary-units') === 'imperial') primaryUnits = 'imperial'; } catch {}

function parseTime(value, pace = false) {
  const text = value.trim();
  if (!/^\d+(?:\.\d+)?$|^\d+:\d{1,2}(?::\d{1,2})?$/.test(text)) return NaN;
  const parts = text.split(':').map(Number);
  if ((pace && parts.length > 2) || parts.slice(1).some(n => n >= 60)) return NaN;
  const seconds = parts.length === 1 ? parts[0] * 60 : parts.reduce((sum, n) => sum * 60 + n, 0);
  return seconds > 0 && Number.isFinite(seconds) ? seconds : NaN;
}
function formatTime(seconds, hours = false) {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  const n = Math.round(seconds);
  const s = String(n % 60).padStart(2, '0');
  return hours ? `${Math.floor(n / 3600)}:${String(Math.floor(n / 60) % 60).padStart(2, '0')}:${s}` : `${Math.floor(n / 60)}:${s}`;
}
function customKm() {
  const n = Number($('distance').value);
  return n > 0 && Number.isFinite(n) ? n * ($('distance-unit').value === 'mi' ? MILE_KM : 1) : NaN;
}
function render(preserveValue = false) {
  const custom = customKm();
  if (preserveValue !== true) {
  if (mode === 'pace') secondsPerKm = parseTime($('pace').value, true) / ($('pace-unit').value === 'mi' ? MILE_KM : 1);
  else if (mode === 'speed') {
    const speed = Number($('speed').value);
    secondsPerKm = speed > 0 && Number.isFinite(speed) ? 3600 / (speed * ($('speed-unit').value === 'mph' ? MILE_KM : 1)) : NaN;
  }
  else secondsPerKm = parseTime($('finish').value) / ($('race').value === 'custom' ? custom : Number($('race').value));
  }
  const valid = Number.isFinite(secondsPerKm) && secondsPerKm > 0;
  const activeInput = $(mode === 'pace' ? 'pace' : mode === 'speed' ? 'speed' : 'finish').value.trim();
  $('error').textContent = !valid && activeInput ? (mode === 'speed' ? 'Enter a valid speed greater than zero.' : 'Enter a valid positive time and distance. Seconds must be under 60.') : !Number.isFinite(custom) && $('distance').value !== '' ? 'Enter a positive custom distance.' : '';
  const imperial = primaryUnits === 'imperial';
  const paceMetric = `${valid ? formatTime(secondsPerKm) : '—'} / km`;
  const paceImperial = `${valid ? formatTime(secondsPerKm * MILE_KM) : '—'} / mile`;
  const speedMetric = `${valid ? (3600 / secondsPerKm).toFixed(2) : '—'} km/h`;
  const speedImperial = `${valid ? (3600 / secondsPerKm / MILE_KM).toFixed(2) : '—'} mph`;
  $('primary').textContent = imperial ? paceImperial : paceMetric;
  $('secondary').textContent = imperial ? paceMetric : paceImperial;
  $('speed-primary').textContent = imperial ? speedImperial : speedMetric;
  $('speed-secondary').textContent = imperial ? speedMetric : speedImperial;
  $('races').innerHTML = RACES.map(([name, km]) => `<tr><td>${name}<small>${Number(km.toFixed(4))} km · ${Number((km / MILE_KM).toFixed(3))} mi</small></td><td>${valid ? formatTime(secondsPerKm * km, true) : '—'}</td></tr>`).join('');
  $('custom-result').textContent = valid && Number.isFinite(custom) ? `${Number(custom.toFixed(3))} km / ${Number((custom / MILE_KM).toFixed(3))} mi → ${formatTime(secondsPerKm * custom, true)}` : '—';
}
// Treat numeric entry as MMSS for pace and HHMMSS (or MMSS) for finish time.
function formatTimeDigits(value, finish = false) {
  const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  if (!digits) return '';
  const padded = digits.padStart(3, '0');
  const seconds = padded.slice(-2);
  const minutes = padded.slice(0, -2);
  if (!finish || minutes.length <= 2) return `${minutes}:${seconds}`;
  return `${minutes.slice(0, -2)}:${minutes.slice(-2)}:${seconds}`;
}
for (const id of ['pace', 'finish']) {
  const input = $(id);
  input.addEventListener('beforeinput', event => {
    const { selectionStart: start, selectionEnd: end, value } = input;
    if (start !== end) return;
    // Deleting a separator also deletes the neighboring digit, so it cannot trap the cursor.
    if (event.inputType === 'deleteContentBackward' && value[start - 1] === ':') input.setSelectionRange(Math.max(0, start - 2), end);
    if (event.inputType === 'deleteContentForward' && value[start] === ':') input.setSelectionRange(start, Math.min(value.length, end + 2));
  });
  input.addEventListener('input', () => {
    const digitsAfterCursor = input.value.slice(input.selectionStart).replace(/\D/g, '').length;
    input.value = formatTimeDigits(input.value, id === 'finish');
    let cursor = input.value.length;
    let remaining = digitsAfterCursor;
    while (cursor > 0 && remaining > 0) {
      cursor--;
      if (/\d/.test(input.value[cursor])) remaining--;
    }
    input.setSelectionRange(cursor, cursor);
    render();
  });
}
for (const id of ['speed', 'race', 'distance', 'distance-unit']) $(id).addEventListener('input', render);
$('pace-unit').addEventListener('change', () => {
  if (Number.isFinite(secondsPerKm) && secondsPerKm > 0) {
    const minutes = secondsPerKm * ($('pace-unit').value === 'mi' ? MILE_KM : 1) / 60;
    $('pace').value = formatTime(minutes * 60);
  }
  render(true);
});
$('speed-unit').addEventListener('change', () => {
  if (Number.isFinite(secondsPerKm) && secondsPerKm > 0) {
    $('speed').value = (3600 / secondsPerKm / ($('speed-unit').value === 'mph' ? MILE_KM : 1)).toFixed(2);
  }
  render(true);
});
for (const next of ['pace', 'speed', 'time']) $(`${next}-tab`).addEventListener('click', () => {
  if (next !== mode && Number.isFinite(secondsPerKm) && secondsPerKm > 0) {
    if (next === 'pace') $('pace').value = formatTime(secondsPerKm * ($('pace-unit').value === 'mi' ? MILE_KM : 1));
    if (next === 'speed') $('speed').value = (3600 / secondsPerKm / ($('speed-unit').value === 'mph' ? MILE_KM : 1)).toFixed(2);
  }
  mode = next;
  $('pace-fields').hidden = next !== 'pace';
  $('speed-fields').hidden = next !== 'speed';
  $('time-fields').hidden = next !== 'time';
  for (const tab of ['pace', 'speed', 'time']) $(`${tab}-tab`).setAttribute('aria-selected', String(tab === next));
  render(next !== 'time');
});
function applyPrimaryUnits() {
  const distance = customKm();
  const imperial = primaryUnits === 'imperial';
  for (const [id, preferred] of [['pace-unit', imperial ? 'mi' : 'km'], ['speed-unit', imperial ? 'mph' : 'kmh'], ['distance-unit', imperial ? 'mi' : 'km']]) {
    const select = $(id);
    const option = Array.from(select.options).find(option => option.value === preferred);
    select.prepend(option);
    select.value = preferred;
  }
  $('primary-units').value = primaryUnits;
  if (Number.isFinite(secondsPerKm) && secondsPerKm > 0) {
    $('pace').value = formatTime(secondsPerKm * (imperial ? MILE_KM : 1));
    $('speed').value = (3600 / secondsPerKm / (imperial ? MILE_KM : 1)).toFixed(2);
  }
  if (Number.isFinite(distance)) $('distance').value = String(Number((distance / (imperial ? MILE_KM : 1)).toFixed(8)));
  render(true);
}
$('primary-units').addEventListener('change', () => {
  primaryUnits = $('primary-units').value;
  try { localStorage.setItem('stride-primary-units', primaryUnits); } catch {}
  applyPrimaryUnits();
});
applyPrimaryUnits();

$('clear-values').addEventListener('click', () => {
  for (const id of ['pace', 'speed', 'finish', 'distance']) $(id).value = '';
  secondsPerKm = NaN;
  render(true);
  $(mode === 'pace' ? 'pace' : mode === 'speed' ? 'speed' : 'finish').focus();
});
