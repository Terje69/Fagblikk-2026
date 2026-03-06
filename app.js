const tripDate = '2026-10-08T06:45:00+02:00';

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const statusEl = document.getElementById('status');

function updateCountdown() {
  const now = new Date();
  const departure = new Date(tripDate);
  const diff = departure - now;

  if (diff <= 0) {
    daysEl.textContent = '0';
    hoursEl.textContent = '0';
    minutesEl.textContent = '0';
    statusEl.textContent = 'ABFLUG';
    return;
  }

  const totalMinutes = Math.floor(diff / 1000 / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  daysEl.textContent = String(days);
  hoursEl.textContent = String(hours).padStart(2, '0');
  minutesEl.textContent = String(minutes).padStart(2, '0');
  statusEl.textContent = 'AKTIV';
}

updateCountdown();
setInterval(updateCountdown, 1000);
