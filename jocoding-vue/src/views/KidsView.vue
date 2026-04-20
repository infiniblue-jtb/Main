<template>
  <div class="luxury-container">
    <header class="hero-section">
      <div class="hero-content">
        <span class="sub-title">EXPLORE WITH KIDS</span>
        <h1 class="main-title">{{ t.title }}</h1>
        <p class="hero-desc">{{ t.desc }}</p>
      </div>
    </header>

    <section class="content-section">
      <div class="criteria-luxury">
        <div class="criteria-header">
          <span class="dot"></span>
          <h2>{{ t.criteriaTitle }}</h2>
        </div>
        <ul class="luxury-list">
          <li>네이버/구글 평점 4.0 이상의 높은 사용자 만족도</li>
          <li>최근 1년 내 SNS 및 블로그 언급량 상위권</li>
          <li>아이들이 직접 체험 가능한 놀이/학습 시설 완비</li>
          <li>유모차 대여, 수유실 등 부모 편의시설 우수</li>
        </ul>
      </div>

      <div class="map-wrapper">
        <div id="map" ref="mapContainer"></div>
      </div>

      <div class="grid-container">
        <!-- 무료 섹션 -->
        <div class="luxury-column">
          <div class="column-header free">
            <span>01</span>
            <h2>{{ t.freeTitle }}</h2>
          </div>
          <div class="spot-grid">
            <div v-for="spot in freePlaces" :key="spot.name" class="luxury-card">
              <div class="card-inner">
                <span class="card-category">FREE</span>
                <h3>{{ currentLang === 'ko' ? spot.name : spot.name_en }}</h3>
                <p class="spot-addr">{{ spot.address }}</p>
                <div class="card-footer">
                  <span class="price-label">{{ currentLang === 'ko' ? spot.price : spot.price_en }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 유료 섹션 -->
        <div class="luxury-column">
          <div class="column-header paid">
            <span>02</span>
            <h2>{{ t.paidTitle }}</h2>
          </div>
          <div class="spot-grid">
            <div v-for="spot in paidPlaces" :key="spot.name" class="luxury-card">
              <div class="card-inner">
                <span class="card-category">PREMIUM</span>
                <h3>{{ currentLang === 'ko' ? spot.name : spot.name_en }}</h3>
                <p class="spot-addr">{{ spot.address }}</p>
                <div class="card-footer">
                  <span class="price-label highlighted">{{ currentLang === 'ko' ? spot.price : spot.price_en }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 제휴 문의 -->
    <section class="contact-section">
      <div class="contact-inner">
        <h2>{{ t.contactTitle }}</h2>
        <form action="https://formspree.io/f/mrerkyqp" method="POST" class="luxury-form">
          <div class="input-group">
            <input type="text" id="company" name="company" required placeholder=" ">
            <label for="company">{{ t.labelCompany }}</label>
          </div>
          <div class="input-group">
            <input type="email" id="email" name="_replyto" required placeholder=" ">
            <label for="email">{{ t.labelEmail }}</label>
          </div>
          <div class="input-group">
            <textarea id="message" name="message" required placeholder=" "></textarea>
            <label for="message">{{ t.labelMessage }}</label>
          </div>
          <button type="submit" class="luxury-submit">{{ t.submitBtn }}</button>
        </form>
      </div>
    </section>

    <div class="comments-section">
      <div id="disqus_thread"></div>
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
    title: "아이와 오늘 뭐하지?", desc: "서울/경기 아이 동반 추천 명소 TOP 20",
    criteriaTitle: "선정 기준",
    freeTitle: "무료 명소", paidTitle: "유료 명소",
    contactTitle: "제휴 및 장소 제보",
    labelCompany: "업체명/이름", labelEmail: "이메일 주소", labelMessage: "문의 및 제보 내용",
    submitBtn: "SEND MESSAGE", addrLabel: "주소: ", priceLabel: "금액: "
  },
  en: {
    title: "Where to go today?", desc: "Top 20 Recommended Spots for Kids",
    criteriaTitle: "Criteria",
    freeTitle: "Free Spots", paidTitle: "Premium Spots",
    contactTitle: "Affiliate & Report",
    labelCompany: "Name/Company", labelEmail: "Email", labelMessage: "Message",
    submitBtn: "SEND MESSAGE", addrLabel: "Addr: ", priceLabel: "Price: "
  }
};

export default {
  name: 'KidsView',
  setup() {
    const currentLang = ref(localStorage.getItem('lang') || 'ko');
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
          content: `<div style="padding:10px;font-size:12px;color:#333;font-family:'Noto Sans KR';">${name}</div>`
        });
        kakao.maps.event.addListener(marker, 'click', () => iw.open(map.value, marker));
        markers.value.push(marker);
      });
    };

    onMounted(() => {
      initMap();
      if (!document.getElementById('disqus-script')) {
        const d = document, s = d.createElement('script');
        s.id = 'disqus-script';
        s.src = 'https://infiniblue.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
      }
    });

    return { currentLang, t, freePlaces, paidPlaces };
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,700;1,400&family=Noto+Sans+KR:wght@300;400;700&display=swap');

.luxury-container {
  font-family: 'Noto Sans KR', sans-serif;
  color: #1a1a1a;
  background: #fff;
}

.hero-section {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #fcfcfc;
  border-bottom: 1px solid #eee;
}

.sub-title {
  font-family: 'Bodoni Moda', serif;
  letter-spacing: 0.3em;
  font-size: 0.8rem;
  color: #888;
  display: block;
  margin-bottom: 20px;
}

.main-title {
  font-family: 'Bodoni Moda', serif;
  font-size: 4rem;
  font-weight: 400;
  margin: 0;
  letter-spacing: -0.02em;
}

.hero-desc {
  font-size: 1.1rem;
  color: #666;
  margin-top: 20px;
  font-weight: 300;
}

.content-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 100px 40px;
}

.criteria-luxury {
  margin-bottom: 80px;
}

.criteria-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #1a1a1a;
  border-radius: 50%;
}

.criteria-header h2 {
  font-family: 'Bodoni Moda', serif;
  font-size: 1.8rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.luxury-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.luxury-list li {
  font-size: 0.95rem;
  color: #555;
  padding: 20px;
  border-left: 1px solid #ddd;
}

.map-wrapper {
  margin-bottom: 100px;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.05);
}

#map {
  width: 100%;
  height: 600px;
  filter: grayscale(0.2);
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
}

.column-header {
  display: flex;
  align-items: baseline;
  gap: 15px;
  margin-bottom: 40px;
  border-bottom: 2px solid #1a1a1a;
  padding-bottom: 10px;
}

.column-header span {
  font-family: 'Bodoni Moda', serif;
  font-size: 1.5rem;
  font-style: italic;
}

.column-header h2 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
}

.spot-grid {
  display: grid;
  gap: 30px;
}

.luxury-card {
  border: 1px solid #eee;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.luxury-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.08);
  border-color: #1a1a1a;
}

.card-inner {
  padding: 30px;
}

.card-category {
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  color: #999;
  display: block;
  margin-bottom: 15px;
}

.luxury-card h3 {
  font-size: 1.3rem;
  margin: 0 0 10px 0;
}

.spot-addr {
  font-size: 0.85rem;
  color: #777;
  line-height: 1.6;
}

.card-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f5f5f5;
}

.price-label {
  font-size: 0.85rem;
  color: #555;
}

.highlighted {
  font-weight: 700;
  color: #1a1a1a;
}

.contact-section {
  background: #1a1a1a;
  color: #fff;
  padding: 120px 40px;
}

.contact-inner {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.contact-inner h2 {
  font-family: 'Bodoni Moda', serif;
  font-size: 2.5rem;
  margin-bottom: 60px;
  letter-spacing: 0.05em;
}

.luxury-form {
  display: grid;
  gap: 40px;
}

.input-group {
  position: relative;
}

.input-group input, .input-group textarea {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid #444;
  padding: 10px 0;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

.input-group label {
  position: absolute;
  left: 0;
  top: 10px;
  color: #888;
  pointer-events: none;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label,
.input-group textarea:focus + label,
.input-group textarea:not(:placeholder-shown) + label {
  top: -20px;
  font-size: 0.75rem;
  color: #fff;
}

.input-group input:focus, .input-group textarea:focus {
  border-bottom-color: #fff;
}

.luxury-submit {
  background: #fff;
  color: #1a1a1a;
  border: none;
  padding: 20px;
  font-family: 'Bodoni Moda', serif;
  font-size: 1rem;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
}

.luxury-submit:hover {
  background: #1a1a1a;
  color: #fff;
  outline: 1px solid #fff;
}

@media (max-width: 900px) {
  .grid-container { grid-template-columns: 1fr; }
  .main-title { font-size: 2.5rem; }
}
</style>
