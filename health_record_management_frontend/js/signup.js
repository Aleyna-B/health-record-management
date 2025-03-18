document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('signupForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;
        const surname = document.getElementById('surname').value;
        
        const registerData = {
            name:name,
            surname:surname,
            email: email,  
            password: password
        };
        
        fetch('http://localhost:8080/api/v1/auth/signup', {  
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Kayıt başarısız.');
            }
            return response.json();
        })
        .then(data => {
            window.location.href = 'login.html';
        })
        .catch(error => {
            document.getElementById('errorMessage').textContent = 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
            console.error('Error:', error);
        });
    });
});