const BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api/user'
  : 'https://hm-academy-website.onrender.com/api/user';

const email = localStorage.getItem('userEmail');
const profileDiv = document.getElementById('profile-info');
const statusDiv = document.getElementById('payment-status');

// ---------------- Load Profile ----------------
async function loadProfile() {
  try {
    // Fetch bio-data
    const bioRes = await fetch(`${BASE_URL}/biodata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const bioData = await bioRes.json();

    // Fetch payments
    const payRes = await fetch(`${BASE_URL}/payments/${email}`);
    const payData = await payRes.json();
    const paid = payData?.payments?.some(p => p.status === 'success');

    if (bioData.success && bioData.data) {
      const b = bioData.data;
      profileDiv.innerHTML = `
        <p><strong>Full Name:</strong> ${b.fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${b.phone}</p>
        <p><strong>Gender:</strong> ${b.gender}</p>
        <p><strong>DOB:</strong> ${new Date(b.dob).toLocaleDateString()}</p>
        <p><strong>Address:</strong> ${b.address}</p>
      `;
    } else {
      profileDiv.textContent = 'No bio-data found. Please fill it.';
    }

    if (paid) {
      statusDiv.textContent = '✅ Account activated. You have paid.';
    } else {
      statusDiv.innerHTML = `
        ❗ Payment pending. Please complete a <a href="programs.html">program purchase</a>.
      `;
    }
  } catch (err) {
    console.error("Error loading profile:", err);
    profileDiv.textContent = "⚠️ Could not load profile.";
  }
}

// ---------------- Save Biodata ----------------
const biodataForm = document.getElementById('biodata-form');
if (biodataForm) {
  biodataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const biodata = {
      email,
      fullName: document.getElementById('fullName').value,
      phone: document.getElementById('phone').value,
      gender: document.getElementById('gender').value,
      dob: document.getElementById('dob').value,
      address: document.getElementById('address').value
    };

    try {
      const res = await fetch(`${BASE_URL}/save-biodata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(biodata)
      });

      const data = await res.json();
      document.getElementById('msg').textContent = data.success
        ? '✅ Bio-data saved successfully!'
        : `❌ ${data.message}`;

      if (data.success) {
        loadProfile(); // Refresh profile after saving
      }
    } catch (err) {
      document.getElementById('msg').textContent = '❌ Server error';
      console.error(err);
    }
  });
}

// Initial load
loadProfile();
