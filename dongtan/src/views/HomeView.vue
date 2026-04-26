<template>
  <div class="home-container">
    <section class="hero-full">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="main-title">Happy Dongtan</h1>
        <p class="main-subtitle">아이와 함께하는 동탄 생활의 모든 것</p>
        <div class="cta-group">
          <router-link to="/kids" class="apple-button primary">🎠 아이와 뭐하지</router-link>
          <router-link to="/food" class="apple-button secondary">🍱 오늘 뭐먹지</router-link>
          <router-link to="/cafe" class="apple-button secondary">☕ 키즈 가베</router-link>
          <router-link to="/health" class="apple-button secondary">🏥 병원/약국</router-link>
          <router-link to="/info" class="apple-button secondary">📰 정보 광장</router-link>
        </div>
      </div>
    </section>

    <section class="info-sections">
      <div class="info-grid">
        <div class="info-card">
          <div class="card-icon">🏘️</div>
          <h3>신도시 라이프스타일</h3>
          <p>동탄 신도시는 아이 키우기 가장 좋은 인프라를 갖추고 있습니다. 넓은 공원과 안전한 보행로, 그리고 다양한 교육 시설이 완비되어 있습니다.</p>
        </div>
        <div class="info-card">
          <div class="card-icon">🌿</div>
          <h3>자연과 함께하는 일상</h3>
          <p>동탄호수공원과 센트럴파크는 가족들의 휴식처입니다. 계절마다 변하는 아름다운 풍경 속에서 아이와 함께 잊지 못할 추억을 만들어보세요.</p>
        </div>
        <div class="info-card">
          <div class="card-icon">🍎</div>
          <h3>스마트한 건강 관리</h3>
          <p>갑자기 아이가 아플 때 당황하지 마세요. 우리 사이트에서는 동탄 내 달빛어린이병원과 휴일 운영 약국 정보를 실시간으로 제공합니다.</p>
        </div>
      </div>

      <div class="welcome-text">
        <h2>Welcome to Happy Dongtan</h2>
        <p>
          Happy Dongtan은 단순한 정보 나열을 넘어, 동탄에 거주하는 부모님들의 실제 목소리를 담고자 노력합니다. 
          매주 업데이트되는 맛집 리스트와 키즈카페 정보를 통해 여러분의 주말 고민을 덜어드립니다. 
          지금 바로 다양한 카테고리를 탐색하고 동탄의 매력을 발견해보세요!
        </p>
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
  margin-top: -48px;
}

.hero-full {
  position: relative;
  height: 100vh;
  min-height: 600px;
  background-image: url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
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

.info-sections {
  max-width: 1024px;
  margin: 0 auto;
  padding: 80px 22px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 80px;
}

.info-card {
  background: var(--card-bg);
  padding: 40px 30px;
  border-radius: 20px;
  text-align: center;
  transition: transform 0.3s;
}

.info-card:hover {
  transform: translateY(-10px);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.info-card h3 {
  font-size: 1.4rem;
  margin-bottom: 15px;
}

.info-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 0.95rem;
}

.welcome-text {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.welcome-text h2 {
  font-size: 2.5rem;
  margin-bottom: 25px;
}

.welcome-text p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-secondary);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 734px) {
  .main-title { font-size: 3rem; }
  .main-subtitle { font-size: 1.2rem; }
  .cta-group { flex-direction: column; align-items: center; }
  .apple-button { width: 100%; max-width: 280px; }
  .info-grid { grid-template-columns: 1fr; }
  .welcome-text h2 { font-size: 1.8rem; }
}
</style>
