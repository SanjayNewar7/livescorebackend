# FIFA World Cup 2026 Stream Dashboard

A complete self-contained web application for managing and displaying World Cup match streams.

## Features

- ✅ **No Backend Required** - Uses localStorage for data persistence
- ✅ **Beautiful Dashboard** - View all matches in a clean grid layout
- ✅ **Admin Panel** - Add, remove, and manage stream links for each match
- ✅ **Search & Filter** - Find matches by team, stadium, group, or stream availability
- ✅ **Export/Import Data** - Backup and restore your stream links
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **One-Click Watch** - Direct access to stream links

## How to Use

### Viewing Matches
1. Open `index.html` in your browser
2. Browse matches in the grid
3. Click "Watch" or any match card to view stream links
4. Click the watch icon on any stream to open it

### Managing Streams (Admin)
1. Click the "Admin" link in the navigation
2. Find the match you want to manage
3. Click "Edit" to open the stream manager
4. Add new stream URLs or remove existing ones
5. Changes are saved automatically

### Data Management
- **Export**: Download all data as a JSON backup file
- **Import**: Restore from a previously exported JSON file
- **Reset**: Reset all data to default (warning: this cannot be undone)

## Deployment

### Option 1: Local Use
Simply open `index.html` in any modern web browser.

### Option 2: Netlify
1. Create a new site on Netlify
2. Upload all files (HTML, CSS, JS)
3. Your dashboard is live!

### Option 3: Vercel
1. Create a new project on Vercel
2. Upload all files
3. Deploy!

## Adding Stream Links

Streams are added manually through the admin panel. To add a stream:

1. Go to the Admin page
2. Click "Edit" on the match
3. Enter the stream URL (e.g., `https://dlhd.pk/watch.php?id=5006`)
4. Click "Add"
5. The stream is now available for that match

## Default Data

The app comes pre-populated with sample World Cup matches including:
- USA vs England (Group A)
- Brazil vs Germany (Group B)
- Argentina vs France (Group C)
- Spain vs Portugal (Group D)
- And 4 more matches

## Data Storage

All data is stored in your browser's localStorage. This means:
- ✅ Data persists between sessions
- ✅ Works offline once loaded
- ❌ Data is limited to ~5MB
- ❌ Data is specific to each browser/device

## Technologies Used

- HTML5
- CSS3 (Flexbox, Grid, Animations)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- localStorage for data persistence

## Customization

### Adding New Matches
Edit the `DEFAULT_MATCHES` array in `script.js`:

```javascript
{
    id: '9', // Unique ID
    homeTeam: 'Italy',
    awayTeam: 'England',
    homeFlag: '🇮🇹',
    awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    date: '2026-07-04',
    time: '20:00',
    stadium: 'Wembley Stadium',
    group: 'Group A',
    streams: []
}
