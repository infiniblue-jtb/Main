<template>
  <div class="home">

    <!-- ══════════ HERO ══════════ -->
    <section class="home-hero">
      <div class="hero-bg">
        <div class="orb orb1"></div>
        <div class="orb orb2"></div>
        <div class="orb orb3"></div>
      </div>
      <div class="hero-body">
        <p class="hero-eyebrow">동탄에 오신 것을 환영합니다</p>
        <h1 class="hero-heading">Happy<br><em>Dongtan</em></h1>
        <p class="hero-desc">아이와 함께하는 동탄 생활의 모든 것 —<br>맛집, 카페, 병원, 놀거리를 한곳에서.</p>
        <div class="hero-ctas">
          <router-link to="/blog" class="cta-primary">블로그 보기</router-link>
          <router-link to="/kids" class="cta-secondary">생활정보 탐색 →</router-link>
        </div>
      </div>
    </section>

    <!-- ══════════ CATEGORY CARDS ══════════ -->
    <section class="cat-section">
      <div class="cat-grid">
        <router-link to="/kids" class="cat-card" style="--c1:#1d4ed8;--c2:#3b82f6">
          <span class="cat-icon">🏘️</span>
          <h3>생활정보</h3>
          <p>동탄 신도시 생활의 모든 팁</p>
          <span class="cat-arrow">→</span>
        </router-link>
        <router-link to="/food" class="cat-card" style="--c1:#b45309;--c2:#f59e0b">
          <span class="cat-icon">🍽️</span>
          <h3>맛집</h3>
          <p>아이와 가기 좋은 맛집 큐레이션</p>
          <span class="cat-arrow">→</span>
        </router-link>
        <router-link to="/cafe" class="cat-card" style="--c1:#065f46;--c2:#10b981">
          <span class="cat-icon">☕</span>
          <h3>카페</h3>
          <p>분위기 좋은 동탄 카페 모음</p>
          <span class="cat-arrow">→</span>
        </router-link>
        <router-link to="/health" class="cat-card" style="--c1:#7c3aed;--c2:#a78bfa">
          <span class="cat-icon">🏥</span>
          <h3>병원·약국</h3>
          <p>달빛어린이병원 & 야간 약국</p>
          <span class="cat-arrow">→</span>
        </router-link>
        <router-link to="/fun" class="cat-card" style="--c1:#be185d;--c2:#f472b6">
          <span class="cat-icon">🎮</span>
          <h3>놀거리</h3>
          <p>키즈카페부터 야외 공원까지</p>
          <span class="cat-arrow">→</span>
        </router-link>
        <router-link to="/board" class="cat-card" style="--c1:#0e7490;--c2:#22d3ee">
          <span class="cat-icon">💬</span>
          <h3>자유게시판</h3>
          <p>이웃과 자유롭게 소통해요</p>
          <span class="cat-arrow">→</span>
        </router-link>
      </div>
    </section>

    <!-- ══════════ FEATURE STRIP ══════════ -->
    <section class="feature-strip">
      <div class="feature-inner">
        <div class="feature-tag">WHY HAPPY DONGTAN</div>
        <h2 class="feature-heading">동탄 가족을 위해<br>직접 검증한 정보만</h2>
        <div class="feature-cols">
          <div class="feature-item">
            <div class="fi-icon">🔍</div>
            <h4>로컬 에디터 직접 검증</h4>
            <p>인플루언서 광고 아닌, 실제 동탄 주민이 발품을 팔아 확인한 정보만 담았습니다.</p>
          </div>
          <div class="feature-item">
            <div class="fi-icon">🗺️</div>
            <h4>카카오맵 연동</h4>
            <p>모든 장소는 카카오맵으로 바로 위치 확인과 길찾기가 가능합니다.</p>
          </div>
          <div class="feature-item">
            <div class="fi-icon">📱</div>
            <h4>모바일 최적화</h4>
            <p>외출 중에도 스마트폰으로 편리하게 정보를 확인할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════ BLOG PREVIEW ══════════ -->
    <section class="blog-strip" v-if="recentPosts.length > 0">
      <div class="strip-inner">
        <div class="strip-header">
          <div>
            <div class="feature-tag">BLOG</div>
            <h2 class="strip-heading">최근 블로그 포스트</h2>
          </div>
          <router-link to="/blog" class="view-all">전체 보기 →</router-link>
        </div>
        <div class="blog-preview-grid">
          <router-link
            to="/blog"
            v-for="post in recentPosts"
            :key="post.id"
            class="bp-card"
          >
            <div v-if="getThumb(post)" class="bp-img" :style="{ backgroundImage: `url(${getThumb(post)})` }"></div>
            <div v-else class="bp-img bp-img-empty">✦</div>
            <div class="bp-body">
              <span v-if="post.category" class="bp-cat">{{ post.category }}</span>
              <h4 class="bp-title">{{ post.title }}</h4>
              <p class="bp-date">{{ fmtDate(post.created_at) }}</p>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- ══════════ BOTTOM BANNER ══════════ -->
    <section class="bottom-banner">
      <div class="bb-inner">
        <h2>동탄 생활, 더 스마트하게</h2>
        <p>궁금한 점이 있다면 자유게시판에서 이웃과 함께 해결해보세요.</p>
        <router-link to="/board" class="cta-primary">자유게시판 가기</router-link>
      </div>
    </section>

  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'HomeView',
  setup() {
    const recentPosts = ref([]);

    const getThumb = (post) => {
      if (!post.content) return null;
      const m = post.content.match(/src="([^"]+)"/);
      return m ? m[1] : null;
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) : '';

    onMounted(async () => {
      try {
        const res = await fetch('https://dongtan-api.infiniblue.workers.dev/api/posts');
        const data = await res.json();
        recentPosts.value = data.slice(0, 3);
      } catch (e) { /* ignore */ }
    });

    return { recentPosts, getThumb, fmtDate };
  }
}
</script>

<style scoped>
.home { overflow-x: hidden; }

/* ── Hero ── */
.home-hero {
  min-height: 92vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #000;
  margin-top: -60px;
  padding-top: 60px;
}

.hero-bg { position: absolute; inset: 0; }
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
}
.orb1 { width: 600px; height: 600px; background: radial-gradient(circle, #1d4ed8, transparent); top: -100px; left: -100px; }
.orb2 { width: 500px; height: 500px; background: radial-gradient(circle, #7c3aed, transparent); bottom: -100px; right: -80px; }
.orb3 { width: 300px; height: 300px; background: radial-gradient(circle, #0e7490, transparent); top: 40%; left: 55%; }

.hero-body {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 60px 24px;
  max-width: 760px;
}

.hero-eyebrow {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  margin: 0 0 20px;
}

.hero-heading {
  font-size: clamp(3.5rem, 10vw, 7rem);
  font-weight: 800;
  color: #fff;
  line-height: 1;
  margin: 0 0 24px;
  letter-spacing: -0.03em;
}
.hero-heading em {
  font-style: normal;
  background: linear-gradient(135deg, #60a5fa, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 1.15rem;
  color: rgba(255,255,255,0.55);
  line-height: 1.7;
  margin: 0 0 40px;
}

.hero-ctas { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }
.cta-primary {
  background: #fff;
  color: #111;
  padding: 14px 32px;
  border-radius: 100px;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,255,255,0.2); }
.cta-secondary {
  color: rgba(255,255,255,0.7);
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.cta-secondary:hover { color: #fff; }

/* ── Category Grid ── */
.cat-section {
  padding: 80px 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.cat-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 32px 28px;
  border-radius: 24px;
  text-decoration: none;
  background: var(--card-bg);
  border: 1.5px solid rgba(0,0,0,0.06);
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  position: relative;
  overflow: hidden;
}

.cat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, color-mix(in srgb, var(--c1) 8%, transparent), color-mix(in srgb, var(--c2) 4%, transparent));
  opacity: 0;
  transition: opacity 0.3s;
}
.cat-card:hover::before { opacity: 1; }
.cat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.1); border-color: rgba(0,0,0,0.1); }

.cat-icon { font-size: 2rem; }
.cat-card h3 { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0; }
.cat-card p { font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.5; }
.cat-arrow {
  margin-top: auto;
  font-size: 1rem;
  color: var(--c1);
  font-weight: 600;
  transition: transform 0.2s;
}
.cat-card:hover .cat-arrow { transform: translateX(4px); }

/* ── Feature Strip ── */
.feature-strip {
  background: var(--card-bg);
  border-top: 1px solid rgba(0,0,0,0.06);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.feature-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 24px;
}

.feature-tag {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #3b82f6;
  margin-bottom: 12px;
}

.feature-heading {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 56px;
}

.feature-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.feature-item { }
.fi-icon { font-size: 2rem; margin-bottom: 14px; }
.feature-item h4 { font-size: 1rem; font-weight: 700; margin: 0 0 8px; }
.feature-item p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.65; margin: 0; }

/* ── Blog Strip ── */
.blog-strip { padding: 80px 24px; }
.strip-inner { max-width: 1100px; margin: 0 auto; }
.strip-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 32px; }
.strip-heading { font-size: 1.8rem; font-weight: 800; margin: 8px 0 0; letter-spacing: -0.02em; }
.view-all { font-size: 0.9rem; font-weight: 600; color: #3b82f6; text-decoration: none; }
.view-all:hover { text-decoration: underline; }

.blog-preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.bp-card {
  text-decoration: none;
  border-radius: 20px;
  overflow: hidden;
  background: var(--card-bg);
  border: 1.5px solid rgba(0,0,0,0.06);
  transition: all 0.25s;
}
.bp-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
.bp-img {
  height: 160px;
  background-size: cover;
  background-position: center;
  background-color: #e5e7eb;
}
.bp-img-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: linear-gradient(135deg, #dbeafe, #ede9fe);
  color: #3b82f6;
}
.bp-body { padding: 18px 20px; }
.bp-cat {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #3b82f6;
}
.bp-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 6px 0 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.bp-date { font-size: 0.78rem; color: var(--text-secondary); margin: 0; }

/* ── Bottom Banner ── */
.bottom-banner {
  background: linear-gradient(135deg, #0f172a, #1e3a5f);
  padding: 100px 24px;
  text-align: center;
}
.bb-inner { max-width: 600px; margin: 0 auto; }
.bottom-banner h2 { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; color: #fff; margin: 0 0 14px; letter-spacing: -0.02em; }
.bottom-banner p { font-size: 1.05rem; color: rgba(255,255,255,0.6); margin: 0 0 36px; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .cat-grid { grid-template-columns: repeat(2, 1fr); }
  .feature-cols { grid-template-columns: 1fr; gap: 28px; }
  .blog-preview-grid { grid-template-columns: 1fr; }
  .strip-header { flex-direction: column; align-items: flex-start; gap: 8px; }
}

@media (max-width: 560px) {
  .cat-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .cat-card { padding: 20px 16px; }
  .hero-ctas { flex-direction: column; }
}
</style>
