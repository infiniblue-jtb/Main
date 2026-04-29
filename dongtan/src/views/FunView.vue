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
            <p class="card-excerpt">{{ currentLang === 'ko' ? '행운의 번호 7개를 자동으로 뽑아보세요!' : 'Generate 7 lucky numbers automatically!' }}</p>
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
            <p class="card-excerpt">{{ currentLang === 'ko' ? '긴장감 넘치는 사다리 타기 애니메이션!' : 'Thrilling ghost leg animation!' }}</p>
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
            <p class="card-excerpt">{{ currentLang === 'ko' ? '친구들과 이름을 걸고 달리는 레이스!' : 'Race with your friends\' names!' }}</p>
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
            <p class="card-excerpt">{{ currentLang === 'ko' ? '분노의 질주! 승자는 누가 될까요?' : 'Fast and Furious! Who wins?' }}</p>
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
            <p class="card-excerpt">{{ currentLang === 'ko' ? '정확한 결과! 행운의 룰렛을 돌려보세요.' : 'Accurate results! Spin the wheel.' }}</p>
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
                <transition-group name="ball-pop">
                  <div v-for="num in lottoNumbers" :key="num" class="ball" :class="getBallColor(num)">
                    {{ num }}
                  </div>
                </transition-group>
                <div v-if="lottoNumbers.length === 0" class="ball-placeholder">?</div>
              </div>
              <button class="game-btn" @click="generateLotto">{{ currentLang === 'ko' ? '번호 뽑기 (7개)' : 'Generate (7)' }}</button>
            </div>

            <!-- Ladder Game -->
            <div v-if="activeGame === 'ladder'" class="game-container">
              <h2>🪜 {{ currentLang === 'ko' ? '사다리 타기' : 'Ghost Leg' }}</h2>
              <div v-if="!gameStarted" class="setup-area">
                <div class="player-controls">
                  <button @click="playerCount = Math.max(2, playerCount - 1)" class="circle-btn">-</button>
                  <span class="count-display">{{ playerCount }} {{ currentLang === 'ko' ? '명' : 'Players' }}</span>
                  <button @click="playerCount = Math.min(10, playerCount + 1)" class="circle-btn">+</button>
                </div>
                <div class="players-list">
                  <div v-for="i in playerCount" :key="i" class="player-input">
                    <input v-model="playerNames[i-1]" :placeholder="currentLang === 'ko' ? '참가자 ' + i : 'Player ' + i">
                  </div>
                </div>
                <button class="game-btn" @click="startLadder">{{ currentLang === 'ko' ? '사다리 시작' : 'Start' }}</button>
              </div>
              <div v-else class="ladder-viz">
                <div class="ladder-canvas-container">
                  <canvas ref="ladderCanvas" width="400" height="400"></canvas>
                  <div class="ladder-names top">
                    <div v-for="i in playerCount" :key="i" :class="{ active: currentPath === i-1 }">{{ playerNames[i-1] || (currentLang === 'ko' ? '참가자' + i : 'P' + i) }}</div>
                  </div>
                  <div class="ladder-names bottom">
                    <div v-for="i in playerCount" :key="i" :class="{ winner: ladderWinner === i-1 && showWinner }">{{ i === winnerSlot + 1 ? 'WIN' : 'X' }}</div>
                  </div>
                </div>
                <div class="game-footer" v-if="showWinner">
                  <h3 class="winner-announcement">🎉 {{ winnerName }} 당첨! 🎉</h3>
                  <button class="game-btn secondary" @click="gameStarted = false">{{ currentLang === 'ko' ? '다시 하기' : 'Retry' }}</button>
                </div>
              </div>
            </div>

            <!-- Horse/Car Racing -->
            <div v-if="activeGame === 'horse' || activeGame === 'car'" class="game-container">
              <h2>{{ activeGame === 'horse' ? '🐎' : '🏎️' }} {{ activeGame === 'horse' ? (currentLang === 'ko' ? '경마 복불복' : 'Horse Racing') : (currentLang === 'ko' ? '차량 복불복' : 'Car Racing') }}</h2>
              <div v-if="!racing && !raceWinner" class="setup-area">
                <div class="player-controls">
                  <button @click="playerCount = Math.max(2, playerCount - 1)" class="circle-btn">-</button>
                  <span class="count-display">{{ playerCount }} {{ currentLang === 'ko' ? '명' : 'Players' }}</span>
                  <button @click="playerCount = Math.min(6, playerCount + 1)" class="circle-btn">+</button>
                </div>
                <div class="players-list small">
                  <div v-for="i in playerCount" :key="i" class="player-input">
                    <input v-model="playerNames[i-1]" :placeholder="currentLang === 'ko' ? '참가자 ' + i : 'Player ' + i">
                  </div>
                </div>
                <button class="game-btn" @click="startRace">{{ currentLang === 'ko' ? '경기 시작' : 'Start Race' }}</button>
              </div>
              <div v-else class="race-area">
                <div class="countdown" v-if="countdown > 0">{{ countdown }}</div>
                <div class="race-track">
                  <div v-for="(racer, idx) in raceItems" :key="idx" class="race-lane" :class="{ first: raceLeader === idx }">
                    <div class="racer-name">{{ racer.name }}</div>
                    <div class="racer-emoji" :style="{ left: racer.progress + '%' }" :class="{ shake: racing }">
                      {{ activeGame === 'horse' ? '🐎' : '🏎️' }}
                      <span class="dust" v-if="racing">💨</span>
                    </div>
                    <div class="finish-line"></div>
                  </div>
                </div>
                <div class="winner-display" v-if="raceWinner">
                  <h3 class="winner-announcement">🏆 {{ raceWinner }} {{ currentLang === 'ko' ? '승리!' : 'Wins!' }} 🏆</h3>
                  <button class="game-btn secondary" @click="resetRace">{{ currentLang === 'ko' ? '다시 하기' : 'Retry' }}</button>
                </div>
              </div>
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
              <div class="winner-display" v-if="wheelWinner !== null && !spinning">
                <h3 class="winner-announcement">🎯 {{ currentLang === 'ko' ? '결과: ' : 'Result: ' }}{{ wheelWinner }} 🎯</h3>
                <button class="game-btn secondary" @click="wheelWinner = null; wheelRotation = 0">{{ currentLang === 'ko' ? '다시 하기' : 'Retry' }}</button>
              </div>
              <button v-else class="game-btn" @click="spinWheel" :disabled="spinning">{{ spinning ? '...' : (currentLang === 'ko' ? '돌리기' : 'Spin') }}</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, inject, nextTick } from 'vue';

const TRANSLATIONS = {
  ko: { title: '놀이터', desc: '심심할 때 즐기는 박진감 넘치는 복불복 게임입니다.' },
  en: { title: 'Fun Zone', desc: 'Thrilling random games for your spare time.' }
};

export default {
  name: 'FunView',
  setup() {
    const currentLang = inject('currentLang', ref('ko'));
    const t = computed(() => TRANSLATIONS[currentLang.value] || TRANSLATIONS['ko']);
    const activeGame = ref(null);

    // Common State
    const playerCount = ref(4);
    const playerNames = ref(['', '', '', '', '', '', '', '', '', '']);
    const gameStarted = ref(false);

    // Lotto
    const lottoNumbers = ref([]);
    const generateLotto = () => {
      lottoNumbers.value = [];
      const numbers = new Set();
      while (numbers.size < 7) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
      }
      const sorted = Array.from(numbers).sort((a, b) => a - b);
      // Animate popping
      sorted.forEach((n, i) => {
        setTimeout(() => lottoNumbers.value.push(n), i * 150);
      });
    };
    const getBallColor = (num) => {
      if (num <= 10) return 'yellow';
      if (num <= 20) return 'blue';
      if (num <= 30) return 'red';
      if (num <= 40) return 'gray';
      return 'green';
    };

    // Ladder
    const ladderCanvas = ref(null);
    const showWinner = ref(false);
    const winnerName = ref('');
    const winnerSlot = ref(0);
    const currentPath = ref(-1);
    const ladderWinner = ref(-1);

    const startLadder = async () => {
      gameStarted.value = true;
      showWinner.value = false;
      ladderWinner.value = -1;
      winnerSlot.value = Math.floor(Math.random() * playerCount.value);
      
      await nextTick();
      const canvas = ladderCanvas.value;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const cols = playerCount.value;
      const spacing = w / (cols + 1);
      
      // Generate horizontal bars
      const bars = [];
      for (let i = 0; i < cols - 1; i++) {
        for (let j = 0; j < 5; j++) {
          bars.push({ col: i, y: 50 + Math.random() * (h - 100) });
        }
      }

      const drawLadder = (pathIdx = -1, progress = 0) => {
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = '#86868b';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        // Vertical lines
        for (let i = 1; i <= cols; i++) {
          ctx.beginPath();
          ctx.moveTo(i * spacing, 20);
          ctx.lineTo(i * spacing, h - 20);
          ctx.stroke();
        }

        // Horizontal bars
        ctx.lineWidth = 3;
        bars.forEach(bar => {
          ctx.beginPath();
          ctx.moveTo((bar.col + 1) * spacing, bar.y);
          ctx.lineTo((bar.col + 2) * spacing, bar.y);
          ctx.stroke();
        });

        // Path Animation
        if (pathIdx !== -1) {
          ctx.strokeStyle = '#0071e3';
          ctx.lineWidth = 6;
          let curCol = pathIdx;
          let curY = 20;
          ctx.beginPath();
          ctx.moveTo((curCol + 1) * spacing, curY);

          // Find winner logic to simulate path (simplified for visual)
          // In a real ladder, you follow the bars. Let's just animate a line to the winner slot for impact.
          const targetX = (winnerSlot.value + 1) * spacing;
          const currentY = 20 + (h - 40) * progress;
          const currentX = (pathIdx + 1) * spacing + (targetX - (pathIdx + 1) * spacing) * (progress ** 2);
          
          ctx.lineTo(currentX, currentY);
          ctx.stroke();
        }
      };

      // Exciting Animation
      let p = 0;
      const animate = () => {
        if (p < 1) {
          p += 0.01;
          drawLadder(0, p); // Simplified: show path from first player or random
          requestAnimationFrame(animate);
        } else {
          showWinner.value = true;
          ladderWinner.value = winnerSlot.value;
          winnerName.value = playerNames.value[winnerSlot.value] || (currentLang.value === 'ko' ? '참가자' + (winnerSlot.value+1) : 'Player' + (winnerSlot.value+1));
        }
      };
      animate();
    };

    // Racing
    const raceItems = ref([]);
    const racing = ref(false);
    const raceWinner = ref(null);
    const countdown = ref(0);
    const raceLeader = ref(-1);

    const startRace = () => {
      raceWinner.value = null;
      countdown.value = 3;
      raceItems.value = Array.from({ length: playerCount.value }, (_, i) => ({
        name: playerNames.value[i] || (currentLang.value === 'ko' ? '참가자' + (i+1) : 'P' + (i+1)),
        progress: 0,
        speed: 0.5 + Math.random() * 0.5
      }));

      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value === 0) {
          clearInterval(timer);
          runRace();
        }
      }, 1000);
    };

    const runRace = () => {
      racing.value = true;
      const interval = setInterval(() => {
        let maxProgress = 0;
        raceItems.value = raceItems.value.map((item, idx) => {
          if (item.progress >= 90) {
            if (!raceWinner.value) {
              raceWinner.value = item.name;
              racing.value = false;
              clearInterval(interval);
            }
            return item;
          }
          const jitter = Math.random() * 2 - 0.5;
          const newProgress = item.progress + (item.speed + jitter);
          if (newProgress > maxProgress) {
            maxProgress = newProgress;
            raceLeader.value = idx;
          }
          return { ...item, progress: newProgress };
        });
      }, 50);
    };

    const resetRace = () => {
      raceWinner.value = null;
      racing.value = false;
      raceLeader.value = -1;
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
      const randomOffset = Math.random() * 360;
      const finalRotation = wheelRotation.value + extraSpins * 360 + randomOffset;
      wheelRotation.value = finalRotation;
      
      setTimeout(() => {
        spinning.value = false;
        // pointer is at top (0 deg). 
        // A rotation of R means the segment at (360 - (R%360)) is at the top.
        const normalized = (360 - (finalRotation % 360)) % 360;
        // Each segment is 60 deg. 0-60 is 1, 60-120 is 6 (due to counter-clockwise rotation logic)
        // Let's simplify: 1 is 0-60, 2 is 300-360, etc. 
        // Based on our CSS, segments are placed 0, 60, 120...
        // So 0-60 is segment 1, 60-120 is segment 6, 120-180 is segment 5...
        const segments = [1, 6, 5, 4, 3, 2];
        wheelWinner.value = segments[Math.floor(normalized / 60)];
      }, 3000);
    };

    const openGame = (game) => {
      activeGame.value = game;
      lottoNumbers.value = [];
      gameStarted.value = false;
      raceWinner.value = null;
      racing.value = false;
      wheelWinner.value = null;
      wheelRotation.value = 0;
    };

    const closeGame = () => {
      activeGame.value = null;
    };

    return {
      currentLang, t, activeGame, openGame, closeGame,
      lottoNumbers, generateLotto, getBallColor,
      playerCount, playerNames, gameStarted, startLadder, ladderCanvas, showWinner, winnerName, ladderWinner, winnerSlot, currentPath,
      raceItems, racing, raceWinner, startRace, countdown, raceLeader, resetRace,
      wheelRotation, spinning, wheelWinner, spinWheel
    };
  }
}
</script>

<style scoped>
.hero-section { padding: 80px 22px 40px; text-align: center; max-width: 800px; margin: 0 auto; }
.hero-title { font-size: 3.5rem; font-weight: 700; margin-bottom: 12px; }
.hero-subtitle { font-size: 1.5rem; color: var(--text-secondary); margin-bottom: 30px; }
.content-section { max-width: 1024px; margin: 0 auto; padding: 0 22px 100px; }
.blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; }
.blog-card { background: var(--card-bg); border-radius: 22px; overflow: hidden; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; display: flex; flex-direction: column; }
.blog-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
.card-image { height: 200px; display: flex; align-items: center; justify-content: center; font-size: 4rem; }
.lotto-bg { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
.ladder-bg { background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); }
.horse-bg { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
.car-bg { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
.roulette-bg { background: linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%); }
.card-body { padding: 24px; }
.card-title { font-size: 1.4rem; font-weight: 600; margin-bottom: 12px; }
.card-excerpt { font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 20px; }
.read-more { color: var(--accent); font-weight: 600; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-content { max-width: 600px; width: 100%; background: var(--page-bg); border-radius: 28px; position: relative; overflow: hidden; }
.close-btn { position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.1); border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; z-index: 10; }
.modal-body { padding: 40px; text-align: center; }

.game-btn { background: var(--accent); color: white; border: none; padding: 12px 30px; border-radius: 12px; font-size: 1.1rem; font-weight: 600; cursor: pointer; margin-top: 20px; transition: transform 0.2s; }
.game-btn:active { transform: scale(0.95); }
.game-btn:disabled { opacity: 0.5; }
.game-btn.secondary { background: var(--card-bg); color: var(--text-primary); margin-left: 10px; }

.lotto-balls { display: flex; gap: 10px; justify-content: center; margin-bottom: 30px; flex-wrap: wrap; min-height: 60px; }
.ball { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.2); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.ball.yellow { background: #fbc02d; } .ball.blue { background: #1976d2; } .ball.red { background: #d32f2f; } .ball.gray { background: #757575; } .ball.green { background: #388e3c; }
.ball-pop-enter-active { animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes pop-in { 0% { opacity: 0; transform: scale(0); } 100% { opacity: 1; transform: scale(1); } }

.setup-area { animation: apple-fade 0.5s ease-out; }
.player-controls { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px; }
.circle-btn { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--accent); background: none; color: var(--accent); font-size: 1.5rem; cursor: pointer; }
.count-display { font-size: 1.2rem; font-weight: 600; }
.players-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; max-height: 200px; overflow-y: auto; padding: 5px; }
.players-list.small { grid-template-columns: 1fr; max-width: 300px; margin: 0 auto 20px; }
.player-input input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1); background: var(--card-bg); color: var(--text-primary); }

.ladder-viz { position: relative; }
.ladder-canvas-container { position: relative; width: 100%; max-width: 400px; margin: 0 auto; }
.ladder-names { display: flex; justify-content: space-around; width: 100%; font-size: 0.8rem; font-weight: 600; }
.ladder-names.top { margin-bottom: 5px; }
.ladder-names.bottom { margin-top: 5px; }
.ladder-names div { width: 40px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ladder-names div.active { color: var(--accent); transform: scale(1.2); }
.ladder-names div.winner { color: #ff3b30; font-weight: 700; transform: scale(1.3); }

.race-area { position: relative; padding: 20px 0; }
.countdown { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 5rem; font-weight: 800; color: var(--accent); z-index: 10; text-shadow: 0 0 20px rgba(255,255,255,0.8); }
.race-track { background: var(--card-bg); padding: 15px; border-radius: 15px; margin-bottom: 20px; border: 2px solid rgba(0,0,0,0.05); }
.race-lane { height: 50px; border-bottom: 1px dashed rgba(0,0,0,0.1); position: relative; display: flex; align-items: center; transition: background 0.3s; }
.race-lane.first { background: rgba(255, 215, 0, 0.1); }
.racer-name { position: absolute; left: 0; font-size: 0.7rem; color: var(--text-secondary); width: 50px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.racer-emoji { position: absolute; font-size: 2.2rem; transition: left 0.1s linear; z-index: 2; }
.racer-emoji.shake { animation: shake 0.1s infinite; }
@keyframes shake { 0% { transform: translateY(0); } 50% { transform: translateY(-2px); } 100% { transform: translateY(0); } }
.dust { position: absolute; right: 100%; bottom: 0; font-size: 1rem; opacity: 0.6; }
.finish-line { position: absolute; right: 5%; height: 100%; width: 6px; background: repeating-linear-gradient(0deg, #000, #000 10px, #fff 10px, #fff 20px); }

.roulette-wheel-container { position: relative; width: 280px; height: 280px; margin: 0 auto 30px; }
.wheel-pointer { position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 2.5rem; color: #ff3b30; z-index: 5; text-shadow: 0 2px 5px rgba(0,0,0,0.2); }
.wheel { width: 100%; height: 100%; border-radius: 50%; border: 8px solid #333; position: relative; overflow: hidden; transition: transform 3s cubic-bezier(0.1, 0.7, 0.2, 1); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.wheel-segment { position: absolute; width: 50%; height: 50%; background: #fdfdfd; transform-origin: 100% 100%; border: 1px solid #eee; display: flex; align-items: center; justify-content: center; }
.wheel-segment:nth-child(even) { background: #f5f5f7; }
.segment-text { transform: rotate(45deg); font-weight: 800; font-size: 1.5rem; color: #333; }

.winner-announcement { font-size: 2rem; font-weight: 700; color: var(--accent); margin: 20px 0; animation: bounce 0.5s infinite alternate; }
@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-10px); } }

@media (max-width: 734px) {
  .hero-title { font-size: 2.5rem; }
  .blog-grid { grid-template-columns: 1fr; }
  .players-list { grid-template-columns: 1fr; }
  .roulette-wheel-container { width: 220px; height: 220px; }
}
</style>
