async function fetchLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/api/leaderboard/`, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard data');
        }

        const data = await response.json();
        updateLeaderboardTable(data.leaderboard);

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }
}

function updateLeaderboardTable(leaderboardData) {
    const tableBody = document.querySelector('.leader_board table');
    if (!tableBody) return;

    // Keep the header row
    const headerRow = tableBody.querySelector('.th');
    tableBody.innerHTML = '';
    tableBody.appendChild(headerRow);

    // Add data rows
    leaderboardData.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="./images/circle.png" />${entry.username}</td>
            <td>${entry.coins}</td>
            <td>${entry.attempts}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Load leaderboard when page loads
document.addEventListener('DOMContentLoaded', fetchLeaderboard); 