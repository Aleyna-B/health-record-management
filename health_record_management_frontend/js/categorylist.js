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
    
    fetchCategories(token);
    
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
});

function fetchCategories(token) {
    const categoryListElement = document.getElementById('categoryList');
    categoryListElement.innerHTML = '<div class="loading-indicator">Yükleniyor...</div>';
    
    fetch('http://localhost:8080/api/v1/datacontrol/category', {
        headers: {
            'Authorization': `Bearer ${token}`,   
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log("Token being sent:", token);
        if (response.status === 401) {
            handleUnauthorized();
            console.log(response.data);
            console.log(response);
            throw new Error('Unauthorized');
        }
        if (response.status === 403) {
            console.log(response.data);
            console.log(response);
            throw new Error('error 403');
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
        displayCategories(categories);
    })
    .catch(error => {
        console.error('Error fetching categories:', error);
        categoryListElement.innerHTML = '<div class="error-message">Kategoriler yüklenemedi. Lütfen daha sonra tekrar deneyiniz.</div>';
    });
}

function displayCategories(categories) {
    const categoryListElement = document.getElementById('categoryList');
    categoryListElement.innerHTML = '';
    
    if (!categories || categories.length === 0) {
        categoryListElement.innerHTML = '<div class="no-categories">Henüz kategori bulunmamaktadır.</div>';
        return;
    }
    
    const parentCategories = categories.filter(category => !category.parent);
    
    parentCategories.forEach(parentCategory => {
        addCategoryToList(parentCategory, categoryListElement, true);

        const childCategories = categories.filter(category => 
            category.parent && category.parent.id === parentCategory.id
        );
        
        childCategories.forEach(childCategory => {
            addCategoryToList(childCategory, categoryListElement, false);
        });
    });
    
    //any remaining categories that might not be connected properly
    const addedCategoryIds = new Set([
        ...parentCategories.map(cat => cat.id),
        ...parentCategories.flatMap(parent => 
            categories
                .filter(cat => cat.parent && cat.parent.id === parent.id)
                .map(cat => cat.id)
        )
    ]);
    
    const remainingCategories = categories.filter(cat => !addedCategoryIds.has(cat.id));
    
    if (remainingCategories.length > 0) {
        const divider = document.createElement('div');
        divider.className = 'category-divider';
        divider.textContent = 'Diğer Kategoriler';
        categoryListElement.appendChild(divider);
        
        remainingCategories.forEach(category => {
            addCategoryToList(category, categoryListElement, !category.parent);
        });
    }
}

function addCategoryToList(category, containerElement, isParent) {
    const categoryItem = document.createElement('div');
    categoryItem.className = `category-item ${isParent ? 'parent-category' : 'child-category'}`;
    categoryItem.dataset.id = category.id;
    
    const nameElement = document.createElement('div');
    nameElement.className = 'category-name';
    nameElement.textContent = category.name;
    
    const enNameElement = document.createElement('div');
    enNameElement.className = 'category-en-name';
    enNameElement.textContent = category.enName;
    
    const parentElement = document.createElement('div');
    parentElement.className = 'category-parent';
    parentElement.textContent = category.parent ? category.parent.name : '-';
    
    const actionsElement = document.createElement('div');
    actionsElement.className = 'category-actions';
    
    const editButton = document.createElement('button');
    editButton.className = 'action-btn edit-btn';
    editButton.textContent = 'Düzenle';
    editButton.addEventListener('click', () => editCategory(category.id));
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'action-btn delete-btn';
    deleteButton.textContent = 'Sil';
    deleteButton.addEventListener('click', () => deleteCategory(category.id, category.name));
    
    actionsElement.appendChild(editButton);
    actionsElement.appendChild(deleteButton);
    
    categoryItem.appendChild(nameElement);
    categoryItem.appendChild(enNameElement);
    categoryItem.appendChild(parentElement);
    categoryItem.appendChild(actionsElement);
    
    containerElement.appendChild(categoryItem);
}

function editCategory(categoryId) {
    window.location.href = `kategori_edit.html?id=${categoryId}`;
}

function deleteCategory(categoryId, categoryName) {
    if (confirm(`"${categoryName}" kategorisini silmek istediğinize emin misiniz?`)) {
        fetch(`http://localhost:8080/api/v1/datacontrol/category/${categoryId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log("Token being sent:", token);
            if (response.status === 401 || response.status === 403) {
                console.log(response.data);
                console.log(response);
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
        .then(() => {
            fetchCategories();
        })
        .catch(error => {
            console.error('Error deleting category:', error);
            alert('Kategori silinemedi. Lütfen daha sonra tekrar deneyiniz.');
        });
    }
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
    //window.location.href = 'login.html';
}