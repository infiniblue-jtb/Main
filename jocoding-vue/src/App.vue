<template>
  <div id="app-wrapper">
    <nav class="luxury-nav" :class="{ 'scrolled': isScrolled }">
      <div class="nav-container">
        <div class="logo">HAPPYKIDS</div>
        <div class="nav-links">
          <router-link to="/" class="nav-item">DISCOVER</router-link>
          <router-link to="/food" class="nav-item">GASTRONOMY</router-link>
        </div>
      </div>
    </nav>
    
    <main class="content-wrapper">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="luxury-footer">
      <div class="footer-content">
        <div class="footer-logo">HAPPYKIDS</div>
        <p class="copyright">&copy; 2026 CURATED FOR FAMILY. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'App',
  setup() {
    const isScrolled = ref(false);

    const handleScroll = () => {
      isScrolled.value = window.scrollY > 50;
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return { isScrolled };
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,700;1,400&family=Noto+Sans+KR:wght@300;400;700&display=swap');

:root {
  --accent-color: #1a1a1a;
  --text-color: #1a1a1a;
  --light-gray: #f9f9f9;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Noto Sans KR', sans-serif;
  color: var(--text-color);
  background: #fff;
  -webkit-font-smoothing: antialiased;
}

#app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.luxury-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 30px 0;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  background: transparent;
}

.luxury-nav.scrolled {
  padding: 15px 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0,0,0,0.05);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
}

.logo {
  font-family: 'Bodoni Moda', serif;
  font-size: 1.5rem;
  letter-spacing: 0.2em;
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 40px;
}

.nav-item {
  text-decoration: none;
  color: var(--text-color);
  font-family: 'Bodoni Moda', serif;
  font-size: 0.9rem;
  letter-spacing: 0.15em;
  font-weight: 400;
  position: relative;
  padding-bottom: 5px;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--text-color);
  transition: width 0.3s ease;
}

.nav-item:hover::after, .router-link-active::after {
  width: 100%;
}

.content-wrapper {
  flex: 1;
  margin-top: 0;
}

.luxury-footer {
  padding: 100px 40px;
  background: #fff;
  border-top: 1px solid #eee;
  text-align: center;
}

.footer-logo {
  font-family: 'Bodoni Moda', serif;
  font-size: 1.2rem;
  letter-spacing: 0.3em;
  margin-bottom: 30px;
}

.copyright {
  font-size: 0.7rem;
  color: #999;
  letter-spacing: 0.1em;
}

/* Page Transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
