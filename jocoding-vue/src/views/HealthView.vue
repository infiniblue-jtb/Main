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
        <h2 class="section-title">{{ t.hospitalTitle }}</h2>
      </div>
      <div class="bento-grid">
        <div v-for="item in hospitals" :key="item.name" class="apple-card clickable" @click="searchOnNaver(currentLang === 'ko' ? item.name : item.name_en)">
          <div class="card-content">
            <span class="card-tag emergency">{{ currentLang === 'ko' ? '병원' : 'Hospital' }}</span>
            <h3>{{ currentLang === 'ko' ? item.name : item.name_en }}</h3>
            <p class="address">{{ item.address }}</p>
            <p class="time">⏰ {{ currentLang === 'ko' ? item.time : item.time_en }}</p>
            <p class="info">ℹ️ {{ currentLang === 'ko' ? item.info : item.info_en }}</p>
          </div>
        </div>
      </div>

      <div class="section-header mt-80">
        <h2 class="section-title">{{ t.pharmacyTitle }}</h2>
      </div>
      <div class="bento-grid">
        <div v-for="item in pharmacies" :key="item.name" class="apple-card clickable" @click="searchOnNaver(currentLang === 'ko' ? item.name : item.name_en)">
          <div class="card-content">
            <span class="card-tag pharmacy">{{ currentLang === 'ko' ? '약국' : 'Pharmacy' }}</span>
            <h3>{{ currentLang === 'ko' ? item.name : item.name_en }}</h3>
            <p class="address">{{ item.address }}</p>
            <p class="time">⏰ {{ currentLang === 'ko' ? item.time : item.time_en }}</p>
            <p class="info">ℹ️ {{ currentLang === 'ko' ? item.info : item.info_en }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
/* global kakao */
import { ref, onMounted, computed, inject, watch } from 'vue';
import data from '../assets/data.json';

const TRANSLATIONS = {
  ko: {
    title: '야간/응급 의료 정보',
    desc: '동탄 내 달빛어린이병원 및 늦게까지 운영하는 약국 정보입니다.',
    hospitalTitle: '소아과/응급실',
    pharmacyTitle: '야간/휴일 약국'
  },
  en: {
    title: 'Emergency Medical Info',
    desc: 'Night-care pediatrics and late-night pharmacies in Dongtan.',
    hospitalTitle: 'Pediatrics/ER',
    pharmacyTitle: 'Night-care Pharmacies'
  }
};

export default {
  name: 'HealthView',
  setup() {
    const currentLang = inject('currentLang', ref('ko'));
    const map = ref(null);
    const markers = ref([]);
    const t = computed(() => TRANSLATIONS[currentLang.value] || TRANSLATIONS['ko']);

    const hospitals = ref(data.health.hospitals);
    const pharmacies = ref(data.health.pharmacies);

    const initMap = () => {
      if (typeof kakao === 'undefined') {
        setTimeout(initMap, 500);
        return;
      }
      kakao.maps.load(() => {
        const container = document.getElementById('map');
        if(!container) return;
        const options = { center: new kakao.maps.LatLng(37.205, 127.080), level: 7 };
        map.value = new kakao.maps.Map(container, options);
        renderMarkers();
      });
    };

    const renderMarkers = () => {
      if (!map.value) return;
      markers.value.forEach(m => m.setMap(null));
      markers.value = [];
      [...hospitals.value, ...pharmacies.value].forEach(item => {
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(item.lat, item.lng),
          map: map.value
        });
        const name = currentLang.value === 'ko' ? item.name : item.name_en;
        const iw = new kakao.maps.InfoWindow({ content: `<div style="padding:5px;font-size:12px;color:#333;">${name}</div>` });
        kakao.maps.event.addListener(marker, 'click', () => iw.open(map.value, marker));
        markers.value.push(marker);
      });
    };

    onMounted(() => {
      initMap();
    });

    watch(currentLang, () => renderMarkers());

    const searchOnNaver = (query) => {
      const url = `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
      window.open(url, '_blank');
    };

    return { currentLang, t, hospitals, pharmacies, searchOnNaver };
  }
}
</script>

<style scoped>
.apple-page { padding-bottom: 100px; }
.hero-section { padding: 80px 22px 40px; text-align: center; max-width: 800px; margin: 0 auto; }
.hero-title { font-size: 3.5rem; font-weight: 700; margin-bottom: 12px; }
.hero-subtitle { font-size: 1.5rem; color: var(--text-secondary); }
.map-section { max-width: 1024px; margin: 0 auto 80px; padding: 0 22px; }
.glass-card { background: var(--card-bg); border-radius: 28px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
#map { width: 100%; height: 500px; }
.content-section { max-width: 1024px; margin: 0 auto; padding: 0 22px; }
.section-header { margin-bottom: 30px; }
.section-title { font-size: 2rem; font-weight: 600; }
.mt-80 { margin-top: 80px; }
.bento-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.apple-card { background: var(--card-bg); border-radius: 22px; padding: 30px; transition: transform 0.4s; min-height: 200px; border: 1px solid transparent; }
.apple-card:hover { transform: scale(1.02); border: 1px solid var(--accent); }
.card-tag { font-size: 0.75rem; font-weight: 700; margin-bottom: 12px; display: block; }
.card-tag.emergency { color: #ff3b30; }
.card-tag.pharmacy { color: #34c759; }
.address, .time, .info { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 4px; }
.clickable { cursor: pointer; }
@media (max-width: 734px) {
  .hero-title { font-size: 2.5rem; }
  .bento-grid { grid-template-columns: 1fr; }
}
</style>
