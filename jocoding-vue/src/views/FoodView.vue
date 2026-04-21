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
      <!-- 아침 -->
      <div class="time-block">
        <div class="section-header">
          <h2 class="section-title">{{ t.breakfastTitle }}</h2>
        </div>
        <div class="bento-grid">
          <div v-for="item in breakfastItems" :key="item.name" class="apple-card food-card">
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
          <div v-for="item in lunchItems" :key="item.name" class="apple-card food-card">
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
          <div v-for="item in dinnerItems" :key="item.name" class="apple-card food-card">
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

const BREAKFAST_ITEMS = [
  { name: "죽이야기", name_en: "Juk Iyagi", lat: 37.5665, lng: 126.9780, address: "서울 중구 태평로1가", menu: "야채죽, 전복죽", menu_en: "Veggie Porridge, Abalone Porridge" },
  { name: "파리바게뜨 시그니처", name_en: "Paris Baguette Signature", lat: 37.5600, lng: 126.9800, address: "서울 중구 명동", menu: "샌드위치, 오므라이스", menu_en: "Sandwich, Omurice" },
  { name: "본죽", name_en: "Bonjuk", lat: 37.5700, lng: 126.9750, address: "서울 종로구 세종로", menu: "쇠고기야채죽", menu_en: "Beef Veggie Porridge" }
];

const LUNCH_ITEMS = [
  { name: "남산돈까스", name_en: "Namsan Cutlet", lat: 37.5550, lng: 126.9850, address: "서울 중구 남산동", menu: "왕돈까스, 치즈돈까스", menu_en: "King Cutlet, Cheese Cutlet" },
  { name: "미즈컨테이너", name_en: "Mies Container", lat: 37.4980, lng: 127.0270, address: "서울 강남구 역삼동", menu: "샐러드 스파게티, 베이컨 포테이토 피자", menu_en: "Salad Spaghetti, Bacon Potato Pizza" },
  { name: "서가앤쿡", name_en: "Seoga & Cook", lat: 37.5010, lng: 127.0250, address: "서울 서초구 서초동", menu: "목살 한상, 까르보나라", menu_en: "Pork Steak Hansang, Carbonara" }
];

const DINNER_ITEMS = [
  { name: "하남돼지집", name_en: "Hanam Pig", lat: 37.5100, lng: 127.0300, address: "서울 강남구 논현동", menu: "삼겹살, 목살 (직접 구워줌)", menu_en: "Grilled Pork Belly, Neck" },
  { name: "애슐리퀸즈", name_en: "Ashley Queens", lat: 37.5130, lng: 127.0580, address: "서울 강남구 삼성동", menu: "패밀리 뷔페", menu_en: "Family Buffet" },
  { name: "빕스(VIPS)", name_en: "VIPS", lat: 37.5150, lng: 127.0600, address: "서울 강남구 대치동", menu: "스테이크, 샐러드바", menu_en: "Steak, Salad Bar" }
];

const TRANSLATIONS = {
  ko: {
    title: "오늘 뭐먹지?", desc: "아이와 함께 즐기는 건강하고 맛있는 한 끼",
    breakfastTitle: "좋은 아침", lunchTitle: "맛있는 점심", dinnerTitle: "든든한 저녁"
  },
  en: {
    title: "What to Eat", desc: "Healthy and delicious meals for family",
    breakfastTitle: "Good Morning", lunchTitle: "Delicious Lunch", dinnerTitle: "Hearty Dinner"
  }
};

export default {
  name: 'FoodView',
  setup() {
    const currentLang = inject('currentLang');
    const theme = inject('theme');
    const map = ref(null);
    const markers = ref([]);
    const t = computed(() => TRANSLATIONS[currentLang.value]);

    const breakfastItems = ref(BREAKFAST_ITEMS);
    const lunchItems = ref(LUNCH_ITEMS);
    const dinnerItems = ref(DINNER_ITEMS);

    const initMap = () => {
      if (typeof kakao === 'undefined') {
        setTimeout(initMap, 500);
        return;
      }
      kakao.maps.load(() => {
        const container = document.getElementById('map');
        if(!container) return;
        const options = { center: new kakao.maps.LatLng(37.53, 127.02), level: 9 };
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

    return { currentLang, theme, t, breakfastItems, lunchItems, dinnerItems };
  }
}
</script>

<style scoped>
.apple-page { padding-bottom: 100px; }
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
