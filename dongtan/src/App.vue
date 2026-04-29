<template>
  <div id="app-wrapper" :class="{ 'dark-mode': theme === 'dark' }">
    <nav class="apple-nav">
      <div class="nav-container">
        <div class="nav-left">
          <router-link to="/" class="logo-group clickable-logo">
            <span class="logo-icon">✨</span>
            <span class="logo-text">Happy Dongtan</span>
          </router-link>

          <button class="mobile-menu-btn" @click="isMenuOpen = !isMenuOpen" :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'">
            <span class="hamburger-line" :class="{ 'open': isMenuOpen }"></span>
            <span class="hamburger-line" :class="{ 'open': isMenuOpen }"></span>
            <span class="hamburger-line" :class="{ 'open': isMenuOpen }"></span>
          </button>
        </div>

        <div class="nav-links" :class="{ 'is-open': isMenuOpen }">
          <router-link to="/kids" class="nav-item" @click="isMenuOpen = false">{{ currentLang === 'ko' ? '아이와 뭐하지' : 'Explore' }}</router-link>
          <router-link to="/food" class="nav-item" @click="isMenuOpen = false">{{ currentLang === 'ko' ? '오늘 뭐먹지' : 'Eat' }}</router-link>
          <router-link to="/cafe" class="nav-item" @click="isMenuOpen = false">{{ currentLang === 'ko' ? '키즈 가베' : 'Cafe' }}</router-link>
          <router-link to="/health" class="nav-item" @click="isMenuOpen = false">{{ currentLang === 'ko' ? '병원/약국' : 'Health' }}</router-link>
          <router-link to="/info" class="nav-item" @click="isMenuOpen = false">{{ currentLang === 'ko' ? '정보' : 'Info' }}</router-link>
          <router-link to="/fun" class="nav-item" @click="isMenuOpen = false">{{ currentLang === 'ko' ? '놀이터' : 'Fun' }}</router-link>
          <router-link to="/board" class="nav-item" @click="isMenuOpen = false">{{ currentLang === 'ko' ? '자유게시판' : 'Board' }}</router-link>
        </div>
        <div class="control-group">
          <div class="status-pill">
            <span class="weather-info" v-if="weather">
              <span class="weather-icon">{{ weather.icon }}</span>
              <span class="weather-temp">{{ weather.temp }}°</span>
            </span>
            <span class="nav-time">{{ currentTime }}</span>
          </div>
          <button class="icon-btn" @click="toggleLang" :title="currentLang === 'ko' ? 'English' : '한국어'">
            {{ currentLang === 'ko' ? 'EN' : 'KO' }}
          </button>
          <button class="icon-btn theme-btn" @click="toggleTheme">
            <span v-if="theme === 'light'">🌙</span>
            <span v-else>☀️</span>
          </button>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="apple-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
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
      currentTime.value = now.toLocaleTimeString('ko-KR', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    let timer;
    let weatherTimer;

    const goToContact = async () => {
      if (router.currentRoute.value.path !== '/board') {
        await router.push('/board');
      }
      setTimeout(() => {
        const el = document.getElementById('contact-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
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
      weatherTimer = setInterval(fetchWeather, 600000); // 10분마다 날씨 업데이트
    });

    onUnmounted(() => {
      if (timer) clearInterval(timer);
      if (weatherTimer) clearInterval(weatherTimer);
    });

    return { currentLang, theme, isMenuOpen, currentTime, weather, toggleLang, toggleTheme, goToContact };
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

:root {
  --nav-bg: rgba(251, 251, 253, 0.8);
  --page-bg: #ffffff;
  --text-primary: #1d1d1f;
  --text-secondary: #86868b;
  --accent: #0071e3;
  --card-bg: #f5f5f7;
  --blur: blur(20px);
}

[data-theme="dark"] {
  --nav-bg: rgba(0, 0, 0, 0.8);
  --page-bg: #000000;
  --text-primary: #f5f5f7;
  --text-secondary: #a1a1a6;
  --accent: #2997ff;
  --card-bg: #1c1c1e;
}

* {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--page-bg);
  color: var(--text-primary);
  transition: background-color 0.5s ease;
}

.apple-nav {
  position: fixed;
  top: 0;
  width: 100%;
  height: 48px;
  background: var(--nav-bg);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  z-index: 9999;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

[data-theme="dark"] .apple-nav {
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.nav-container {
  max-width: 1024px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 22px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 1.1rem;
}

.clickable-logo {
  text-decoration: none;
  color: var(--text-primary);
  transition: opacity 0.3s;
}

.clickable-logo:hover {
  opacity: 0.7;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-item {
  text-decoration: none;
  color: var(--text-primary);
  font-size: 0.85rem;
  opacity: 0.8;
  transition: opacity 0.3s;
  font-weight: 400;
}

.nav-item:hover {
  opacity: 1;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  z-index: 10001;
}

.hamburger-line {
  display: block;
  width: 20px;
  height: 2px;
  margin: 4px 0;
  background-color: var(--text-primary);
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger-line.open:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger-line.open:nth-child(2) {
  opacity: 0;
}

.hamburger-line.open:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

.router-link-active {
  opacity: 1;
  font-weight: 600;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-time {
  font-family: 'Inter', -apple-system, sans-serif;
  font-variant-numeric: tabular-nums;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0,0,0,0.04);
  padding: 5px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

[data-theme="dark"] .status-pill {
  background: rgba(255,255,255,0.08);
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  border-right: 1px solid rgba(0,0,0,0.1);
  padding-right: 10px;
}

[data-theme="dark"] .weather-info {
  border-right: 1px solid rgba(255,255,255,0.1);
}

.weather-icon {
  font-size: 1rem;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.8;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s;
}

.icon-btn:hover {
  opacity: 1;
  background: rgba(0,0,0,0.05);
}

[data-theme="dark"] .icon-btn:hover {
  background: rgba(255,255,255,0.1);
}

.main-content {
  margin-top: 48px;
  min-height: 100vh;
}

.apple-footer {
  padding: 40px 22px;
  background: var(--card-bg);
  border-top: 1px solid rgba(0,0,0,0.05);
}

.footer-content {
  max-width: 1024px;
  margin: 0 auto;
  text-align: center;
}

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

.footer-links a:hover {
  color: var(--accent);
}

.copyright {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.8;
}

/* Common UI Components */
.intro-card {
  margin-bottom: 80px;
  background: var(--card-bg);
  border-radius: 28px;
  padding: 40px;
  border: 1px solid rgba(0,0,0,0.05);
}

[data-theme="dark"] .intro-card {
  border: 1px solid rgba(255,255,255,0.1);
}

.intro-card h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 15px 0;
}

.intro-card p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

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

.tips-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid rgba(0,0,0,0.1);
}

[data-theme="dark"] .tips-grid {
  border-top: 1px solid rgba(255,255,255,0.1);
}

.tip-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.tip-item .icon {
  font-size: 1.5rem;
}

.tip-item p {
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
}

.mb-80 { margin-bottom: 80px; }

/* Animations */
.apple-fade-enter-active, .apple-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.apple-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.apple-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 834px) {
  .nav-container {
    padding: 0 16px;
  }

  .mobile-menu-btn {
    display: block;
    padding: 8px;
  }

  .nav-links {
    position: fixed;
    top: 54px;
    left: 12px;
    width: 220px;
    height: auto;
    max-height: calc(100vh - 100px);
    background: var(--nav-bg);
    backdrop-filter: var(--blur);
    -webkit-backdrop-filter: var(--blur);
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 4px;
    padding: 12px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: scale(0.95) translateY(-10px);
    transform-origin: top left;
    z-index: 10000;
    border-radius: 18px;
    border: 1px solid rgba(0,0,0,0.08);
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    overflow-y: auto;
  }

  [data-theme="dark"] .nav-links {
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }

  .nav-links.is-open {
    opacity: 1;
    visibility: visible;
    transform: scale(1) translateY(0);
  }

  .nav-item {
    font-size: 0.95rem;
    font-weight: 500;
    width: 100%;
    text-align: left;
    padding: 10px 14px;
    border-radius: 10px;
    opacity: 0.9;
  }

  .nav-item:hover, .nav-item.router-link-active {
    background: rgba(0,0,0,0.04);
    opacity: 1;
  }

  [data-theme="dark"] .nav-item:hover, [data-theme="dark"] .nav-item.router-link-active {
    background: rgba(255,255,255,0.08);
  }

  .logo-text { 
    font-size: 0.95rem;
  }
  
  .control-group {
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .logo-text { display: none; }
}
</style>
