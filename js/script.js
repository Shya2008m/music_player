/* ============================================================
   MUSIC PLAYER – Full JavaScript Logic
   ============================================================ */

// ============================================================
//  1. SONG DATA (Add your own tracks here)
// ============================================================
const songs = [
    {
        title: 'beat_5_140bpm',
        artist: 'SSh',
        cover: 'assets/images/default-album.jpg',
        src: 'assets/audio/beat_5_140bpm.wav'
    },
    {
        title: 'beat_7_110bpm',
        artist: 'SSh',
        cover: 'assets/images/default-album.jpg',
        src: 'assets/audio/beat_7_110bpm.wav'
    },
    {
        title: 'beat_8_110bpm',
        artist: 'SSh',
        cover: 'assets/images/default-album.jpg',
        src: 'assets/audio/beat_8_110bpm.wav'
    },
    {
        title: 'beat_10_140bpm',
        artist: 'SSh',
        cover: 'assets/images/default-album.jpg',
        src: 'assets/audio/beat_10_140bpm.wav'
    },
    {
        title: 'beat_11_110bpm',
        artist: 'SSh',
        cover: 'assets/images/default-album.jpg',
        src: 'assets/audio/beat_11_110bpm.wav'
    },
    {
        title: 'beat_12_180bpm',
        artist: 'SSh',
        cover: 'assets/images/default-album.jpg',
        src: 'assets/audio/beat_12_180bpm.wav'
    },
    {
        title: 'beat_13_157bpm',
        artist: 'SSh',
        cover: 'assets/images/default-album.jpg',
        src: 'assets/audio/beat_13_157bpm.wav'
    },
    {
        title: 'beat_14_100bpm',
        artist: 'SSh',
        cover: 'assets/images/default-album.jpg',
        src: 'assets/audio/beat_14_100bpm.wav'
    }
];

// ============================================================
//  2. DOM REFERENCES
// ============================================================
const audio = new Audio();

const albumCover    = document.getElementById('albumCover');
const songTitle     = document.getElementById('songTitle');
const artistName    = document.getElementById('artistName');
const progressFill  = document.getElementById('progressFill');
const progressBar   = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl    = document.getElementById('duration');
const playBtn       = document.getElementById('playBtn');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const shuffleBtn    = document.getElementById('shuffleBtn');
const repeatBtn     = document.getElementById('repeatBtn');
const volumeSlider  = document.getElementById('volumeSlider');
const volumeIcon    = document.getElementById('volumeIcon');
const playlistEl    = document.getElementById('playlist');
const togglePlaylistBtn = document.getElementById('togglePlaylistBtn');

// ============================================================
//  3. STATE VARIABLES
// ============================================================
let currentSongIndex = 0;
let isPlaying = false;
let isShuffled = false;
let repeatMode = 'none'; // 'none', 'one', 'all'
let isDraggingProgress = false;

// ============================================================
//  4. HELPER FUNCTIONS
// ============================================================
function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================
//  5. LOAD & PLAY SONGS
// ============================================================
function loadSong(index) {
    const song = songs[index];
    if (!song) return;

    audio.src = song.src;
    songTitle.textContent = song.title;
    artistName.textContent = song.artist;
    albumCover.src = song.cover || 'assets/images/default-album.jpg';
    
    // Reset progress
    progressFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';
    
    // Highlight playlist item
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });

    // Load metadata to get duration
    audio.load();
}

function playSong() {
    if (!audio.src) {
        loadSong(currentSongIndex);
    }
    audio.play()
        .then(() => {
            isPlaying = true;
            updatePlayButton();
            albumCover.classList.add('playing');
        })
        .catch(err => console.warn('Playback error:', err));
}

function pauseSong() {
    audio.pause();
    isPlaying = false;
    updatePlayButton();
    albumCover.classList.remove('playing');
}

function togglePlay() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

// ============================================================
//  6. NAVIGATION
// ============================================================
function getNextIndex() {
    if (isShuffled) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * songs.length);
        } while (randomIndex === currentSongIndex && songs.length > 1);
        return randomIndex;
    }
    return (currentSongIndex + 1) % songs.length;
}

function getPrevIndex() {
    if (isShuffled) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * songs.length);
        } while (randomIndex === currentSongIndex && songs.length > 1);
        return randomIndex;
    }
    return (currentSongIndex - 1 + songs.length) % songs.length;
}

function nextSong() {
    const nextIndex = getNextIndex();
    currentSongIndex = nextIndex;
    loadSong(currentSongIndex);
    if (isPlaying) playSong();
}

function prevSong() {
    // If current time > 3s, restart instead of going previous
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }
    const prevIndex = getPrevIndex();
    currentSongIndex = prevIndex;
    loadSong(currentSongIndex);
    if (isPlaying) playSong();
}

// ============================================================
//  7. SHUFFLE & REPEAT
// ============================================================
function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active', isShuffled);
}

function toggleRepeat() {
    if (repeatMode === 'none') {
        repeatMode = 'all';
        repeatBtn.classList.add('active');
        repeatBtn.style.color = 'var(--accent)';
    } else if (repeatMode === 'all') {
        repeatMode = 'one';
        repeatBtn.innerHTML = '<i class="fas fa-redo"></i><sup style="font-size:0.6rem;">1</sup>';
        repeatBtn.classList.add('active');
    } else {
        repeatMode = 'none';
        repeatBtn.classList.remove('active');
        repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
        repeatBtn.style.color = '';
    }
}

// ============================================================
//  8. VOLUME
// ============================================================
function setVolume(value) {
    const vol = parseFloat(value);
    audio.volume = vol;
    // Update icon
    if (vol === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (vol < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

// ============================================================
//  9. PROGRESS & SEEK
// ============================================================
function updateProgress() {
    if (isDraggingProgress) return;
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = percent + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
}

function seekTo(e) {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(1, Math.max(0, clickX / rect.width));
    if (audio.duration) {
        audio.currentTime = percent * audio.duration;
        progressFill.style.width = percent * 100 + '%';
    }
}

// ============================================================
//  10. PLAYLIST GENERATION
// ============================================================
function generatePlaylist() {
    playlistEl.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.className = 'playlist-item';
        li.dataset.index = index;
        if (index === currentSongIndex) li.classList.add('active');

        li.innerHTML = `
            <span class="playlist-song">${song.title}</span>
            <span class="playlist-artist">${song.artist}</span>
            <span class="playlist-duration">--:--</span>
        `;

        li.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(currentSongIndex);
            if (isPlaying) playSong();
            else {
                // If paused, load and keep paused but update UI
                playSong(); // play it
                // Actually we want to play if user clicks, so let's do:
                // But if it was paused, we should play. 
                // Let's just call playSong() which handles playing.
                // However if paused, playSong() will play. If playing, it will stay playing.
                // But we need to ensure the play button state is correct.
                // Better:
                if (!isPlaying) {
                    playSong();
                } else {
                    // already playing, just load and keep playing
                }
            }
        });

        playlistEl.appendChild(li);
    });
}

// Update playlist duration when metadata loads (optional)
function updatePlaylistDurations() {
    // We could preload, but for simplicity we skip or do on load.
}

// ============================================================
//  11. TOGGLE PLAYLIST VISIBILITY
// ============================================================
let playlistVisible = true;
function togglePlaylist() {
    playlistVisible = !playlistVisible;
    playlistEl.classList.toggle('collapsed', !playlistVisible);
    togglePlaylistBtn.classList.toggle('open', playlistVisible);
}

// ============================================================
//  12. UPDATE UI HELPERS
// ============================================================
function updatePlayButton() {
    const icon = playBtn.querySelector('i');
    if (isPlaying) {
        icon.className = 'fas fa-pause';
        playBtn.title = 'Pause';
    } else {
        icon.className = 'fas fa-play';
        playBtn.title = 'Play';
    }
}

// ============================================================
//  13. EVENT LISTENERS
// ============================================================

// --- Audio Events ---
audio.addEventListener('timeupdate', updateProgress);

audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
    if (repeatMode === 'one') {
        audio.currentTime = 0;
        playSong();
    } else if (repeatMode === 'all' || !isShuffled) {
        nextSong();
    } else {
        // If shuffled and repeat off, just stop or go to next random
        nextSong();
    }
});

// --- Control Buttons ---
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);

// --- Volume ---
volumeSlider.addEventListener('input', (e) => {
    setVolume(e.target.value);
});

// --- Progress Bar (click to seek) ---
progressBar.addEventListener('click', seekTo);

// Drag support (optional but nice)
progressBar.addEventListener('mousedown', (e) => {
    isDraggingProgress = true;
    seekTo(e);
});
document.addEventListener('mouseup', () => {
    isDraggingProgress = false;
    // Ensure progress updates after drag
    updateProgress();
});
document.addEventListener('mousemove', (e) => {
    if (isDraggingProgress) {
        seekTo(e);
    }
});

// Touch support for mobile
progressBar.addEventListener('touchstart', (e) => {
    isDraggingProgress = true;
    seekTo(e.touches[0]);
});
progressBar.addEventListener('touchmove', (e) => {
    if (isDraggingProgress) {
        seekTo(e.touches[0]);
    }
});
progressBar.addEventListener('touchend', () => {
    isDraggingProgress = false;
    updateProgress();
});

// --- Playlist Toggle ---
togglePlaylistBtn.addEventListener('click', togglePlaylist);

// --- Keyboard shortcuts (bonus) ---
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return; // ignore if typing in range
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
    }
    if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (audio.duration) audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
    }
    if (e.code === 'ArrowLeft') {
        e.preventDefault();
        audio.currentTime = Math.max(0, audio.currentTime - 5);
    }
});

// ============================================================
//  14. INITIALIZATION
// ============================================================
function init() {
    // Load first song
    loadSong(0);
    generatePlaylist();
    setVolume(volumeSlider.value);
    updatePlayButton();
    
    // Default playlist expanded
    playlistEl.classList.remove('collapsed');
    togglePlaylistBtn.classList.add('open');
}

// Start the app
init();

console.log('🎵 Music Player initialized!');