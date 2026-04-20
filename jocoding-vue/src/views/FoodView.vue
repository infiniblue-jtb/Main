<template>
  <div class="luxury-container">
    <header class="hero-section">
      <div class="hero-content">
        <span class="sub-title">GASTRONOMY FOR FAMILY</span>
        <h1 class="main-title">{{ currentLang === 'ko' ? '오늘 뭐 먹지?' : 'What to Eat?' }}</h1>
        <p class="hero-desc">{{ currentLang === 'ko' ? '엄선된 공간에서의 특별한 미식 경험' : 'Curated dining experiences for your special day' }}</p>
      </div>
    </header>

    <section class="content-section">
      <div class="food-luxury-grid">
        <div v-for="(category, index) in categories" :key="category.name" class="luxury-food-card" :class="{ 'reverse': index % 2 !== 0 }">
          <div class="food-image-wrapper">
             <div class="placeholder-img" :style="{ background: category.color }">
               <span class="category-number">0{{ index + 1 }}</span>
               <span class="large-emoji">{{ category.emoji }}</span>
             </div>
          </div>
          <div class="food-info-luxury">
            <span class="category-tag">{{ currentLang === 'ko' ? '추천 카테고리' : 'RECOMMENDED' }}</span>
            <h2>{{ currentLang === 'ko' ? category.name : category.name_en }}</h2>
            <p class="category-desc">{{ currentLang === 'ko' ? category.desc : category.desc_en }}</p>
            <div class="luxury-tags">
              <span v-for="tag in category.tags" :key="tag">#{{ tag }}</span>
            </div>
            <button class="discover-btn">DISCOVER MORE</button>
          </div>
        </div>
      </div>
    </section>

    <section class="philosophy-section">
      <div class="philosophy-content">
        <h2>{{ currentLang === 'ko' ? '엄격한 선정 기준' : 'Our Philosophy' }}</h2>
        <div class="philosophy-grid">
          <div class="phi-item">
            <h3>QUALITY</h3>
            <p>{{ currentLang === 'ko' ? '신선한 재료와 철저한 위생 관리' : 'Fresh ingredients and strict hygiene' }}</p>
          </div>
          <div class="phi-item">
            <h3>KIDS FRIENDLY</h3>
            <p>{{ currentLang === 'ko' ? '아이들을 위한 편의시설 완비' : 'Full facilities for children' }}</p>
          </div>
          <div class="phi-item">
            <h3>SPACE</h3>
            <p>{{ currentLang === 'ko' ? '여유로운 좌석 배치와 쾌적한 환경' : 'Spacious seating and pleasant environment' }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'FoodView',
  setup() {
    const currentLang = ref(localStorage.getItem('lang') || 'ko');
    
    const categories = [
      { 
        name: '돈까스 & 우동', name_en: 'Cutlet & Udon', emoji: '🍱', color: '#f9f3f0',
        desc: '바삭한 식감과 깊은 육수의 조화, 아이들이 가장 선호하는 메뉴입니다.', 
        desc_en: 'Perfect harmony of crispy texture and deep broth.',
        tags: ['아기의자', '어린이세트']
      },
      { 
        name: '프리미엄 한식', name_en: 'Premium Korean', emoji: '🐟', color: '#f0f4f9',
        desc: '정갈한 상차림과 영양 밸런스를 고려한 건강한 한 끼 식사.', 
        desc_en: 'Neat table setting and healthy meals with balanced nutrition.',
        tags: ['영양가득', '맵지않음']
      },
      { 
        name: '이탈리안 다이닝', name_en: 'Italian Dining', emoji: '🍝', color: '#f4f0f9',
        desc: '신선한 재료로 요리한 파스타와 화덕 피자를 즐겨보세요.', 
        desc_en: 'Enjoy pasta and wood-fired pizza cooked with fresh ingredients.',
        tags: ['가족외식', '분위기']
      }
    ];

    return { currentLang, categories };
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
  background: #fafafa;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 40px;
}

.food-luxury-grid {
  display: grid;
  gap: 150px;
}

.luxury-food-card {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 80px;
  align-items: center;
}

.luxury-food-card.reverse {
  grid-template-columns: 1fr 1.2fr;
}

.luxury-food-card.reverse .food-image-wrapper {
  order: 2;
}

.food-image-wrapper {
  position: relative;
  overflow: hidden;
}

.placeholder-img {
  aspect-ratio: 4/5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.luxury-food-card:hover .placeholder-img {
  transform: scale(1.05);
}

.category-number {
  position: absolute;
  top: 40px;
  left: 40px;
  font-family: 'Bodoni Moda', serif;
  font-size: 2rem;
  font-style: italic;
  opacity: 0.3;
}

.large-emoji {
  font-size: 8rem;
}

.category-tag {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: #999;
  display: block;
  margin-bottom: 15px;
}

.food-info-luxury h2 {
  font-family: 'Bodoni Moda', serif;
  font-size: 2.5rem;
  margin: 0 0 25px 0;
  font-weight: 400;
}

.category-desc {
  font-size: 1rem;
  line-height: 1.8;
  color: #555;
  margin-bottom: 30px;
  font-weight: 300;
}

.luxury-tags {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
}

.luxury-tags span {
  font-size: 0.85rem;
  color: #888;
}

.discover-btn {
  background: none;
  border: 1px solid #1a1a1a;
  padding: 15px 35px;
  font-family: 'Bodoni Moda', serif;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s;
}

.discover-btn:hover {
  background: #1a1a1a;
  color: #fff;
}

.philosophy-section {
  background: #f9f9f9;
  padding: 120px 40px;
  text-align: center;
}

.philosophy-content h2 {
  font-family: 'Bodoni Moda', serif;
  font-size: 2.5rem;
  margin-bottom: 80px;
}

.philosophy-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.phi-item h3 {
  font-family: 'Bodoni Moda', serif;
  font-size: 1.2rem;
  letter-spacing: 0.1em;
  margin-bottom: 20px;
}

.phi-item p {
  font-size: 0.9rem;
  color: #777;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .luxury-food-card, .luxury-food-card.reverse {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .luxury-food-card.reverse .food-image-wrapper { order: 0; }
  .philosophy-grid { grid-template-columns: 1fr; }
  .main-title { font-size: 2.5rem; }
}
</style>
