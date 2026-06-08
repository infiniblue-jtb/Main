<template>
  <div class="md-home">
    <!-- fixed rotating connection globe (home only) -->
    <div class="md-globe-layer">
      <ConnectionGlobe :speed="0.4" :style-name="globeStyle" />
    </div>

    <div class="md-wrap">

      <!-- HERO -->
      <section class="md-hero">
        <div class="md-kicker">37.2°N 127.1°E · 동탄, 대한민국</div>
        <h1 class="md-h1">동탄의 모든 것,<br><span class="glow">한 화면에.</span></h1>
        <p class="md-sub">아이와 함께하는 동탄 생활 — 맛집, 카페, 병원, 놀거리부터 이웃 소식까지. 실제 동탄 주민이 발품 팔아 검증한 정보만 한곳에 모았습니다.</p>
        <div class="md-cta-row">
          <router-link to="/kids" class="md-btn">동탄 둘러보기</router-link>
          <router-link to="/blog" class="md-btn ghost">블로그 보기 →</router-link>
        </div>
        <div class="md-chips">
          <router-link v-for="c in chips" :key="c.to" :to="c.to" class="md-chip">
            <span class="sym">{{ c.label }}</span>
            <span class="ch">{{ c.count }}</span>
          </router-link>
        </div>
        <div class="md-hint"><span class="ring"></span>지구본을 드래그</div>
      </section>

      <!-- CATEGORIES -->
      <section class="md-block solid">
        <div class="md-container">
          <div class="md-sec-head reveal">
            <span class="md-eyebrow">EVERYTHING DONGTAN</span>
            <h2>한 포털에 담은 동탄 생활.</h2>
            <p>집 앞 병원부터 오늘 저녁 맛집까지 — 동탄에서의 하루를 채우는 모든 정보를, 직접 사는 사람들이 매일 업데이트합니다.</p>
          </div>
          <div class="md-feat-grid">
            <router-link v-for="(cat, i) in categories" :key="cat.to" :to="cat.to" class="md-feature reveal">
              <div class="gi" v-html="cat.icon"></div>
              <div class="meta">{{ String(i + 1).padStart(2, '0') }} · {{ cat.name }}</div>
              <h3>{{ cat.name }}</h3>
              <p>{{ cat.desc }}</p>
            </router-link>
          </div>
        </div>
      </section>

      <!-- CONNECT band (globe shows through) -->
      <section class="md-block connect">
        <div class="md-container">
          <div class="md-connect-inner reveal">
            <span class="md-eyebrow">동탄에서 세계로</span>
            <h2 class="md-connect-h">작은 신도시, 무한한 연결.</h2>
            <p class="md-connect-p">지구본을 돌려보세요. 그 중심에는 동탄이 있습니다 — 도쿄·런던·뉴욕으로 이어지는 선처럼, 작은 동네의 일상도 세계와 닿아 있습니다.</p>
            <div class="md-stats">
              <div class="md-stat"><div class="n">{{ stats.posts }}<span class="u">+</span></div><div class="l">블로그 포스트</div></div>
              <div class="md-stat"><div class="n">{{ stats.cats }}</div><div class="l">정보 카테고리</div></div>
              <div class="md-stat"><div class="n">매일</div><div class="l">업데이트</div></div>
            </div>
          </div>
        </div>
      </section>

      <!-- LIVE BOARD -->
      <section class="md-block solid">
        <div class="md-container">
          <div class="md-preview">
            <div class="md-preview-copy reveal">
              <span class="md-eyebrow">WHY HAPPY DONGTAN</span>
              <h2 class="md-connect-h">광고 아닌, 직접 검증한 정보.</h2>
              <ul class="md-feat-list">
                <li><span></span><div><strong>로컬 에디터 직접 검증.</strong> 인플루언서 광고가 아니라, 실제 동탄 주민이 발품 팔아 확인했습니다.</div></li>
                <li><span></span><div><strong>카카오맵 연동.</strong> 모든 장소는 바로 위치 확인과 길찾기가 됩니다.</div></li>
                <li><span></span><div><strong>모바일 최적화.</strong> 외출 중에도 스마트폰으로 편하게 확인하세요.</div></li>
              </ul>
              <div class="md-cta-row"><router-link to="/blog" class="md-btn">최신 글 보기</router-link></div>
            </div>
            <div class="md-terminal reveal">
              <div class="term-bar"><span class="d"></span><span class="d"></span><span class="d"></span><span class="t">최근 블로그 · LIVE</span></div>
              <div class="term-body">
                <div class="row head"><span>게시글</span><span class="v">분류</span><span class="v">올라온 시간</span></div>
                <router-link
                  v-for="(p, i) in boardView"
                  :key="p.id || i"
                  to="/blog"
                  class="row"
                  :class="{ fresh: p._fresh }"
                >
                  <span class="s">{{ p.title }}</span>
                  <span class="v cat">{{ p.category || '소식' }}</span>
                  <span class="v age">{{ fmtAge(p.created_at) }}</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="md-block cta-band">
        <div class="md-container">
          <div class="md-cta-card reveal">
            <h2>동탄 소식, 매일 아침 받아보세요.</h2>
            <p>새로 검증한 맛집·카페·놀거리와 이웃 소식을 이메일로 한 번에.</p>
            <form class="md-signup" @submit.prevent="subscribe">
              <input type="email" v-model="email" placeholder="you@email.com" aria-label="이메일" />
              <button class="md-btn" type="submit">{{ subscribed ? '신청 완료 ✓' : '구독하기' }}</button>
            </form>
            <div class="md-cta-note">언제든 구독 해지 · 스팸 없음</div>
          </div>
        </div>
      </section>

    </div>

    <!-- globe style switcher -->
    <button class="md-ctrl-toggle" :class="{ open: panelOpen }" @click="panelOpen = !panelOpen" aria-label="지구본 설정">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 6.8 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 6.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>
    </button>
    <div class="md-panel" :class="{ open: panelOpen }">
      <h4>지구본 스타일</h4>
      <div class="md-seg">
        <button v-for="s in styles" :key="s.id" :class="{ on: globeStyle === s.id }" @click="globeStyle = s.id">{{ s.label }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import ConnectionGlobe from '@/components/ConnectionGlobe.vue';

const API = 'https://dongtan-api.infiniblue.workers.dev/api/posts';

const CATEGORIES = [
  { name: '생활정보', to: '/kids',   desc: '동탄 신도시 정착에 필요한 행정·교육·생활 팁을 모았습니다.', match: ['생활', '정보', 'life'],
    icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 16 L18 6 L30 16"/><rect x="9" y="16" width="18" height="13" rx="1.5"/><rect x="15" y="21" width="6" height="8"/></svg>' },
  { name: '맛집', to: '/food', desc: '아이와 함께 가기 좋은 동탄 맛집만 골라 큐레이션했습니다.', match: ['맛집', '음식', 'food', '식당'],
    icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 5 V15 M8 5 V11 M14 5 V11 M11 15 V31"/><path d="M24 5 C21 7 21 14 24 16 V31"/></svg>' },
  { name: '카페', to: '/cafe', desc: '분위기 좋고 키즈존 있는 동탄 카페를 한눈에 모았습니다.', match: ['카페', 'cafe', '커피'],
    icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 14 H24 V21 A6 6 0 0 1 18 27 H13 A6 6 0 0 1 7 21 Z"/><path d="M24 16 H28 A3 3 0 0 1 28 22 H24"/><path d="M12 6 V10 M17 6 V10"/></svg>' },
  { name: '병원·약국', to: '/health', desc: '달빛어린이병원과 야간 약국까지, 급할 때 찾는 정보.', match: ['병원', '약국', 'health', '의료'],
    icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6" y="9" width="24" height="20" rx="2"/><path d="M18 14 V24 M13 19 H23"/></svg>' },
  { name: '놀거리', to: '/fun', desc: '키즈카페부터 야외 공원까지, 주말 나들이 코스를 추천합니다.', match: ['놀거리', '놀이', 'fun', '키즈'],
    icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="12" width="26" height="13" rx="6.5"/><path d="M12 18 H16 M14 16 V20"/><circle cx="23" cy="17" r="1.4" fill="currentColor"/><circle cx="26" cy="20" r="1.4" fill="currentColor"/></svg>' },
  { name: '자유게시판', to: '/board', desc: '이웃과 동네 소식을 나누고 궁금증을 함께 풀어요.', match: ['게시판', 'board', '자유'],
    icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 8 H30 V23 H17 L11 28 V23 H6 Z"/><path d="M11 14 H25 M11 18 H21"/></svg>' },
];

const FALLBACK = [
  { id: 'f1', title: '동탄2 신상 키즈카페 다녀온 후기 (주차 꿀팁)', category: '놀거리', created_at: Date.now() - 6e5 },
  { id: 'f2', title: '달빛어린이병원 야간 진료 대기시간 정리', category: '병원', created_at: Date.now() - 36e5 },
  { id: 'f3', title: '레이크파크 산책로 따라 카페 12곳 모음', category: '카페', created_at: Date.now() - 72e5 },
  { id: 'f4', title: '아이랑 가기 좋은 동탄 고깃집 추천', category: '맛집', created_at: Date.now() - 9e6 },
  { id: 'f5', title: 'GTX 개통 후 서울 출퇴근 실제 시간 공유', category: '교통', created_at: Date.now() - 13e6 },
  { id: 'f6', title: '주말 플리마켓 셀러 모집 (이번 토요일)', category: '이벤트', created_at: Date.now() - 18e6 },
];

export default {
  name: 'HomeView',
  components: { ConnectionGlobe },
  setup() {
    const posts = ref([]);
    const email = ref('');
    const subscribed = ref(false);
    const panelOpen = ref(false);
    const globeStyle = ref('wireframe');
    const boardOffset = ref(0);
    let rotateTimer = null, io = null;

    const styles = [
      { id: 'wireframe', label: 'WIRE' },
      { id: 'constellation', label: 'STARS' },
      { id: 'aurora', label: 'AURORA' },
    ];

    // chips: real per-category post counts (fallback to '·')
    const chips = computed(() => {
      const src = posts.value.length ? posts.value : [];
      return CATEGORIES.slice(0, 5).map((cat) => {
        const n = src.filter((p) => matchCat(p.category, cat)).length;
        return { label: cat.name, to: cat.to, count: src.length ? `${n}` : '·' };
      });
    });

    const categories = CATEGORIES;

    const stats = reactive({ posts: '340', cats: CATEGORIES.length });

    const matchCat = (c, cat) => {
      if (!c) return false;
      const s = String(c).toLowerCase();
      return cat.match.some((m) => s.includes(String(m).toLowerCase()));
    };

    // rotating window of recent posts for the live board
    const boardView = computed(() => {
      const src = posts.value.length ? posts.value : FALLBACK;
      const n = Math.min(6, src.length);
      const out = [];
      for (let i = 0; i < n; i++) out.push(src[(boardOffset.value + i) % src.length]);
      return out;
    });

    const fmtAge = (t) => {
      if (!t) return '';
      const ms = Date.now() - new Date(t).getTime();
      const m = Math.floor(ms / 60000);
      if (m < 1) return '방금';
      if (m < 60) return m + '분 전';
      const h = Math.floor(m / 60);
      if (h < 24) return h + '시간 전';
      const d = Math.floor(h / 24);
      return d + '일 전';
    };

    const subscribe = () => { if (email.value) { subscribed.value = true; } };

    onMounted(async () => {
      // reveal-on-scroll
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.14 });
      document.querySelectorAll('.reveal').forEach((el, i) => {
        el.style.transitionDelay = (Math.min(i, 5) * 0.06) + 's';
        io.observe(el);
      });

      // live data
      try {
        const res = await fetch(API);
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          posts.value = data;
          stats.posts = data.length >= 10 ? Math.floor(data.length / 10) * 10 + '' : data.length + '';
          const cats = new Set();
          data.forEach((p) => { if (p.category) cats.add(p.category); });
          stats.cats = Math.max(CATEGORIES.length, cats.size);
        }
      } catch (e) { /* keep fallback */ }

      // gently rotate the board window
      rotateTimer = setInterval(() => {
        const src = posts.value.length ? posts.value : FALLBACK;
        if (src.length > 6) boardOffset.value = (boardOffset.value + 1) % src.length;
      }, 3200);
    });

    onUnmounted(() => {
      if (rotateTimer) clearInterval(rotateTimer);
      if (io) io.disconnect();
    });

    return { posts, chips, categories, stats, boardView, fmtAge, email, subscribed, subscribe, panelOpen, globeStyle, styles };
  },
};
</script>

<style scoped>
/* fonts loaded globally via public/index.html */
.md-home {
  --md-ink: #eaf1ff;
  --md-muted: #9fb0cf;
  --md-faint: #5e6f90;
  --md-accent: #60a5fa;
  --md-accent-2: #7dd3fc;
  --md-line: rgba(120,150,200,0.14);
  --md-line-2: rgba(120,150,200,0.22);
  --md-disp: "Space Grotesk", "Outfit", system-ui, sans-serif;
  --md-mono: "IBM Plex Mono", ui-monospace, monospace;
  position: relative;
  background: #070b16;
  color: var(--md-ink);
  font-family: var(--md-disp);
  margin-top: calc(-1 * var(--nav-h));
  overflow-x: clip;
}

/* fixed globe behind everything (home only) */
.md-globe-layer { position: fixed; inset: 0; z-index: 0; }
.md-globe-layer::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(100deg, rgba(7,11,22,0.92) 0%, rgba(7,11,22,0.55) 38%, rgba(7,11,22,0) 64%);
}
.md-wrap { position: relative; z-index: 2; }

/* HERO */
.md-hero {
  position: relative;
  min-height: 100vh;
  display: flex; flex-direction: column; justify-content: center;
  max-width: 1100px; margin: 0 auto;
  padding: calc(var(--nav-h) + 60px) 28px 110px;
}
.md-kicker {
  font-family: var(--md-mono); font-size: 12px; letter-spacing: 0.22em; color: var(--md-accent-2);
  display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
}
.md-kicker::before { content: ""; width: 34px; height: 1px; background: linear-gradient(90deg, var(--md-accent-2), transparent); }
.md-h1 { font-size: clamp(38px, 6vw, 80px); font-weight: 600; line-height: 0.99; letter-spacing: -0.024em; margin: 0; }
.md-h1 .glow { color: var(--md-accent-2); }
.md-sub { margin: 26px 0 0; font-size: clamp(15px, 1.4vw, 18px); line-height: 1.55; color: var(--md-muted); max-width: 500px; }
.md-cta-row { margin-top: 36px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.md-btn {
  font-family: var(--md-disp); font-weight: 600; font-size: 14px; letter-spacing: 0.01em;
  padding: 14px 26px; border-radius: 999px; border: 0; cursor: pointer; text-decoration: none;
  background: var(--md-accent); color: #06101f; transition: transform .18s, box-shadow .18s, background .18s;
}
.md-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px -8px rgba(96,165,250,0.7); background: var(--md-accent-2); }
.md-btn.ghost { background: transparent; color: var(--md-ink); border: 1px solid var(--md-line-2); }
.md-btn.ghost:hover { background: rgba(255,255,255,0.04); box-shadow: none; }
.md-chips { margin-top: 48px; display: flex; gap: 12px; flex-wrap: wrap; }
.md-chip {
  display: flex; align-items: baseline; gap: 9px; text-decoration: none;
  padding: 11px 16px; border: 1px solid var(--md-line); border-radius: 10px;
  background: rgba(11,16,31,0.5); font-family: var(--md-mono); font-size: 12px; white-space: nowrap;
  transition: border-color .2s, transform .2s;
}
.md-chip:hover { border-color: var(--md-line-2); transform: translateY(-2px); }
.md-chip .sym { color: var(--md-ink); font-weight: 500; }
.md-chip .ch { color: var(--md-accent-2); }
.md-hint { margin-top: 40px; font-family: var(--md-mono); font-size: 11px; letter-spacing: 0.14em; color: var(--md-faint); display: flex; align-items: center; gap: 9px; }
.md-hint .ring { width: 16px; height: 16px; border-radius: 50%; border: 1px solid var(--md-faint); position: relative; }
.md-hint .ring::after { content: ""; position: absolute; inset: 4px; border-radius: 50%; background: var(--md-faint); animation: mddrag 2.6s ease-in-out infinite; }
@keyframes mddrag { 0%,100%{transform:translateX(-3px)} 50%{transform:translateX(3px)} }

/* sections */
.md-block { position: relative; padding: clamp(80px, 11vh, 140px) 0; }
.md-block.solid { background: linear-gradient(180deg, rgba(7,11,22,0.97), rgba(8,13,28,0.99)); }
.md-container { max-width: 1100px; margin: 0 auto; padding: 0 28px; }
.md-sec-head { max-width: 720px; margin-bottom: 54px; }
.md-eyebrow { font-family: var(--md-mono); font-size: 11px; letter-spacing: 0.24em; color: var(--md-accent-2); display: block; margin-bottom: 18px; }
.md-sec-head h2 { font-size: clamp(28px, 4vw, 48px); font-weight: 600; line-height: 1.05; letter-spacing: -0.02em; margin: 0; }
.md-sec-head p { margin: 18px 0 0; color: var(--md-muted); font-size: 17px; line-height: 1.55; max-width: 56ch; }

/* category cards */
.md-feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.md-feature {
  padding: 30px 28px 32px; border: 1px solid var(--md-line); border-radius: 16px;
  background: rgba(13,19,36,0.5); text-decoration: none; color: var(--md-ink);
  transition: transform .25s, border-color .25s, background .25s;
}
.md-feature:hover { transform: translateY(-4px); border-color: var(--md-line-2); background: rgba(17,25,46,0.7); }
.md-feature .gi { width: 42px; height: 42px; margin-bottom: 22px; display: flex; align-items: center; justify-content: center; color: var(--md-accent-2); }
.md-feature .meta { font-family: var(--md-mono); font-size: 10px; letter-spacing: 0.16em; color: var(--md-faint); margin-bottom: 10px; }
.md-feature h3 { font-size: 20px; font-weight: 600; letter-spacing: -0.01em; margin: 0; }
.md-feature p { margin: 10px 0 0; color: var(--md-muted); font-size: 14px; line-height: 1.55; }

/* connect band */
.md-block.connect { padding: clamp(90px,16vh,180px) 0; }
.md-connect-inner { max-width: 560px; }
.md-connect-h { font-size: clamp(28px,4vw,50px); font-weight: 600; line-height: 1.04; letter-spacing: -0.02em; margin: 0; }
.md-connect-p { margin: 18px 0 0; color: var(--md-muted); font-size: 17px; line-height: 1.55; max-width: 46ch; }
.md-stats { display: flex; gap: 48px; margin-top: 44px; flex-wrap: wrap; }
.md-stat .n { font-size: clamp(32px,4vw,48px); font-weight: 600; letter-spacing: -0.02em; white-space: nowrap; }
.md-stat .n .u { color: var(--md-accent-2); }
.md-stat .l { font-family: var(--md-mono); font-size: 11px; letter-spacing: 0.12em; color: var(--md-faint); margin-top: 6px; }

/* live board */
.md-preview { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
.md-feat-list { margin: 28px 0 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
.md-feat-list li { list-style: none; display: flex; gap: 13px; color: var(--md-muted); font-size: 15px; line-height: 1.5; }
.md-feat-list li > span { flex: none; width: 7px; height: 7px; margin-top: 8px; border-radius: 50%; background: var(--md-accent-2); box-shadow: 0 0 8px 1px rgba(125,211,252,0.6); }
.md-feat-list strong { color: var(--md-ink); font-weight: 600; }
.md-terminal { border: 1px solid var(--md-line-2); border-radius: 16px; overflow: hidden; background: linear-gradient(180deg, rgba(10,15,30,0.96), rgba(8,12,24,0.98)); box-shadow: 0 30px 80px -30px rgba(0,0,0,0.8); }
.term-bar { display: flex; align-items: center; gap: 8px; padding: 13px 16px; border-bottom: 1px solid var(--md-line); }
.term-bar .d { width: 10px; height: 10px; border-radius: 50%; background: rgba(120,150,200,0.3); }
.term-bar .t { margin-left: 10px; font-family: var(--md-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--md-faint); }
.term-body { padding: 12px 20px 20px; }
.row { display: grid; grid-template-columns: 2.4fr 0.8fr 0.9fr; gap: 12px; align-items: center; padding: 12px 6px; border-bottom: 1px solid rgba(120,150,200,0.07); font-family: var(--md-mono); font-size: 12px; text-decoration: none; transition: background .4s; }
.row.head { color: var(--md-faint); font-size: 10px; letter-spacing: 0.12em; border-bottom: 1px solid var(--md-line); }
.row .s { color: var(--md-ink); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color .3s; }
.row .v { color: var(--md-muted); text-align: right; }
.row .cat { color: var(--md-accent-2); }
.row:hover .s { color: var(--md-accent-2); }
.row.fresh { background: rgba(125,211,252,0.08); }

/* CTA */
.md-block.cta-band { padding: clamp(80px,12vh,150px) 0; }
.md-cta-card { border: 1px solid var(--md-line-2); border-radius: 26px; background: linear-gradient(155deg, rgba(17,25,46,0.85), rgba(9,14,28,0.92)); padding: clamp(40px,6vw,76px); text-align: center; position: relative; overflow: hidden; }
.md-cta-card::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(70% 120% at 50% -10%, rgba(96,165,250,0.18), transparent 60%); }
.md-cta-card h2 { font-size: clamp(28px,4vw,46px); font-weight: 600; letter-spacing: -0.02em; position: relative; margin: 0; }
.md-cta-card p { margin: 16px 0 0; color: var(--md-muted); font-size: 16px; position: relative; }
.md-signup { margin-top: 32px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; position: relative; }
.md-signup input { font-family: var(--md-disp); font-size: 14px; background: rgba(7,11,22,0.7); border: 1px solid var(--md-line-2); border-radius: 999px; padding: 14px 22px; color: var(--md-ink); width: 290px; max-width: 100%; outline: none; transition: border-color .2s; }
.md-signup input:focus { border-color: var(--md-accent); }
.md-signup input::placeholder { color: var(--md-faint); }
.md-cta-note { margin-top: 16px; font-family: var(--md-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--md-faint); position: relative; }

/* globe control */
.md-ctrl-toggle { position: fixed; right: 24px; bottom: 24px; z-index: 30; width: 46px; height: 46px; border-radius: 50%; background: rgba(13,19,36,0.8); backdrop-filter: blur(14px); border: 1px solid var(--md-line-2); color: var(--md-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: color .2s, transform .35s; }
.md-ctrl-toggle:hover { color: var(--md-ink); }
.md-ctrl-toggle.open { transform: rotate(60deg); color: var(--md-accent-2); }
.md-panel { position: fixed; right: 24px; bottom: 82px; z-index: 30; width: 220px; padding: 18px; background: rgba(11,16,31,0.92); backdrop-filter: blur(18px); border: 1px solid var(--md-line-2); border-radius: 16px; transform: translateY(12px) scale(0.97); opacity: 0; pointer-events: none; transition: opacity .22s, transform .22s; }
.md-panel.open { opacity: 1; transform: none; pointer-events: auto; }
.md-panel h4 { font-family: var(--md-mono); font-size: 10px; letter-spacing: 0.2em; color: var(--md-faint); font-weight: 500; margin: 0 0 14px; }
.md-seg { display: flex; gap: 4px; background: rgba(7,11,22,0.6); border-radius: 10px; padding: 4px; }
.md-seg button { flex: 1; font-family: var(--md-mono); font-size: 9.5px; letter-spacing: 0.06em; color: var(--md-muted); background: transparent; border: 0; padding: 9px 4px; border-radius: 7px; cursor: pointer; transition: .2s; }
.md-seg button:hover { color: var(--md-ink); }
.md-seg button.on { background: var(--md-accent-2); color: #06101f; font-weight: 600; }

/* reveal */
.reveal { opacity: 0; transform: translateY(26px); transition: opacity .7s cubic-bezier(.2,.6,.2,1), transform .7s cubic-bezier(.2,.6,.2,1); }
.reveal.in { opacity: 1; transform: none; }

@media (max-width: 880px) {
  .md-feat-grid { grid-template-columns: 1fr; max-width: 520px; }
  .md-preview { grid-template-columns: 1fr; gap: 32px; }
}
@media (max-width: 480px) {
  .md-hero { padding-left: 20px; padding-right: 20px; }
  .md-chips { gap: 8px; }
  .md-chip { padding: 9px 12px; font-size: 11px; }
  .md-stats { gap: 28px; }
}
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
  .md-hint .ring::after { animation: none; }
}
</style>
