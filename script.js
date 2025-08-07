// =================================================================================
// SCRIPT CONFIGURATION
// =================================================================================
// ▼▼▼ YAHAN APNA APPS SCRIPT API URL PASTE KAREIN ▼▼▼
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyk9Z6npLcjnO9otz3hfw6oPiC7VyXvTLNOXxmQwZB-IXUnbtok9HSy8VDNtgA9PJn5NQ/exec";
// ▲▲▲ YAHAN APNA APPS SCRIPT API URL PASTE KAREIN ▲▲▲
// =================================================================================


document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;

    // Check which page we are on and run the corresponding logic
    if (path.includes('login.html') || path.endsWith('/')) {
        handleLoginPage();
    } else if (path.includes('dashboard.html')) {
        handleDashboardPage();
    }
});

// =================================================================================
// LOGIN PAGE LOGIC
// =================================================================================
function handleLoginPage() {
    // If user is already logged in, redirect to dashboard
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
        return;
    }

    const form = document.getElementById('login-form');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            loginButton.disabled = true;
            loginButton.textContent = 'Logging in...';
            errorMessage.style.display = 'none';

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const authUrl = SCRIPT_URL + '?action=authenticate&username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password);

            fetch(authUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        sessionStorage.setItem('isLoggedIn', 'true');
                        window.location.href = 'dashboard.html';
                    } else {
                        errorMessage.textContent = data.message || 'Login failed.';
                        errorMessage.style.display = 'block';
                        loginButton.disabled = false;
                        loginButton.textContent = 'Login';
                    }
                })
                .catch(error => {
                    errorMessage.textContent = 'An error occurred: ' + error.message;
                    errorMessage.style.display = 'block';
                    loginButton.disabled = false;
                    loginButton.textContent = 'Login';
                });
        });
    }
}

// =================================================================================
// DASHBOARD PAGE LOGIC
// =================================================================================
function handleDashboardPage() {
    // If user is not logged in, redirect to login page
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    const preloader = document.getElementById('preloader');
    preloader.classList.add('hidden');

    // --- General Dashboard Setup ---
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    });

    // --- Page Specific Logic ---
    const params = new URLSearchParams(window.location.search);
    const currentPage = params.get('page') || 'Backoffice';

    // Highlight active link
    document.querySelectorAll('.nav-links li').forEach(li => {
        if (li.querySelector('a').href.includes('page=' + currentPage)) {
            li.classList.add('active');
        }
    });
    
    // Set page title
    document.getElementById('page-title').textContent = currentPage + ' Dashboard';

    // Load data for the current page
    switch (currentPage) {
        case 'Backoffice':
            loadBackofficePage();
            break;
        case 'Marketing':
            loadMarketingPage();
            break;
        case 'Engineers':
            loadEngineersPage();
            break;
        case 'Accounts':
            loadAccountsPage();
            break;
        case 'HR':
            loadHrPage();
            break;
    }
}

// --- Data Loading Functions for Each Page ---

function loadBackofficePage() {
    // Implement data fetching and rendering for Backoffice page
    console.log("Loading Backoffice data...");
    // Example: fetch(SCRIPT_URL + '?action=getBackofficeData').then(...)
}

function loadMarketingPage() {
    console.log("Loading Marketing data...");
    fetch(SCRIPT_URL + '?action=getMarketingData')
        .then(res => res.json())
        .then(data => {
            // Populate leaderboard, star performer etc.
            // This part needs to be built out to render the HTML from data
            console.log(data);
        })
        .catch(err => console.error("Error fetching marketing data:", err));
    
    // Map logic will also go here
}

function loadEngineersPage() {
    console.log("Loading Engineers data...");
}

function loadAccountsPage() {
    console.log("Loading Accounts data...");
}

function loadHrPage() {
    console.log("Loading HR data...");
}
