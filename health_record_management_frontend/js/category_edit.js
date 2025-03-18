document.addEventListener('DOMContentLoaded', function() {
    // Get the JWT token from localStorage
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Check if token is expired
    if (isTokenExpired(token)) {
        handleUnauthorized();
        return;
    }
    
    // Get category ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('id');
    
    if (!categoryId) {
        showError('Kategori ID bulunamadı.');
        return;
    }
    
    // Fetch category details
    fetchCategoryDetails(categoryId, token);
    
    // Set up form submission
    document.getElementById('categoryForm').addEventListener('submit', function(event) {
        event.preventDefault();
        updateCategory(categoryId, token);
    });
    
    // Set up cancel button
    document.getElementById('cancelBtn').addEventListener('click', function() {
        window.location.href = 'kategori_liste.html';
    });
});

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        return Date.now() >= expirationTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true; // Assume expired if there's an error
    }
}

function handleUnauthorized() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    window.location.href = 'login.html';
}

function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showError(message) {
    hideLoading();
    const formContainer = document.querySelector('.category-form-container');
    formContainer.innerHTML = `<div class="error-message">${message}</div>`;
}

function fetchCategoryDetails(categoryId, token) {
    showLoading();
    
    // Get all categories and find the one with matching ID
    fetch('http://localhost:8080/api/v1/datacontrol/category', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
            throw new Error('Unauthorized');
        }
        if (!response.ok) {
            throw new Error('Kategoriler alınamadı.');
        }
        return response.json();
    })
    .then(categories => {
        // Find the category with the matching ID
        const category = categories.find(cat => cat.id.toString() === categoryId.toString());
        
        if (!category) {
            throw new Error('Kategori bulunamadı.');
        }
        
        // Populate form with category details
        document.getElementById('categoryName').value = category.name || '';
        document.getElementById('categoryEnName').value = category.enName || '';
        hideLoading();
    })
    .catch(error => {
        console.error('Error fetching category details:', error);
        showError('Kategori bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyiniz.');
    });
}

function updateCategory(categoryId, token) {
    showLoading();
    
    const categoryName = document.getElementById('categoryName').value.trim();
    const categoryEnName = document.getElementById('categoryEnName').value.trim();
    
    // Validate form inputs
    if (categoryName.length < 2 || categoryName.length > 10) {
        alert('Kategori adı 2-10 karakter arasında olmalıdır.');
        hideLoading();
        return;
    }
    
    if (categoryEnName.length < 2 || categoryEnName.length > 10) {
        alert('Kategori adı 2-10 karakter arasında olmalıdır.');
        hideLoading();
        return;
    }
    
    const categoryData = {
        id: categoryId,
        name: categoryName,
        enName: categoryEnName
    };
    
    fetch(`http://localhost:8080/api/v1/datacontrol/category/${categoryId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
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
            throw new Error('Kategori güncellenemedi.');
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json') || response.headers.get('content-length') === '0') {
            return [];
        }
        return response.json();
    })
    .then(updatedCategory => {
        alert('Kategori başarıyla güncellendi.');
        window.location.href = 'kategori_liste.html';
    })
    .catch(error => {
        console.error('Error updating category:', error);
        hideLoading();
        alert('Kategori güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
    });
}