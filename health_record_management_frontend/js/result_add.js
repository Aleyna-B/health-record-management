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
    fetchUserData(token);
    // Load categories for dropdown
    loadCategories(token);
    
    // Set up form submission
    const resultForm = document.getElementById('resultForm');
    if (resultForm) {
        resultForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Image preview functionality
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }
    
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
});

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

function fetchUserData(token) {
    // Extract user information directly from the JWT token
    const decodedToken = parseJwt(token);
    
    if (decodedToken && decodedToken.sub) {
        document.getElementById('username').textContent = decodedToken.sub;
    } else {
        document.getElementById('username').textContent = 'Kullanıcı';
    }
}

function loadCategories(token) {
    const categoryDropdown = document.getElementById('category');
    
    fetch('http://localhost:8080/api/v1/datacontrol/category', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.status === 401) {
            handleUnauthorized();
            throw new Error('Unauthorized');
        }
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(categories => {
        // Clear loading option
        categoryDropdown.innerHTML = '<option value="">Kategori seçiniz</option>';
        
        // Add categories to dropdown
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryDropdown.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error loading categories:', error);
        categoryDropdown.innerHTML = '<option value="">Kategoriler yüklenemedi</option>';
    });
}

function handleImagePreview(event) {
    const imagePreview = document.getElementById('imagePreview');
    const file = event.target.files[0];
    
    if (file) {
        // Display image preview
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="preview-image">`;
        };
        reader.readAsDataURL(file);
        
        // Show file name
        const fileNameDisplay = document.createElement('div');
        fileNameDisplay.className = 'file-name';
        fileNameDisplay.textContent = file.name;
        imagePreview.appendChild(fileNameDisplay);
    } else {
        // Clear preview if no file is selected
        imagePreview.innerHTML = '';
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const token = localStorage.getItem('jwt_token');
    
    // Validate form
    if (!validateForm(form)) {
        return;
    }
    
    // Create FormData object for file upload
    const formData = new FormData();
    
    // Add the image file if it exists
    const imageInput = document.getElementById('imageInput');
    if (imageInput.files.length > 0) {
        formData.append('img', imageInput.files[0]);
    }
    
    // Create the resultDto object
    const resultDto = {
        category: { id: form.category.value },
        report: form.report.value,
        klinik: form.klinik.value,
        patientId: parseInt(form.patientId.value)
    };
    
    // Convert resultDto to JSON and append to form data
    const resultDtoBlob = new Blob([JSON.stringify(resultDto)], {
        type: 'application/json'
    });
    
    formData.append('resultDto', resultDtoBlob);
    
    // Display loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Kaydediliyor...';
    
    // Send the request
    fetch('http://localhost:8080/api/v1/datacontrol/result/newresult', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // Note: Content-Type is automatically set by the browser when using FormData
        },
        body: formData
    })
    .then(response => {
        if (response.status === 401) {
            handleUnauthorized();
            throw new Error('Unauthorized');
        }
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Error: ${response.status} - ${text}`);
            });
        }
        return response.text();
    })
    .then(() => {
        // Success - redirect to results list
        window.location.href = 'sonuclar_liste.html';
    })
    .catch(error => {
        console.error('Error saving result:', error);
        alert(`Sonuç kaydedilemedi: ${error.message}`);
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    });
}

function validateForm(form) {
    // Reset previous error messages
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(element => element.remove());
    
    let isValid = true;
    
    // Validate category
    if (!form.category.value) {
        showError(form.category, 'Lütfen kategori seçiniz.');
        isValid = false;
    }
    
    // Validate patient
    if (!form.patientId.value) {
        showError(form.patientId, 'Lütfen hasta seçiniz.');
        isValid = false;
    }
    
    // Validate clinic
    if (!form.klinik.value) {
        showError(form.klinik, 'Lütfen klinik seçiniz.');
        isValid = false;
    }
    
    // Validate report (10-300 characters)
    if (!form.report.value || form.report.value.length < 10 || form.report.value.length > 300) {
        showError(form.report, 'Rapor 10-300 karakter arasında olmalıdır.');
        isValid = false;
    }
    
    return isValid;
}

function showError(element, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    element.parentNode.appendChild(errorElement);
    element.classList.add('error');
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