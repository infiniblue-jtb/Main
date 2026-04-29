<template>
  <div class="apple-page">
    <header class="hero-section">
      <h1 class="hero-title">{{ t.title }}</h1>
      <p class="hero-subtitle">{{ t.desc }}</p>
    </header>

    <section class="content-section">
      <div class="blog-grid">
        <!-- 로또 번호 생성 -->
        <article class="blog-card" @click="openGame('lotto')">
          <div class="card-image lotto-bg">
            <div class="placeholder-image">🎰</div>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ currentLang === 'ko' ? '로또 번호 생성기' : 'Lotto Generator' }}</h3>
            <p class="card-excerpt">{{ currentLang === 'ko' ? '행운의 번호를 자동으로 뽑아보세요!' : 'Generate your lucky numbers automatically!' }}</p>
            <div class="card-footer">
              <span class="read-more">{{ currentLang === 'ko' ? '시작하기' : 'Start' }} →</span>
            </div>
          </div>
        </article>

        <!-- 사다리 게임 -->
        <article class="blog-card" @click="openGame('ladder')">
          <div class="card-image ladder-bg">
            <div class="placeholder-image">🪜</div>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ currentLang === 'ko' ? '사다리 타기' : 'Ghost Leg' }}</h3>
            <p class="card-excerpt">{{ currentLang === 'ko' ? '인원을 추가하고 당첨자를 정해보세요.' : 'Add people and pick a winner.' }}</p>
            <div class="card-footer">
              <span class="read-more">{{ currentLang === 'ko' ? '시작하기' : 'Start' }} →</span>
            </div>
          </div>
        </article>

        <!-- 경마 복불복 -->
        <article class="blog-card" @click="openGame('horse')">
          <div class="card-image horse-bg">
            <div class="placeholder-image">🐎</div>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ currentLang === 'ko' ? '경마 복불복' : 'Horse Racing' }}</h3>
            <p class="card-excerpt">{{ currentLang === 'ko' ? '어떤 말이 가장 먼저 들어올까요?' : 'Which horse will finish first?' }}</p>
            <div class="card-footer">
              <span class="read-more">{{ currentLang === 'ko' ? '시작하기' : 'Start' }} →</span>
            </div>
          </div>
        </article>

        <!-- 차량 복불복 -->
        <article class="blog-card" @click="openGame('car')">
          <div class="card-image car-bg">
            <div class="placeholder-image">🏎️</div>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ currentLang === 'ko' ? '차량 복불복' : 'Car Racing' }}</h3>
            <p class="card-excerpt">{{ currentLang === 'ko' ? '질주하는 자동차들 중 승자를 맞춰보세요.' : 'Pick the winner among racing cars.' }}</p>
            <div class="card-footer">
              <span class="read-more">{{ currentLang === 'ko' ? '시작하기' : 'Start' }} →</span>
            </div>
          </div>
        </article>

        <!-- 룰렛 복불복 -->
        <article class="blog-card" @click="openGame('roulette')">
          <div class="card-image roulette-bg">
            <div class="placeholder-image">🎡</div>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ currentLang === 'ko' ? '룰렛 복불복' : 'Roulette' }}</h3>
            <p class="card-excerpt">{{ currentLang === 'ko' ? '행운의 돌림판을 돌려보세요.' : 'Spin the lucky wheel.' }}</p>
            <div class="card-footer">
              <span class="read-more">{{ currentLang === 'ko' ? '시작하기' : 'Start' }} →</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- 게임 모달 -->
    <transition name="apple-fade">
      <div v-if="activeGame" class="modal-overlay" @click="closeGame">
        <div class="modal-content glass-card" @click.stop>
          <button class="close-btn" @click="closeGame">✕</button>
          
          <div class="modal-body">
            <!-- Lotto Game -->
            <div v-if="activeGame === 'lotto'" class="game-container">
              <h2>🎰 {{ currentLang === 'ko' ? '로또 번호 생성기' : 'Lotto Generator' }}</h2>
              <div class="lotto-balls">
                <div v-for="num in lottoNumbers" :key="num" class="ball" :class="getBallColor(num)">
                  {{ num }}
                </div>
                <div v-if="lottoNumbers.length === 0" class="ball-placeholder">?</div>
              </div>
              <button class="game-btn" @click="generateLotto">{{ currentLang === 'ko' ? '번호 뽑기' : 'Generate' }}</button>
            </div>

            <!-- Ladder Game -->
            <div v-if="activeGame === 'ladder'" class="game-container">
              <h2>🪜 {{ currentLang === 'ko' ? '사다리 타기' : 'Ghost Leg' }}</h2>
              <div class="ladder-setup" v-if="!gameStarted">
                <div class="input-group">
                  <label>{{ currentLang === 'ko' ? '참가자 수' : 'Number of Players' }}</label>
                  <input type="number" v-model.number="playerCount" min="2" max="10">
                </div>
                <div class="players-list">
                  <div v-for="i in playerCount" :key="i" class="player-input">
                    <input v-model="playerNames[i-1]" :placeholder="currentLang === 'ko' ? '참가자 ' + i : 'Player ' + i">
                  </div>
                </div>
                <button class="game-btn" @click="startLadder">{{ currentLang === 'ko' ? '사다리 시작' : 'Start Ladder' }}</button>
              </div>
              <div class="ladder-result" v-else>
                <div class="result-box" v-if="winner">
                  <h3>🎉 {{ currentLang === 'ko' ? '당첨자' : 'Winner' }} 🎉</h3>
                  <div class="winner-name">{{ winner }}</div>
                </div>
                <button class="game-btn secondary" @click="gameStarted = false">{{ currentLang === 'ko' ? '다시 하기' : 'Retry' }}</button>
              </div>
            </div>

            <!-- Horse Racing -->
            <div v-if="activeGame === 'horse'" class="game-container">
              <h2>🐎 {{ currentLang === 'ko' ? '경마 복불복' : 'Horse Racing' }}</h2>
              <div class="race-track">
                <div v-for="(horse, idx) in raceItems" :key="idx" class="race-lane">
                  <div class="racer" :style="{ left: horse.progress + '%' }">🐎</div>
                  <div class="finish-line"></div>
                </div>
              </div>
              <div class="winner-display" v-if="raceWinner !== null">
                <h3>🏆 {{ raceWinner + 1 }}{{ currentLang === 'ko' ? '번 말 승리!' : ' Horse Wins!' }}</h3>
              </div>
              <button class="game-btn" @click="startRace('horse')" :disabled="racing">{{ racing ? '...' : (currentLang === 'ko' ? '경기 시작' : 'Start Race') }}</button>
            </div>

            <!-- Car Racing -->
            <div v-if="activeGame === 'car'" class="game-container">
              <h2>🏎️ {{ currentLang === 'ko' ? '차량 복불복' : 'Car Racing' }}</h2>
              <div class="race-track">
                <div v-for="(car, idx) in raceItems" :key="idx" class="race-lane">
                  <div class="racer" :style="{ left: car.progress + '%' }">🏎️</div>
                  <div class="finish-line"></div>
                </div>
              </div>
              <div class="winner-display" v-if="raceWinner !== null">
                <h3>🏆 {{ raceWinner + 1 }}{{ currentLang === 'ko' ? '번 차량 승리!' : ' Car Wins!' }}</h3>
              </div>
              <button class="game-btn" @click="startRace('car')" :disabled="racing">{{ racing ? '...' : (currentLang === 'ko' ? '경기 시작' : 'Start Race') }}</button>
            </div>

            <!-- Roulette -->
            <div v-if="activeGame === 'roulette'" class="game-container">
              <h2>🎡 {{ currentLang === 'ko' ? '룰렛 복불복' : 'Roulette' }}</h2>
              <div class="roulette-wheel-container">
                <div class="wheel-pointer">▼</div>
                <div class="wheel" :style="{ transform: `rotate(${wheelRotation}deg)` }">
                  <div v-for="i in 6" :key="i" class="wheel-segment" :style="{ transform: `rotate(${(i-1)*60}deg)` }">
                    <span class="segment-text">{{ i }}</span>
                  </div>
                </div>
              </div>
              <div class="winner-display" v-if="wheelWinner !== null">
                <h3>🎯 {{ currentLang === 'ko' ? '결과: ' : 'Result: ' }}{{ wheelWinner }}</h3>
              </div>
              <button class="game-btn" @click="spinWheel" :disabled="spinning">{{ spinning ? '...' : (currentLang === 'ko' ? '돌리기' : 'Spin') }}</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, inject } from 'vue';

const TRANSLATIONS = {
  ko: {
    title: '놀이터',
    desc: '심심할 때 즐기는 간단한 복불복 게임입니다.',
  },
  en: {
    title: 'Fun Zone',
    desc: 'Enjoy simple random games when you are bored.',
  }
};

export default {
  name: 'FunView',
  setup() {
    const currentLang = inject('currentLang', ref('ko'));
    const t = computed(() => TRANSLATIONS[currentLang.value] || TRANSLATIONS['ko']);
    const activeGame = ref(null);

    // Lotto
    const lottoNumbers = ref([]);
    const generateLotto = () => {
      const numbers = new Set();
      while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
      }
      lottoNumbers.value = Array.from(numbers).sort((a, b) => a - b);
    };
    const getBallColor = (num) => {
      if (num <= 10) return 'yellow';
      if (num <= 20) return 'blue';
      if (num <= 30) return 'red';
      if (num <= 40) return 'gray';
      return 'green';
    };

    // Ladder
    const playerCount = ref(4);
    const playerNames = ref(['', '', '', '', '', '', '', '', '', '']);
    const gameStarted = ref(false);
    const winner = ref(null);
    const startLadder = () => {
      const validNames = playerNames.value.slice(0, playerCount.value).map((n, i) => n || (currentLang.value === 'ko' ? '참가자 ' + (i+1) : 'Player ' + (i+1)));
      const winIdx = Math.floor(Math.random() * playerCount.value);
      winner.value = validNames[winIdx];
      gameStarted.value = true;
    };

    // Racing (Horse & Car)
    const raceItems = ref([]);
    const racing = ref(false);
    const raceWinner = ref(null);
    const startRace = () => {
      raceWinner.value = null;
      racing.value = true;
      raceItems.value = Array.from({ length: 5 }, () => ({ progress: 0 }));
      
      const interval = setInterval(() => {
        let finished = false;
        raceItems.value = raceItems.value.map((item, idx) => {
          if (item.progress >= 90) {
            if (!finished) {
              finished = true;
              raceWinner.value = idx;
            }
            return item;
          }
          return { progress: item.progress + Math.random() * 5 };
        });

        if (finished) {
          clearInterval(interval);
          racing.value = false;
        }
      }, 50);
    };

    // Roulette
    const wheelRotation = ref(0);
    const spinning = ref(false);
    const wheelWinner = ref(null);
    const spinWheel = () => {
      if (spinning.value) return;
      spinning.value = true;
      wheelWinner.value = null;
      const extraSpins = 5 + Math.random() * 5;
      const finalRotation = wheelRotation.value + extraSpins * 360 + Math.random() * 360;
      wheelRotation.value = finalRotation;
      
      setTimeout(() => {
        spinning.value = false;
        const normalized = (360 - (finalRotation % 360)) % 360;
        wheelWinner.value = Math.floor(normalized / 60) + 1;
      }, 3000);
    };

    const openGame = (game) => {
      activeGame.value = game;
      // Reset states
      lottoNumbers.value = [];
      gameStarted.value = false;
      winner.value = null;
      raceItems.value = [];
      raceWinner.value = null;
      wheelWinner.value = null;
    };

    const closeGame = () => {
      activeGame.value = null;
    };

    return {
      currentLang, t, activeGame, openGame, closeGame,
      lottoNumbers, generateLotto, getBallColor,
      playerCount, playerNames, gameStarted, winner, startLadder,
      raceItems, racing, raceWinner, startRace,
      wheelRotation, spinning, wheelWinner, spinWheel
    };
  }
}
</script>

<style scoped>
.hero-section {
  padding: 80px 22px 40px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin-bottom: 30px;
}

.content-section {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 22px 100px;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.blog-card {
  background: var(--card-bg);
  border-radius: 22px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.blog-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.card-image {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
}

.lotto-bg { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
.ladder-bg { background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); }
.horse-bg { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
.car-bg { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
.roulette-bg { background: linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%); }

.card-body {
  padding: 24px;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.card-excerpt {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.read-more {
  color: var(--accent);
  font-weight: 600;
}

/* Modal & Game Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(5px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  max-width: 600px;
  width: 100%;
  background: var(--page-bg);
  border-radius: 28px;
  position: relative;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 20px; right: 20px;
  background: rgba(0,0,0,0.1);
  border: none;
  width: 32px; height: 32px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
}

.modal-body {
  padding: 40px;
  text-align: center;
}

.game-container h2 {
  margin-bottom: 30px;
}

.game-btn {
  background: var(--accent);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
}

.game-btn:disabled {
  opacity: 0.5;
}

.game-btn.secondary {
  background: var(--card-bg);
  color: var(--text-primary);
}

/* Lotto Ball Style */
.lotto-balls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.ball {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.ball.yellow { background: #fbc02d; }
.ball.blue { background: #1976d2; }
.ball.red { background: #d32f2f; }
.ball.gray { background: #757575; }
.ball.green { background: #388e3c; }

.ball-placeholder {
  font-size: 3rem;
  color: var(--text-secondary);
}

/* Ladder Styles */
.input-group {
  margin-bottom: 20px;
}

.input-group input {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.1);
  width: 60px;
  text-align: center;
}

.players-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.player-input input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.1);
}

.winner-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent);
  margin: 20px 0;
}

/* Racing Styles */
.race-track {
  background: #eee;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  position: relative;
}

.race-lane {
  height: 40px;
  border-bottom: 1px dashed #ccc;
  position: relative;
  display: flex;
  align-items: center;
}

.racer {
  position: absolute;
  font-size: 2rem;
  transition: left 0.05s linear;
}

.finish-line {
  position: absolute;
  right: 10%;
  height: 100%;
  width: 4px;
  background: repeating-linear-gradient(0deg, #000, #000 10px, #fff 10px, #fff 20px);
}

/* Roulette Styles */
.roulette-wheel-container {
  position: relative;
  width: 250px;
  height: 250px;
  margin: 0 auto 30px;
}

.wheel-pointer {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  color: #ff3b30;
  z-index: 5;
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 5px solid #333;
  position: relative;
  overflow: hidden;
  transition: transform 3s cubic-bezier(0.2, 0.8, 0.3, 1);
}

.wheel-segment {
  position: absolute;
  width: 50%;
  height: 50%;
  background: #f0f0f0;
  transform-origin: 100% 100%;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wheel-segment:nth-child(even) {
  background: #e0e0e0;
}

.segment-text {
  transform: rotate(45deg);
  font-weight: 700;
  font-size: 1.2rem;
}

@media (max-width: 734px) {
  .hero-title { font-size: 2.5rem; }
  .blog-grid { grid-template-columns: 1fr; }
  .players-list { grid-template-columns: 1fr; }
}
</style>
