<template>
  <div class="fun-page">
    <header class="hero-section">
      <h1 class="hero-title">{{ t.title }}</h1>
      <p class="hero-subtitle">{{ t.desc }}</p>
    </header>

    <section class="content-section">
      <div class="game-grid">
        <article class="game-card" @click="openGame('lotto')">
          <div class="card-icon lotto-icon">🎰</div>
          <h3>{{ currentLang === 'ko' ? '로또 번호 생성기' : 'Lotto Generator' }}</h3>
          <p>{{ currentLang === 'ko' ? '행운의 번호를 뽑아보세요!' : 'Generate lucky numbers!' }}</p>
        </article>
        <article class="game-card" @click="openGame('ladder')">
          <div class="card-icon ladder-icon">🪜</div>
          <h3>{{ currentLang === 'ko' ? '사다리 타기' : 'Ghost Leg' }}</h3>
          <p>{{ currentLang === 'ko' ? '긴장감 넘치는 사다리 게임!' : 'Thrilling ghost leg!' }}</p>
        </article>
        <article class="game-card" @click="openGame('horse')">
          <div class="card-icon horse-icon">🐎</div>
          <h3>{{ currentLang === 'ko' ? '경마 복불복' : 'Horse Racing' }}</h3>
          <p>{{ currentLang === 'ko' ? '친구들과 달리는 레이스!' : 'Race with friends!' }}</p>
        </article>
        <article class="game-card" @click="openGame('car')">
          <div class="card-icon car-icon">🏎️</div>
          <h3>{{ currentLang === 'ko' ? '차량 복불복' : 'Car Racing' }}</h3>
          <p>{{ currentLang === 'ko' ? '분노의 질주! 승자는?' : 'Fast & Furious!' }}</p>
        </article>
        <article class="game-card" @click="openGame('roulette')">
          <div class="card-icon roulette-icon">🎡</div>
          <h3>{{ currentLang === 'ko' ? '룰렛 복불복' : 'Roulette' }}</h3>
          <p>{{ currentLang === 'ko' ? '행운의 룰렛을 돌려보세요!' : 'Spin the wheel!' }}</p>
        </article>
      </div>
    </section>

    <!-- 모달 -->
    <transition name="modal-fade">
      <div v-if="activeGame" class="modal-overlay" @click.self="closeGame">
        <div class="modal-box">
          <button class="close-btn" @click="closeGame">✕</button>

          <!-- =================== 로또 =================== -->
          <div v-if="activeGame === 'lotto'" class="game-wrap">
            <h2 class="game-title">🎰 {{ currentLang === 'ko' ? '로또 번호 생성기' : 'Lotto Generator' }}</h2>
            <canvas ref="lottoCanvas" class="lotto-canvas" width="520" height="340"></canvas>
            <div class="btn-row">
              <button class="btn-primary" @click="generateLotto" :disabled="lottoAnimating">
                {{ lottoAnimating ? '🎲 추첨 중...' : (currentLang === 'ko' ? '🎲 번호 뽑기 (7줄)' : '🎲 Generate (7 Lines)') }}
              </button>
            </div>
          </div>

          <!-- =================== 사다리 =================== -->
          <div v-if="activeGame === 'ladder'" class="game-wrap">
            <h2 class="game-title">🪜 {{ currentLang === 'ko' ? '사다리 타기' : 'Ghost Leg' }}</h2>
            <div v-if="!ladderStarted" class="setup-area">
              <div class="player-ctrl">
                <button class="circle-btn" @click="playerCount = Math.max(2, playerCount - 1)">−</button>
                <span class="count-label">{{ playerCount }}{{ currentLang === 'ko' ? '명' : ' Players' }}</span>
                <button class="circle-btn" @click="playerCount = Math.min(8, playerCount + 1)">+</button>
              </div>
              <div class="name-grid">
                <input v-for="i in playerCount" :key="i" v-model="playerNames[i-1]"
                  :placeholder="currentLang === 'ko' ? '참가자 ' + i : 'Player ' + i" class="name-input" />
              </div>
              <button class="btn-primary" @click="startLadder">{{ currentLang === 'ko' ? '🪜 사다리 시작!' : '🪜 Start!' }}</button>
            </div>
            <div v-else class="canvas-area">
              <canvas ref="ladderCanvas" class="ladder-canvas"></canvas>
              <transition name="winner-pop">
                <div v-if="ladderWinnerName" class="winner-banner">
                  🎉 {{ ladderWinnerName }} {{ currentLang === 'ko' ? '당첨!' : 'Wins!' }} 🎉
                </div>
              </transition>
              <button v-if="ladderWinnerName" class="btn-secondary" @click="ladderStarted = false; ladderWinnerName = ''">
                {{ currentLang === 'ko' ? '다시 하기' : 'Retry' }}
              </button>
            </div>
          </div>

          <!-- =================== 경마 / 차량 =================== -->
          <div v-if="activeGame === 'horse' || activeGame === 'car'" class="game-wrap">
            <h2 class="game-title">
              {{ activeGame === 'horse' ? '🐎' : '🏎️' }}
              {{ activeGame === 'horse' ? (currentLang === 'ko' ? '경마 복불복' : 'Horse Racing') : (currentLang === 'ko' ? '차량 복불복' : 'Car Racing') }}
            </h2>
            <div v-if="!raceStarted" class="setup-area">
              <div class="player-ctrl">
                <button class="circle-btn" @click="playerCount = Math.max(2, playerCount - 1)">−</button>
                <span class="count-label">{{ playerCount }}{{ currentLang === 'ko' ? '명' : ' Players' }}</span>
                <button class="circle-btn" @click="playerCount = Math.min(6, playerCount + 1)">+</button>
              </div>
              <div class="name-grid single">
                <input v-for="i in playerCount" :key="i" v-model="playerNames[i-1]"
                  :placeholder="currentLang === 'ko' ? '참가자 ' + i : 'Player ' + i" class="name-input" />
              </div>
              <button class="btn-primary" @click="startRace">{{ currentLang === 'ko' ? '🏁 경기 시작!' : '🏁 Start Race!' }}</button>
            </div>
            <div v-else class="canvas-area">
              <div v-if="raceCountdown > 0" class="countdown-overlay">{{ raceCountdown }}</div>
              <canvas ref="raceCanvas" class="race-canvas"></canvas>
              <transition name="winner-pop">
                <div v-if="raceWinner" class="winner-banner">
                  🏆 {{ raceWinner }} {{ currentLang === 'ko' ? '우승!' : 'Wins!' }} 🏆
                </div>
              </transition>
              <button v-if="raceWinner" class="btn-secondary" @click="resetRace">{{ currentLang === 'ko' ? '다시 하기' : 'Retry' }}</button>
            </div>
          </div>

          <!-- =================== 룰렛 =================== -->
          <div v-if="activeGame === 'roulette'" class="game-wrap">
            <h2 class="game-title">🎡 {{ currentLang === 'ko' ? '룰렛 복불복' : 'Roulette' }}</h2>
            <div class="setup-area" v-if="!rouletteStarted">
              <p class="setup-hint">{{ currentLang === 'ko' ? '항목 수를 설정하세요 (2~12)' : 'Set number of segments (2~12)' }}</p>
              <div class="player-ctrl">
                <button class="circle-btn" @click="rouletteCount = Math.max(2, rouletteCount - 1)">−</button>
                <span class="count-label">{{ rouletteCount }}{{ currentLang === 'ko' ? '칸' : ' Segments' }}</span>
                <button class="circle-btn" @click="rouletteCount = Math.min(12, rouletteCount + 1)">+</button>
              </div>
              <div class="name-grid">
                <input v-for="i in rouletteCount" :key="i" v-model="rouletteLabels[i-1]"
                  :placeholder="String(i)" class="name-input" />
              </div>
              <button class="btn-primary" @click="initRoulette">{{ currentLang === 'ko' ? '🎡 룰렛 시작!' : '🎡 Start Roulette!' }}</button>
            </div>
            <div v-else class="canvas-area">
              <canvas ref="rouletteCanvas" class="roulette-canvas"></canvas>
              <transition name="winner-pop">
                <div v-if="rouletteResult !== null && !rouletteSpinning" class="winner-banner">
                  🎯 {{ rouletteResultLabel }} {{ currentLang === 'ko' ? '당첨!' : 'Selected!' }} 🎯
                </div>
              </transition>
              <div class="btn-row">
                <button class="btn-primary" @click="spinRoulette" :disabled="rouletteSpinning">
                  {{ rouletteSpinning ? '🌀 돌아가는 중...' : (currentLang === 'ko' ? '🌀 돌리기!' : '🌀 Spin!') }}
                </button>
                <button class="btn-secondary" @click="rouletteStarted = false; rouletteResult = null">
                  {{ currentLang === 'ko' ? '설정 변경' : 'Change Settings' }}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, inject, nextTick, watch } from 'vue';

const TRANSLATIONS = {
  ko: { title: '놀이터 🎮', desc: '심심할 때 즐기는 박진감 넘치는 복불복 게임!' },
  en: { title: 'Fun Zone 🎮', desc: 'Thrilling random games for your spare time!' }
};

const ROULETTE_COLORS = [
  '#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c','#3498db',
  '#9b59b6','#e91e63','#ff5722','#00bcd4','#8bc34a','#ff9800'
];

export default {
  name: 'FunView',
  setup() {
    const currentLang = inject('currentLang', ref('ko'));
    const t = computed(() => TRANSLATIONS[currentLang.value] || TRANSLATIONS['ko']);
    const activeGame = ref(null);

    // ─── 공통 상태 ───
    const playerCount = ref(4);
    const playerNames = ref(Array(10).fill(''));

    // ─── 로또 ───
    const lottoCanvas = ref(null);
    const lottoAnimating = ref(false);

    const getBallColor = (num) => {
      if (num <= 10) return { bg: '#f5a623', shadow: '#c47d00' };
      if (num <= 20) return { bg: '#4a90e2', shadow: '#2060b0' };
      if (num <= 30) return { bg: '#e74c3c', shadow: '#a52a2a' };
      if (num <= 40) return { bg: '#7f8c8d', shadow: '#4a5568' };
      return { bg: '#27ae60', shadow: '#1a6e3c' };
    };

    const drawLottoCanvas = (rows) => {
      const canvas = lottoCanvas.value;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // 배경
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1a1a2e');
      grad.addColorStop(1, '#16213e');
      ctx.fillStyle = grad;
      ctx.roundRect(0, 0, W, H, 16);
      ctx.fill();

      if (rows.length === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '500 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('버튼을 눌러 번호를 생성하세요!', W / 2, H / 2);
        return;
      }

      const rowH = H / (rows.length + 0.5);
      rows.forEach((row, ri) => {
        const y = rowH * (ri + 0.7);
        // 회차 라벨
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '500 13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${ri + 1}줄`, 14, y + 4);

        row.forEach((num, ni) => {
          const ballR = 20;
          const x = 55 + ni * 75 + ballR;
          const { bg, shadow } = getBallColor(num);

          // 그림자
          ctx.beginPath();
          ctx.arc(x + 2, y + 4, ballR, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.fill();

          // 공
          const ballGrad = ctx.createRadialGradient(x - 5, y - 5, 2, x, y, ballR);
          ballGrad.addColorStop(0, lighten(bg, 40));
          ballGrad.addColorStop(1, bg);
          ctx.beginPath();
          ctx.arc(x, y, ballR, 0, Math.PI * 2);
          ctx.fillStyle = ballGrad;
          ctx.fill();

          // 번호
          ctx.fillStyle = '#fff';
          ctx.font = `700 ${num >= 10 ? 13 : 15}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(num), x, y + 1);
          ctx.textBaseline = 'alphabetic';
        });
      });
    };

    const lighten = (hex, amt) => {
      const num = parseInt(hex.replace('#', ''), 16);
      const r = Math.min(255, (num >> 16) + amt);
      const g = Math.min(255, ((num >> 8) & 0xff) + amt);
      const b = Math.min(255, (num & 0xff) + amt);
      return `rgb(${r},${g},${b})`;
    };

    const generateLotto = async () => {
      if (lottoAnimating.value) return;
      lottoAnimating.value = true;

      const finalRows = [];
      for (let i = 0; i < 7; i++) {
        const s = new Set();
        while (s.size < 6) s.add(Math.floor(Math.random() * 45) + 1);
        finalRows.push(Array.from(s).sort((a, b) => a - b));
      }

      // 볼 하나씩 순차 등장 애니메이션
      const revealed = finalRows.map(() => []);
      for (let ri = 0; ri < 7; ri++) {
        for (let ni = 0; ni < 6; ni++) {
          revealed[ri].push(finalRows[ri][ni]);
          drawLottoCanvas(revealed);
          await sleep(60);
        }
      }
      lottoAnimating.value = false;
    };

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // 캔버스 초기화
    watch(activeGame, async (g) => {
      if (g === 'lotto') {
        await nextTick();
        drawLottoCanvas([]);
      }
    });

    // ─── 사다리 ───
    const ladderCanvas = ref(null);
    const ladderStarted = ref(false);
    const ladderWinnerName = ref('');

    const startLadder = async () => {
      ladderStarted.value = true;
      ladderWinnerName.value = '';
      await nextTick();

      const canvas = ladderCanvas.value;
      const cols = playerCount.value;
      const W = 480, H = 420;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      const xs = Array.from({ length: cols }, (_, i) => 40 + i * ((W - 80) / (cols - 1)));
      const TOP = 50, BOT = H - 50;

      // 수평 막대 생성 (겹침 방지)
      const bars = [];
      const levels = 8;
      for (let lv = 0; lv < levels; lv++) {
        const y = TOP + (lv + 1) * ((BOT - TOP) / (levels + 1));
        const usedCols = new Set();
        for (let c = 0; c < cols - 1; c++) {
          if (!usedCols.has(c) && !usedCols.has(c + 1) && Math.random() > 0.45) {
            bars.push({ c, y });
            usedCols.add(c).add(c + 1);
          }
        }
      }

      // 승자 미리 결정 (랜덤 출발 → 경로 추적)
      const startIdx = Math.floor(Math.random() * cols);
      let col = startIdx;
      const pathPts = [{ x: xs[col], y: TOP }];

      const sortedBars = [...bars].sort((a, b) => a.y - b.y);
      sortedBars.forEach(bar => {
        if (bar.c === col) {
          pathPts.push({ x: xs[col], y: bar.y });
          col++;
          pathPts.push({ x: xs[col], y: bar.y });
        } else if (bar.c === col - 1) {
          pathPts.push({ x: xs[col], y: bar.y });
          col--;
          pathPts.push({ x: xs[col], y: bar.y });
        }
      });
      pathPts.push({ x: xs[col], y: BOT });
      const winnerCol = col;

      const drawFrame = (progress) => {
        ctx.clearRect(0, 0, W, H);

        // 배경
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#0f0c29');
        bg.addColorStop(1, '#302b63');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // 이름 (상단)
        xs.forEach((x, i) => {
          const name = playerNames.value[i] || `P${i + 1}`;
          const isStart = i === startIdx;
          ctx.save();
          ctx.font = `${isStart ? '700' : '500'} 13px sans-serif`;
          ctx.fillStyle = isStart ? '#ffd700' : 'rgba(255,255,255,0.7)';
          ctx.textAlign = 'center';
          ctx.fillText(name.slice(0, 5), x, TOP - 8);
          ctx.restore();
        });

        // 결과 (하단)
        xs.forEach((x, i) => {
          const isWin = i === winnerCol && progress >= 1;
          ctx.save();
          ctx.font = `${isWin ? '700' : '500'} 13px sans-serif`;
          ctx.fillStyle = isWin ? '#ff6b6b' : 'rgba(255,255,255,0.5)';
          ctx.textAlign = 'center';
          ctx.fillText(isWin ? '🏆WIN' : '✗', x, BOT + 20);
          ctx.restore();
        });

        // 세로줄
        xs.forEach(x => {
          ctx.beginPath();
          ctx.moveTo(x, TOP);
          ctx.lineTo(x, BOT);
          ctx.strokeStyle = 'rgba(255,255,255,0.25)';
          ctx.lineWidth = 3;
          ctx.stroke();
        });

        // 가로 막대
        bars.forEach(bar => {
          const x1 = xs[bar.c], x2 = xs[bar.c + 1];
          ctx.beginPath();
          ctx.moveTo(x1, bar.y);
          ctx.lineTo(x2, bar.y);
          ctx.strokeStyle = 'rgba(255,255,255,0.35)';
          ctx.lineWidth = 3;
          ctx.stroke();
        });

        // 경로 애니메이션
        const totalLen = pathPts.length - 1;
        const drawn = progress * totalLen;
        const fullSegs = Math.floor(drawn);

        ctx.beginPath();
        ctx.moveTo(pathPts[0].x, pathPts[0].y);
        for (let i = 0; i < Math.min(fullSegs, totalLen); i++) {
          ctx.lineTo(pathPts[i + 1].x, pathPts[i + 1].y);
        }
        if (fullSegs < totalLen) {
          const frac = drawn - fullSegs;
          const a = pathPts[fullSegs], b = pathPts[fullSegs + 1];
          ctx.lineTo(a.x + (b.x - a.x) * frac, a.y + (b.y - a.y) * frac);
        }
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 12;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 현재 위치 공
        if (progress < 1) {
          const frac2 = drawn - Math.floor(drawn);
          const si = Math.min(Math.floor(drawn), totalLen - 1);
          const a = pathPts[si], b = pathPts[si + 1];
          const cx = a.x + (b.x - a.x) * frac2;
          const cy = a.y + (b.y - a.y) * frac2;
          ctx.beginPath();
          ctx.arc(cx, cy, 10, 0, Math.PI * 2);
          ctx.fillStyle = '#ffd700';
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 20;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      };

      // 애니메이션
      let p = 0;
      const anim = () => {
        p += 0.008;
        if (p >= 1) {
          drawFrame(1);
          ladderWinnerName.value = playerNames.value[startIdx] || `P${startIdx + 1}`;
          return;
        }
        drawFrame(p);
        requestAnimationFrame(anim);
      };
      anim();
    };

    // ─── 경마 / 차량 ───
    const raceCanvas = ref(null);
    const raceStarted = ref(false);
    const raceCountdown = ref(0);
    const raceWinner = ref(null);
    let raceAnimId = null;

    const startRace = async () => {
      raceStarted.value = true;
      raceWinner.value = null;
      raceCountdown.value = 3;

      await nextTick();

      // 카운트다운
      await sleep(1000); raceCountdown.value = 2;
      await sleep(1000); raceCountdown.value = 1;
      await sleep(1000); raceCountdown.value = 0;

      const canvas = raceCanvas.value;
      const cnt = playerCount.value;
      const emoji = activeGame.value === 'horse' ? '🐎' : '🏎️';
      const W = 480, laneH = 64, PAD = 12;
      const H = cnt * laneH + PAD * 2;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');

      // 미리 승자 결정
      const winnerIdx = Math.floor(Math.random() * cnt);

      // 각 참가자 상태
      const racers = Array.from({ length: cnt }, (_, i) => ({
        name: (playerNames.value[i] || `P${i + 1}`).slice(0, 6),
        progress: 0,
        speed: 0.6 + Math.random() * 0.5,
        color: ROULETTE_COLORS[i % ROULETTE_COLORS.length],
        finished: false,
        jitterY: 0
      }));

      // 승자가 확실히 이기도록 약간 부스트
      racers[winnerIdx].speed += 0.3;

      const TRACK_START = 90;
      const TRACK_END = W - 40;
      const TRACK_W = TRACK_END - TRACK_START;
      const FINISH_X = TRACK_END - 8;

      const draw = () => {
        ctx.clearRect(0, 0, W, H);

        // 배경
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#1a1a2e');
        bg.addColorStop(1, '#0f3460');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // 트랙 라인
        racers.forEach((r, i) => {
          const y = PAD + i * laneH;
          // 레인 배경
          ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)';
          ctx.fillRect(0, y, W, laneH);

          // 이름
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          ctx.font = '500 12px sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(r.name, 6, y + laneH / 2);

          // 점선
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(TRACK_START, y + laneH);
          ctx.lineTo(TRACK_END, y + laneH);
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);

          // 결승선
          for (let s = 0; s < laneH; s += 8) {
            ctx.fillStyle = s % 16 === 0 ? '#fff' : '#000';
            ctx.fillRect(FINISH_X, y + s, 6, 8);
          }

          // 레이서
          const ex = TRACK_START + (r.progress / 100) * (TRACK_W - 20);
          const ey = y + laneH / 2 - 14 + r.jitterY;
          ctx.font = '28px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(emoji, ex, ey + 20);

          // 먼지
          if (!r.finished && r.progress > 0) {
            ctx.globalAlpha = 0.4;
            ctx.font = '14px sans-serif';
            ctx.fillText('💨', ex - 16, ey + 22);
            ctx.globalAlpha = 1;
          }
        });
      };

      let finished = false;
      const tick = () => {
        if (finished) return;
        let winnerName = null;
        racers.forEach((r, i) => {
          if (r.finished) return;
          const jitter = (Math.random() - 0.5) * 2.5;
          r.progress = Math.min(100, r.progress + r.speed + jitter);
          r.jitterY = (Math.random() - 0.5) * 3;
          if (r.progress >= 100) {
            r.finished = true;
            if (!winnerName) winnerName = r.name;
          }
        });
        draw();
        if (winnerName) {
          finished = true;
          raceWinner.value = winnerName;
          return;
        }
        raceAnimId = requestAnimationFrame(tick);
      };
      tick();
    };

    const resetRace = () => {
      if (raceAnimId) cancelAnimationFrame(raceAnimId);
      raceStarted.value = false;
      raceWinner.value = null;
      raceCountdown.value = 0;
    };

    // ─── 룰렛 ───
    const rouletteCanvas = ref(null);
    const rouletteCount = ref(6);
    const rouletteLabels = ref(Array(12).fill('').map((_, i) => String(i + 1)));
    const rouletteStarted = ref(false);
    const rouletteSpinning = ref(false);
    const rouletteResult = ref(null);
    const rouletteResultLabel = ref('');
    let rouletteAngle = 0; // 현재 회전 각도 (라디안)

    const initRoulette = async () => {
      rouletteStarted.value = true;
      rouletteResult.value = null;
      rouletteAngle = 0;
      await nextTick();
      drawRoulette(0);
    };

    const drawRoulette = (angle) => {
      const canvas = rouletteCanvas.value;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) / 2 - 20;
      const n = rouletteCount.value;
      const segAngle = (Math.PI * 2) / n;

      ctx.clearRect(0, 0, W, H);

      // 배경
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, W, H);

      // 바깥 테두리 빛
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R + 10, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 세그먼트 그리기
      for (let i = 0; i < n; i++) {
        const start = angle + i * segAngle;
        const end = start + segAngle;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, start, end);
        ctx.closePath();
        ctx.fillStyle = ROULETTE_COLORS[i % ROULETTE_COLORS.length];
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // 텍스트
        const mid = start + segAngle / 2;
        const tx = cx + (R * 0.65) * Math.cos(mid);
        const ty = cy + (R * 0.65) * Math.sin(mid);
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(mid + Math.PI / 2);
        ctx.fillStyle = '#fff';
        ctx.font = `700 ${n > 8 ? 13 : 16}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = rouletteLabels.value[i] || String(i + 1);
        ctx.fillText(label.slice(0, 5), 0, 0);
        ctx.restore();
      }

      // 중앙 원
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a2e';
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 포인터 (상단 고정 삼각형)
      ctx.save();
      ctx.fillStyle = '#ff3b30';
      ctx.shadowColor = '#ff3b30';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(cx, cy - R - 6);
      ctx.lineTo(cx - 12, cy - R - 28);
      ctx.lineTo(cx + 12, cy - R - 28);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    };

    const spinRoulette = () => {
      if (rouletteSpinning.value) return;
      rouletteSpinning.value = true;
      rouletteResult.value = null;

      const n = rouletteCount.value;
      const segAngle = (Math.PI * 2) / n;

      // 미리 당첨 세그먼트 결정
      const winIdx = Math.floor(Math.random() * n);

      // 포인터는 -Math.PI/2 (12시 방향)에 고정
      // angle 회전 후 포인터가 winIdx 세그먼트 중앙을 가리키려면:
      // 포인터 방향 = -PI/2
      // 세그먼트 i의 중앙 각도(회전 후) = rouletteAngle + (i + 0.5) * segAngle
      // 이 값 % (2PI) === -PI/2 + 2PI*k 가 되어야 함
      // => rouletteAngle = -PI/2 - (winIdx + 0.5) * segAngle + 2PI*k

      const targetAngle = -Math.PI / 2 - (winIdx + 0.5) * segAngle;
      const spins = 8 + Math.random() * 4; // 8~12바퀴
      const finalAngle = targetAngle - spins * Math.PI * 2;

      const startAngle = rouletteAngle;
      const totalDelta = finalAngle - startAngle;
      const duration = 4000 + Math.random() * 1000;
      const startTime = performance.now();

      const ease = (t) => t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const anim = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentAngle = startAngle + totalDelta * ease(progress);
        rouletteAngle = currentAngle;
        drawRoulette(currentAngle);

        if (progress < 1) {
          requestAnimationFrame(anim);
        } else {
          // 정확히 winIdx 세그먼트가 포인터에 위치
          rouletteSpinning.value = false;
          rouletteResult.value = winIdx;
          rouletteResultLabel.value = rouletteLabels.value[winIdx] || String(winIdx + 1);
        }
      };
      requestAnimationFrame(anim);
    };

    // ─── 게임 열기/닫기 ───
    const openGame = (game) => {
      activeGame.value = game;
      playerCount.value = 4;
      playerNames.value = Array(10).fill('');
      ladderStarted.value = false;
      ladderWinnerName.value = '';
      raceStarted.value = false;
      raceWinner.value = null;
      raceCountdown.value = 0;
      rouletteStarted.value = false;
      rouletteResult.value = null;
      if (raceAnimId) cancelAnimationFrame(raceAnimId);
    };

    const closeGame = () => {
      if (raceAnimId) cancelAnimationFrame(raceAnimId);
      activeGame.value = null;
    };

    return {
      currentLang, t, activeGame, openGame, closeGame,
      playerCount, playerNames,
      // 로또
      lottoCanvas, lottoAnimating, generateLotto,
      // 사다리
      ladderCanvas, ladderStarted, ladderWinnerName, startLadder,
      // 경마/차량
      raceCanvas, raceStarted, raceCountdown, raceWinner, startRace, resetRace,
      // 룰렛
      rouletteCanvas, rouletteCount, rouletteLabels, rouletteStarted,
      rouletteSpinning, rouletteResult, rouletteResultLabel, initRoulette, spinRoulette
    };
  }
};
</script>

<style scoped>
/* ── 전체 레이아웃 ── */
.fun-page { min-height: 100vh; }
.hero-section { padding: 80px 22px 40px; text-align: center; max-width: 800px; margin: 0 auto; }
.hero-title { font-size: 3rem; font-weight: 700; margin-bottom: 12px; }
.hero-subtitle { font-size: 1.3rem; color: var(--text-secondary); }
.content-section { max-width: 1100px; margin: 0 auto; padding: 0 22px 100px; }

/* ── 카드 그리드 ── */
.game-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.game-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 30px 20px 24px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s;
  border: 1px solid rgba(255,255,255,0.06);
}
.game-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
.card-icon { font-size: 3.5rem; margin-bottom: 14px; display: block; }
.game-card h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; }
.game-card p { font-size: 0.88rem; color: var(--text-secondary); }
.lotto-icon { filter: drop-shadow(0 0 12px #f5a623aa); }
.ladder-icon { filter: drop-shadow(0 0 12px #4a90e2aa); }
.horse-icon { filter: drop-shadow(0 0 12px #27ae60aa); }
.car-icon { filter: drop-shadow(0 0 12px #e74c3caa); }
.roulette-icon { filter: drop-shadow(0 0 12px #9b59b6aa); }

/* ── 모달 ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal-box {
  width: 100%; max-width: 560px;
  background: var(--page-bg, #fff);
  border-radius: 28px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.1);
  max-height: 90vh;
  overflow-y: auto;
}
.close-btn {
  position: absolute; top: 16px; right: 16px;
  background: rgba(128,128,128,0.15);
  border: none; width: 34px; height: 34px;
  border-radius: 50%; cursor: pointer; font-size: 14px;
  color: var(--text-primary); z-index: 10;
}
.game-wrap { padding: 40px 30px 36px; text-align: center; }
.game-title { font-size: 1.6rem; font-weight: 700; margin-bottom: 24px; }

/* ── 버튼 ── */
.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; border: none;
  padding: 13px 32px; border-radius: 14px;
  font-size: 1rem; font-weight: 600; cursor: pointer;
  transition: transform 0.15s, opacity 0.2s;
  box-shadow: 0 6px 20px rgba(102,126,234,0.4);
}
.btn-primary:hover { transform: translateY(-2px); }
.btn-primary:active { transform: scale(0.97); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.btn-secondary {
  background: rgba(128,128,128,0.15);
  color: var(--text-primary);
  border: 1px solid rgba(128,128,128,0.25);
  padding: 11px 28px; border-radius: 14px;
  font-size: 0.95rem; font-weight: 500; cursor: pointer;
  transition: background 0.2s;
  margin-left: 10px;
}
.btn-secondary:hover { background: rgba(128,128,128,0.25); }
.btn-row { margin-top: 20px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }

/* ── 설정 영역 ── */
.setup-area { animation: fadeUp 0.4s ease-out; }
.setup-hint { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 14px; }
.player-ctrl { display: flex; align-items: center; justify-content: center; gap: 18px; margin-bottom: 18px; }
.circle-btn {
  width: 38px; height: 38px; border-radius: 50%;
  border: 2px solid var(--accent, #667eea);
  background: none; color: var(--accent, #667eea);
  font-size: 1.4rem; cursor: pointer; line-height: 1;
  transition: all 0.2s;
}
.circle-btn:hover { background: var(--accent, #667eea); color: #fff; }
.count-label { font-size: 1.2rem; font-weight: 600; min-width: 70px; text-align: center; }
.name-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 8px; margin-bottom: 20px;
  max-height: 220px; overflow-y: auto;
}
.name-grid.single { grid-template-columns: 1fr; max-width: 240px; margin: 0 auto 20px; }
.name-input {
  width: 100%; padding: 9px 12px; border-radius: 10px;
  border: 1px solid rgba(128,128,128,0.25);
  background: var(--card-bg, #f5f5f7);
  color: var(--text-primary); font-size: 0.9rem;
  box-sizing: border-box;
}

/* ── 캔버스 ── */
.canvas-area { position: relative; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.lotto-canvas { width: 100%; max-width: 520px; height: 340px; border-radius: 16px; display: block; }
.ladder-canvas { width: 100%; max-width: 480px; border-radius: 16px; display: block; }
.race-canvas { width: 100%; max-width: 480px; border-radius: 16px; display: block; }
.roulette-canvas { width: 300px; height: 300px; display: block; }

/* ── 카운트다운 ── */
.countdown-overlay {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 6rem; font-weight: 800;
  color: #ffd700;
  text-shadow: 0 0 30px rgba(255,215,0,0.8);
  z-index: 5;
  animation: pulseIn 0.4s ease-out;
}

/* ── 당첨 배너 ── */
.winner-banner {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: #fff;
  padding: 14px 28px;
  border-radius: 16px;
  font-size: 1.3rem;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(245,87,108,0.4);
  animation: bounceIn 0.5s cubic-bezier(.36,.07,.19,.97);
}

/* ── 트랜지션 ── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.winner-pop-enter-active { animation: bounceIn 0.5s cubic-bezier(.36,.07,.19,.97); }
.winner-pop-leave-active { transition: opacity 0.2s; }
.winner-pop-leave-to { opacity: 0; }

/* ── 애니메이션 ── */
@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes bounceIn {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.1); }
  80% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes pulseIn {
  0% { transform: translate(-50%,-50%) scale(0.5); opacity: 0; }
  100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
}

/* ── 반응형 ── */
@media (max-width: 600px) {
  .hero-title { font-size: 2.2rem; }
  .game-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .game-wrap { padding: 30px 18px 28px; }
  .roulette-canvas { width: 250px; height: 250px; }
}
</style>