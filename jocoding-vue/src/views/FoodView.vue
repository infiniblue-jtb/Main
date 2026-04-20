<template>
  <div class="container">
    <h1>{{ currentLang === 'ko' ? '🍕 오늘 뭐 먹지?' : '🍕 What to Eat Today?' }}</h1>
    <p>{{ currentLang === 'ko' ? '아이와 함께 가기 좋은 맞춤형 맛집 추천' : 'Recommended restaurants for family with kids' }}</p>

    <div class="food-grid">
      <div v-for="category in categories" :key="category.name" class="food-card" :style="{ borderTop: '5px solid ' + category.color }">
        <div class="emoji">{{ category.emoji }}</div>
        <h3>{{ currentLang === 'ko' ? category.name : category.name_en }}</h3>
        <p>{{ currentLang === 'ko' ? category.desc : category.desc_en }}</p>
        <div class="tags">
          <span v-for="tag in category.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>{{ currentLang === 'ko' ? '💡 맛집 선정 기준' : '💡 Selection Criteria' }}</h3>
      <ul>
        <li>{{ currentLang === 'ko' ? '아기의자 및 유아용 식기 완비' : 'High chairs and kids tablewares available' }}</li>
        <li>{{ currentLang === 'ko' ? '자극적이지 않은 어린이 메뉴 보유' : 'Healthy and mild kids menu options' }}</li>
        <li>{{ currentLang === 'ko' ? '유모차 이동이 편리한 넓은 공간' : 'Spacious area for strollers' }}</li>
      </ul>
    </div>
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
        name: '돈까스/우동', name_en: 'Cutlet/Udon', emoji: '🍱', color: '#ff9f43',
        desc: '아이들이 가장 좋아하는 불변의 1위 메뉴', desc_en: 'All-time favorite menu for kids',
        tags: ['아기의자', '어린이세트']
      },
      { 
        name: '한식/생선구이', name_en: 'Korean Food', emoji: '🐟', color: '#10ac84',
        desc: '건강하고 든든한 집밥 스타일 외식', desc_en: 'Healthy and solid home-style meal',
        tags: ['영양가득', '맵지않음']
      },
      { 
        name: '파스타/피자', name_en: 'Pasta/Pizza', emoji: '🍝', color: '#ee5253',
        desc: '온 가족이 즐거운 이탈리안 레스토랑', desc_en: 'Italian restaurant for family',
        tags: ['가족외식', '분위기']
      },
      { 
        name: '브런치/카페', name_en: 'Brunch/Cafe', emoji: '🥞', color: '#5f27cd',
        desc: '주말 아침, 여유롭게 즐기는 브런치', desc_en: 'Relaxing brunch on weekend morning',
        tags: ['키즈존', '야외테라스']
      }
    ];

    return {
      currentLang,
      categories
    };
  }
}
</script>

<style scoped>
.container {
  background: var(--container-bg);
  padding: 40px 20px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  width: 95%;
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}

h1 { color: var(--accent-color); margin-bottom: 10px; }

.food-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 40px 0;
}

.food-card {
  background: var(--card-bg);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.food-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.emoji { font-size: 3rem; margin-bottom: 15px; }

.tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.tag {
  background: #eee;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #666;
}

.info-section {
  text-align: left;
  background: rgba(255,255,255,0.3);
  padding: 20px;
  border-radius: 15px;
  margin-top: 40px;
  border-left: 5px solid var(--accent-color);
}

.info-section h3 { margin-top: 0; }
.info-section ul { margin-bottom: 0; }
</style>
