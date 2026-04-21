<template>
  <div id="app-wrapper">
    <nav class="main-nav">
      <div class="nav-container">
        <div class="logo">✨ HappyKids</div>
        <div class="nav-links">
          <router-link to="/" class="nav-item">{{ currentLang === 'ko' ? '👶 아이와 뭐하지?' : '👶 What to do?' }}</router-link>
          <router-link to="/food" class="nav-item">{{ currentLang === 'ko' ? '🍕 오늘 뭐먹지?' : '🍕 What to eat?' }}</router-link>
        </div>
        <div class="top-controls">
          <button class="lang-toggle" @click="toggleLang">{{ currentLang === 'ko' ? '🌐 English' : '🌐 한국어' }}</button>
          <button class="theme-toggle" @click="toggleTheme">{{ currentLang === 'ko' ? '🌓 모드 변경' : '🌓 Toggle Theme' }}</button>
        </div>
      </div>
    </nav>
    <main class="content-wrapper">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
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
      // Trigger a global event or rely on reactivity if possible
      window.dispatchEvent(new CustomEvent('lang-changed', { detail: currentLang.value }));
    };

    const toggleTheme = () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', theme.value);
      document.documentElement.setAttribute('data-theme', theme.value);
    };

    provide('currentLang', currentLang);
    provide('theme', theme);
    provide('toggleLang', toggleLang);
    provide('toggleTheme', toggleTheme);

    onMounted(() => {
      document.documentElement.setAttribute('data-theme', theme.value);
      document.documentElement.lang = currentLang.value;
    });

    return { currentLang, toggleLang, toggleTheme };
  }
}
</script>

<style>
:root {
  --bg-gradient: linear-gradient(135deg, #fff9e6, #e6f7ff);
  --container-bg: rgba(255, 255, 255, 0.9);
  --text-color: #444;
  --card-bg: white;
  --input-border: #ddd;
  --accent-color: #ff9f43;
  --free-color: #3498db;
  --paid-color: #e74c3c;
}
[data-theme="dark"] {
  --bg-gradient: linear-gradient(135deg, #2c3e50, #000000);
  --container-bg: rgba(0, 0, 0, 0.7);
  --text-color: #eee;
  --card-bg: #333;
  --input-border: #555;
  --accent-color: #f39c12;
}
body { margin: 0; font-family: 'Segoe UI', sans-serif; background: var(--bg-gradient); color: var(--text-color); }
.main-nav { position: sticky; top: 0; z-index: 1000; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 15px 0; }
.nav-container { max-width: 1000px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
.logo { font-size: 1.5rem; font-weight: bold; color: var(--accent-color); }
.nav-links { display: flex; gap: 15px; }
.nav-item { text-decoration: none; color: var(--text-color); font-weight: 500; padding: 8px 12px; border-radius: 10px; transition: all 0.3s; font-size: 0.95rem; }
.router-link-active { background: var(--accent-color); color: white !important; }
.top-controls { display: flex; gap: 10px; }
.theme-toggle, .lang-toggle {
  background: none; border: 1px solid var(--text-color); color: var(--text-color);
  padding: 5px 10px; border-radius: 15px; cursor: pointer; font-size: 12px; transition: all 0.3s;
}
.theme-toggle:hover, .lang-toggle:hover { background: var(--text-color); color: white; }
.content-wrapper { padding: 40px 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .nav-container { flex-direction: column; gap: 15px; }
  .nav-links { width: 100%; justify-content: center; }
  .top-controls { width: 100%; justify-content: center; }
}
</style>
