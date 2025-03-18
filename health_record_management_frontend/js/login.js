document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const loginData = {
            email: email,  
            password: password
        };
        
        fetch('http://localhost:8080/api/v1/auth/signin', {  
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Giriş başarısız.');
            }
            console.log(response)
            return response.json();
        })
        .then(data => {
            localStorage.setItem('jwt_token', data.token);
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            document.getElementById('errorMessage').textContent = 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
            console.error('Error:', error);
        });
    });
});