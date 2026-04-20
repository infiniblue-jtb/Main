<template>
  <div id="app-container">
    <div class="container">
      <div class="top-controls">
        <button class="lang-toggle" @click="toggleLang">{{ t.langBtn }}</button>
        <button class="theme-toggle" @click="toggleTheme">{{ t.themeBtn }}</button>
      </div>
      
      <h1>{{ t.title }}</h1>
      <p>{{ t.desc }}</p>

      <div class="criteria-box">
        <strong>{{ t.criteriaTitle }}</strong>
        <ul style="margin: 5px 0 0 20px; padding: 0;">
          <li>네이버/구글 평점 4.0 이상의 높은 사용자 만족도</li>
          <li>최근 1년 내 SNS 및 블로그 언급량 상위권</li>
          <li>아이들이 직접 체험 가능한 놀이/학습 시설 완비</li>
          <li>유모차 대여, 수유실 등 부모 편의시설 우수</li>
        </ul>
      </div>

      <div id="map" ref="mapContainer"></div>

      <div class="sections-container">
        <!-- 무료 섹션 -->
        <div class="section">
          <h2 class="free-header">{{ t.freeTitle }}</h2>
          <div id="freeList">
            <div v-for="spot in freePlaces" :key="spot.name" class="spot-card">
              <h3>{{ currentLang === 'ko' ? spot.name : spot.name_en }}</h3>
              <p class="spot-info"><strong>{{ t.addrLabel }}</strong> {{ spot.address }}</p>
              <p class="spot-info"><strong>{{ t.priceLabel }}</strong> <span style="color: #3498db">{{ currentLang === 'ko' ? spot.price : spot.price_en }}</span></p>
            </div>
          </div>
        </div>
        <!-- 유료 섹션 -->
        <div class="section">
          <h2 class="paid-header">{{ t.paidTitle }}</h2>
          <div id="paidList">
            <div v-for="spot in paidPlaces" :key="spot.name" class="spot-card">
              <h3>{{ currentLang === 'ko' ? spot.name : spot.name_en }}</h3>
              <p class="spot-info"><strong>{{ t.addrLabel }}</strong> {{ spot.address }}</p>
              <p class="spot-info"><strong>{{ t.priceLabel }}</strong> <span style="color: #e74c3c">{{ currentLang === 'ko' ? spot.price : spot.price_en }}</span></p>
            </div>
          </div>
        </div>
      </div>

      <!-- 제휴 문의 -->
      <div class="contact-form">
        <h2 style="text-align:center;">{{ t.contactTitle }}</h2>
        <form action="https://formspree.io/f/mrerkyqp" method="POST">
          <div style="margin-bottom:15px;">
            <label for="company" style="display:block; margin-bottom:5px; font-size:0.9rem;">{{ t.labelCompany }}</label>
            <input type="text" id="company" name="company" required class="form-input">
          </div>
          <div style="margin-bottom:15px;">
            <label for="email" style="display:block; margin-bottom:5px; font-size:0.9rem;">{{ t.labelEmail }}</label>
            <input type="email" id="email" name="_replyto" required class="form-input">
          </div>
          <div style="margin-bottom:15px;">
            <label for="message" style="display:block; margin-bottom:5px; font-size:0.9rem;">{{ t.labelMessage }}</label>
            <textarea id="message" name="message" required class="form-textarea"></textarea>
          </div>
          <input type="text" name="_gotcha" style="display:none">
          <button type="submit" class="submit-btn">{{ t.submitBtn }}</button>
        </form>
      </div>

      <div class="comments-section">
        <div id="disqus_thread"></div>
      </div>
    </div>
  </div>
</template>

<script>
/* global kakao */
import { ref, onMounted, computed } from 'vue';

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
    title: "👶 아이와 오늘 뭐하지?", desc: "서울/경기 아이 동반 추천 명소 TOP 20",
    criteriaTitle: "📊 선정 기준:",
    freeTitle: "💙 무료 명소 TOP 10", paidTitle: "❤️ 유료 명소 TOP 10",
    contactTitle: "🤝 제휴 및 장소 제보",
    labelCompany: "업체명/이름", labelEmail: "이메일 주소", labelMessage: "문의 및 제보 내용",
    submitBtn: "보내기", addrLabel: "주소: ", priceLabel: "금액: ",
    langBtn: "🌐 English", themeBtn: "🌓 모드 변경"
  },
  en: {
    title: "👶 What to do with Kids?", desc: "Top 20 Recommended Spots in Seoul/Gyeonggi",
    criteriaTitle: "📊 Criteria:",
    freeTitle: "💙 Free Spots TOP 10", paidTitle: "❤️ Paid Spots TOP 10",
    contactTitle: "🤝 Affiliate & Report",
    labelCompany: "Name/Company", labelEmail: "Email", labelMessage: "Message",
    submitBtn: "Submit", addrLabel: "Addr: ", priceLabel: "Price: ",
    langBtn: "🌐 한국어", themeBtn: "🌓 Toggle Theme"
  }
};

export default {
  name: 'App',
  setup() {
    const currentLang = ref(localStorage.getItem('lang') || 'ko');
    const theme = ref(localStorage.getItem('theme') || 'light');
    const map = ref(null);
    const markers = ref([]);

    const t = computed(() => TRANSLATIONS[currentLang.value]);

    const freePlaces = ref(FREE_PLACES);
    const paidPlaces = ref(PAID_PLACES);

    const toggleLang = () => {
      currentLang.value = currentLang.value === 'ko' ? 'en' : 'ko';
      localStorage.setItem('lang', currentLang.value);
      document.documentElement.lang = currentLang.value;
      renderMarkers();
    };

    const toggleTheme = () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', theme.value);
      document.documentElement.setAttribute('data-theme', theme.value);
    };

    const initMap = () => {
      if (typeof kakao === 'undefined') {
        setTimeout(initMap, 500);
        return;
      }
      kakao.maps.load(() => {
        const container = document.getElementById('map');
        if(!container) return;
        const options = {
          center: new kakao.maps.LatLng(37.5, 127.0),
          level: 10
        };
        map.value = new kakao.maps.Map(container, options);
        renderMarkers();
      });
    };

    const renderMarkers = () => {
      if (!map.value) return;
      markers.value.forEach(m => m.setMap(null));
      markers.value = [];
      const allPlaces = [...freePlaces.value, ...paidPlaces.value];
      allPlaces.forEach(spot => {
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(spot.lat, spot.lng),
          map: map.value
        });
        const name = currentLang.value === 'ko' ? spot.name : spot.name_en;
        const iw = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;color:#333;">${name}</div>`
        });
        kakao.maps.event.addListener(marker, 'click', () => iw.open(map.value, marker));
        markers.value.push(marker);
      });
    };

    onMounted(() => {
      document.documentElement.setAttribute('data-theme', theme.value);
      document.documentElement.lang = currentLang.value;
      initMap();
      
      // Disqus
      if (!document.getElementById('disqus-script')) {
        const d = document, s = d.createElement('script');
        s.id = 'disqus-script';
        s.src = 'https://infiniblue.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
      }
    });

    return {
      currentLang,
      theme,
      t,
      freePlaces,
      paidPlaces,
      toggleLang,
      toggleTheme
    };
  }
}
</script>

<style>
:root {
  --bg-gradient: linear-gradient(135deg, #fff9e6, #e6f7ff);
  --container-bg: rgba(255, 255, 255, 0.9);
  --text-color: #444;
  --card-bg: white;
  --input-bg: #f9f9f9;
  --input-border: #ddd;
  --label-color: #666;
  --accent-color: #ff9f43;
  --free-color: #3498db;
  --paid-color: #e74c3c;
}

[data-theme="dark"] {
  --bg-gradient: linear-gradient(135deg, #2c3e50, #000000);
  --container-bg: rgba(0, 0, 0, 0.7);
  --text-color: #eee;
  --card-bg: #333;
  --input-bg: #444;
  --input-border: #555;
  --label-color: #bbb;
  --accent-color: #f39c12;
}

body {
  margin: 0;
  font-family: 'Segoe UI', 'Apple SD Gothic Neo', sans-serif;
  background: var(--bg-gradient);
  color: var(--text-color);
  transition: background 0.3s, color 0.3s;
}

#app-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 20px 0;
}

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

.top-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.theme-toggle, .lang-toggle {
  background: none;
  border: 2px solid var(--text-color);
  color: var(--text-color);
  padding: 5px 12px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
  white-space: nowrap;
}

.theme-toggle:hover, .lang-toggle:hover {
  background: var(--text-color);
  color: var(--container-bg);
  transform: scale(1.05);
}

h1 { margin-bottom: 10px; color: var(--accent-color); }

.criteria-box {
  background: rgba(255,255,255,0.5);
  padding: 15px;
  border-radius: 15px;
  margin-bottom: 30px;
  font-size: 0.9rem;
  border: 1px dashed var(--accent-color);
  text-align: left;
}

#map {
  width: 100%;
  height: 450px;
  border-radius: 15px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  background: #eee;
}

.sections-container {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.section {
  flex: 1;
  min-width: 300px;
  text-align: left;
}

.section h2 {
  text-align: center;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.free-header { background: var(--free-color); color: white; }
.paid-header { background: var(--paid-color); color: white; }

.spot-card {
  background: var(--card-bg);
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0,0,0,0.05);
  margin-bottom: 15px;
  transition: transform 0.2s;
  border: 1px solid var(--input-border);
}

.spot-card:hover { transform: translateY(-3px); }
.spot-card h3 { margin-top: 0; margin-bottom: 8px; font-size: 1.1rem; }
.spot-info { font-size: 0.85rem; margin-bottom: 4px; }

.contact-form {
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid var(--input-border);
  text-align: left;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-color);
  box-sizing: border-box;
}

.form-textarea {
  height: 100px;
}

.submit-btn {
  width: 100%; padding: 15px; border: none; border-radius: 25px;
  background: var(--accent-color); color: white; font-weight: bold;
  cursor: pointer; transition: 0.3s;
}

.comments-section {
  margin-top: 50px; padding-top: 30px; border-top: 1px solid var(--input-border);
}
</style>
