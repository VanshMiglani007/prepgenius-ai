const authWrapper = document.querySelector('.auth-wrapper');
const loginTrigger = document.querySelector('.login-trigger');
const registerTrigger = document.querySelector('.register-trigger');

// API base URL - use same origin when served from Express
const API_BASE = window.location.origin;

// Toggle between Login and Signup panels
registerTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    authWrapper.classList.add('toggled');
    clearErrors();
});

loginTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    authWrapper.classList.remove('toggled');
    clearErrors();
});

function clearErrors() {
    document.getElementById('loginError').textContent = '';
    document.getElementById('signupError').textContent = '';
}

// Login form submit
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginError = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');

    loginError.textContent = '';
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            window.location.href = '/dashboard.html';
        } else {
            loginError.textContent = data.message || 'Login failed.';
        }
    } catch (err) {
        loginError.textContent = 'Cannot connect to server. Is the backend running?';
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});

// Signup form submit
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const signupError = document.getElementById('signupError');
    const signupBtn = document.getElementById('signupBtn');

    signupError.textContent = '';
    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating account...';

    try {
        const res = await fetch(`${API_BASE}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            window.location.href = '/dashboard.html';
        } else {
            signupError.textContent = data.message || 'Signup failed.';
        }
    } catch (err) {
        signupError.textContent = 'Cannot connect to server. Is the backend running?';
    } finally {
        signupBtn.disabled = false;
        signupBtn.textContent = 'Register';
    }
});
