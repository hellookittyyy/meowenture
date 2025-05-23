const API_URL = 'http://localhost:8000'; 

 // SHOW THAT YOU ARE LOGGED IN
const setTokens = (access, refresh) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
}; 
// SHOW THAT YOU ARE LOGGED OUT
const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

const getAccessToken = () => localStorage.getItem('access_token'); // FOR CHECKING IF YOU ARE LOGGED IN
const getRefreshToken = () => localStorage.getItem('refresh_token'); // FOR REFRESHING TOKEN (IT SAVED TO 2 HOURS)

async function refreshAccessToken() {
    const refresh = getRefreshToken();
    if (!refresh) {
        clearTokens();
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh })
        }); // SEND REFRESH TOKEN TO THE SERVER

        if (!response.ok) {
            clearTokens();
            return false;
        } // IF RESPONSE IS NOT OK, THEN LOG OUT

        const data = await response.json();
        localStorage.setItem('access_token', data.access); // SAVE NEW ACCESS TOKEN
        return true;
    } catch (error) {
        console.error('Error refreshing token:', error);
        clearTokens();
        return false;
    }
}

async function authenticatedFetch(url, options = {}) {
    const access = getAccessToken();
    if (!access) {
        throw new Error('No access token available');
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${access}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(url, { ...options, headers });
        
        if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                headers.Authorization = `Bearer ${getAccessToken()}`;
                return fetch(url, { ...options, headers });
            } else {
                throw new Error('Session expired');
            }
        }
        
        return response;
    } catch (error) {
        throw error;
    }
}

function getMediaUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
}

async function loginUser(email, password) {
    const response = await fetch(`${API_URL}/api/token/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        throw new Error('Invalid credentials');
    }

    const data = await response.json();
    setTokens(data.access, data.refresh);
    
    // Redirect to account page after successful login
    window.location.href = 'account.html';
}

document.getElementById('registerButton')?.addEventListener('click', async function(event) {
    event.preventDefault(); //FOR NOT REFRESH PAGE ETC
    const username = document.getElementById('registerNickname').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const messageElement = document.getElementById('registerMessage');

    if (!username || !email || !password) {
        messageElement.textContent = 'All fields are required';
        messageElement.className = 'error';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageElement.textContent = 'Registration successful! You can now login.';
            messageElement.className = 'success';

            document.getElementById('registerNickname').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
        } else {
            messageElement.textContent = data.message || 'Registration failed';
            messageElement.className = 'error';
        }
    } catch (error) {
        console.error(error);
        messageElement.textContent = 'An error occurred. Please try again.';
        messageElement.className = 'error';
    }
});

document.getElementById('loginButton')?.addEventListener('click', async function(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const messageElement = document.getElementById('loginMessage');

    if (!email || !password) {
        messageElement.textContent = 'Email and password are required';
        messageElement.className = 'error';
        return;
    }

    try {
        await loginUser(email, password);
        messageElement.textContent = 'Login successful!';
        messageElement.className = 'success';

        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';

    } catch (error) {
        messageElement.textContent = error.message || 'Invalid credentials';
        messageElement.className = 'error';
    }
});

async function checkLoginStatus() {
    const access = getAccessToken();
    if (!access) {
        // If no token and we're on account page, redirect to login
        if (window.location.pathname.endsWith('account.html')) {
            window.location.href = 'login.html';
        }
        return;
    }
    try {
        const response = await authenticatedFetch(`${API_URL}/api/profile/`);
        if (!response.ok) throw new Error('Not logged in');

        if (window.location.pathname.endsWith('login.html')) {
          window.location.href = 'account.html';
        }
        const data = await response.json();
        console.log(data.username);
        console.log(data.email);
        console.log(data.coins);

        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${data.username}!`;
        }

        const usernameDisplay = document.getElementById('usernameDisplay');
        if (usernameDisplay) {
            usernameDisplay.textContent = data.username;
        }

        const userImg = document.getElementById('user_img');
        if (userImg && data.profile_image) {
            userImg.src = getMediaUrl(data.profile_image);
        }

        // Set points balance
        const pointsBalance = document.getElementById('points_balance');
        if (pointsBalance) {
            pointsBalance.textContent = `POINTS BALANCE: ${data.coins || 0}`;
        }

    } catch (error) {
        console.error(error);
        clearTokens();
        if (window.location.pathname.endsWith('account.html')) {
            window.location.href = 'login.html';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const profileImageInput = document.getElementById('profileImageInput');
    if (profileImageInput) {
        profileImageInput.addEventListener('change', async function(event) {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('profile_image', file);

            try {
                const response = await fetch(`${API_URL}/api/profile/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': ` Bearer ${getAccessToken()}`
                    },
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    // Update the profile image
                    const userImg = document.getElementById('user_img');
                    if (userImg && data.profile_image) {
                        userImg.src = getMediaUrl(data.profile_image);
                    }
                } else {
                    console.error('Failed to update profile image:', data.message);
                }
            } catch (error) {
                console.error('Error updating profile image:', error);
            }
        });
    }

    checkLoginStatus();
});

document.addEventListener('DOMContentLoaded', function() {
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const messageElement = document.getElementById('passwordMessage');
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate passwords match

            if (!currentPassword || !newPassword) {
              messageElement.textContent = 'Current password and new password are required';
              messageElement.className = 'message error';
              return;
          }
            if (newPassword !== confirmPassword) {
                messageElement.textContent = 'New passwords do not match';
                messageElement.className = 'message error';
                return;
            }
            if (!currentPassword || !newPassword) {
                messageElement.textContent = 'Current password and new password are required';
                messageElement.className = 'message error';
                return;
            }
            try {
                const response = await fetch(`${API_URL}/api/change-password/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAccessToken()}`
                    },
                    body: JSON.stringify({
                        old_password: currentPassword,
                        new_password: newPassword
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    setTokens(data.tokens.access, data.tokens.refresh);
                    
                    messageElement.textContent = 'Password changed successfully! Redirecting...';
                    messageElement.className = 'message success';

                    changePasswordForm.reset();

                    setTimeout(() => {
                        window.location.href = 'account.html';
                    }, 2000);
                } else {
                    messageElement.textContent = data.message || 'Failed to change password';
                    messageElement.className = 'message error';
                }
            } catch (error) {
                console.error(error);
                messageElement.textContent = 'An error occurred. Please try again.';
                messageElement.className = 'message error';
            }
        });
    }
    
    checkLoginStatus();
});

document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            clearTokens();
            window.location.href = 'login.html';
        });
    }
    checkLoginStatus();
});