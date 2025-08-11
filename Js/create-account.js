// Js/create-account.js
const BASE_URL = 'http://localhost:5000/api/auth';

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  document.getElementById('message').textContent = data.message;

  if (data.success) {
    alert('🎉 Account created successfully! Redirecting to login...');
    window.location.href = 'student-dashboard.html';
  }
});