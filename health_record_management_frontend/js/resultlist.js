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
    fetchResults(token);
    
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

function fetchResults(token) {
    const resultsListElement = document.getElementById('resultsList');
    resultsListElement.innerHTML = '<div class="loading-indicator">Yükleniyor...</div>';
    
    fetch('http://localhost:8080/api/v1/datacontrol/result', {
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
    .then(results => {
        displayResults(results);
    })
    .catch(error => {
        console.error('Error fetching results:', error);
        resultsListElement.innerHTML = '<div class="error-message">Sonuçlar yüklenemedi. Lütfen daha sonra tekrar deneyiniz.</div>';
    });
}

function displayResults(results) {
    const resultsListElement = document.getElementById('resultsList');
    resultsListElement.innerHTML = '';
    
    if (!results || results.length === 0) {
        resultsListElement.innerHTML = '<div class="no-results">Henüz sonuç bulunmamaktadır.</div>';
        return;
    }
    
    // Sort results by insertedDate in descending order (newest first)
    results.sort((a, b) => {
        return new Date(b.insertedDate) - new Date(a.insertedDate);
    });
    
    results.forEach(result => {
        addResultToList(result, resultsListElement);
    });
}

function addResultToList(result, containerElement) {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    resultItem.dataset.id = result.id;
    
    // Create patient info section
    const patientElement = document.createElement('div');
    patientElement.className = 'result-patient';
    patientElement.textContent = result.patient ? `${result.patient.firstName} ${result.patient.lastName}` : 'Belirtilmemiş';
    
    // Create category info section
    const categoryElement = document.createElement('div');
    categoryElement.className = 'result-category';
    categoryElement.textContent = result.category ? result.category.name : 'Belirtilmemiş';
    
    // Create clinic/branch info section
    const clinicElement = document.createElement('div');
    clinicElement.className = 'result-clinic';
    clinicElement.textContent = result.klinik || 'Belirtilmemiş';
    
    // Create date info section
    const dateElement = document.createElement('div');
    dateElement.className = 'result-date';
    dateElement.textContent = formatDate(result.insertedDate);
    
    // Create report info section (truncated if too long)
    const reportElement = document.createElement('div');
    reportElement.className = 'result-report';
    reportElement.textContent = result.report && result.report.length > 100 ? 
        result.report.substring(0, 100) + '...' : result.report || 'Belirtilmemiş';
    
    // Create image indicator
    const imageIndicator = document.createElement('div');
    imageIndicator.className = 'result-image-indicator';
    imageIndicator.textContent = result.image ? 'Görüntü mevcut' : 'Görüntü yok';
    
    // Create actions section
    const actionsElement = document.createElement('div');
    actionsElement.className = 'result-actions';
    
    const viewButton = document.createElement('button');
    viewButton.className = 'action-btn view-btn';
    viewButton.textContent = 'Görüntüle';
    viewButton.addEventListener('click', () => viewResult(result.id));
    
    const editButton = document.createElement('button');
    editButton.className = 'action-btn edit-btn';
    editButton.textContent = 'Düzenle';
    editButton.addEventListener('click', () => editResult(result.id));
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'action-btn delete-btn';
    deleteButton.textContent = 'Sil';
    deleteButton.addEventListener('click', () => deleteResult(result.id, result.patient?.firstName));
    
    actionsElement.appendChild(viewButton);
    actionsElement.appendChild(editButton);
    actionsElement.appendChild(deleteButton);
    
    // Append all sections to the result item
    resultItem.appendChild(patientElement);
    resultItem.appendChild(categoryElement);
    resultItem.appendChild(clinicElement);
    resultItem.appendChild(dateElement);
    resultItem.appendChild(reportElement);
    resultItem.appendChild(imageIndicator);
    resultItem.appendChild(actionsElement);
    
    containerElement.appendChild(resultItem);
}

function formatDate(dateString) {
    if (!dateString) return 'Belirtilmemiş';
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Geçersiz tarih' : 
        `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function viewResult(resultId) {
    window.location.href = `sonuc_detay.html?id=${resultId}`;
}

function editResult(resultId) {
    window.location.href = `sonuc_duzenle.html?id=${resultId}`;
}

function deleteResult(resultId, patientName) {
    if (confirm(`"${patientName || 'Seçili'}" hastasına ait sonucu silmek istediğinize emin misiniz?`)) {
        const token = localStorage.getItem('jwt_token');
        
        fetch(`http://localhost:8080/api/v1/datacontrol/result/${resultId}`, {
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
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(() => {
            fetchResults(token);
        })
        .catch(error => {
            console.error('Error deleting result:', error);
            alert('Sonuç silinemedi. Lütfen daha sonra tekrar deneyiniz.');
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
    window.location.href = 'login.html';
}