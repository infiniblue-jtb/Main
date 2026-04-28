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
      <!-- Editor's Introduction Card -->
      <div class="glass-card intro-card mb-80">
        <div class="card-body">
          <span class="badge">Local's Pick</span>
          <h2>아이와 함께하는 맛있는 동탄 미식 여행</h2>
          <p>
            동탄 신도시는 젊은 부부들이 많이 거주하는 특성상, 대부분의 식당이 아이 친화적인(Kid-friendly) 환경을 갖추고 있습니다. 
            하지만 그 중에서도 특히 <strong>아기 의자 구비 여부</strong>, <strong>유모차 진입 가능성</strong>, 그리고 <strong>자극적이지 않은 메뉴 구성</strong>을 기준으로 엄선한 리스트를 공유합니다.
          </p>
          <p>
            점심 시간에는 센트럴파크 인근의 브런치 카페나 쌀국수 전문점을 추천하며, 저녁에는 호수공원 근처의 한식 정식이나 이탈리안 레스토랑에서 여유로운 식사를 즐기실 수 있습니다. 
            식사 후에는 바로 인근 산책로를 이용할 수 있는 동선으로 구성했으니 참고해 보세요.
          </p>
          <div class="tips-grid">
            <div class="tip-item">
              <span class="icon">🍱</span>
              <p>대부분의 식당에 아기 의자가 준비되어 있지만, 주말에는 미리 전화로 확인하는 것이 좋습니다.</p>
            </div>
            <div class="tip-item">
              <span class="icon">🤱</span>
              <p>레이크꼬모나 롯데백화점 내 식당들은 수유실과 기저귀 교환대가 가까워 매우 편리합니다.</p>
            </div>
          </div>
        </div>
      </div>

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
              <p class="parking-info">🚗 {{ item.parking }}</p>
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
              <p class="parking-info">🚗 {{ item.parking }}</p>
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
              <p class="parking-info">🚗 {{ item.parking }}</p>
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
    breakfastTitle: '아침식사',
    lunchTitle: '점심식사',
    dinnerTitle: '저녁식사',
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

        // 내 위치 가져오기
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const locPosition = new kakao.maps.LatLng(lat, lng);
            
            // 내 위치 마커 표시
            const imageSize = new kakao.maps.Size(24, 24);
            const markerImage = new kakao.maps.MarkerImage('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', imageSize);
            new kakao.maps.Marker({
              map: map.value,
              position: locPosition,
              image: markerImage,
              title: "내 위치"
            });
            
            map.value.setCenter(locPosition);
          });
        }

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
.menu-desc { font-size: 0.95rem; font-weight: 400; line-height: 1.4; opacity: 0.9; margin-bottom: 8px; }
.parking-info { font-size: 0.85rem; color: var(--accent); font-weight: 500; }
@media (max-width: 734px) { .hero-title { font-size: 2.5rem; } .hero-subtitle { font-size: 1.2rem; } .bento-grid { grid-template-columns: 1fr; } }
</style>
