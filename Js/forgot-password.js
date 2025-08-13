const BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api/auth'
    : 'https://hm-academy-website.onrender.com/api/auth';

const emailInput = document.getElementById('email');
const otpInput = document.getElementById('otp');
const passwordInput = document.getElementById('newPassword');
const message = document.getElementById('message');

let globalEmail = ''; // Save email across forms

// STEP 1: Send OTP
document.getElementById('send-otp-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) return (message.textContent = 'Email is required ❗');

  globalEmail = email;

  const res = await fetch(`${BASE_URL}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  message.textContent = data.message || 'OTP request sent';

  if (data.success) {
    document.getElementById('send-otp-form').style.display = 'none';
    document.getElementById('verify-otp-form').style.display = 'block';
  }
});

// STEP 2: Verify OTP
document.getElementById('verify-otp-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const code = otpInput.value.trim();
  if (!code) return (message.textContent = 'Enter the OTP ❗');

  const res = await fetch(`${BASE_URL}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: globalEmail, code }),
  });

  const data = await res.json();
  message.textContent = data.message || 'Verifying...';

  if (data.success) {
    document.getElementById('verify-otp-form').style.display = 'none';
    document.getElementById('reset-password-form').style.display = 'block';
  }
});

// STEP 3: Reset Password + Redirect
document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPassword = passwordInput.value.trim();
  if (!newPassword) return (message.textContent = 'Enter a new password');

  const res = await fetch(`${BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: globalEmail, newPassword }),
  });

  const data = await res.json();
  message.textContent = data.message;

  if (data.success) {
    alert('✅ Password reset successful! Redirecting...');
    const role = data.role || 'student'; // default if backend didn't send role
    window.location.href = role === 'staff' ? 'staff-login.html' : 'student-login.html';
  } else if (data.redirect) {
    alert('⚠️ Account not found. Redirecting you to create one.');
    window.location.href = 'create-account.html';
  } else {
    message.textContent = data.message || 'Error resetting password';
  }
});