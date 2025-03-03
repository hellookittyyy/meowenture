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

