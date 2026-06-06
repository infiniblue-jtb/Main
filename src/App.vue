<template>
  <div id="app-wrapper" :class="{ 'dark-mode': theme === 'dark' }">
    <nav class="app-nav" :class="{ 'nav-scrolled': isScrolled }">
      <div class="nav-container">

        <!-- 로고 -->
        <router-link to="/" class="logo-group" @click="isMenuOpen = false">
          <span class="logo-mark">✦</span>
          <span class="logo-text">Happy<em>Dongtan</em></span>
        </router-link>

        <!-- 데스크탑 메뉴 -->
        <div class="nav-center">
          <router-link to="/" class="nav-link" @click="isMenuOpen = false">
            {{ currentLang === 'ko' ? '홈' : 'Home' }}
          </router-link>
          <router-link to="/blog" class="nav-link" @click="isMenuOpen = false">
            {{ currentLang === 'ko' ? '블로그' : 'Blog' }}
          </router-link>

          <div class="nav-dropdown" @mouseenter="isDropdownOpen = true" @mouseleave="isDropdownOpen = false">
            <span class="nav-link dropdown-trigger">
              {{ currentLang === 'ko' ? '동탄정보' : 'Categories' }}
              <svg class="chevron" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
            <transition name="dropdown-fade">
              <div v-if="isDropdownOpen" class="dropdown-panel">
                <div class="dropdown-inner">
                  <router-link to="/kids" class="dropdown-item" @click="isMenuOpen = false; isDropdownOpen = false">
                    <div class="di-icon di-life">🏘️</div>
                    <div class="di-body">
                      <span class="di-name">{{ currentLang === 'ko' ? '생활정보' : 'Life Info' }}</span>
                      <span class="di-desc">{{ currentLang === 'ko' ? '동탄 생활 꿀팁' : 'Local living tips' }}</span>
                    </div>
                    <span class="di-arrow">›</span>
                  </router-link>
                  <router-link to="/food" class="dropdown-item" @click="isMenuOpen = false; isDropdownOpen = false">
                    <div class="di-icon di-food">🍽️</div>
                    <div class="di-body">
                      <span class="di-name">{{ currentLang === 'ko' ? '맛집' : 'Restaurants' }}</span>
                      <span class="di-desc">{{ currentLang === 'ko' ? '인기 맛집 추천' : 'Top food picks' }}</span>
                    </div>
                    <span class="di-arrow">›</span>
                  </router-link>
                  <router-link to="/cafe" class="dropdown-item" @click="isMenuOpen = false; isDropdownOpen = false">
                    <div class="di-icon di-cafe">☕</div>
                    <div class="di-body">
                      <span class="di-name">{{ currentLang === 'ko' ? '카페' : 'Cafes' }}</span>
                      <span class="di-desc">{{ currentLang === 'ko' ? '분위기 좋은 카페' : 'Cozy coffee spots' }}</span>
                    </div>
                    <span class="di-arrow">›</span>
                  </router-link>
                  <router-link to="/health" class="dropdown-item" @click="isMenuOpen = false; isDropdownOpen = false">
                    <div class="di-icon di-health">🏥</div>
                    <div class="di-body">
                      <span class="di-name">{{ currentLang === 'ko' ? '병원' : 'Healthcare' }}</span>
                      <span class="di-desc">{{ currentLang === 'ko' ? '가까운 병원 찾기' : 'Find nearby clinics' }}</span>
                    </div>
                    <span class="di-arrow">›</span>
                  </router-link>
                </div>
              </div>
            </transition>
          </div>

          <router-link to="/tools" class="nav-link" @click="isMenuOpen = false">
            {{ currentLang === 'ko' ? '도구' : 'Tools' }}
          </router-link>
          <router-link to="/fun" class="nav-link" @click="isMenuOpen = false">
            {{ currentLang === 'ko' ? '놀거리' : 'Fun' }}
          </router-link>
          <router-link to="/board" class="nav-link" @click="isMenuOpen = false">
            {{ currentLang === 'ko' ? '자유게시판' : 'Board' }}
          </router-link>
        </div>

        <!-- 우측 컨트롤 -->
        <div class="nav-right">
          <div class="status-chip" v-if="weather || currentTime">
            <span v-if="weather" class="weather-badge">
              {{ weather.icon }} {{ weather.temp }}°
            </span>
            <span class="time-badge">{{ currentTime }}</span>
          </div>

          <button class="ctrl-btn" @click="toggleLang" :title="currentLang === 'ko' ? 'English' : '한국어'">
            {{ currentLang === 'ko' ? 'EN' : 'KO' }}
          </button>
          <button class="ctrl-btn theme-toggle" @click="toggleTheme">
            <span v-if="theme === 'light'">🌙</span>
            <span v-else>☀️</span>
          </button>

          <!-- 햄버거 버튼 (모바일) -->
          <button class="hamburger" :class="{ active: isMenuOpen }" @click="isMenuOpen = !isMenuOpen" aria-label="메뉴">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <!-- 모바일 드로어 -->
      <transition name="drawer">
        <div v-if="isMenuOpen" class="mobile-drawer">
          <div class="drawer-links">
            <router-link to="/" class="drawer-link" @click="isMenuOpen = false">
              <span>{{ currentLang === 'ko' ? '홈' : 'Home' }}</span>
              <span class="drawer-arrow">→</span>
            </router-link>
            <router-link to="/blog" class="drawer-link" @click="isMenuOpen = false">
              <span>{{ currentLang === 'ko' ? '블로그' : 'Blog' }}</span>
              <span class="drawer-arrow">→</span>
            </router-link>
            <div class="drawer-section-label">{{ currentLang === 'ko' ? '동탄정보' : 'Categories' }}</div>
            <router-link to="/kids" class="drawer-link sub" @click="isMenuOpen = false">
              <span>🏘️ {{ currentLang === 'ko' ? '생활정보' : 'Life' }}</span>
            </router-link>
            <router-link to="/food" class="drawer-link sub" @click="isMenuOpen = false">
              <span>🍽️ {{ currentLang === 'ko' ? '맛집' : 'Food' }}</span>
            </router-link>
            <router-link to="/cafe" class="drawer-link sub" @click="isMenuOpen = false">
              <span>☕ {{ currentLang === 'ko' ? '카페' : 'Cafe' }}</span>
            </router-link>
            <router-link to="/health" class="drawer-link sub" @click="isMenuOpen = false">
              <span>🏥 {{ currentLang === 'ko' ? '병원' : 'Health' }}</span>
            </router-link>
            <router-link to="/tools" class="drawer-link" @click="isMenuOpen = false">
              <span>🛠️ {{ currentLang === 'ko' ? '도구' : 'Tools' }}</span>
              <span class="drawer-arrow">→</span>
            </router-link>
            <router-link to="/fun" class="drawer-link" @click="isMenuOpen = false">
              <span>{{ currentLang === 'ko' ? '놀거리' : 'Fun' }}</span>
              <span class="drawer-arrow">→</span>
            </router-link>
            <router-link to="/board" class="drawer-link" @click="isMenuOpen = false">
              <span>{{ currentLang === 'ko' ? '자유게시판' : 'Board' }}</span>
              <span class="drawer-arrow">→</span>
            </router-link>
          </div>
        </div>
      </transition>
    </nav>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="apple-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      <AdComponent slotId="9173007135" />
    </main>

    <footer class="apple-footer">
      <div class="footer-content">
        <div class="footer-links">
          <router-link to="/about">About</router-link>
          <router-link to="/privacy">Privacy Policy</router-link>
          <a href="#" @click.prevent="goToContact">Contact</a>
        </div>
        <p class="copyright">© 2026 Happy Dongtan. Designed for families in Dongtan.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, provide, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'App',
  setup() {
    const router = useRouter();
    const currentLang = ref(localStorage.getItem('lang') || 'ko');
    const theme = ref(localStorage.getItem('theme') || 'light');
    const isMenuOpen = ref(false);
    const isDropdownOpen = ref(false);
    const isScrolled = ref(false);
    const currentTime = ref('');
    const weather = ref(null);

    const getWeatherIcon = (code) => {
      if (code === 0) return '☀️';
      if (code <= 3) return '🌤️';
      if (code <= 48) return '☁️';
      if (code <= 67) return '🌧️';
      if (code <= 77) return '❄️';
      if (code <= 82) return '🌦️';
      if (code <= 99) return '⛈️';
      return '🌡️';
    };

    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.2022&longitude=127.1088&current_weather=true');
        const data = await res.json();
        weather.value = {
          temp: Math.round(data.current_weather.temperature),
          icon: getWeatherIcon(data.current_weather.weathercode)
        };
      } catch (e) {
        console.error('Weather fetch failed', e);
      }
    };

    const updateTime = () => {
      const now = new Date();
      currentTime.value = now.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' });
    };

    const handleScroll = () => {
      isScrolled.value = window.scrollY > 10;
    };

    let timer, weatherTimer;

    const goToContact = async () => {
      if (router.currentRoute.value.path !== '/board') await router.push('/board');
      setTimeout(() => {
        const el = document.getElementById('contact-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    const toggleLang = () => {
      currentLang.value = currentLang.value === 'ko' ? 'en' : 'ko';
      localStorage.setItem('lang', currentLang.value);
      document.documentElement.lang = currentLang.value;
      window.dispatchEvent(new CustomEvent('lang-changed', { detail: currentLang.value }));
    };

    const toggleTheme = () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', theme.value);
      document.documentElement.setAttribute('data-theme', theme.value);
    };

    provide('currentLang', currentLang);
    provide('theme', theme);

    onMounted(() => {
      document.documentElement.setAttribute('data-theme', theme.value);
      document.documentElement.lang = currentLang.value;
      updateTime();
      fetchWeather();
      timer = setInterval(updateTime, 1000);
      weatherTimer = setInterval(fetchWeather, 600000);
      window.addEventListener('scroll', handleScroll, { passive: true });
    });

    onUnmounted(() => {
      if (timer) clearInterval(timer);
      if (weatherTimer) clearInterval(weatherTimer);
      window.removeEventListener('scroll', handleScroll);
    });

    return { currentLang, theme, isMenuOpen, isDropdownOpen, isScrolled, currentTime, weather, toggleLang, toggleTheme, goToContact };
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

:root {
  --nav-h: 60px;
  --nav-bg: rgba(255, 255, 255, 0.72);
  --nav-border: rgba(0, 0, 0, 0.06);
  --page-bg: #ffffff;
  --text-primary: #111318;
  --text-secondary: #74747a;
  --accent: #0055d4;
  --accent-soft: rgba(0, 85, 212, 0.08);
  --card-bg: #f4f4f6;
  --blur: blur(24px) saturate(1.8);
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
}

[data-theme="dark"] {
  --nav-bg: rgba(14, 14, 18, 0.78);
  --nav-border: rgba(255, 255, 255, 0.06);
  --page-bg: #0c0c10;
  --text-primary: #ebebf0;
  --text-secondary: #8e8e98;
  --accent: #4d8eff;
  --accent-soft: rgba(77, 142, 255, 0.1);
  --card-bg: #18181e;
}

* { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

body {
  margin: 0;
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--page-bg);
  color: var(--text-primary);
  transition: background-color 0.4s ease, color 0.4s ease;
}

/* ─── NAV BASE ─── */
.app-nav {
  position: fixed;
  top: 0;
  inset-inline: 0;
  height: var(--nav-h);
  z-index: 9999;
  background: var(--nav-bg);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border-bottom: 1px solid var(--nav-border);
  transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
}

.app-nav.nav-scrolled {
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .app-nav.nav-scrolled {
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.4);
}

.nav-container {
  max-width: 1100px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  gap: 16px;
}

/* ─── LOGO ─── */
.logo-group {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-mark {
  font-size: 1.1rem;
  background: linear-gradient(135deg, var(--accent), #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 8px rgba(0,85,212,0.3));
}

.logo-text {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.logo-text em {
  font-style: normal;
  color: var(--accent);
}

.logo-group:hover .logo-mark {
  filter: drop-shadow(0 0 14px rgba(0,85,212,0.5));
}

/* ─── NAV CENTER (desktop links) ─── */
.nav-center {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  position: relative;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--accent-soft);
}

.nav-link.router-link-active {
  color: var(--accent);
  font-weight: 600;
  background: var(--accent-soft);
}

/* ─── DROPDOWN ─── */
.nav-dropdown {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 5px;
}

.chevron {
  width: 10px;
  height: 10px;
  transition: transform 0.2s;
}

.nav-dropdown:hover .chevron {
  transform: rotate(180deg);
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
  pointer-events: all;
}

.dropdown-inner {
  background: var(--nav-bg);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border: 1px solid var(--nav-border);
  border-radius: 20px;
  padding: 10px;
  min-width: 240px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.08);
}

[data-theme="dark"] .dropdown-inner {
  box-shadow: 0 24px 64px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.35);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 10px;
  border-radius: 14px;
  text-decoration: none;
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: background 0.2s, transform 0.2s;
  margin-bottom: 2px;
}

.dropdown-item:last-child { margin-bottom: 0; }

.dropdown-item:hover {
  background: var(--accent-soft);
  transform: translateX(4px);
}

.dropdown-item:hover .di-arrow {
  opacity: 1;
  transform: translateX(3px);
}

.dropdown-item:hover .di-icon {
  transform: scale(1.12) rotate(-5deg);
}

.di-icon {
  width: 42px; height: 42px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.2,0.8,0.2,1);
}

.di-life   { background: linear-gradient(135deg, rgba(99,179,237,0.2), rgba(66,153,225,0.1)); border: 1px solid rgba(99,179,237,0.25); }
.di-food   { background: linear-gradient(135deg, rgba(252,129,74,0.22), rgba(237,100,44,0.1)); border: 1px solid rgba(252,129,74,0.28); }
.di-cafe   { background: linear-gradient(135deg, rgba(205,155,110,0.25), rgba(183,121,70,0.12)); border: 1px solid rgba(205,155,110,0.3); }
.di-health { background: linear-gradient(135deg, rgba(104,211,145,0.2), rgba(56,178,94,0.1)); border: 1px solid rgba(104,211,145,0.25); }

.di-body {
  display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0;
}

.di-name {
  font-size: 0.875rem; font-weight: 600; color: var(--text-primary); line-height: 1.2;
}

.di-desc {
  font-size: 0.72rem; color: var(--text-secondary); opacity: 0.75;
}

.di-arrow {
  font-size: 1.3rem; color: var(--text-secondary);
  opacity: 0; transition: opacity 0.2s, transform 0.2s; font-weight: 300;
}

/* Dropdown transition */
.dropdown-fade-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-fade-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
}
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

/* ─── NAV RIGHT ─── */
.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.status-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: var(--accent-soft);
  border-radius: 20px;
  border: 1px solid rgba(0,85,212,0.1);
}

[data-theme="dark"] .status-chip {
  border-color: rgba(77,142,255,0.15);
}

.weather-badge, .time-badge {
  font-size: 0.775rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--accent);
  letter-spacing: -0.01em;
}

.weather-badge {
  border-right: 1px solid rgba(0,85,212,0.15);
  padding-right: 8px;
}

.ctrl-btn {
  background: none;
  border: 1px solid var(--nav-border);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.775rem;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 8px;
  font-family: inherit;
  transition: all 0.2s;
  letter-spacing: 0.03em;
}

.ctrl-btn:hover {
  color: var(--text-primary);
  background: var(--accent-soft);
  border-color: var(--accent);
}

.theme-toggle {
  font-size: 0.9rem;
  padding: 5px 8px;
}

/* ─── HAMBURGER ─── */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  padding: 8px;
  background: none;
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.hamburger span {
  display: block;
  height: 1.5px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.25s ease, width 0.25s ease;
  transform-origin: center;
}

.hamburger span:nth-child(1) { width: 100%; }
.hamburger span:nth-child(2) { width: 70%; }
.hamburger span:nth-child(3) { width: 100%; }

.hamburger.active span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); width: 100%; }
.hamburger.active span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hamburger.active span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); width: 100%; }

.hamburger:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
}

/* ─── MOBILE DRAWER ─── */
.mobile-drawer {
  position: absolute;
  top: var(--nav-h);
  inset-inline: 0;
  background: var(--nav-bg);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border-top: 1px solid var(--nav-border);
  border-bottom: 1px solid var(--nav-border);
  padding: 12px 16px 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.drawer-links {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drawer-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 500;
  transition: background 0.15s;
}

.drawer-link:hover {
  background: var(--accent-soft);
  color: var(--accent);
}

.drawer-link.router-link-active {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}

.drawer-link.sub {
  padding-left: 28px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.drawer-link.sub:hover { color: var(--accent); }

.drawer-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  padding: 10px 14px 4px;
  opacity: 0.6;
}

.drawer-arrow {
  color: var(--text-secondary);
  font-size: 0.85rem;
  transition: transform 0.2s;
}

.drawer-link:hover .drawer-arrow {
  transform: translateX(4px);
  color: var(--accent);
}

/* Drawer transition */
.drawer-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.drawer-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.drawer-enter-from { opacity: 0; transform: translateY(-8px); }
.drawer-leave-to { opacity: 0; transform: translateY(-4px); }

/* ─── MAIN / FOOTER ─── */
.main-content {
  margin-top: var(--nav-h);
  min-height: 100vh;
}

.apple-footer {
  padding: 40px 22px;
  background: var(--card-bg);
  border-top: 1px solid var(--nav-border);
}

.footer-content { max-width: 1100px; margin: 0 auto; text-align: center; }

.footer-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
}

.footer-links a {
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
  transition: color 0.3s;
}

.footer-links a:hover { color: var(--accent); }

.copyright {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.7;
  margin: 0;
}

/* ─── SHARED COMPONENTS ─── */
.glass-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.05);
  transition: border-color 0.3s, box-shadow 0.3s;
}

[data-theme="dark"] .glass-card {
  border: 1px solid rgba(255,255,255,0.08);
}

.intro-card { margin-bottom: 80px; padding: 40px; }
.intro-card h2 { font-size: 2rem; font-weight: 700; margin: 15px 0; }
.intro-card p { font-size: 1.1rem; line-height: 1.8; color: var(--text-secondary); margin-bottom: 20px; }

.badge {
  display: inline-block;
  padding: 6px 12px;
  background: var(--accent);
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; padding-top: 30px; border-top: 1px solid rgba(0,0,0,0.08); }
[data-theme="dark"] .tips-grid { border-top: 1px solid rgba(255,255,255,0.08); }
.tip-item { display: flex; gap: 15px; align-items: flex-start; }
.tip-item .icon { font-size: 1.5rem; }
.tip-item p { font-size: 0.95rem; margin: 0; line-height: 1.5; }
.mb-80 { margin-bottom: 80px; }

/* ─── TRANSITIONS ─── */
.apple-fade-enter-active, .apple-fade-leave-active { transition: opacity 0.35s ease; }
.apple-fade-enter-from, .apple-fade-leave-to { opacity: 0; }

/* ─── RESPONSIVE ─── */
@media (max-width: 834px) {
  .nav-container { padding: 0 12px; gap: 6px; }
  .nav-center { display: none; }
  .hamburger { display: flex; }
  .logo-text { font-size: 0.9rem; }

  .status-chip {
    padding: 3px 8px;
    gap: 4px;
    border-radius: 14px;
  }
  .weather-badge, .time-badge {
    font-size: 0.64rem;
    letter-spacing: 0;
  }
  .weather-badge { padding-right: 5px; }

  .ctrl-btn {
    padding: 4px 8px;
    font-size: 0.7rem;
  }
  .theme-toggle { padding: 4px 7px; }
}

.drawer-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  margin: 4px 0 8px;
  background: var(--accent-soft);
  border-radius: 14px;
  border: 1px solid rgba(0,85,212,0.12);
}
.drawer-weather, .drawer-time {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
.drawer-weather {
  border-right: 1px solid rgba(0,85,212,0.2);
  padding-right: 10px;
}

@media (max-width: 390px) {
  .time-badge { display: none; }
  .weather-badge { border-right: none; padding-right: 0; }
  .logo-mark { display: none; }
}
</style>
