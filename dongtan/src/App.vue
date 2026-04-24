<template>
  <div id="app-wrapper" :class="{ 'dark-mode': theme === 'dark' }">
    <nav class="apple-nav">
      <div class="nav-container">
        <router-link to="/" class="logo-group clickable-logo">
          <span class="logo-icon">✨</span>
          <span class="logo-text">Happy Dongtan</span>
        </router-link>
        <div class="nav-links">
          <router-link to="/kids" class="nav-item">{{ currentLang === 'ko' ? '아이와 뭐하지' : 'Explore' }}</router-link>
          <router-link to="/food" class="nav-item">{{ currentLang === 'ko' ? '오늘 뭐먹지' : 'Eat' }}</router-link>
          <router-link to="/cafe" class="nav-item">{{ currentLang === 'ko' ? '키즈 가베' : 'Cafe' }}</router-link>
          <router-link to="/health" class="nav-item">{{ currentLang === 'ko' ? '병원/약국' : 'Health' }}</router-link>
          <router-link to="/board" class="nav-item">{{ currentLang === 'ko' ? '자유게시판' : 'Board' }}</router-link>
        </div>
        <div class="control-group">
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
        <p>© 2026 Designed for infiniblue with gemini</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, provide, onMounted } from 'vue';

export default {
  name: 'App',
  setup() {
    const currentLang = ref(localStorage.getItem('lang') || 'ko');
    const theme = ref(localStorage.getItem('theme') || 'light');

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
    });

    return { currentLang, theme, toggleLang, toggleTheme };
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

.router-link-active {
  opacity: 1;
  font-weight: 600;
}

.control-group {
  display: flex;
  gap: 15px;
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
  padding: 60px 22px;
  background: var(--card-bg);
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

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

@media (max-width: 734px) {
  .nav-links { gap: 15px; }
  .logo-text { display: none; }
}
</style>

