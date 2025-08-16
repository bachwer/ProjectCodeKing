document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Clear previous messages
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    // Basic validation
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }

    // Show loading state
    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;


    // Danh sách tài khoản mẫu
    

    // Simulate login process
    setTimeout(() => {
        // Chỉ login thành công khi đúng username và password từ object accounts
        if (accounts[username] && accounts[username] === password) {
            showSuccess('Login successful!');
            setTimeout(() => {
                // logic next page ..



                localStorage.setItem('UserData', username);
                window.location.href = './PageUser/start.html';

            }, 1000);
        } else {
            showError('Invalid credentials');
        }

        // Reset button
        loginBtn.textContent = 'Login to Contest';
        loginBtn.disabled = false;
    }, 1500);
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

// Enter key support
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});