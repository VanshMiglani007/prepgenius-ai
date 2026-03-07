const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Redirect to login if not authenticated
if (!token) {
    window.location.href = '/';
}

document.getElementById('userName').textContent = user.name || user.email || 'User';

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
});
