import { getBooks, getChapters, getNotes, getTasks, getStreak, getFlashcards, getGoal, setGoal } from '../storage/database.js';
import { showPomodoroModal } from '../utils/helpers.js';

export function renderDashboard(container) {
    const books = getBooks();
    const chapters = getChapters();
    const notes = getNotes();
    const streak = getStreak();
    const todayTasks = getTasks(new Date().toISOString().split('T')[0]);
    const dueFlashcards = getFlashcards().filter(c => new Date(c.nextReview) <= new Date());
    const goal = getGoal();
    
    const completedChapters = chapters.filter(c => c.progress === 100).length;
    const recent = chapters.filter(c => c.lastStudied).sort((a,b)=>new Date(b.lastStudied)-new Date(a.lastStudied)).slice(0,5);
    
    let html = `
        <div class="content-header">
            <h1 class="page-title">Dashboard</h1>
            <div class="date-display">${new Date().toLocaleDateString('en-US',{weekday:'long', month:'long', day:'numeric'})}</div>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-icon"><i class="fas fa-book"></i></div><div class="stat-info"><h4>Books</h4><div class="value">${books.length}</div></div></div>
            <div class="stat-card"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><h4>Chapters Done</h4><div class="value">${completedChapters}</div></div></div>
            <div class="stat-card"><div class="stat-icon"><i class="fas fa-sticky-note"></i></div><div class="stat-info"><h4>Notes</h4><div class="value">${notes.length}</div></div></div>
            <div class="stat-card"><div class="stat-icon"><i class="fas fa-fire"></i></div><div class="stat-info"><h4>Streak</h4><div class="value">${streak.count}</div></div></div>
        </div>
        <div class="goal-card glass-card">
            <h3>Daily Study Goal</h3>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span>${goal.progress} / ${goal.daily} min</span>
                <div class="goal-progress"><div class="goal-progress-fill" style="width: ${Math.min(100, (goal.progress/goal.daily)*100)}%"></div></div>
                <input type="number" id="goalInput" class="goal-input" value="${goal.daily}" min="1" max="600">
                <button class="primary-btn" id="setGoalBtn">Set</button>
            </div>
        </div>
        <div class="dashboard-grid">
            <div class="glass-card recent-card">
                <h3>Recently Studied</h3>
                <div class="recent-list">
                    ${recent.length ? recent.map(c => {
                        const book = books.find(b => b.id === c.bookId);
                        return `<div class="recent-item"><span>${book?.name || ''} - ${c.name}</span><small>${c.lastStudied}</small></div>`;
                    }).join('') : '<p>No recent studies</p>'}
                </div>
            </div>
            <div class="glass-card progress-card">
                <h3>Weekly Progress</h3>
                <div class="chart-container"><canvas id="weeklyChart"></canvas></div>
            </div>
        </div>
        <div style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
            <button class="primary-btn" id="pomodoroBtn"><i class="fas fa-clock"></i> Pomodoro</button>
            <button class="primary-btn" id="flashcardReviewBtn"><i class="fas fa-brain"></i> Review Flashcards (${dueFlashcards.length})</button>
            <button class="primary-btn" id="backupBtn"><i class="fas fa-download"></i> Backup</button>
        </div>
    `;
    container.innerHTML = html;
    
    const ctx = document.getElementById('weeklyChart')?.getContext('2d');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
                datasets: [{
                    label: 'Study Minutes',
                    data: [30, 45, 60, 90, 120, 150, 75],
                    borderColor: '#00f0ff',
                    backgroundColor: 'rgba(0,240,255,0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } } }
            }
        });
    }
    
    document.getElementById('pomodoroBtn')?.addEventListener('click', showPomodoroModal);
    document.getElementById('flashcardReviewBtn')?.addEventListener('click', ()=>{
        import('../script.js').then(m => m.loadTab('flashcards'));
    });
    document.getElementById('backupBtn')?.addEventListener('click', ()=>{
        import('../storage/database.js').then(m => m.backupData());
    });
    document.getElementById('setGoalBtn')?.addEventListener('click', () => {
        const newGoal = parseInt(document.getElementById('goalInput').value);
        if (newGoal > 0) setGoal(newGoal);
    });
}
