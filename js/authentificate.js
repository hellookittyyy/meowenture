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