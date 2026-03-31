/* ============================================================
   AgroEase – Dashboard Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Universal Loader
    const loader = document.getElementById('universal-loader');
    if(loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('fade-out');
                setTimeout(() => loader.style.display = 'none', 600);
            }, 1200);
        });
    }

    // 2. Sidebar Navigation & Panel Switching
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-panel]');
    const panels = document.querySelectorAll('.panel');
    const topbarTitle = document.getElementById('topbar-title');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetPanelId = link.getAttribute('data-panel');
            const panelName = link.textContent.trim();

            // Update Sidebar UI
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update Topbar
            if(topbarTitle) {
                topbarTitle.style.opacity = '0';
                setTimeout(() => {
                    topbarTitle.textContent = panelName;
                    topbarTitle.style.opacity = '1';
                }, 200);
            }

            // Switch Panels
            panels.forEach(p => {
                p.classList.remove('active');
                if(p.id === `panel-${targetPanelId}`) {
                    p.classList.add('active');
                }
            });
        });
    });

    // 3. Initialize Overview Chart
    const ctx = document.getElementById('overview-chart')?.getContext('2d');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Yield Prediction (Tons)',
                    data: [12, 19, 15, 22, 18, 25],
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#16a34a'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // 4. Logout Logic
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Add a wipe transition
            const wipe = document.createElement('div');
            wipe.className = 'page-wipe-active';
            document.body.appendChild(wipe);
            setTimeout(() => window.location.href = 'index.html', 800);
        });
    }

    // 5. Stat Counter Animation (Simple)
    const animateValue = (id, start, end, duration) => {
        const obj = document.getElementById(id);
        if(!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    // Trigger counters on load
    setTimeout(() => {
        animateValue('score-number', 0, 87, 2000);
    }, 1500);
});
