<template>
  <div class="apple-page">
    <header class="hero-section">
      <h1 class="hero-title">{{ t.title }}</h1>
      <p class="hero-subtitle">{{ t.desc }}</p>
    </header>

    <section class="map-section">
      <div class="glass-card map-container">
        <div id="map" ref="mapContainer"></div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">{{ t.freeTitle }}</h2>
      </div>
      <div class="bento-grid">
        <div v-for="spot in freePlaces" :key="spot.name" class="apple-card">
          <div class="card-content">
            <span class="card-tag free">{{ currentLang === 'ko' ? '무료' : 'Free' }}</span>
            <h3>{{ currentLang === 'ko' ? spot.name : spot.name_en }}</h3>
            <p class="address">{{ spot.address }}</p>
            <p class="price">{{ currentLang === 'ko' ? spot.price : spot.price_en }}</p>
          </div>
        </div>
      </div>

      <div class="section-header mt-80">
        <h2 class="section-title">{{ t.paidTitle }}</h2>
      </div>
      <div class="bento-grid">
        <div v-for="spot in paidPlaces" :key="spot.name" class="apple-card">
          <div class="card-content">
            <span class="card-tag paid">{{ currentLang === 'ko' ? '유료' : 'Paid' }}</span>
            <h3>{{ currentLang === 'ko' ? spot.name : spot.name_en }}</h3>
            <p class="address">{{ spot.address }}</p>
            <p class="price">{{ currentLang === 'ko' ? spot.price : spot.price_en }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
/* global kakao */
import { ref, onMounted, computed, inject, onUnmounted, watch } from 'vue';

import data from '../assets/data.json';

const TRANSLATIONS = {
  ko: {
    title: '아이와 뭐하지?',
    desc: '서울/경기 근교의 아이와 가기 좋은 장소들을 모았어요.',
    freeTitle: '부담 없는 무료 장소',
    paidTitle: '특별한 경험, 유료 장소'
  },
  en: {
    title: 'Where to go with Kids?',
    desc: 'Best places for kids around Seoul & Gyeonggi.',
    freeTitle: 'Free Admission',
    paidTitle: 'Paid Experience'
  }
};

export default {
  name: 'KidsView',
  setup() {
    const currentLang = inject('currentLang', ref('ko'));
    const theme = inject('theme', ref('light'));
    const map = ref(null);
    const markers = ref([]);
    const t = computed(() => {
      const lang = currentLang.value || 'ko';
      const trans = TRANSLATIONS[lang] || TRANSLATIONS['ko'];
      return {
        title: trans.title || '',
        desc: trans.desc || '',
        freeTitle: trans.freeTitle || '',
        paidTitle: trans.paidTitle || ''
      };
    });

    const freePlaces = ref(data?.kids?.free || data?.free_places || []);
    const paidPlaces = ref(data?.kids?.paid || data?.paid_places || []);

    const initMap = () => {
      if (typeof kakao === 'undefined') {
        setTimeout(initMap, 500);
        return;
      }
      kakao.maps.load(() => {
        const container = document.getElementById('map');
        if(!container) return;
        const options = { center: new kakao.maps.LatLng(37.197, 127.085), level: 7 };
        map.value = new kakao.maps.Map(container, options);
        renderMarkers();
      });
    };

    const renderMarkers = () => {
      if (!map.value) return;
      markers.value.forEach(m => m.setMap(null));
      markers.value = [];
      [...freePlaces.value, ...paidPlaces.value].forEach(spot => {
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(spot.lat, spot.lng),
          map: map.value
        });
        const name = currentLang.value === 'ko' ? spot.name : spot.name_en;
        const iw = new kakao.maps.InfoWindow({ content: `<div style="padding:5px;font-size:12px;color:#333;border:none;">${name}</div>` });
        kakao.maps.event.addListener(marker, 'click', () => iw.open(map.value, marker));
        markers.value.push(marker);
      });
    };

    onMounted(() => {
      initMap();
      window.addEventListener('lang-changed', renderMarkers);
    });

    onUnmounted(() => {
      window.removeEventListener('lang-changed', renderMarkers);
    });

    watch(currentLang, () => renderMarkers());

    return { currentLang, theme, t, freePlaces, paidPlaces };
  }
}
</script>

<style scoped>
.apple-page {
  padding-bottom: 100px;
}

.hero-section {
  padding: 80px 22px 40px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  margin-bottom: 12px;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--text-secondary);
  font-weight: 400;
}

.map-section {
  max-width: 1024px;
  margin: 0 auto 80px;
  padding: 0 22px;
}

.glass-card {
  background: var(--card-bg);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

#map {
  width: 100%;
  height: 500px;
  filter: grayscale(0.2);
}

.content-section {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 22px;
}

.section-header {
  margin-bottom: 30px;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
}

.mt-80 { margin-top: 80px; }

.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.apple-card {
  background: var(--card-bg);
  border-radius: 22px;
  padding: 30px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 200px;
  border: 1px solid transparent;
}

.apple-card:hover {
  transform: scale(1.02);
  border: 1px solid var(--accent);
}

.card-tag {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 12px;
  display: block;
}

.card-tag.free { color: var(--accent); }
.card-tag.paid { color: #ff3b30; }

.apple-card h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.address {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.price {
  font-size: 0.9rem;
  font-weight: 600;
}

@media (max-width: 734px) {
  .hero-title { font-size: 2.5rem; }
  .hero-subtitle { font-size: 1.2rem; }
  .bento-grid { grid-template-columns: 1fr; }
}
</style>
