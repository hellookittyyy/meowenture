function slide(direction) {
    let slider = document.getElementById("slider");
    slider.style.transition = "all 0.5s ease";
    slider.style.transitionDelay = "0.1s";

    if (direction < 0) {
        slider.style.marginLeft = "0%";
    }
    if (direction > 0) {
        slider.style.marginLeft = "-100%";
    }
}

async function fetchAttempts() {
    try {
        const response = await fetch(`${API_URL}/api/progress/attempt/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch attempts');
        }

        const data = await response.json();
        console.log(data);
        const attemptsElement = document.getElementById('attempts');
        if (attemptsElement) {
            attemptsElement.textContent = data.attempts || 0;
        }

    } catch (error) {
        console.error('Error fetching attempts:', error);
    }
}

async function fetchAvatars() {
    try {
        const response = await fetch(`${API_URL}/api/avatar/list/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch avatars');
        }

        const data = await response.json();
        console.log(data);
        updateAvatarGrid(data.avatars);

    } catch (error) {
        console.error('Error fetching avatars:', error);
    }
}

function updateAvatarGrid(avatars) {
    const avatarContainer = document.querySelector('.slide-1-images');
    if (!avatarContainer) return;

    // Clear existing content
    avatarContainer.innerHTML = '';

    // Add each avatar
    avatars.forEach(avatar => {
        const box = document.createElement('div');
        box.className = 'box';
        
        // Create image element
        const img = document.createElement('img');
        img.src = `${API_URL}${avatar.image}` || './images/test_img.png'; // Fallback to default if no image
        img.alt = 'Avatar';
        
        // Create price text
        const priceText = document.createElement('div');
        priceText.className = 'image_text';
        priceText.textContent = `${avatar.price} points`;

        // Add bought/not-bought status
        if (avatar.is_bought) {
            box.classList.add('bought');
        } else {
            box.classList.add('not-bought');
        }

        // Assemble the box
        box.appendChild(img);
        box.appendChild(priceText);
        avatarContainer.appendChild(box);
    });
}

document.addEventListener('DOMContentLoaded', fetchAttempts);
document.addEventListener('DOMContentLoaded', fetchAvatars);

