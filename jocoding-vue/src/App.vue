<template>
  <div id="app-wrapper">
    <nav class="main-nav">
      <div class="nav-container">
        <div class="logo">✨ HappyKids</div>
        <div class="nav-links">
          <router-link to="/" class="nav-item">👶 아이와 뭐하지?</router-link>
          <router-link to="/food" class="nav-item">🍕 오늘 뭐먹지?</router-link>
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
.nav-links { display: flex; gap: 20px; }
.nav-item { text-decoration: none; color: var(--text-color); font-weight: 500; padding: 8px 15px; border-radius: 10px; transition: all 0.3s; }
.router-link-active { background: var(--accent-color); color: white !important; }
.content-wrapper { padding: 40px 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
