/* ============================================================
   AgroEase – Authentication & Auth UI Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Universal Loader
    const loader = document.getElementById('universal-loader');
    if(loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('fade-out');
                setTimeout(() => loader.style.display = 'none', 600);
            }, 1000);
        });
    }

    // 2. Sliding Panel Toggle
    const authContainer = document.getElementById('auth-container');
    const signUpBtn = document.getElementById('signUp');
    const signInBtn = document.getElementById('signIn');

    if(signUpBtn && signInBtn) {
        signUpBtn.addEventListener('click', () => {
            authContainer.classList.add('right-panel-active');
        });
        signInBtn.addEventListener('click', () => {
            authContainer.classList.remove('right-panel-active');
        });
    }

    // 3. Form Validation Helpers
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
        });
    });

    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real app, this would handle API calls
            // For now, we redirect to dashboard after a brief delay
            const btn = form.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Processing...';
            btn.disabled = true;

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1200);
        });
    });
});
