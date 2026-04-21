<template>
  <div class="container">
    <h1>{{ t.title }}</h1>
    <p>{{ t.desc }}</p>

    <div class="criteria-box">
      <strong>{{ t.criteriaTitle }}</strong>
      <ul style="margin: 5px 0 0 20px; padding: 0;">
        <li>아기의자 및 유아용 식기 완비 여부</li>
        <li>자극적이지 않고 영양가 높은 어린이 메뉴 보유</li>
        <li>유모차 이동이 편리한 넓은 공간 및 쾌적한 환경</li>
        <li>가족 단위 방문객의 실제 리뷰 및 평점 분석</li>
      </ul>
    </div>

    <div id="map" ref="mapContainer"></div>

    <div class="sections-container">
      <!-- 아침 -->
      <div class="section">
        <h2 class="breakfast-header">{{ t.breakfastTitle }}</h2>
        <div class="food-list">
          <div v-for="item in breakfastItems" :key="item.name" class="spot-card">
            <h3>{{ currentLang === 'ko' ? item.name : item.name_en }}</h3>
            <p class="spot-info"><strong>{{ t.addrLabel }}</strong> {{ item.address }}</p>
            <p class="spot-info"><strong>{{ t.menuLabel }}</strong> {{ currentLang === 'ko' ? item.menu : item.menu_en }}</p>
          </div>
        </div>
      </div>
      <!-- 점심 -->
      <div class="section">
        <h2 class="lunch-header">{{ t.lunchTitle }}</h2>
        <div class="food-list">
          <div v-for="item in lunchItems" :key="item.name" class="spot-card">
            <h3>{{ currentLang === 'ko' ? item.name : item.name_en }}</h3>
            <p class="spot-info"><strong>{{ t.addrLabel }}</strong> {{ item.address }}</p>
            <p class="spot-info"><strong>{{ t.menuLabel }}</strong> {{ currentLang === 'ko' ? item.menu : item.menu_en }}</p>
          </div>
        </div>
      </div>
      <!-- 저녁 -->
      <div class="section">
        <h2 class="dinner-header">{{ t.dinnerTitle }}</h2>
        <div class="food-list">
          <div v-for="item in dinnerItems" :key="item.name" class="spot-card">
            <h3>{{ currentLang === 'ko' ? item.name : item.name_en }}</h3>
            <p class="spot-info"><strong>{{ t.addrLabel }}</strong> {{ item.address }}</p>
            <p class="spot-info"><strong>{{ t.menuLabel }}</strong> {{ currentLang === 'ko' ? item.menu : item.menu_en }}</p>
          </div>
        </div>
      </div>
    </div>
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
    title: "🍕 오늘 뭐먹지?", desc: "아이와 함께 즐기는 건강하고 맛있는 한 끼",
    criteriaTitle: "📊 선정 기준:",
    breakfastTitle: "☀️ 아침 추천 (08:00~10:00)",
    lunchTitle: "🕛 점심 추천 (12:00~14:00)",
    dinnerTitle: "🌙 저녁 추천 (18:00~20:00)",
    addrLabel: "위치: ", menuLabel: "추천 메뉴: "
  },
  en: {
    title: "🍕 What to Eat Today?", desc: "Healthy and delicious meals for you and your kids",
    criteriaTitle: "📊 Criteria:",
    breakfastTitle: "☀️ Breakfast (08:00~10:00)",
    lunchTitle: "🕛 Lunch (12:00~14:00)",
    dinnerTitle: "🌙 Dinner (18:00~20:00)",
    addrLabel: "Loc: ", menuLabel: "Recommended: "
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
        const iw = new kakao.maps.InfoWindow({ content: `<div style="padding:5px;font-size:12px;color:#333;">${name}</div>` });
        kakao.maps.event.addListener(marker, 'click', () => iw.open(map.value, marker));
        markers.value.push(marker);
      });
    };

    const handleLangChange = () => {
      renderMarkers();
    };

    onMounted(() => {
      initMap();
      window.addEventListener('lang-changed', handleLangChange);
    });

    onUnmounted(() => {
      window.removeEventListener('lang-changed', handleLangChange);
    });

    watch(currentLang, () => {
        renderMarkers();
    });

    return { currentLang, theme, t, breakfastItems, lunchItems, dinnerItems };
  }
}
</script>

<style scoped>
.container {
  position: relative;
  text-align: center;
  background: var(--container-bg);
  padding: 40px 20px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  width: 95%;
  max-width: 1000px;
  margin: 0 auto;
  transition: background 0.3s;
}
h1 { margin-bottom: 10px; color: var(--accent-color); }
.criteria-box {
  background: rgba(255,255,255,0.5); padding: 15px; border-radius: 15px; margin-bottom: 30px;
  font-size: 0.9rem; border: 1px dashed var(--accent-color); text-align: left;
}
#map { width: 100%; height: 450px; border-radius: 15px; margin-bottom: 30px; background: #eee; }
.sections-container { display: flex; gap: 20px; flex-wrap: wrap; }
.section { flex: 1; min-width: 300px; text-align: left; }
.section h2 { text-align: center; padding: 10px; border-radius: 10px; margin-bottom: 20px; font-size: 1.1rem; }
.breakfast-header { background: #ff9f43; color: white; }
.lunch-header { background: #ee5253; color: white; }
.dinner-header { background: #10ac84; color: white; }
.spot-card {
  background: var(--card-bg); padding: 15px; border-radius: 12px; margin-bottom: 15px;
  border: 1px solid var(--input-border); transition: transform 0.2s;
}
.spot-card:hover { transform: translateY(-3px); }
.spot-info { font-size: 0.85rem; margin-bottom: 4px; }
</style>