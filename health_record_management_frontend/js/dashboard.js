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

function handleLogout() {
    localStorage.removeItem('jwt_token');
    window.location.href = 'login.html';
}

function handleUnauthorized() {
    localStorage.removeItem('jwt_token');
    window.location.href = 'login.html';
}

// Add Authorization header to all fetch requests
// This is an alternative to manually adding headers to each fetch call
(function() {
    const originalFetch = window.fetch;
    window.fetch = function() {
        let [resource, config] = arguments;
        const token = localStorage.getItem('jwt_token');
        
        // If token exists and config doesn't already have Authorization header
        if (token && (!config || !config.headers || !config.headers.Authorization)) {
            config = config || {};
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Call the original fetch with the updated config
        return originalFetch(resource, config)
            .then(response => {
                if (response.status === 401 || response.status === 403) {
                    handleUnauthorized();
                }
                return response;
            });
    };
})();

function setupTokenRefresh() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;
    
    const decodedToken = parseJwt(token);
    if (!decodedToken || !decodedToken.exp) return;
    
    const expirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    const refreshTime = Math.min(timeUntilExpiration * 0.8, timeUntilExpiration - (10 * 60 * 1000));
    
    if (refreshTime > 0) {
        setTimeout(() => {
            if (localStorage.getItem('jwt_token')) {
                window.location.reload();
            }
        }, refreshTime);
    } else {
        handleUnauthorized();
    }
}

document.addEventListener('DOMContentLoaded', setupTokenRefresh);