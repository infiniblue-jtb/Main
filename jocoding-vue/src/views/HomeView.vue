<template>
  <div class="home-container">
    <section class="hero-full">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="main-title">Happy Dongtan</h1>
        <p class="main-subtitle">아이와 함께하는 동탄 생활의 모든 것</p>
        <div class="cta-group">
          <router-link to="/kids" class="apple-button primary">아이와 뭐하지</router-link>
          <router-link to="/food" class="apple-button secondary">오늘 뭐먹지</router-link>
        </div>
      </div>
    </section>

    <section class="feature-section">
      <div class="feature-grid">
        <div class="feature-card" @click="$router.push('/kids')">
          <div class="card-icon">🎠</div>
          <h3>장소 추천</h3>
          <p>무료 공원부터 키즈 카페까지</p>
        </div>
        <div class="feature-card" @click="$router.push('/food')">
          <div class="card-icon">🍱</div>
          <h3>맛집 정보</h3>
          <p>아이 식기 완비, 주차 편한 곳</p>
        </div>
        <div class="feature-card" @click="$router.push('/cafe')">
          <div class="card-icon">☕</div>
          <h3>키즈 가베</h3>
          <p>엄마 아빠의 여유로운 티타임</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home-container {
  margin-top: -48px; /* Nav bar overlap */
}

.hero-full {
  position: relative;
  height: 90vh;
  min-height: 600px;
  background-image: url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'); /* 고퀄리티 자연 이미지 */
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.hero-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5));
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  padding: 0 22px;
}

.main-title {
  font-size: 5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
  animation: fadeInUp 1s ease-out;
}

.main-subtitle {
  font-size: 1.8rem;
  font-weight: 400;
  opacity: 0.9;
  margin-bottom: 40px;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.cta-group {
  display: flex;
  gap: 20px;
  justify-content: center;
  animation: fadeInUp 1s ease-out 0.4s both;
}

.apple-button {
  padding: 16px 32px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
}

.apple-button.primary {
  background: white;
  color: #1d1d1f;
}

.apple-button.primary:hover {
  background: rgba(255,255,255,0.9);
  transform: scale(1.05);
}

.apple-button.secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
}

.apple-button.secondary:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.05);
}

.feature-section {
  max-width: 1024px;
  margin: -100px auto 100px;
  position: relative;
  z-index: 2;
  padding: 0 22px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.feature-card {
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 28px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-10px);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.feature-card p {
  color: var(--text-secondary);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 734px) {
  .main-title { font-size: 3rem; }
  .main-subtitle { font-size: 1.2rem; }
  .feature-grid { grid-template-columns: 1fr; }
  .hero-full { height: 70vh; }
}
</style>
