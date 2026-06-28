// ============================================
// LIVE STREAM HUB - Complete JavaScript
// ESPN API Integration + All Leagues
// ============================================

// ==================== CONFIGURATION ====================

const ESPN_CONFIG = {
    // ESPN API endpoints (undocumented but working)
    BASE_URL: 'https://site.api.espn.com/apis/site/v2/sports/soccer',
    
    LEAGUES: {
        worldcup: {
            id: 'fifa.world',
            name: 'FIFA World Cup',
            icon: '🏆',
            espnId: 'fifa.world'
        },
        premier: {
            id: 'eng.1',
            name: 'Premier League',
            icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
            espnId: 'eng.1'
        },
        laliga: {
            id: 'esp.1',
            name: 'La Liga',
            icon: '🇪🇸',
            espnId: 'esp.1'
        },
        seriea: {
            id: 'ita.1',
            name: 'Serie A',
            icon: '🇮🇹',
            espnId: 'ita.1'
        },
        bundesliga: {
            id: 'ger.1',
            name: 'Bundesliga',
            icon: '🇩🇪',
            espnId: 'ger.1'
        },
        ligue1: {
            id: 'fra.1',
            name: 'Ligue 1',
            icon: '🇫🇷',
            espnId: 'fra.1'
        },
        champions: {
            id: 'uefa.champions',
            name: 'UEFA Champions League',
            icon: '🌟',
            espnId: 'uefa.champions'
        },
        europa: {
            id: 'uefa.europa',
            name: 'UEFA Europa League',
            icon: '🏅',
            espnId: 'uefa.europa'
        }
    }
};

// ==================== DATA STORAGE ====================

function getMatches() {
    const data = localStorage.getItem('allMatches');
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    }
    return [];
}

function saveMatches(matches) {
    localStorage.setItem('allMatches', JSON.stringify(matches));
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

function addStreamToMatch(matchId, streamUrl, quality = 'HD') {
    const match = getMatchById(matchId);
    if (match) {
        if (!match.streams) match.streams = [];
        match.streams.push({
            id: Date.now().toString(),
            url: streamUrl,
            quality: quality,
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

// ==================== ESPN API FETCHING ====================

async function fetchLeagueMatches(leagueKey) {
    const league = ESPN_CONFIG.LEAGUES[leagueKey];
    if (!league) return [];
    
    try {
        // ESPN API endpoint for league scores
        const url = `${ESPN_CONFIG.BASE_URL}/${league.espnId}/scoreboard`;
        const response = await fetch(url);
        
        if (!response.ok) {
            console.warn(`Failed to fetch ${league.name}: ${response.status}`);
            return [];
        }
        
        const data = await response.json();
        const events = data.events || [];
        
        const matches = events.map(event => {
            const homeTeam = event.competitions[0].competitors.find(c => c.homeAway === 'home');
            const awayTeam = event.competitions[0].competitors.find(c => c.homeAway === 'away');
            const status = event.status.type.description;
            
            return {
                id: event.id,
                league: leagueKey,
                leagueName: league.name,
                homeTeam: homeTeam?.team.displayName || 'Unknown',
                awayTeam: awayTeam?.team.displayName || 'Unknown',
                homeFlag: getTeamFlag(homeTeam?.team.displayName || ''),
                awayFlag: getTeamFlag(awayTeam?.team.displayName || ''),
                homeScore: homeTeam?.score || '0',
                awayScore: awayTeam?.score || '0',
                status: status,
                isLive: status.toLowerCase().includes('live'),
                isFinished: status.toLowerCase().includes('final'),
                date: event.date,
                venue: event.competitions[0].venue?.fullName || 'TBD',
                streams: [],
                lastUpdated: new Date().toISOString()
            };
        });
        
        return matches;
    } catch (error) {
        console.error(`Error fetching ${league.name}:`, error);
        return [];
    }
}

function getTeamFlag(teamName) {
    const flagMap = {
        'USA': '🇺🇸', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Brazil': '🇧🇷', 'Germany': '🇩🇪',
        'Argentina': '🇦🇷', 'France': '🇫🇷', 'Spain': '🇪🇸', 'Portugal': '🇵🇹',
        'Netherlands': '🇳🇱', 'Belgium': '🇧🇪', 'Croatia': '🇭🇷', 'Denmark': '🇩🇰',
        'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Mexico': '🇲🇽', 'Canada': '🇨🇦',
        'Italy': '🇮🇹', 'Uruguay': '🇺🇾', 'Colombia': '🇨🇴', 'Chile': '🇨🇱',
        'Nigeria': '🇳🇬', 'Senegal': '🇸🇳', 'Ghana': '🇬🇭', 'Cameroon': '🇨🇲',
        'Australia': '🇦🇺', 'New Zealand': '🇳🇿', 'Saudi Arabia': '🇸🇦', 'Iran': '🇮🇷',
        'Manchester City': '🏙️', 'Liverpool': '🔴', 'Chelsea': '🔵', 'Arsenal': '🔴',
        'Real Madrid': '👑', 'Barcelona': '🔴🔵', 'Atletico Madrid': '🔴⚪',
        'Bayern Munich': '🔴', 'Dortmund': '🟡⚫', 'PSG': '🔴🔵',
        'Juventus': '⚫⚪', 'AC Milan': '🔴⚫', 'Inter Milan': '🔵⚫'
    };
    return flagMap[teamName] || '⚽';
}

// ==================== SYNC ALL LEAGUES ====================

async function syncAllLeagues() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    
    const allMatches = [];
    const leagueKeys = Object.keys(ESPN_CONFIG.LEAGUES);
    
    for (const leagueKey of leagueKeys) {
        try {
            const matches = await fetchLeagueMatches(leagueKey);
            // Merge with existing streams
            const existing = getMatches();
            const existingMap = {};
            existing.forEach(m => {
                if (m.league === leagueKey) {
                    existingMap[m.id] = m.streams || [];
                }
            });
            
            matches.forEach(m => {
                if (existingMap[m.id]) {
                    m.streams = existingMap[m.id];
                }
            });
            
            allMatches.push(...matches);
            console.log(`✅ Fetched ${matches.length} matches for ${leagueKey}`);
        } catch (e) {
            console.error(`❌ Failed for ${leagueKey}:`, e);
        }
    }
    
    // Use fallback data if no matches fetched
    if (allMatches.length === 0) {
        console.warn('No matches fetched, using fallback data');
        allMatches.push(...getFallbackData());
    }
    
    saveMatches(allMatches);
    
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    
    // Refresh UI
    renderAll();
    alert(`✅ Synced ${allMatches.length} matches across ${leagueKeys.length} leagues!`);
}

function getFallbackData() {
    // Fallback data if API fails
    const fallback = [];
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    const leagues = ['worldcup', 'premier', 'laliga', 'champions'];
    const teams = {
        worldcup: [['USA', 'England'], ['Brazil', 'Germany'], ['Argentina', 'France']],
        premier: [['Manchester City', 'Liverpool'], ['Arsenal', 'Chelsea']],
        laliga: [['Real Madrid', 'Barcelona'], ['Atletico Madrid', 'Sevilla']],
        champions: [['Bayern Munich', 'PSG'], ['Real Madrid', 'Manchester City']]
    };
    
    leagues.forEach(league => {
        const leagueMatches = teams[league] || [];
        leagueMatches.forEach((t, i) => {
            const date = i === 0 ? today : tomorrow;
            fallback.push({
                id: `${league}_${i}`,
                league: league,
                leagueName: ESPN_CONFIG.LEAGUES[league].name,
                homeTeam: t[0],
                awayTeam: t[1],
                homeFlag: getTeamFlag(t[0]),
                awayFlag: getTeamFlag(t[1]),
                homeScore: '0',
                awayScore: '0',
                status: 'Scheduled',
                isLive: false,
                isFinished: false,
                date: `${date}T${14 + i * 2}:00:00Z`,
                venue: 'TBD',
                streams: [],
                lastUpdated: new Date().toISOString()
            });
        });
    });
    
    return fallback;
}

// ==================== RENDER FUNCTIONS ====================

let currentLeague = 'worldcup';

function renderStats() {
    const matches = getMatches();
    const totalMatches = matches.length;
    const totalStreams = matches.reduce((acc, m) => acc + (m.streams ? m.streams.length : 0), 0);
    const liveMatches = matches.filter(m => m.isLive).length;
    const now = new Date();
    const upcoming = matches.filter(m => {
        if (m.isLive || m.isFinished) return false;
        try {
            const matchDate = new Date(m.date);
            return matchDate > now;
        } catch (e) { return false; }
    }).length;
    
    document.getElementById('totalMatches').textContent = totalMatches;
    document.getElementById('totalStreams').textContent = totalStreams;
    document.getElementById('liveMatches').textContent = liveMatches;
    document.getElementById('upcomingMatches').textContent = upcoming;
    
    // Admin stats
    if (document.getElementById('adminTotalMatches')) {
        document.getElementById('adminTotalMatches').textContent = totalMatches;
        document.getElementById('adminTotalStreams').textContent = totalStreams;
        const leagues = new Set(matches.map(m => m.league));
        document.getElementById('adminLeagues').textContent = leagues.size;
    }
}

function renderMatches() {
    const matches = getMatches();
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const dateFilter = document.getElementById('dateFilter')?.value || 'all';
    const streamFilter = document.getElementById('streamFilter')?.value || 'all';
    
    let filtered = matches.filter(m => m.league === currentLeague);
    
    // Search
    if (searchTerm) {
        filtered = filtered.filter(m => 
            m.homeTeam.toLowerCase().includes(searchTerm) ||
            m.awayTeam.toLowerCase().includes(searchTerm) ||
            m.venue.toLowerCase().includes(searchTerm) ||
            m.leagueName.toLowerCase().includes(searchTerm)
        );
    }
    
    // Date filter
    if (dateFilter !== 'all') {
        const now = new Date();
        filtered = filtered.filter(m => {
            try {
                const matchDate = new Date(m.date);
                if (dateFilter === 'today') {
                    return matchDate.toDateString() === now.toDateString();
                }
                if (dateFilter === 'tomorrow') {
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return matchDate.toDateString() === tomorrow.toDateString();
                }
                if (dateFilter === 'week') {
                    const weekLater = new Date(now);
                    weekLater.setDate(weekLater.getDate() + 7);
                    return matchDate >= now && matchDate <= weekLater;
                }
                return true;
            } catch (e) { return false; }
        });
    }
    
    // Stream filter
    if (streamFilter === 'has') {
        filtered = filtered.filter(m => m.streams && m.streams.length > 0);
    } else if (streamFilter === 'live') {
        filtered = filtered.filter(m => m.isLive);
    }
    
    const grid = document.getElementById('matchesGrid');
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-search"></i>
                <h3>No matches found</h3>
                <p>Try adjusting your filters or sync data</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(match => {
        const streamCount = match.streams ? match.streams.length : 0;
        const hasStream = streamCount > 0;
        const isLive = match.isLive;
        const isFinished = match.isFinished;
        const statusText = isLive ? '🔴 LIVE' : isFinished ? '✅ FT' : '📅 Upcoming';
        
        return `
            <div class="match-card" onclick="openModal('${match.id}')">
                ${isLive ? '<span class="live-badge">🔴 LIVE</span>' : ''}
                <div class="match-card-header">
                    <span class="group-badge">${match.leagueName}</span>
                    <span style="font-size:0.85rem; opacity:0.8;">
                        ${formatDate(match.date)}
                    </span>
                </div>
                <div class="match-card-body">
                    <div class="match-teams">
                        <div class="team">
                            <span class="team-flag">${match.homeFlag || '🏠'}</span>
                            <span class="team-name">${match.homeTeam}</span>
                            ${isLive || isFinished ? `<span style="font-weight:bold;font-size:1.2rem;">${match.homeScore}</span>` : ''}
                        </div>
                        <span class="match-vs">${isLive || isFinished ? '' : 'VS'}</span>
                        <div class="team">
                            <span class="team-flag">${match.awayFlag || '✈️'}</span>
                            <span class="team-name">${match.awayTeam}</span>
                            ${isLive || isFinished ? `<span style="font-weight:bold;font-size:1.2rem;">${match.awayScore}</span>` : ''}
                        </div>
                    </div>
                    <div class="match-info">
                        <span><i class="fas fa-clock"></i> ${formatTime(match.date)}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${match.venue}</span>
                    </div>
                    <div class="match-info">
                        <span>${statusText}</span>
                        <span><i class="fas fa-refresh"></i> ${match.streams ? match.streams.length : 0} streams</span>
                    </div>
                    <div class="match-stream-status">
                        <span class="stream-badge ${hasStream ? 'has-stream' : 'no-stream'}">
                            ${hasStream ? '🎥 Stream Available' : '📺 No Stream'}
                        </span>
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
        const isLive = match.isLive;
        
        return `
            <div class="admin-match-item">
                <div class="admin-match-info">
                    <div class="admin-match-teams">
                        ${match.homeTeam} vs ${match.awayTeam}
                        ${isLive ? ' <span style="color:#ff6b6b;font-size:0.7rem;">🔴 LIVE</span>' : ''}
                    </div>
                    <div class="admin-match-meta">
                        <span><i class="fas fa-calendar"></i> ${formatDate(match.date)}</span>
                        <span><i class="fas fa-clock"></i> ${formatTime(match.date)}</span>
                        <span><i class="fas fa-tag"></i> ${match.leagueName}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${match.venue}</span>
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
    
    title.textContent = `${match.homeTeam} vs ${match.awayTeam} - ${match.leagueName}`;
    
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
                            <div class="link-label">
                                <span class="stream-quality ${(stream.quality || 'HD').toLowerCase()}">${stream.quality || 'HD'}</span>
                                Added: ${new Date(stream.addedAt).toLocaleString()}
                            </div>
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

// ==================== ADMIN MODAL ====================

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
                <div style="display: flex; gap: 15px; flex-wrap: wrap; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <span><strong>League:</strong> ${match.leagueName}</span>
                    <span><strong>Date:</strong> ${formatDate(match.date)}</span>
                    <span><strong>Time:</strong> ${formatTime(match.date)}</span>
                    <span><strong>Venue:</strong> ${match.venue}</span>
                    ${match.isLive ? '<span style="color:#ff6b6b;">🔴 LIVE</span>' : ''}
                </div>
            </div>
            
            <div class="form-group">
                <label>Current Streams (${streams.length})</label>
                <div class="stream-list">
                    ${streams.map(stream => `
                        <div class="stream-link-item">
                            <div class="link-info">
                                <div class="link-url">${stream.url}</div>
                                <div class="link-label">
                                    <span class="stream-quality ${(stream.quality || 'HD').toLowerCase()}">${stream.quality || 'HD'}</span>
                                    Added: ${new Date(stream.addedAt).toLocaleString()}
                                </div>
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
                    <select id="newStreamQuality" style="padding:10px;border:2px solid #e0e0e0;border-radius:8px;">
                        <option value="HD">HD</option>
                        <option value="SD">SD</option>
                        <option value="4K">4K</option>
                    </select>
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
    const quality = document.getElementById('newStreamQuality')?.value || 'HD';
    const url = input.value.trim();
    
    if (!url) {
        alert('Please enter a valid URL');
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('Please enter a valid URL starting with http:// or https://');
        return;
    }
    
    if (addStreamToMatch(matchId, url, quality)) {
        input.value = '';
        openEditModal(matchId);
        renderAll();
        alert('✅ Stream added successfully!');
    } else {
        alert('❌ Error adding stream');
    }
}

function removeStream(matchId, streamId) {
    if (confirm('Are you sure you want to remove this stream?')) {
        if (removeStreamFromMatch(matchId, streamId)) {
            openEditModal(matchId);
            renderAll();
            alert('✅ Stream removed successfully!');
        } else {
            alert('❌ Error removing stream');
        }
    }
}

// ==================== EXPORT/IMPORT ====================

function exportData() {
    const data = getMatches();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `streams_backup_${new Date().toISOString().split('T')[0]}.json`;
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
                    alert('✅ Data imported successfully!');
                    renderAll();
                } else {
                    alert('❌ Invalid data format!');
                }
            } catch (error) {
                alert('❌ Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function resetData() {
    if (confirm('⚠️ Are you sure you want to reset all data? This cannot be undone!')) {
        if (confirm('⚠️ Really? All streams will be lost!')) {
            localStorage.removeItem('allMatches');
            alert('✅ Data has been reset! Please sync again.');
            renderAll();
        }
    }
}

// ==================== UTILITY FUNCTIONS ====================

function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return dateStr || 'TBD';
    }
}

function formatTime(dateStr) {
    try {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return '';
    }
}

function renderAll() {
    renderStats();
    renderMatches();
    renderAdminMatches();
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', function() {
    // Check if we have data, if not sync
    const matches = getMatches();
    if (matches.length === 0) {
        syncAllLeagues();
    } else {
        renderAll();
    }
    
    // League tabs
    document.querySelectorAll('.league-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.league-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentLeague = this.dataset.league;
            renderMatches();
        });
    });
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', syncAllLeagues);
    }
    
    // Filters
    const searchInput = document.getElementById('searchInput');
    const dateFilter = document.getElementById('dateFilter');
    const streamFilter = document.getElementById('streamFilter');
    
    if (searchInput) searchInput.addEventListener('input', renderMatches);
    if (dateFilter) dateFilter.addEventListener('change', renderMatches);
    if (streamFilter) streamFilter.addEventListener('change', renderMatches);
    
    // Close modals on background click
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('streamModal');
        const editModal = document.getElementById('editModal');
        if (e.target === modal) closeModal();
        if (e.target === editModal) closeEditModal();
    });
    
    // Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeEditModal();
        }
    });
});

// ==================== AUTO-REFRESH ====================

// Refresh data every 5 minutes
setInterval(() => {
    console.log('🔄 Auto-refreshing data...');
    syncAllLeagues();
}, 300000);

console.log('🚀 Live Stream Hub initialized!');
console.log('📊 Supported Leagues:', Object.keys(ESPN_CONFIG.LEAGUES).join(', '));
console.log('🔄 Auto-refresh every 5 minutes');
