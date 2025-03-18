document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    if (isTokenExpired(token)) {
        handleUnauthorized();
        return;
    }
    
    // Load parent categories for dropdown
    loadParentCategories();
    
    // Set up form submission
    document.getElementById('categoryForm').addEventListener('submit', handleFormSubmit);
    
    // Set up cancel button
    document.getElementById('cancelBtn').addEventListener('click', function() {
        window.location.href = 'kategori_liste.html';
    });
    
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
});

function loadParentCategories() {
    fetch('http://localhost:8080/api/v1/datacontrol/category', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
            throw new Error('Unauthorized');
        }
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json') || response.headers.get('content-length') === '0') {
            // Return empty array if the response is empty
            return [];
        }
        return response.json();
    })
    .then(categories => {
        const parentSelect = document.getElementById('categoryParent');
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            parentSelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error loading parent categories:', error);
        // Create error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message visible';
        errorElement.textContent = 'Üst kategoriler yüklenemedi. Lütfen sayfayı yenileyin.';
        
        const formContainer = document.querySelector('.category-form-container');
        formContainer.insertBefore(errorElement, document.getElementById('categoryForm'));
    });
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('categoryName');
    const enNameInput = document.getElementById('categoryEnName');
    const parentIdSelect = document.getElementById('categoryParent');
    
    const categoryData = {
        name: nameInput.value.trim(),
        enName: enNameInput.value.trim(),
        parentId: parentIdSelect.value ? parseInt(parentIdSelect.value) : null
    };
    
    // Validate input
    if (categoryData.name.length < 2 || categoryData.name.length > 10) {
        showError('Kategori adı 2-10 karakter arasında olmalıdır.');
        return;
    }
    
    if (categoryData.enName.length < 2 || categoryData.enName.length > 10) {
        showError('İngilizce adı 2-10 karakter arasında olmalıdır.');
        return;
    }
    
    // Send data to server
    fetch('http://localhost:8080/api/v1/datacontrol/category/addcategory', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
            throw new Error('Unauthorized');
        }
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json') || response.headers.get('content-length') === '0') {
            // Return empty array if the response is empty
            return [];
        }
        return response.json();
    })
    .then(data => {
        // Redirect to category list on success
        window.location.href = 'kategori_liste.html';
    })
    .catch(error => {
        console.error('Error adding category:', error);
        showError('Kategori eklenemedi. Lütfen daha sonra tekrar deneyiniz.');
    });
}

function showError(message) {
    // Remove any existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create new error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message visible';
    errorElement.textContent = message;
    
    const formContainer = document.querySelector('.category-form-container');
    formContainer.insertBefore(errorElement, document.getElementById('categoryForm'));
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error parsing JWT token:", e);
        return null;
    }
}

function isTokenExpired(token) {
    const decodedToken = parseJwt(token);
    
    if (!decodedToken) {
        return true;
    }
    
    // JWT exp claim is in seconds since epoch
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
}

function handleLogout() {
    localStorage.removeItem('jwt_token');
    window.location.href = 'login.html';
}

function handleUnauthorized() {
    localStorage.removeItem('jwt_token');
    window.location.href = 'login.html';
}