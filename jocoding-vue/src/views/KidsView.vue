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

const FREE_PLACES = [
  { name: "서울어린이대공원", name_en: "Seoul Children's Grand Park", lat: 37.548, lng: 127.074, address: "서울 광진구 능동로 216", price: "무료 (동물원/식물원)", price_en: "Free (Zoo/Botany)" },
  { name: "국립중앙박물관 어린이박물관", name_en: "National Museum Kids", lat: 37.523, lng: 126.979, address: "서울 용산구 서빙고로 137", price: "무료 (예약 필수)", price_en: "Free (Booking req.)" },
  { name: "전쟁기념관 어린이박물관", name_en: "War Memorial Kids", lat: 37.536, lng: 126.977, address: "서울 용산구 이태원로 29", price: "무료", price_en: "Free" },
  { name: "서울시립과학관", name_en: "Seoul Science Center", lat: 37.637, lng: 127.079, address: "서울 노원구 한글비석로 160", price: "무료 (상설전시)", price_en: "Free (Permanent)" },
  { name: "경기도박물관", name_en: "Gyeonggi Museum", lat: 37.270, lng: 127.110, address: "경기 용인시 기흥구 상갈로 6", price: "무료", price_en: "Free" },
  { name: "국립과천과학관 (야외)", name_en: "Gwacheon Science (Outdoor)", lat: 37.437, lng: 127.017, address: "경기 과천시 상하벌로 110", price: "야외전시장 무료", price_en: "Free (Outdoor)" },
  { name: "동대문디자인플라자(DDP) 잔디언덕", name_en: "DDP Grass Hill", lat: 37.566, lng: 127.009, address: "서울 중구 을지로 281", price: "무료", price_en: "Free" },
  { name: "인천나비공원", name_en: "Incheon Butterfly Park", lat: 37.519, lng: 126.697, address: "인천 부평구 평천로 26-47", price: "무료", price_en: "Free" },
  { name: "경기평화광장 북카페", name_en: "Gyeonggi Peace Square", lat: 37.753, lng: 127.070, address: "경기 의정부시 청사로 1", price: "무료", price_en: "Free" },
  { name: "고양어린이박물관 (주말무료)", name_en: "Goyang Kids (Weekend Free)", lat: 37.632, lng: 126.832, address: "경기 고양시 덕양구 화중로 26", price: "첫째/셋째 주말 무료", price_en: "1st/3rd Weekend Free" }
];

const PAID_PLACES = [
  { name: "에버랜드", name_en: "Everland", lat: 37.294, lng: 127.203, address: "경기 용인시 처인구 포곡읍 에버랜드로 199", price: "50,000원~", price_en: "50,000 KRW~" },
  { name: "롯데월드 어드벤처", name_en: "Lotte World Adventure", lat: 37.511, lng: 127.098, address: "서울 송파구 올림픽로 240", price: "47,000원~", price_en: "47,000 KRW~" },
  { name: "키자니아 서울", name_en: "KidZania Seoul", lat: 37.513, lng: 127.102, address: "서울 송파구 올림픽로 240", price: "40,000원~", price_en: "40,000 KRW~" },
  { name: "코엑스 아쿠아리움", name_en: "COEX Aquarium", lat: 37.513, lng: 127.059, address: "서울 강남구 영동대로 513", price: "30,000원~", price_en: "30,000 KRW~" },
  { name: "안성팜랜드", name_en: "Anseong Farmland", lat: 37.014, lng: 127.151, address: "경기 안성시 공도읍 대신두길 28", price: "12,000원~", price_en: "12,000 KRW~" },
  { name: "아쿠아플라넷 일산", name_en: "Aqua Planet Ilsan", lat: 37.664, lng: 126.758, address: "경기 고양시 일산서구 한류월드로 282", price: "29,000원~", price_en: "29,000 KRW~" },
  { name: "한국민속촌", name_en: "Korean Folk Village", lat: 37.258, lng: 127.116, address: "경기 용인시 기흥구 민속촌로 90", price: "30,000원~", price_en: "30,000 KRW~" },
  { name: "광명동굴", name_en: "Gwangmyeong Cave", lat: 37.426, lng: 126.866, address: "경기 광명시 가학로85번길 142", price: "6,000원~", price_en: "6,000 KRW~" },
  { name: "파주 하니랜드", name_en: "Paju Honey Land", lat: 37.765, lng: 126.837, address: "경기 파주시 조리읍 장곡로 218", price: "15,000원~", price_en: "15,000 KRW~" },
  { name: "일산 뽀로로파크", name_en: "Ilsan Pororo Park", lat: 37.665, lng: 126.753, address: "경기 고양시 일산서구 주엽로 80", price: "25,000원~", price_en: "25,000 KRW~" }
];

const TRANSLATIONS = {
  ko: {
    title: "아이와 오늘 뭐하지?", desc: "서울/경기 아이 동반 추천 명소 TOP 20",
    freeTitle: "무료 명소", paidTitle: "유료 명소"
  },
  en: {
    title: "Play with Kids", desc: "Top 20 Recommended Spots in Seoul/Gyeonggi",
    freeTitle: "Free Selection", paidTitle: "Paid Selection"
  }
};

export default {
  name: 'KidsView',
  setup() {
    const currentLang = inject('currentLang');
    const theme = inject('theme');
    const map = ref(null);
    const markers = ref([]);
    const t = computed(() => TRANSLATIONS[currentLang.value]);

    const freePlaces = ref(FREE_PLACES);
    const paidPlaces = ref(PAID_PLACES);

    const initMap = () => {
      if (typeof kakao === 'undefined') {
        setTimeout(initMap, 500);
        return;
      }
      kakao.maps.load(() => {
        const container = document.getElementById('map');
        if(!container) return;
        const options = { center: new kakao.maps.LatLng(37.5, 127.0), level: 10 };
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
