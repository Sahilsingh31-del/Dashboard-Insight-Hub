// =================================================================================
// SCRIPT CONFIGURATION
// =================================================================================
// ▼▼▼ YAHAN APNA NAYA APPS SCRIPT API URL PASTE KAREIN ▼▼▼
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbylRPanAgVT5gSN4ylewkdACSyn1yRtsEF30wDn2B0J4oFWAgb-xTcESWIUjH2X7JSROQ/exec";
// ▲▲▲ YAHAN APNA NAYA APPS SCRIPT API URL PASTE KAREIN ▲▲▲
// =================================================================================


document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const pageName = path.split("/").pop();

    if (pageName === 'index.html' || pageName === '' || !pageName.includes('.html')) {
        handleLoginPage();
    } else if (pageName === 'dashboard.html') {
        handleDashboardPage();
    }
});

// =================================================================================
// LOGIN PAGE LOGIC
// =================================================================================
function handleLoginPage() {
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
        return;
    }

    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const loginButton = document.getElementById('login-button');
            const errorMessage = document.getElementById('error-message');
            loginButton.disabled = true;
            loginButton.textContent = 'Logging in...';
            errorMessage.style.display = 'none';

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const authUrl = `${SCRIPT_URL}?action=authenticate&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

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
                    errorMessage.textContent = 'An error occurred. Please check the console.';
                    console.error('Login Error:', error);
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
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const preloader = document.getElementById('preloader');
    preloader.classList.remove('hidden');

    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    });

    const params = new URLSearchParams(window.location.search);
    const currentPage = params.get('page') || 'Backoffice';

    document.querySelectorAll('.nav-links li a').forEach(a => {
        if (a.href.includes('page=' + currentPage)) {
            a.parentElement.classList.add('active');
        }
    });
    
    document.getElementById('page-title').textContent = `${currentPage} Dashboard`;

    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = '<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>';

    switch (currentPage) {
        case 'Backoffice':
            loadBackofficePage(pageContent);
            break;
        case 'Marketing':
            loadMarketingPage(pageContent);
            break;
        case 'Engineers':
            loadEngineersPage(pageContent);
            break;
        case 'Accounts':
            loadAccountsPage(pageContent);
            break;
        case 'HR':
            loadHrPage(pageContent);
            break;
    }
    preloader.classList.add('hidden');
}

// --- RENDER FUNCTIONS FOR EACH PAGE ---

function loadBackofficePage(container) {
    fetch(`${SCRIPT_URL}?action=getBackofficeData`)
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            let html = `
                <div class="card" style="margin-bottom: 24px;">
                    <h3 style="margin-bottom: 16px; font-weight: 600;">Today's Work Breakdown</h3>
                    <div class="chart-container"><canvas id="summary-chart"></canvas></div>
                </div>
                <div id="backoffice-dashboard" class="grid-container-large">`;

            for (const name in data.performance) {
                const emp = data.performance[name];
                const photoUrl = emp.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0e7ff&color=4f46e5`;
                const workBreakdownHtml = Object.keys(emp.today.workTypes).map(type => `<span><b>${emp.today.workTypes[type]}</b> ${type}</span>`).join('') || '<span>No files today</span>';
                
                html += `
                    <div class="card perf-card">
                        <div class="perf-header">
                            <div class="employee-photo-wrapper">
                                <img class="employee-photo" src="${photoUrl}" alt="${name}">
                                <span class="status-dot status-dot-${emp.status || 'absent'}"></span>
                            </div>
                            <h4>${name}</h4>
                            <div class="total-files"><div class="value">${emp.today.total}</div><div class="label">Today</div></div>
                        </div>
                        <div class="perf-work-breakdown">${workBreakdownHtml}</div>
                    </div>`;
            }
            html += `</div>`;
            container.innerHTML = html;

            const ctx = document.getElementById('summary-chart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(data.summary.workTypes),
                    datasets: [{
                        data: Object.values(data.summary.workTypes),
                        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'],
                        borderColor: '#ffffff',
                        borderWidth: 4,
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });
        })
        .catch(err => {
            container.innerHTML = `<div class="card"><h3>Error Loading Data</h3><p>${err.message}</p><p>Please check the API URL in script.js and ensure the Apps Script is deployed correctly with access for "Anyone".</p></div>`;
            console.error("Backoffice Error:", err);
        });
}

function loadMarketingPage(container) {
    fetch(`${SCRIPT_URL}?action=getMarketingData`)
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            let leaderboardHtml = '';
            data.leaderboard.forEach((p, index) => {
                leaderboardHtml += `
                    <tr>
                        <td><b>#${index + 1}</b></td>
                        <td><div class="employee-cell">
                            <div class="employee-photo-wrapper">
                                <img class="employee-photo" src="${p.photo || 'https://ui-avatars.com/api/?name=' + p.name.replace(/ /g, '+')}" alt="${p.name}">
                                <span class="status-dot status-dot-${p.status}"></span>
                            </div>
                            <span>${p.name}</span>
                        </div></td>
                        <td>${p.cases}</td>
                    </tr>`;
            });

            let peopleFilterHtml = '';
            data.peopleList.forEach(person => {
                peopleFilterHtml += `<option value="${person}">${person}</option>`;
            });

            const html = `
                <div id="marketing-dashboard" class="marketing-grid">
                    <div class="card">
                        <div class="filter-bar" style="background:none; box-shadow:none; padding: 0 0 16px 0;">
                            <label for="person-filter">Person:</label>
                            <select id="person-filter">
                                <option value="All">All People</option>
                                ${peopleFilterHtml}
                            </select>
                            <label for="period-filter">Period:</label>
                            <select id="period-filter">
                                <option value="today" selected>Today's Visits</option>
                                <option value="last30days">Last 30 Days</option>
                            </select>
                        </div>
                        <div id="map-container">
                            <div id="map"></div>
                            <div class="map-loader"><div class="spinner"></div></div>
                        </div>
                    </div>
                    <div class="marketing-sidebar">
                        <div class="card">
                            <div class="card-title"><i class="material-icons-outlined" style="color: #f59e0b; background-color: #fefce8;">star_border</i><h3>Star Performer (Monthly)</h3></div>
                            <div class="employee-cell" style="margin-top: 16px;">
                                <div class="employee-photo-wrapper">
                                    <img class="employee-photo" src="${data.star.photo || 'https://ui-avatars.com/api/?name=' + data.star.name.replace(/ /g, '+')}" alt="${data.star.name}">
                                    <span class="status-dot status-dot-${data.star.status}"></span>
                                </div>
                                <div>
                                    <p class="card-value" style="font-size: 1.5rem; line-height: 1;">${data.star.name}</p>
                                    <p class="card-subtext" style="font-size: 1rem; margin-top: 4px;">${data.star.cases} Cases Received</p>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <h3>Leaderboard (Cases Received)</h3>
                            <div class="table-container">
                                <table class="styled-table">
                                    <thead><tr><th>Rank</th><th>Naam</th><th>Cases</th></tr></thead>
                                    <tbody>${leaderboardHtml}</tbody>
                                </table>
                            </div>
                        </div>
                        <div class="card">
                            <h3>Today's Visit Log</h3>
                            <div class="table-container">
                                <table class="styled-table">
                                    <thead><tr><th>Time</th><th>Name</th><th>Bank</th></tr></thead>
                                    <tbody id="visit-log-body"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>`;
            container.innerHTML = html;
            initializeMarketingMap();
        })
        .catch(err => {
            container.innerHTML = `<div class="card"><h3>Error Loading Data</h3><p>${err.message}</p></div>`;
            console.error("Marketing Error:", err);
        });
}

function initializeMarketingMap() {
    const map = L.map('map').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    const personFilter = document.getElementById('person-filter');
    const periodFilter = document.getElementById('period-filter');

    function fetchAndDisplayVisits() {
        const mapLoader = document.querySelector('.map-loader');
        const visitLogBody = document.getElementById('visit-log-body');
        mapLoader.style.display = 'flex';
        markersLayer.clearLayers();
        visitLogBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Loading...</td></tr>';
        
        const filters = { person: personFilter.value, period: periodFilter.value };
        const url = `${SCRIPT_URL}?action=getMarketingVisits&filters=${encodeURIComponent(JSON.stringify(filters))}`;

        fetch(url)
            .then(res => res.json())
            .then(visits => {
                if (visits.error) throw new Error(visits.error);
                if (visits && visits.length > 0) {
                    const bounds = [];
                    let visitLogHtml = '';
                    const personColors = {};
                    const colorPalette = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6'];
                    let colorIndex = 0;

                    const getColorForPerson = (name) => {
                        if (!personColors[name]) {
                            personColors[name] = colorPalette[colorIndex % colorPalette.length];
                            colorIndex++;
                        }
                        return personColors[name];
                    };
                    
                    visits.forEach(visit => {
                        const color = getColorForPerson(visit.name);
                        const iconHtml = `<div style="background-color:${color}; width:24px; height:24px; border-radius:50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`;
                        const customIcon = L.divIcon({ html: iconHtml, className: 'custom-marker-icon', iconSize: [24, 24], iconAnchor: [12, 12] });
                        const popupContent = `<b>${visit.name}</b>${visit.bank}<br>${visit.branch || ''}<br><small>${timeAgo(visit.timestamp)}</small>`;
                        const marker = L.marker([visit.lat, visit.lng], { icon: customIcon }).bindPopup(popupContent);
                        markersLayer.addLayer(marker);
                        bounds.push([visit.lat, visit.lng]);
                        if (filters.period === 'today') {
                            visitLogHtml += `<tr><td>${formatTime(visit.timestamp)}</td><td>${visit.name}</td><td>${visit.bank}</td></tr>`;
                        }
                    });
                    
                    if (bounds.length > 0) map.fitBounds(bounds, { padding: [50, 50] });
                    visitLogBody.innerHTML = visitLogHtml || '<tr><td colspan="3" style="text-align:center;">No visits today.</td></tr>';
                } else {
                    visitLogBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No visits found.</td></tr>';
                }
                mapLoader.style.display = 'none';
            })
            .catch(err => {
                visitLogBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Error: ${err.message}</td></tr>`;
                mapLoader.style.display = 'none';
                 console.error("Map Error:", err);
            });
    }

    personFilter.addEventListener('change', fetchAndDisplayVisits);
    periodFilter.addEventListener('change', fetchAndDisplayVisits);
    fetchAndDisplayVisits();
}


function loadEngineersPage(container) {
    fetch(`${SCRIPT_URL}?action=getEngineersData`)
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            let engineersHtml = '';
            data.engineers.forEach(eng => {
                engineersHtml += `
                    <tr>
                        <td><div class="employee-cell">
                            <div class="employee-photo-wrapper">
                                <img class="employee-photo" src="${eng.photo || 'https://ui-avatars.com/api/?name=' + eng.name.replace(/ /g, '+')}" alt="${eng.name}">
                                <span class="status-dot status-dot-${eng.status}"></span>
                            </div>
                            <span>${eng.name}</span>
                        </div></td>
                        <td>${eng.todayVisits}</td>
                        <td>${eng.monthlyVisits}</td>
                        <td>${eng.avgReview.toFixed(1)}</td>
                    </tr>`;
            });

            container.innerHTML = `
                <div id="engineers-dashboard">
                    <div class="card">
                        <div class="card-title"><i class="material-icons-outlined">groups</i><h3>Engineers Performance</h3></div>
                        <div class="table-container">
                            <table class="styled-table">
                                <thead><tr><th>Engineer</th><th>Today's Visits</th><th>Monthly Visits</th><th>Avg. Review</th></tr></thead>
                                <tbody>${engineersHtml}</tbody>
                            </table>
                        </div>
                    </div>
                </div>`;
        })
        .catch(err => {
            container.innerHTML = `<div class="card"><h3>Error Loading Data</h3><p>${err.message}</p></div>`;
            console.error("Engineers Error:", err);
        });
}

function loadAccountsPage(container) {
     fetch(`${SCRIPT_URL}?action=getAccountsData`)
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            const summary = data.summary;
            const lists = data.lists;

            const createListHtml = (list) => {
                return list.map(item => `
                    <tr>
                        <td>
                            <div class="employee-cell">
                                <div class="employee-photo-wrapper">
                                    <img class="employee-photo" src="${item.photo || 'https://ui-avatars.com/api/?name=' + item.name.replace(/ /g, '+')}" alt="${item.name}">
                                    <span class="status-dot status-dot-${item.status}"></span>
                                </div>
                                <span>${item.name}</span>
                            </div>
                        </td>
                        <td style="text-align:right;">₹${item.amount.toLocaleString('en-IN')}</td>
                    </tr>
                `).join('');
            };

            container.innerHTML = `
                <div id="accounts-dashboard">
                    <div class="grid-container accounts-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                        <div class="card"><div class="card-title"><i class="material-icons-outlined" style="color: #ef4444; background-color: #fee2e2;">arrow_upward</i><h3>Total Debit</h3></div><p class="card-value" style="color: #b91c1c;">₹${summary.totalDebit.toLocaleString('en-IN')}</p></div>
                        <div class="card"><div class="card-title"><i class="material-icons-outlined" style="color: #16a34a; background-color: #dcfce7;">arrow_downward</i><h3>Total Credit</h3></div><p class="card-value" style="color: #15803d;">₹${summary.totalCredit.toLocaleString('en-IN')}</p></div>
                        <div class="card"><div class="card-title"><i class="material-icons-outlined" style="color: #f97316; background-color: #ffedd5;">hourglass_empty</i><h3>Total Pending</h3></div><p class="card-value" style="color: #c2410c;">₹${summary.totalPending.toLocaleString('en-IN')}</p></div>
                        <div class="card">
                            <div class="card-title"><i class="material-icons-outlined" style="color: ${summary.netProfitLoss >= 0 ? '#16a34a' : '#ef4444'}; background-color: ${summary.netProfitLoss >= 0 ? '#dcfce7' : '#fee2e2'};">trending_${summary.netProfitLoss >= 0 ? 'up' : 'down'}</i><h3>Net Profit/Loss</h3></div>
                            <p class="card-value" style="color: ${summary.netProfitLoss >= 0 ? '#15803d' : '#b91c1c'};">₹${summary.netProfitLoss.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                    <div id="accounts-default-view" style="margin-top: 24px;">
                        <div class="grid-container" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
                            <div class="card"><h3 style="margin-bottom: 1rem;">Debit List</h3><div class="table-container"><table class="styled-table"><tbody>${createListHtml(lists.debitList)}</tbody></table></div></div>
                            <div class="card"><h3 style="margin-bottom: 1rem;">Credit List</h3><div class="table-container"><table class="styled-table"><tbody>${createListHtml(lists.creditList)}</tbody></table></div></div>
                            <div class="card"><h3 style="margin-bottom: 1rem;">Pending List</h3><div class="table-container"><table class="styled-table"><tbody>${createListHtml(lists.pendingList)}</tbody></table></div></div>
                        </div>
                    </div>
                </div>`;
        })
        .catch(err => {
            container.innerHTML = `<div class="card"><h3>Error Loading Data</h3><p>${err.message}</p></div>`;
            console.error("Accounts Error:", err);
        });
}

function loadHrPage(container) {
     fetch(`${SCRIPT_URL}?action=getHrData`)
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            const summary = data.summary;
            let byDeptHtml = '';
            for (let dept in data.byDept) {
                const deptData = data.byDept[dept];
                const employeesHtml = deptData.employees.map(emp => `
                    <li>
                        <div class="employee-photo-wrapper">
                            <img class="employee-photo" src="${emp.photo || 'https://ui-avatars.com/api/?name=' + emp.name.replace(/ /g, '+')}" alt="${emp.name}">
                            <span class="status-dot status-dot-${emp.status}"></span>
                        </div>
                        <span class="employee-name">${emp.name}</span>
                        <span class="employee-status status-${emp.status}">${emp.status}</span>
                    </li>
                `).join('');

                byDeptHtml += `
                    <div class="dept-card">
                        <h4>${dept} (${deptData.present}/${deptData.employees.length} Present)</h4>
                        <ul class="employee-list">${employeesHtml}</ul>
                    </div>`;
            }

            container.innerHTML = `
                <div id="hr-dashboard">
                    <div class="grid-container">
                        <div class="card"><div class="card-title"><i class="material-icons-outlined" style="color: #16a34a; background-color: #dcfce7;">check_circle</i><h3>Present</h3></div><p class="card-value">${summary.present}</p><p class="card-subtext">out of ${summary.total} employees</p></div>
                        <div class="card"><div class="card-title"><i class="material-icons-outlined" style="color: #ef4444; background-color: #fee2e2;">cancel</i><h3>Absent</h3></div><p class="card-value">${summary.absent}</p><p class="card-subtext">out of ${summary.total} employees</p></div>
                        <div class="card"><div class="card-title"><i class="material-icons-outlined" style="color: #2563eb; background-color: #dbeafe;">flight_takeoff</i><h3>On Leave</h3></div><p class="card-value">${summary.leave}</p><p class="card-subtext">out of ${summary.total} employees</p></div>
                    </div>
                    <div class="card" style="margin-top:24px;">
                        <div class="card-header"><div class="card-title"><i class="material-icons-outlined">apartment</i><h3>Department-wise Attendance</h3></div></div>
                        <div class="grid-container-large">${byDeptHtml}</div>
                    </div>
                </div>`;
        })
        .catch(err => {
            container.innerHTML = `<div class="card"><h3>Error Loading Data</h3><p>${err.message}</p></div>`;
            console.error("HR Error:", err);
        });
}

// --- UTILITY FUNCTIONS ---
function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function timeAgo(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.round(hours / 24);
    return `${days} day(s) ago`;
}
