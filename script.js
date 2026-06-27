// ============================================
// FIFA World Cup 2026 - Stream Dashboard
// Pure JavaScript with localStorage
// ============================================

// ==================== DATA ====================

// Default data (ESPN Free API data)
const DEFAULT_MATCHES = [
    {
        id: '1',
        homeTeam: 'USA',
        awayTeam: 'England',
        homeFlag: '🇺🇸',
        awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        date: '2026-06-28',
        time: '14:00',
        stadium: 'MetLife Stadium',
        group: 'Group A',
        streams: []
    },
    {
        id: '2',
        homeTeam: 'Brazil',
        awayTeam: 'Germany',
        homeFlag: '🇧🇷',
        awayFlag: '🇩🇪',
        date: '2026-06-29',
        time: '16:00',
        stadium: 'SoFi Stadium',
        group: 'Group B',
        streams: []
    },
    {
        id: '3',
        homeTeam: 'Argentina',
        awayTeam: 'France',
        homeFlag: '🇦🇷',
        awayFlag: '🇫🇷',
        date: '2026-06-30',
        time: '18:00',
        stadium: 'AT&T Stadium',
        group: 'Group C',
        streams: []
    },
    {
        id: '4',
        homeTeam: 'Spain',
        awayTeam: 'Portugal',
        homeFlag: '🇪🇸',
        awayFlag: '🇵🇹',
        date: '2026-07-01',
        time: '20:00',
        stadium: 'Hard Rock Stadium',
        group: 'Group D',
        streams: []
    },
    {
        id: '5',
        homeTeam: 'Netherlands',
        awayTeam: 'Belgium',
        homeFlag: '🇳🇱',
        awayFlag: '🇧🇪',
        date: '2026-07-02',
        time: '14:00',
        stadium: 'Mercedes-Benz Stadium',
        group: 'Group E',
        streams: []
    },
    {
        id: '6',
        homeTeam: 'Croatia',
        awayTeam: 'Denmark',
        homeFlag: '🇭🇷',
        awayFlag: '🇩🇰',
        date: '2026-07-02',
        time: '16:00',
        stadium: 'NRG Stadium',
        group: 'Group F',
        streams: []
    },
    {
        id: '7',
        homeTeam: 'Japan',
        awayTeam: 'South Korea',
        homeFlag: '🇯🇵',
        awayFlag: '🇰🇷',
        date: '2026-07-03',
        time: '18:00',
        stadium: 'Levi\'s Stadium',
        group: 'Group G',
        streams: []
    },
    {
        id: '8',
        homeTeam: 'Mexico',
        awayTeam: 'Canada',
        homeFlag: '🇲🇽',
        awayFlag: '🇨🇦',
        date: '2026-07-03',
        time: '20:00',
        stadium: 'BC Place',
        group: 'Group H',
        streams: []
    }
];

// ==================== STORAGE FUNCTIONS ====================

function getMatches() {
    const data = localStorage.getItem('worldCupMatches');
    if (data) {
        return JSON.parse(data);
    }
    // Initialize with default data
    localStorage.setItem('worldCupMatches', JSON.stringify(DEFAULT_MATCHES));
    return DEFAULT_MATCHES;
}

function saveMatches(matches) {
    localStorage.setItem('worldCupMatches', JSON.stringify(matches));
}

function getMatchById(id) {
    const matches = getMatches();
    return matches.find(m => m.id === id);
}

function updateMatch(id, updatedMatch) {
    const matches = getMatches();
    const index = matches.findIndex(m => m.id === id);
    if (index !== -1) {
        matches[index] = updatedMatch;
        saveMatches(matches);
        return true;
    }
    return false;
}

function addStreamToMatch(matchId, streamUrl) {
    const match = getMatchById(matchId);
    if (match) {
        if (!match.streams) match.streams = [];
        match.streams.push({
            id: Date.now().toString(),
            url: streamUrl,
            addedAt: new Date().toISOString()
        });
        updateMatch(matchId, match);
        return true;
    }
    return false;
}

function removeStreamFromMatch(matchId, streamId) {
    const match = getMatchById(matchId);
    if (match && match.streams) {
        match.streams = match.streams.filter(s => s.id !== streamId);
        updateMatch(matchId, match);
        return true;
    }
    return false;
}

function exportData() {
    const data = getMatches();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'worldcup_streams_backup.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                if (Array.isArray(data) && data.length > 0) {
                    saveMatches(data);
                    alert('Data imported successfully!');
                    renderAll();
                } else {
                    alert('Invalid data format!');
                }
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function resetData() {
    if (confirm('⚠️ Are you sure you want to reset all data? This cannot be undone!')) {
        if (confirm('Really? All streams will be lost!')) {
            saveMatches(DEFAULT_MATCHES);
            alert('Data has been reset to default!');
            renderAll();
        }
    }
}

// ==================== RENDER FUNCTIONS ====================

function renderStats() {
    const matches = getMatches();
    const totalGames = matches.length;
    const totalStreams = matches.reduce((acc, m) => acc + (m.streams ? m.streams.length : 0), 0);
    const activeStreams = matches.filter(m => m.streams && m.streams.length > 0).length;
    const today = new Date();
    const upcoming = matches.filter(m => new Date(m.date + 'T' + m.time) > today).length;
    
    document.getElementById('totalGames').textContent = totalGames;
    document.getElementById('totalStreams').textContent = totalStreams;
    document.getElementById('activeStreams').textContent = activeStreams;
    document.getElementById('upcomingMatches').textContent = upcoming;
}

function renderMatches() {
    const matches = getMatches();
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const groupFilter = document.getElementById('groupFilter')?.value || 'all';
    const streamFilter = document.getElementById('streamFilter')?.value || 'all';
    
    let filtered = matches;
    
    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(m => 
            m.homeTeam.toLowerCase().includes(searchTerm) ||
            m.awayTeam.toLowerCase().includes(searchTerm) ||
            m.stadium.toLowerCase().includes(searchTerm) ||
            m.group.toLowerCase().includes(searchTerm)
        );
    }
    
    // Group filter
    if (groupFilter !== 'all') {
        filtered = filtered.filter(m => m.group === groupFilter);
    }
    
    // Stream filter
    if (streamFilter === 'has') {
        filtered = filtered.filter(m => m.streams && m.streams.length > 0);
    } else if (streamFilter === 'no') {
        filtered = filtered.filter(m => !m.streams || m.streams.length === 0);
    }
    
    const grid = document.getElementById('matchesGrid');
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-search"></i>
                <h3>No matches found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(match => {
        const streamCount = match.streams ? match.streams.length : 0;
        const hasStream = streamCount > 0;
        
        return `
            <div class="match-card" onclick="openModal('${match.id}')">
                <div class="match-card-header">
                    <span class="group-badge">${match.group}</span>
                    <span style="font-size:0.85rem; opacity:0.8;">
                        <i class="fas fa-calendar"></i> ${formatDate(match.date)}
                    </span>
                </div>
                <div class="match-card-body">
                    <div class="match-teams">
                        <div class="team">
                            <span class="team-flag">${match.homeFlag || '🏠'}</span>
                            <span class="team-name">${match.homeTeam}</span>
                        </div>
                        <span class="match-vs">VS</span>
                        <div class="team">
                            <span class="team-flag">${match.awayFlag || '✈️'}</span>
                            <span class="team-name">${match.awayTeam}</span>
                        </div>
                    </div>
                    <div class="match-info">
                        <span><i class="fas fa-clock"></i> ${match.time}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${match.stadium}</span>
                    </div>
                    <div class="match-stream-status">
                        <span class="stream-badge ${hasStream ? 'has-stream' : 'no-stream'}">
                            ${hasStream ? '🎥 Stream Available' : '📺 No Stream'}
                        </span>
                        <span class="stream-count">${streamCount} link${streamCount !== 1 ? 's' : ''}</span>
                        <button class="watch-btn" onclick="event.stopPropagation(); openModal('${match.id}')">
                            ${hasStream ? 'Watch' : 'Add Stream'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAdminMatches() {
    const matches = getMatches();
    const container = document.getElementById('adminMatchesList');
    
    if (!container) return;
    
    container.innerHTML = matches.map(match => {
        const streamCount = match.streams ? match.streams.length : 0;
        
        return `
            <div class="admin-match-item">
                <div class="admin-match-info">
                    <div class="admin-match-teams">
                        ${match.homeTeam} vs ${match.awayTeam}
                    </div>
                    <div class="admin-match-meta">
                        <span><i class="fas fa-calendar"></i> ${formatDate(match.date)}</span>
                        <span><i class="fas fa-clock"></i> ${match.time}</span>
                        <span><i class="fas fa-tag"></i> ${match.group}</span>
                    </div>
                </div>
                <div class="admin-match-streams">
                    <span class="admin-stream-badge ${streamCount > 0 ? 'has' : 'none'}">
                        ${streamCount} Stream${streamCount !== 1 ? 's' : ''}
                    </span>
                    <button class="admin-edit-btn" onclick="openEditModal('${match.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== MODAL FUNCTIONS ====================

function openModal(matchId) {
    const match = getMatchById(matchId);
    if (!match) return;
    
    const modal = document.getElementById('streamModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    title.textContent = `${match.homeTeam} vs ${match.awayTeam} - Stream Links`;
    
    const streams = match.streams || [];
    
    if (streams.length === 0) {
        body.innerHTML = `
            <div style="text-align:center; padding: 30px;">
                <i class="fas fa-video-slash" style="font-size:3rem; color:#ccc;"></i>
                <h3 style="margin: 15px 0 5px;">No Streams Available</h3>
                <p style="color:#666;">Check back later or <a href="admin.html">add a stream</a></p>
            </div>
        `;
    } else {
        body.innerHTML = `
            <div class="stream-list">
                ${streams.map(stream => `
                    <div class="stream-link-item">
                        <div class="link-info">
                            <div class="link-url"><i class="fas fa-link"></i> ${stream.url}</div>
                            <div class="link-label">Added: ${new Date(stream.addedAt).toLocaleString()}</div>
                        </div>
                        <div class="link-actions">
                            <a href="${stream.url}" target="_blank" class="stream-link-btn btn-watch">
                                <i class="fas fa-play"></i> Watch
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('streamModal').classList.remove('active');
}

// ==================== ADMIN MODAL FUNCTIONS ====================

function openEditModal(matchId) {
    const match = getMatchById(matchId);
    if (!match) return;
    
    const modal = document.getElementById('editModal');
    const title = document.getElementById('editModalTitle');
    const body = document.getElementById('editModalBody');
    
    title.textContent = `Manage Streams - ${match.homeTeam} vs ${match.awayTeam}`;
    
    const streams = match.streams || [];
    
    body.innerHTML = `
        <div class="edit-form">
            <div class="form-group">
                <label>Match Details</label>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <span><strong>Group:</strong> ${match.group}</span>
                    <span><strong>Date:</strong> ${match.date}</span>
                    <span><strong>Time:</strong> ${match.time}</span>
                    <span><strong>Stadium:</strong> ${match.stadium}</span>
                </div>
            </div>
            
            <div class="form-group">
                <label>Current Streams (${streams.length})</label>
                <div class="stream-list">
                    ${streams.map(stream => `
                        <div class="stream-link-item">
                            <div class="link-info">
                                <div class="link-url">${stream.url}</div>
                                <div class="link-label">Added: ${new Date(stream.addedAt).toLocaleString()}</div>
                            </div>
                            <div class="link-actions">
                                <button onclick="removeStream('${matchId}', '${stream.id}')" class="stream-link-btn btn-remove">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                    ${streams.length === 0 ? '<p style="color:#999;">No streams added yet</p>' : ''}
                </div>
            </div>
            
            <div class="form-group">
                <label>Add New Stream</label>
                <div class="add-stream">
                    <input type="url" id="newStreamUrl" placeholder="https://dlhd.pk/watch.php?id=5006" required>
                    <button onclick="addStream('${matchId}')">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

function addStream(matchId) {
    const input = document.getElementById('newStreamUrl');
    const url = input.value.trim();
    
    if (!url) {
        alert('Please enter a valid URL');
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('Please enter a valid URL starting with http:// or https://');
        return;
    }
    
    if (addStreamToMatch(matchId, url)) {
        input.value = '';
        openEditModal(matchId); // Refresh
        renderAll();
        alert('Stream added successfully!');
    } else {
        alert('Error adding stream');
    }
}

function removeStream(matchId, streamId) {
    if (confirm('Are you sure you want to remove this stream?')) {
        if (removeStreamFromMatch(matchId, streamId)) {
            openEditModal(matchId); // Refresh
            renderAll();
            alert('Stream removed successfully!');
        } else {
            alert('Error removing stream');
        }
    }
}

// ==================== UTILITY FUNCTIONS ====================

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

function renderAll() {
    renderStats();
    renderMatches();
    renderAdminMatches();
}

// ==================== EVENT LISTENERS ====================

// Close modals on background click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('streamModal');
    const editModal = document.getElementById('editModal');
    
    if (e.target === modal) {
        closeModal();
    }
    if (e.target === editModal) {
        closeEditModal();
    }
});

// Escape key to close modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
        closeEditModal();
    }
});

// ==================== INITIALIZATION ====================

// On page load, render everything
document.addEventListener('DOMContentLoaded', function() {
    renderAll();
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', renderAll);
    }
    
    // Filter inputs
    const searchInput = document.getElementById('searchInput');
    const groupFilter = document.getElementById('groupFilter');
    const streamFilter = document.getElementById('streamFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', renderMatches);
    }
    if (groupFilter) {
        groupFilter.addEventListener('change', renderMatches);
    }
    if (streamFilter) {
        streamFilter.addEventListener('change', renderMatches);
    }
});
