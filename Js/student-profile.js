const BASE_URL = 'http://localhost:5000/api';
const email = localStorage.getItem('userEmail');
const profileDiv = document.getElementById('profile-info');
const statusDiv = document.getElementById('payment-status');

async function loadProfile() {
  // Fetch bio-data
  const bioRes = await fetch(`${BASE_URL}/user/biodata`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email })
  });
  const bioData = await bioRes.json();

  // Fetch payments
  const payRes = await fetch(`${BASE_URL}/user/payments/${email}`);
  const { payments } = await payRes.json();
  const paid = payments.some(p => p.status === 'success');

  if (bioData.success && bioData.data) {
    const b = bioData.data;
    profileDiv.innerHTML = `
      <p class="profile-field"><strong>Full Name:</strong> ${b.fullName}</p>
      <p class="profile-field"><strong>Email:</strong> ${email}</p>
      <p class="profile-field"><strong>Phone:</strong> ${b.phone}</p>
      <p class="profile-field"><strong>Gender:</strong> ${b.gender}</p>
      <p class="profile-field"><strong>DOB:</strong> ${new Date(b.dob).toLocaleDateString()}</p>
      <p class="profile-field"><strong>Address:</strong> ${b.address}</p>
    `;
  } else {
    profileDiv.textContent = 'No bio-data found. Please fill it on dashboard.';
  }

  if (paid) {
    statusDiv.textContent = '✅ Account activated. You have paid.';
  } else {
    statusDiv.innerHTML = `
      ❗ Payment pending. Please complete a <a href="programs.html">program purchase</a> to activate your account.
    `;
    document.querySelectorAll('header nav a').forEach(a => {
      if (!['Profile','programs.html','about.html'].some(p => a.getAttribute('href').includes(p))) {
        a.style.pointerEvents = 'none';
        a.style.opacity = '0.5';
      }
    });
  }
}

// Initial call
loadProfile();

document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData();
  form.append('email', email);
  form.append('fullName', document.getElementById('fullName').value);
  form.append('phone', document.getElementById('phone').value);
  form.append('gender', document.getElementById('gender').value);
  form.append('dob', document.getElementById('dob').value);
  form.append('address', document.getElementById('address').value);
  if (document.getElementById('avatar').files[0]) {
    form.append('avatar', document.getElementById('avatar').files[0]);
  }

  const res = await fetch(`${BASE_URL}/user/update-profile`, {
    method: 'POST',
    body: form
  });
  const data = await res.json();
  document.getElementById('edit-msg').textContent = data.success ? '✅ Profile updated!' : data.message;
  if (data.success && data.data.avatarUrl) {
    document.getElementById('avatar-preview').src = data.data.avatarUrl;
    document.getElementById('avatar-preview').style.display = 'block';
  }
});