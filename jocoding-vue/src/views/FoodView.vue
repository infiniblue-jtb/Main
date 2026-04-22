<template>
  <div class="apple-page">
    <header class="hero-section">
      <h1 class="hero-title clickable" @click="searchOnNaver(t.title)">{{ t.title }}</h1>
      <p class="hero-subtitle">{{ t.desc }}</p>
    </header>

    <section class="map-section">
      <div class="glass-card map-container">
        <div id="map" ref="mapContainer"></div>
      </div>
    </section>

    <section class="content-section">
      <!-- 아침 -->
      <div class="time-block">
        <div class="section-header">
          <h2 class="section-title">{{ t.breakfastTitle }}</h2>
        </div>
        <div class="bento-grid">
          <div v-for="item in breakfastItems" :key="item.name" class="apple-card food-card clickable" @click="searchOnNaver(currentLang === 'ko' ? item.name : item.name_en)">
            <div class="card-content">
              <span class="card-tag morning">{{ currentLang === 'ko' ? '아침' : 'Breakfast' }}</span>
              <h3>{{ currentLang === 'ko' ? item.name : item.name_en }}</h3>
              <p class="address">{{ item.address }}</p>
              <p class="menu-desc">{{ currentLang === 'ko' ? item.menu : item.menu_en }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 점심 -->
      <div class="time-block mt-80">
        <div class="section-header">
          <h2 class="section-title">{{ t.lunchTitle }}</h2>
        </div>
        <div class="bento-grid">
          <div v-for="item in lunchItems" :key="item.name" class="apple-card food-card clickable" @click="searchOnNaver(currentLang === 'ko' ? item.name : item.name_en)">
            <div class="card-content">
              <span class="card-tag afternoon">{{ currentLang === 'ko' ? '점심' : 'Lunch' }}</span>
              <h3>{{ currentLang === 'ko' ? item.name : item.name_en }}</h3>
              <p class="address">{{ item.address }}</p>
              <p class="menu-desc">{{ currentLang === 'ko' ? item.menu : item.menu_en }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 저녁 -->
      <div class="time-block mt-80">
        <div class="section-header">
          <h2 class="section-title">{{ t.dinnerTitle }}</h2>
        </div>
        <div class="bento-grid">
          <div v-for="item in dinnerItems" :key="item.name" class="apple-card food-card clickable" @click="searchOnNaver(currentLang === 'ko' ? item.name : item.name_en)">
            <div class="card-content">
              <span class="card-tag evening">{{ currentLang === 'ko' ? '저녁' : 'Dinner' }}</span>
              <h3>{{ currentLang === 'ko' ? item.name : item.name_en }}</h3>
              <p class="address">{{ item.address }}</p>
              <p class="menu-desc">{{ currentLang === 'ko' ? item.menu : item.menu_en }}</p>
            </div>
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
    title: '오늘 뭐 먹지?',
    desc: '아이와 함께 가기 좋은 식당들을 시간대별로 추천해드려요.',
    breakfastTitle: '아침',
    lunchTitle: '점심',
    dinnerTitle: '저녁',
    mapTitle: '주변 식당 지도'
  },
  en: {
    title: 'What to Eat?',
    desc: 'Recommended restaurants for kids by meal time.',
    breakfastTitle: 'Breakfast',
    lunchTitle: 'Lunch',
    dinnerTitle: 'Dinner',
    mapTitle: 'Nearby Restaurants'
  }
};

export default {
  name: 'FoodView',
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
        breakfastTitle: trans.breakfastTitle || '',
        lunchTitle: trans.lunchTitle || '',
        dinnerTitle: trans.dinnerTitle || ''
      };
    });

    const breakfastItems = ref(data?.food?.breakfast || data?.meals?.breakfast || []);
    const lunchItems = ref(data?.food?.lunch || data?.meals?.lunch || []);
    const dinnerItems = ref(data?.food?.dinner || data?.meals?.dinner || []);

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
      [...breakfastItems.value, ...lunchItems.value, ...dinnerItems.value].forEach(item => {
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(item.lat, item.lng),
          map: map.value
        });
        const name = currentLang.value === 'ko' ? item.name : item.name_en;
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

    const searchOnNaver = (query) => {
      const url = `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
      window.open(url, '_blank');
    };

    return { currentLang, theme, t, breakfastItems, lunchItems, dinnerItems, searchOnNaver };
  }
}
</script>

<style scoped>
.apple-page { padding-bottom: 100px; }
.clickable {
  cursor: pointer;
  transition: opacity 0.3s;
}
.clickable:hover {
  opacity: 0.7;
  text-decoration: underline;
}
.hero-section { padding: 80px 22px 40px; text-align: center; max-width: 800px; margin: 0 auto; }
.hero-title { font-size: 3.5rem; font-weight: 700; letter-spacing: -0.015em; margin-bottom: 12px; }
.hero-subtitle { font-size: 1.5rem; color: var(--text-secondary); font-weight: 400; }
.map-section { max-width: 1024px; margin: 0 auto 80px; padding: 0 22px; }
.glass-card { background: var(--card-bg); border-radius: 28px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
#map { width: 100%; height: 500px; filter: grayscale(0.2); }
.content-section { max-width: 1024px; margin: 0 auto; padding: 0 22px; }
.section-header { margin-bottom: 30px; }
.section-title { font-size: 2rem; font-weight: 600; }
.mt-80 { margin-top: 80px; }
.bento-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.apple-card { background: var(--card-bg); border-radius: 22px; padding: 30px; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; justify-content: flex-end; min-height: 220px; border: 1px solid transparent; }
.apple-card:hover { transform: scale(1.02); border: 1px solid var(--accent); }
.card-tag { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; display: block; }
.card-tag.morning { color: #ff9500; }
.card-tag.afternoon { color: #ff3b30; }
.card-tag.evening { color: #34c759; }
.apple-card h3 { font-size: 1.4rem; font-weight: 600; margin: 0 0 8px 0; }
.address { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px; }
.menu-desc { font-size: 0.95rem; font-weight: 400; line-height: 1.4; opacity: 0.9; }
@media (max-width: 734px) { .hero-title { font-size: 2.5rem; } .hero-subtitle { font-size: 1.2rem; } .bento-grid { grid-template-columns: 1fr; } }
</style>
