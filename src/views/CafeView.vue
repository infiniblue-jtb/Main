<template>
  <div class="apple-page">
    <header class="hero-section">
      <h1 class="hero-title">{{ t.title }}</h1>
      <p class="hero-subtitle">{{ t.desc }}</p>
    </header>

    <section class="map-section">
      <div id="map" ref="mapContainer"></div>
    </section>

    <section class="content-section">
      <!-- Editor's Introduction Card -->
      <div class="glass-card intro-card mb-80">
        <div class="card-body">
          <span class="badge">Parents' Oasis</span>
          <h2>동탄의 키즈 카페와 가베, 육아의 쉼표가 되는 공간</h2>
          <p>
            동탄 신도시는 아이들의 창의력을 자극하는 다양한 '가베(Gabe)' 체험 공간과 테마형 키즈 카페가 밀집해 있습니다. 
            단순히 뛰어노는 공간을 넘어, 부모님들에게는 편안한 커피 한 잔의 여유를, 아이들에게는 안전한 탐색의 기회를 제공하는 곳들을 소개합니다.
          </p>
          <p>
            최근에는 <strong>노키즈존(No Kids Zone)</strong>이 늘어나는 추세지만, 이곳에 소개된 장소들은 모두 아이들을 환영하는 '웰컴 키즈' 존입니다. 
            특히 넓은 층고와 쾌적한 환기 시스템을 갖춘 대형 카페부터, 소수 정예로 운영되는 프라이빗 키즈룸까지 다양한 선택지를 확인해 보세요.
          </p>
          <div class="tips-grid">
            <div class="tip-item">
              <span class="icon">☕</span>
              <p>주말 키즈 카페는 입장 인원 제한이 있을 수 있으니 네이버 예약을 활용하세요.</p>
            </div>
            <div class="tip-item">
              <span class="icon">🧦</span>
              <p>대부분의 키즈 카페는 보호자와 아이 모두 양말 착용이 필수입니다. 미리 챙겨가시면 좋습니다.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="section-header">
        <h2 class="section-title">{{ t.listTitle }}</h2>
      </div>
      <div class="bento-grid">
        <div v-for="cafe in cafePlaces" :key="cafe.name" class="apple-card clickable" @click="focusOnMap(cafe)">
          <div class="card-content">
            <span class="card-tag cafe">{{ currentLang === 'ko' ? '카페' : 'Cafe' }}</span>
            <h3>{{ currentLang === 'ko' ? cafe.name : cafe.name_en }}</h3>
            <p class="address">{{ cafe.address }}</p>
            <p class="feature">{{ currentLang === 'ko' ? cafe.feature : cafe.feature_en }}</p>
            <p class="parking-info">🚗 {{ cafe.parking }}</p>
            <button class="naver-btn" @click.stop="searchOnNaver(currentLang === 'ko' ? cafe.name : cafe.name_en)">Naver Search</button>
          </div>
        </div>
      </div>

      <!-- Bottom Ad Unit -->
      <AdComponent slotId="9173007135" />
    </section>
  </div>
</template>

<script>
/* global kakao */
import { ref, onMounted, computed, inject, onUnmounted, watch, nextTick } from 'vue';
import data from '../assets/data.json';

const TRANSLATIONS = {
  ko: {
    title: '키즈 가베 (카페)',
    desc: '아이와 함께 편안하게 쉴 수 있는 카페를 추천해드려요.',
    listTitle: '추천 키즈 카페 & 가베'
  },
  en: {
    title: 'Kids Cafe',
    desc: 'Relaxing cafes to visit with your children.',
    listTitle: 'Recommended Kids Cafes'
  }
};

export default {
  name: 'CafeView',
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
        listTitle: trans.listTitle || ''
      };
    });

    const cafePlaces = ref(data?.cafe || []);

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

        // ✅ 추가: 컨테이너 크기 재계산
        map.value.relayout();

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
      markers.value.forEach(m => {
        if (m.iw) m.iw.close();
        m.setMap(null);
      });
      markers.value = [];
      
      const bounds = new kakao.maps.LatLngBounds();
      cafePlaces.value.forEach(cafe => {
        const position = new kakao.maps.LatLng(cafe.lat, cafe.lng);
        const marker = new kakao.maps.Marker({
          position: position,
          map: map.value
        });
        
        const name = currentLang.value === 'ko' ? cafe.name : cafe.name_en;
        const iw = new kakao.maps.InfoWindow({ 
          content: `<div style="padding:10px;font-size:14px;color:#333;font-weight:600;min-width:150px;">${name}</div>`,
          removable: true
        });
        
        kakao.maps.event.addListener(marker, 'click', () => {
          markers.value.forEach(m => m.iw.close());
          iw.open(map.value, marker);
        });
        
        marker.iw = iw;
        marker.itemName = cafe.name;
        markers.value.push(marker);
        bounds.extend(position);
      });

      if (cafePlaces.value.length > 0) {
        map.value.setBounds(bounds);
      }
    };

    const focusOnMap = (item) => {
      if (!map.value) return;
      const position = new kakao.maps.LatLng(item.lat, item.lng);
      map.value.setCenter(position);
      map.value.setLevel(4);
      
      const marker = markers.value.find(m => m.itemName === item.name);
      if (marker) {
        markers.value.forEach(m => m.iw.close());
        marker.iw.open(map.value, marker);
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    onMounted(async () => {
      await nextTick();
      setTimeout(initMap, 100);
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

    return { currentLang, theme, t, cafePlaces, searchOnNaver, focusOnMap };
  }
}
</script>

<style scoped>
.apple-page { padding-bottom: 100px; }
.clickable { cursor: pointer; transition: opacity 0.3s; }
.clickable:hover { opacity: 0.7; text-decoration: underline; }
.hero-section { padding: 80px 22px 40px; text-align: center; max-width: 800px; margin: 0 auto; }
.hero-title { font-size: 3.5rem; font-weight: 700; letter-spacing: -0.015em; margin-bottom: 12px; }
.hero-subtitle { font-size: 1.5rem; color: var(--text-secondary); font-weight: 400; }
.map-section { max-width: 1024px; margin: 0 auto 80px; padding: 0 22px; }
#map { width: 100%; height: 500px; border-radius: 22px; overflow: hidden; display: block; }
.content-section { max-width: 1024px; margin: 0 auto; padding: 0 22px; }
.section-header { margin-bottom: 30px; }
.section-title { font-size: 2rem; font-weight: 600; }
.bento-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.apple-card { background: var(--card-bg); border-radius: 22px; padding: 30px; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; justify-content: flex-end; min-height: 200px; border: 1px solid transparent; }
.apple-card:hover { transform: scale(1.02); border: 1px solid var(--accent); }
.card-tag { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; display: block; }
.card-tag.cafe { color: #ff9500; }
.apple-card h3 { font-size: 1.4rem; font-weight: 600; margin: 0 0 8px 0; }
.address { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 4px; }
.feature { font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; }
.parking-info { font-size: 0.85rem; color: var(--accent); font-weight: 500; }
.naver-btn {
  margin-top: 12px;
  background: #03c75a;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.naver-btn:hover { background: #02b351; }
@media (max-width: 734px) { .hero-title { font-size: 2.5rem; } .hero-subtitle { font-size: 1.2rem; } .bento-grid { grid-template-columns: 1fr; } }
</style>
