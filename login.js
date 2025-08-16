let accounts = [];

fetch('./json/Account.json')
    .then(response => response.json())
    .then(data => {
        accounts = data.Users;
    })
    .catch(error => {
        console.error('Error loading JSON:', error);
    });

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Clear previous messages
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }

    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;

    // Tìm tài khoản phù hợp
    const tmp = accounts.find((acc) => {
        return acc.username === username && acc.password === password;
    });

    if (tmp) {
        showSuccess('Login successful!');
        setTimeout(() => {
            localStorage.setItem('UserData', JSON.stringify(tmp));
            window.location.href = './PageUser/start.html';
        }, 1000);
    } else {
        showError('Username or password is incorrect');
    }

    loginBtn.textContent = 'Login to Contest';
    loginBtn.disabled = false;
});

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.style.display = 'block';
}

document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});
