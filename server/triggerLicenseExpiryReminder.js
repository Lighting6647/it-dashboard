const endpoint = process.env.LICENSE_REMINDER_ENDPOINT
  || 'https://it-monthly-dashboard-new.onrender.com/internal/license-reminder/run';

const response = await fetch(endpoint, { method: 'POST' });
const body = await response.text();
if (!response.ok) throw new Error(`Reminder endpoint returned HTTP ${response.status}: ${body}`);
console.log(body);
