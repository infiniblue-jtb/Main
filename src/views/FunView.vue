<template>
  <div class="fun-page">

    <!-- ── 헤더 ───────────────────────────── -->
    <header class="fun-header">
      <div class="header-bg">
        <div class="grid-lines"></div>
        <div class="header-glow"></div>
      </div>
      <div class="header-content">
        <div class="header-badge">🎮 FUN ZONE</div>
        <h1 class="header-title">
          <span class="title-line1">재미있는</span>
          <span class="title-line2">놀이터</span>
        </h1>
        <p class="header-sub">심심할 때 즐기는 박진감 넘치는 복불복 게임</p>
      </div>
    </header>

    <!-- ── 게임 카드 그리드 ─────────────────── -->
    <section class="games-section">
      <div class="games-grid">
        <div
          v-for="game in gameCards"
          :key="game.id"
          class="game-card"
          :class="`card-${game.id}`"
          @click="openGame(game.id)"
        >
          <div class="card-glow"></div>
          <div class="card-inner">
            <div class="card-icon">{{ game.icon }}</div>
            <h3 class="card-name">{{ game.name }}</h3>
            <p class="card-desc">{{ game.desc }}</p>
            <div class="card-cta">
              <span>PLAY</span>
              <span class="cta-arrow">→</span>
            </div>
          </div>
          <div class="card-scan"></div>
        </div>
      </div>
    </section>

    <!-- Ad Unit -->
    <AdComponent slotId="9173007135" />

    <!-- ── 모달 (Teleport 제거 → scoped CSS 정상 적용) ── -->
    <Transition name="modal">
      <div v-if="activeGame" class="modal-overlay" @click.self="closeGame">
        <div class="modal-box">
          <button class="modal-close" @click="closeGame">✕</button>

          <!-- ===== 로또 ===== -->
          <div v-if="activeGame === 'lotto'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">🎰</span>
              <h2>로또 번호 생성기</h2>
            </div>
            <div class="lotto-area">
              <div class="lotto-rows">
                <div
                  v-for="(row, idx) in lottoRows"
                  :key="idx"
                  class="lotto-row"
                  :style="{ animationDelay: `${idx * 0.12}s` }"
                >
                  <span class="row-num">{{ idx + 1 }}</span>
                  <div class="ball-row">
                    <div
                      v-for="(num, ni) in row"
                      :key="ni"
                      class="ball"
                      :class="ballColor(num)"
                      :style="{ animationDelay: `${idx * 0.12 + ni * 0.06}s` }"
                    >{{ num }}</div>
                  </div>
                </div>
              </div>
              <div v-if="lottoRows.length === 0" class="empty-hint">
                <div class="empty-icon">🎱</div>
                <p>버튼을 눌러 행운의 번호를 뽑아보세요!</p>
              </div>
            </div>
            <button
              class="action-btn"
              :class="{ generating: isGenerating }"
              @click="generateLotto"
              :disabled="isGenerating"
            >
              <span v-if="!isGenerating">🎰 번호 뽑기 (7줄)</span>
              <span v-else class="dots">생성 중<span>.</span><span>.</span><span>.</span></span>
            </button>
          </div>

          <!-- ===== 사다리 ===== -->
          <div v-if="activeGame === 'ladder'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">🪜</span>
              <h2>사다리 타기</h2>
            </div>
            <div v-if="!ladderStarted" class="setup-panel">
              <div class="count-ctrl">
                <button class="count-btn" @click="pCount = Math.max(2, pCount - 1)">－</button>
                <span class="count-val">{{ pCount }}명</span>
                <button class="count-btn" @click="pCount = Math.min(8, pCount + 1)">＋</button>
              </div>
              <div class="name-grid" :style="{ gridTemplateColumns: `repeat(${Math.min(pCount, 4)}, 1fr)` }">
                <input
                  v-for="i in pCount" :key="i"
                  v-model="pNames[i-1]"
                  class="name-input"
                  :placeholder="`참가자 ${i}`"
                />
              </div>
              <button class="action-btn" @click="startLadder">🪜 사다리 시작!</button>
            </div>
            <div v-else class="ladder-viz">
              <div class="top-names">
                <div
                  v-for="i in pCount" :key="i"
                  class="top-name"
                  :class="{ active: ladderActiveCol === i - 1 }"
                >{{ pNames[i-1] || `P${i}` }}</div>
              </div>
              <canvas ref="ladderCanvas" class="ladder-canvas"></canvas>
              <div class="bottom-slots">
                <div
                  v-for="i in pCount" :key="i"
                  class="bottom-slot"
                  :class="{
                    win:  ladderResultCol === i - 1 && ladderDone,
                    lose: ladderResultCol !== i - 1 && ladderDone
                  }"
                >{{ ladderResultCol === i - 1 ? '🏆 WIN' : '✕' }}</div>
              </div>
              <Transition name="winner-pop">
                <div v-if="ladderDone" class="winner-banner">
                  <div class="winner-confetti">🎊</div>
                  <div class="winner-text">{{ ladderWinnerName }} 당첨!</div>
                  <button class="action-btn sm" @click="ladderStarted = false; ladderDone = false">다시 하기</button>
                </div>
              </Transition>
            </div>
          </div>

          <!-- ===== 경마 / 차량 레이스 ===== -->
          <div v-if="activeGame === 'horse' || activeGame === 'car'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">{{ activeGame === 'horse' ? '🐎' : '🏎️' }}</span>
              <h2>{{ activeGame === 'horse' ? '경마 복불복' : '차량 복불복' }}</h2>
            </div>
            <div v-if="!raceActive && !raceWinner" class="setup-panel">
              <div class="count-ctrl">
                <button class="count-btn" @click="pCount = Math.max(2, pCount - 1)">－</button>
                <span class="count-val">{{ pCount }}명</span>
                <button class="count-btn" @click="pCount = Math.min(6, pCount + 1)">＋</button>
              </div>

              <!-- 트랙 선택 (차량 레이스만) -->
              <div v-if="activeGame === 'car'" class="track-select-group">
                <span class="group-label">트랙 선택:</span>
                <div class="track-options">
                  <button 
                    v-for="t in ['circle', 'oval', 'square']" 
                    :key="t"
                    class="track-opt-btn"
                    :class="{ active: raceTrackType === t }"
                    @click="raceTrackType = t"
                  >
                    {{ t === 'circle' ? '원형' : t === 'oval' ? '타원형' : '사각형' }}
                  </button>
                </div>
              </div>

              <div class="name-grid" :style="{ gridTemplateColumns: `repeat(${Math.min(pCount, 3)}, 1fr)` }">
                <input
                  v-for="i in pCount" :key="i"
                  v-model="pNames[i-1]"
                  class="name-input"
                  :placeholder="`참가자 ${i}`"
                />
              </div>
              <button class="action-btn" @click="startRace">
                {{ activeGame === 'horse' ? '🏁 경기 시작!' : '🚦 레이스 시작!' }}
              </button>
            </div>
            <div v-else class="race-area">
              <Transition name="fade-fast">
                <div v-if="countdown > 0" class="countdown-overlay">
                  <div class="countdown-num" :key="countdown">{{ countdown }}</div>
                </div>
              </Transition>

              <!-- 🐎 경마: 기존 선형 트랙 -->
              <div v-if="activeGame === 'horse'" class="race-track">
                <div
                  v-for="(racer, idx) in racers"
                  :key="idx"
                  class="race-lane"
                  :class="{ leading: raceLeader === idx }"
                >
                  <div class="lane-label">{{ racer.name }}</div>
                  <div class="lane-road">
                    <canvas
                      class="lane-canvas"
                      :ref="el => { if(el) laneCanvases[idx] = el }"
                    ></canvas>
                  </div>
                  <div class="place-badge" v-if="racer.place">{{ racer.place }}위</div>
                </div>
              </div>

              <!-- 🏎️ 차량: 향상된 트랙 -->
              <div v-else class="circuit-container">
                <canvas ref="circuitCanvas" class="circuit-canvas"></canvas>
              </div>

              <Transition name="winner-pop">
                <div v-if="raceWinner" class="winner-banner">
                  <div class="winner-confetti">🎊</div>
                  <div class="winner-text">🏆 {{ raceWinner }} 우승!</div>
                  <button class="action-btn sm" @click="resetRace">다시 하기</button>
                </div>
              </Transition>
            </div>
          </div>

          <!-- ===== 핀볼 ===== -->
          <div v-if="activeGame === 'pinball'" class="game-wrap pinball-wrap">
            <div class="game-title-row">
              <span class="g-icon">🔮</span>
              <h2>핀볼 복불복</h2>
            </div>
            <div class="pinball-container">
              <canvas ref="pinballCanvas" class="pinball-canvas"></canvas>
              <div v-if="!pinballActive" class="pinball-start-overlay">
                <button class="action-btn" @click="startPinball">🔮 구슬 발사!</button>
                <p class="pinball-hint">A/D 키 또는 좌우 화살표로 플리퍼 조작</p>
              </div>
              <div class="pinball-score">Score: {{ pinballScore }}</div>
            </div>
          </div>

          <!-- ===== 룰렛 ===== -->
          <div v-if="activeGame === 'roulette'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">🎡</span>
              <h2>룰렛 복불복</h2>
            </div>
            <div v-if="!rouletteStarted" class="setup-panel">
              <div class="count-ctrl">
                <button class="count-btn" @click="pCount = Math.max(2, pCount - 1)">－</button>
                <span class="count-val">{{ pCount }}칸</span>
                <button class="count-btn" @click="pCount = Math.min(8, pCount + 1)">＋</button>
              </div>
              <div class="name-grid" :style="{ gridTemplateColumns: `repeat(${Math.min(pCount, 4)}, 1fr)` }">
                <input
                  v-for="i in pCount" :key="i"
                  v-model="pNames[i-1]"
                  class="name-input"
                  :placeholder="`항목 ${i}`"
                />
              </div>
              <button class="action-btn" @click="rouletteStarted = true">🎡 룰렛 준비!</button>
            </div>
            <div v-else class="roulette-wrap">
              <div class="wheel-pointer">▼</div>
              <div class="wheel-container">
                <canvas
                  ref="wheelCanvas"
                  class="wheel-canvas"
                  :style="{ transform: `rotate(${wheelAngle}deg)`, transition: wheelTransition }"
                ></canvas>
              </div>
              <Transition name="winner-pop">
                <div v-if="wheelWinner" class="winner-banner">
                  <div class="winner-confetti">🎊</div>
                  <div class="winner-text">🎯 {{ wheelWinner }}!</div>
                  <button class="action-btn sm" @click="resetRoulette">다시 돌리기</button>
                </div>
              </Transition>
              <button
                v-if="!wheelWinner"
                class="action-btn spin-btn"
                :class="{ spinning: isSpinning }"
                @click="spinWheel"
                :disabled="isSpinning"
              >{{ isSpinning ? '🌀 돌아가는 중...' : '🎡 룰렛 돌리기!' }}</button>
            </div>
          </div>

        </div><!-- /.modal-box -->
      </div><!-- /.modal-overlay -->
    </Transition>

  </div>
</template>

<script>
import { ref, nextTick, watch } from 'vue';
import AdComponent from '@/components/AdComponent.vue';

const GAME_CARDS = [
  { id: 'lotto',    icon: '🎰', name: '로또 번호 생성기', desc: '행운의 번호를 자동으로 뽑아보세요!' },
  { id: 'ladder',   icon: '🪜', name: '사다리 타기',       desc: '긴장감 넘치는 사다리 타기 애니메이션!' },
  { id: 'horse',    icon: '🐎', name: '경마 복불복',       desc: '내 이름을 걸고 달리는 짜릿한 레이스!' },
  { id: 'car',      icon: '🏎️', name: '차량 복불복',       desc: '3가지 트랙에서 펼쳐지는 분노의 질주!' },
  { id: 'roulette', icon: '🎡', name: '룰렛 복불복',       desc: '운명의 룰렛을 돌려보세요!' },
  { id: 'pinball',  icon: '🔮', name: '핀볼 게임',         desc: '짜릿한 손맛! 고득점에 도전하세요!' },
];

const WHEEL_COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff9f43','#a29bfe','#fd79a8','#00b894'];

const ballColor = (n) => {
  if (n <= 10) return 'b-yellow';
  if (n <= 20) return 'b-blue';
  if (n <= 30) return 'b-red';
  if (n <= 40) return 'b-gray';
  return 'b-green';
};

export default {
  name: 'FunView',
    components: { AdComponent },
  setup() {
    const gameCards  = GAME_CARDS;
    const activeGame = ref(null);
    const pCount     = ref(4);
    const pNames     = ref(Array.from({ length: 10 }, () => ''));
    const raceTrackType = ref('circle');

    /* ── 공통 리셋 ─────────────────────────── */
    const resetAll = () => {
      lottoRows.value        = [];
      isGenerating.value     = false;
      ladderStarted.value    = false;
      ladderDone.value       = false;
      ladderWinnerName.value = '';
      ladderResultCol.value  = -1;
      ladderActiveCol.value  = -1;
      raceActive.value       = false;
      racers.value           = [];
      raceWinner.value       = null;
      countdown.value        = 0;
      raceLeader.value       = -1;
      if (raceInterval) { clearInterval(raceInterval); raceInterval = null; }
      rouletteStarted.value  = false;
      wheelWinner.value      = null;
      wheelAngle.value       = 0;
      wheelTransition.value  = 'none';
      isSpinning.value       = false;
      stopPinball();
    };

    const openGame  = (id) => { resetAll(); activeGame.value = id; };
    const closeGame = ()   => { activeGame.value = null; };

    /* ══════════ 로또 ══════════ */
    const lottoRows    = ref([]);
    const isGenerating = ref(false);

    const generateLotto = async () => {
      if (isGenerating.value) return;
      isGenerating.value = true;
      lottoRows.value = [];
      for (let i = 0; i < 7; i++) {
        await new Promise(r => setTimeout(r, 160));
        const nums = new Set();
        while (nums.size < 6) nums.add(Math.floor(Math.random() * 45) + 1);
        lottoRows.value.push([...nums].sort((a, b) => a - b));
      }
      isGenerating.value = false;
    };

    /* ══════════ 사다리 ══════════ */
    const ladderCanvas     = ref(null);
    const ladderStarted    = ref(false);
    const ladderDone       = ref(false);
    const ladderWinnerName = ref('');
    const ladderResultCol  = ref(-1);
    const ladderActiveCol  = ref(-1);

    /* ══════════ 핀볼 ══════════ */
    const pinballCanvas  = ref(null);
    const pinballActive  = ref(false);
    const pinballScore   = ref(0);
    let pinballAnimId    = null;
    let pinballState     = {
      ball: { x: 230, y: 50, vx: (Math.random() - 0.5) * 4, vy: 2, r: 8 },
      flippers: { left: 0, right: 0 },
      bumpers: [{ x: 150, y: 150, r: 20 }, { x: 310, y: 150, r: 20 }, { x: 230, y: 250, r: 25 }]
    };

    const startPinball = async () => {
      pinballActive.value = true;
      pinballScore.value  = 0;
      pinballState = {
        ball: { x: 230, y: 50, vx: (Math.random() - 0.5) * 4, vy: 2, r: 8 },
        flippers: { left: 0, right: 0 },
        bumpers: [{ x: 150, y: 150, r: 20 }, { x: 310, y: 150, r: 20 }, { x: 230, y: 250, r: 25 }]
      };
      await nextTick();
      runPinball();
    };

    const stopPinball = () => {
      pinballActive.value = false;
      if (pinballAnimId) { cancelAnimationFrame(pinballAnimId); pinballAnimId = null; }
    };

    const runPinball = () => {
      if (!pinballActive.value) return;
      const canvas = pinballCanvas.value;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = 460, H = 500;
      canvas.width = W; canvas.height = H;

      const update = () => {
        if (!pinballActive.value) return;
        let b = pinballState.ball;
        b.x += b.vx; b.y += b.vy;
        b.vy += 0.05;

        if (b.x - b.r < 0 || b.x + b.r > W) b.vx *= -1;
        if (b.y - b.r < 0) b.vy *= -1;
        if (b.y + b.r > H) {
          b.x = 230; b.y = 50; b.vx = (Math.random() - 0.5) * 4; b.vy = 2;
        }

        pinballState.bumpers.forEach(bump => {
          let dx = b.x - bump.x, dy = b.y - bump.y;
          let dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < b.r + bump.r) {
            let angle = Math.atan2(dy, dx);
            b.vx = Math.cos(angle) * 5; b.vy = Math.sin(angle) * 5;
            pinballScore.value += 10;
          }
        });

        const fL = { x: 100, y: 450, w: 100, h: 10, angle: pinballState.flippers.left ? -0.3 : 0.3 };
        const fR = { x: 260, y: 450, w: 100, h: 10, angle: pinballState.flippers.right ? 0.3 : -0.3 };
        
        [fL, fR].forEach(f => {
          if (b.y + b.r > f.y && b.y - b.r < f.y + f.h && b.x > f.x && b.x < f.x + f.w) {
            b.vy = -Math.abs(b.vy) - 2;
            b.vx += f.angle * 10;
          }
        });

        draw();
        pinballAnimId = requestAnimationFrame(update);
      };

      const draw = () => {
        ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, W, H);
        ctx.beginPath(); ctx.arc(pinballState.ball.x, pinballState.ball.y, pinballState.ball.r, 0, Math.PI*2);
        ctx.fillStyle = '#00f5ff'; ctx.fill();
        ctx.fillStyle = '#a29bfe';
        pinballState.bumpers.forEach(bump => {
          ctx.beginPath(); ctx.arc(bump.x, bump.y, bump.r, 0, Math.PI*2); ctx.fill();
        });
        ctx.fillStyle = '#fd79a8';
        ctx.fillRect(100, 450 + (pinballState.flippers.left ? -20 : 0), 100, 10);
        ctx.fillRect(260, 450 + (pinballState.flippers.right ? -20 : 0), 100, 10);
      };

      const handleKey = (e) => {
        const active = e.type === 'keydown';
        if (e.key === 'a' || e.key === 'ArrowLeft') pinballState.flippers.left = active ? 1 : 0;
        if (e.key === 'd' || e.key === 'ArrowRight') pinballState.flippers.right = active ? 1 : 0;
      };
      window.addEventListener('keydown', handleKey);
      window.addEventListener('keyup', handleKey);

      update();
    };

    const startLadder = async () => {
      ladderStarted.value   = true;
      ladderDone.value      = false;
      ladderResultCol.value = -1;
      await nextTick();

      const canvas = ladderCanvas.value;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const W   = canvas.clientWidth  || 460;
      const H   = canvas.clientHeight || 300;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const cols  = pCount.value;
      const PAD_X = 30, PAD_Y = 30;
      const colW  = (W - PAD_X * 2) / Math.max(cols - 1, 1);

      const bars = [];
      for (let col = 0; col < cols - 1; col++) {
        const count = 2 + Math.floor(Math.random() * 3);
        const used  = [];
        let tries   = 0;
        while (used.length < count && tries < 60) {
          tries++;
          const y = PAD_Y + 20 + Math.floor(Math.random() * 10) * ((H - PAD_Y * 2 - 20) / 10);
          if (used.every(py => Math.abs(py - y) > 18)) { used.push(y); bars.push({ col, y }); }
        }
      }
      bars.sort((a, b) => a.y - b.y);

      const startCol = Math.floor(Math.random() * cols);
      ladderActiveCol.value = startCol;
      let cur = startCol;
      const path = [{ x: PAD_X + cur * colW, y: PAD_Y }];
      bars.forEach(bar => {
        if (bar.col === cur) {
          path.push({ x: PAD_X + cur * colW, y: bar.y });
          cur++;
          path.push({ x: PAD_X + cur * colW, y: bar.y });
        } else if (bar.col === cur - 1) {
          path.push({ x: PAD_X + cur * colW, y: bar.y });
          cur--;
          path.push({ x: PAD_X + cur * colW, y: bar.y });
        }
      });
      path.push({ x: PAD_X + cur * colW, y: H - PAD_Y });
      ladderResultCol.value  = cur;
      ladderWinnerName.value = pNames.value[startCol] || `참가자${startCol + 1}`;

      const draw = (progress) => {
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < cols; i++) {
          ctx.beginPath(); ctx.strokeStyle = 'rgba(180,180,220,0.3)'; ctx.lineWidth = 3;
          ctx.moveTo(PAD_X + i * colW, PAD_Y); ctx.lineTo(PAD_X + i * colW, H - PAD_Y); ctx.stroke();
        }
        bars.forEach(bar => {
          ctx.beginPath(); ctx.strokeStyle = 'rgba(180,180,220,0.5)'; ctx.lineWidth = 3;
          ctx.moveTo(PAD_X + bar.col * colW, bar.y); ctx.lineTo(PAD_X + (bar.col + 1) * colW, bar.y); ctx.stroke();
        });
        if (progress > 0 && path.length > 1) {
          const total  = path.length - 1;
          const segIdx = Math.min(Math.floor(progress * total), total - 1);
          ctx.beginPath(); ctx.strokeStyle = '#00f5ff'; ctx.lineWidth = 5;
          ctx.shadowColor = '#00f5ff'; ctx.shadowBlur = 14;
          ctx.moveTo(path[0].x, path[0].y);
          for (let i = 0; i < segIdx; i++) ctx.lineTo(path[i + 1].x, path[i + 1].y);
          const frac = (progress * total) % 1;
          const p0 = path[segIdx], p1 = path[Math.min(segIdx + 1, total)];
          ctx.lineTo(p0.x + (p1.x - p0.x) * frac, p0.y + (p1.y - p0.y) * frac);
          ctx.stroke(); ctx.shadowBlur = 0;
        }
      };
      let p = 0;
      const animate = () => {
        p = Math.min(p + 0.006, 1); draw(p);
        if (p < 1) requestAnimationFrame(animate);
        else { draw(1); ladderDone.value = true; }
      };
      animate();
    };

    /* ══════════ 레이스 ══════════ */
    const racers       = ref([]);
    const raceActive   = ref(false);
    const raceWinner   = ref(null);
    const countdown    = ref(0);
    const raceLeader   = ref(-1);
    const laneCanvases = ref([]);
    const circuitCanvas = ref(null);
    let   raceInterval = null;
    let   placeCounter = 1;

    // 원형 트랙 그리기 (차량용)
    const drawCircuit = () => {
      const canvas = circuitCanvas.value;
      if (!canvas) return;
      const W = canvas.clientWidth || 460;
      const H = canvas.clientHeight || 320;
      if (W <= 0 || H <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
        canvas.width = W * dpr;
        canvas.height = H * dpr;
      }
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const rx = W * 0.38, ry = H * 0.35;

      // 트랙 배경 (아스팔트 느낌)
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx + 30, ry + 30, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a2e';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 중앙 잔디
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx - 30, ry - 30, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#0d0d1a';
      ctx.fill();
      ctx.stroke();

      // 결승선
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.moveTo(cx + rx - 30, cy);
      ctx.lineTo(cx + rx + 30, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // 차량들 그리기
      racers.value.forEach((r, idx) => {
        const laneOffset = (idx - (pCount.value - 1) / 2) * 12;
        const curRx = rx + laneOffset;
        const curRy = ry + laneOffset;
        
        // progress 0-100 -> angle (3시 방향이 0도, 시계방향)
        const angle = (r.progress / 100) * Math.PI * 2;
        const x = cx + curRx * Math.cos(angle);
        const y = cy + curRy * Math.sin(angle);
        
        // 진행 방향 (접선 각도)
        const tangent = angle + Math.PI / 2;

        const eSize = 28;
        const emoji = '🏎️';
        const dust  = '💨';

        // 연기 (뒤쪽에 그림)
        if (raceActive.value && !r.finished) {
        ctx.save();
        // 차량 뒤쪽 위치 계산
        const dustX = x - Math.cos(tangent) * 15;
        const dustY = y - Math.sin(tangent) * 15;
        ctx.translate(dustX, dustY);
        ctx.rotate(tangent);
        ctx.scale(-1, 1); // 연기 좌우 대칭
        ctx.font = `${eSize * 0.6}px serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        // 수평 맞춤을 위해 y좌표 미세 조정
        ctx.fillText(dust, 0, 2); 
        ctx.restore();
        }

        // 자동차
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tangent);
        ctx.scale(-1, 1); // 자동차 좌우 대칭
        ctx.font = `${eSize}px serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(emoji, 0, 0);
        ctx.restore();
        });
        };

        const drawLane = (canvas, racer, isActive) => {
        if (!canvas || !racer) return;
        const W = canvas.clientWidth || 300;
        const H = canvas.clientHeight || 46;
        const dpr = window.devicePixelRatio || 1;
        if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        }
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        // 점선
        ctx.beginPath();
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.moveTo(W * 0.05, H / 2);
        ctx.lineTo(W * 0.9, H / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 결승 깃발
        ctx.font = `${H * 0.7}px serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('🏁', W - H * 0.8, H / 2);

        const emoji = activeGame.value === 'horse' ? '🐎' : '🏎️';
        const dust  = '💨';
        const eSize = Math.floor(H * 0.85);
        const x     = W * (racer.progress / 100);
        const cy    = H / 2;

        ctx.save();
        ctx.font = `${eSize}px serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        if (isActive) {
        // 연기: 캐릭터 왼쪽에 그림 + 방향 반전 + 수평 조정
        ctx.save();
        ctx.translate(x - eSize * 0.5, cy + 2);
        ctx.scale(-1, 1); // 연기 좌우 대칭
        ctx.font = `${Math.floor(eSize * 0.6)}px serif`;
        ctx.fillText(dust, 0, 0);
        ctx.restore();
        }

        // 이모지
        ctx.save();
        ctx.translate(x, cy);
        ctx.scale(-1, 1); // 말/자동차 좌우 대칭
        ctx.fillText(emoji, 0, 0);
        ctx.restore();
      ctx.restore();
    };

    const startRace = async () => {
      placeCounter     = 1;
      raceWinner.value = null;
      racers.value = Array.from({ length: pCount.value }, (_, i) => ({
        name: pNames.value[i] || `참가자${i + 1}`,
        progress: 0, speed: 0.4 + Math.random() * 0.4, finished: false, place: null,
      }));
      
      // 레이스 화면으로 즉시 전환 (트랙과 카운트다운 표시를 위해)
      raceActive.value = true;
      await nextTick();
      
      if (activeGame.value === 'horse') {
        laneCanvases.value = [];
        await nextTick();
        racers.value.forEach((r, idx) => {
          drawLane(laneCanvases.value[idx], r, false);
        });
      } else {
        drawCircuit();
      }

      countdown.value = 3;
      const t = setInterval(() => {
        countdown.value--;
        if (countdown.value === 0) { clearInterval(t); nextTick().then(() => runRace()); }
      }, 1000);
    };

    const runRace = () => {
      raceActive.value = true;
      raceInterval = setInterval(() => {
        let maxP = -1;
        racers.value = racers.value.map((r, idx) => {
          if (r.finished) return r;
          const jitter = (Math.random() - 0.3) * 1.6;
          const np     = Math.min(r.progress + r.speed + jitter, 96);
          if (np > maxP) { maxP = np; raceLeader.value = idx; }
          if (np >= 96) {
            const place = placeCounter++;
            return { ...r, progress: 96, finished: true, place };
          }
          return { ...r, progress: np };
        });

        if (activeGame.value === 'horse') {
          racers.value.forEach((r, idx) => {
            drawLane(laneCanvases.value[idx], r, raceActive.value);
          });
        } else {
          drawCircuit();
        }

        if (placeCounter > pCount.value) {
          clearInterval(raceInterval); raceInterval = null; raceActive.value = false;
          if (activeGame.value === 'horse') {
            racers.value.forEach((r, idx) => drawLane(laneCanvases.value[idx], r, false));
          } else {
            drawCircuit();
          }
          const winner = racers.value.find(r => r.place === 1);
          if (winner) raceWinner.value = winner.name;
        }
      }, 60);
    };

    const resetRace = () => {
      if (raceInterval) { clearInterval(raceInterval); raceInterval = null; }
      raceActive.value = false; racers.value = []; raceWinner.value = null; raceLeader.value = -1;
    };

    /* ══════════ 룰렛 ══════════ */
    const wheelCanvas     = ref(null);
    const rouletteStarted = ref(false);
    const wheelAngle      = ref(0);
    const wheelTransition = ref('none');
    const isSpinning      = ref(false);
    const wheelWinner     = ref(null);

    const drawWheel = () => {
      const canvas = wheelCanvas.value;
      if (!canvas) return;
      const size = canvas.clientWidth || 240;
      const dpr  = window.devicePixelRatio || 1;
      canvas.width = size * dpr; canvas.height = size * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      const cx = size / 2, cy = size / 2, r = size / 2 - 4;
      const n = pCount.value, arc = (2 * Math.PI) / n;
      for (let i = 0; i < n; i++) {
        const start = i * arc - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, start + arc); ctx.closePath();
        ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length]; ctx.fill();
        ctx.strokeStyle = '#12122a'; ctx.lineWidth = 2; ctx.stroke();
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(start + arc / 2);
        ctx.textAlign = 'right'; ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.max(10, Math.floor(14 - n * 0.5))}px sans-serif`;
        ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 4;
        ctx.fillText(pNames.value[i] || `항목${i + 1}`, r - 8, 5); ctx.restore();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
      ctx.fillStyle = '#12122a'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
    };

    watch(rouletteStarted, async (val) => { if (val) { await nextTick(); drawWheel(); } });
    watch([pCount, pNames], async () => { if (rouletteStarted.value) { await nextTick(); drawWheel(); } }, { deep: true });

    const resetRoulette = async () => {
      wheelWinner.value = null; wheelAngle.value = 0; wheelTransition.value = 'none';
      await nextTick(); drawWheel();
    };

    const spinWheel = () => {
      if (isSpinning.value) return;
      isSpinning.value = true; wheelWinner.value = null;
      const totalDeg   = (6 + Math.floor(Math.random() * 6)) * 360 + Math.random() * 360;
      const finalAngle = wheelAngle.value + totalDeg;
      wheelTransition.value = 'transform 4s cubic-bezier(0.17,0.67,0.12,1)';
      wheelAngle.value      = finalAngle;
      setTimeout(() => {
        isSpinning.value = false; wheelTransition.value = 'none';
        const n = pCount.value, arcDeg = 360 / n;
        // 캔버스는 -90도(12시)에서 시작, 포인터(▼)는 상단 고정
        // finalAngle만큼 회전했으므로 실제 포인터가 가리키는 각도 = (0 - finalAngle % 360 + 360) % 360 → 12시 기준
        const rotated = ((finalAngle % 360) + 360) % 360;
        const pointedAngle = (360 - rotated) % 360;
        const idx = Math.floor(pointedAngle / arcDeg) % n;
        wheelWinner.value = pNames.value[idx] || `항목${idx + 1}`;
      }, 4100);
    };

    return {
      gameCards, activeGame, openGame, closeGame, pCount, pNames, ballColor,
      lottoRows, isGenerating, generateLotto,
      ladderCanvas, ladderStarted, ladderDone, ladderWinnerName, ladderResultCol, ladderActiveCol, startLadder,
      racers, raceActive, raceWinner, countdown, raceLeader, laneCanvases, circuitCanvas, startRace, resetRace,
      wheelCanvas, rouletteStarted, wheelAngle, wheelTransition, isSpinning, wheelWinner, spinWheel, resetRoulette,
    };
  }
};
</script>

<style scoped>
.fun-page {
  min-height: 100vh;
  background: #0d0d1a;
  color: #e0e0f0;
  font-family: 'Apple SD Gothic Neo', 'Pretendard', 'Noto Sans KR', sans-serif;
  overflow-x: hidden;
}

/* 헤더 */
.fun-header { position: relative; padding: 80px 24px 60px; text-align: center; overflow: hidden; }
.header-bg  { position: absolute; inset: 0; pointer-events: none; }
.grid-lines {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(0,245,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,245,255,0.06) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: grid-scroll 20s linear infinite;
}
@keyframes grid-scroll { from { background-position: 0 0; } to { background-position: 40px 40px; } }
.header-glow {
  position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
  width: 500px; height: 300px;
  background: radial-gradient(ellipse, rgba(0,245,255,0.18) 0%, transparent 70%);
}
.header-content { position: relative; }
.header-badge {
  display: inline-block;
  background: rgba(0,245,255,0.12); border: 1px solid rgba(0,245,255,0.4);
  color: #00f5ff; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em;
  padding: 6px 16px; border-radius: 30px; margin-bottom: 20px;
}
.header-title { display: flex; flex-direction: column; align-items: center; line-height: 1; margin-bottom: 16px; }
.title-line1 { font-size: clamp(1.8rem,6vw,3rem); font-weight: 300; color: rgba(255,255,255,0.5); letter-spacing: 0.15em; }
.title-line2 {
  font-size: clamp(3.5rem,12vw,7rem); font-weight: 900; letter-spacing: -0.02em;
  background: linear-gradient(135deg,#00f5ff,#a29bfe,#fd79a8);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.header-sub { font-size: 1rem; color: rgba(255,255,255,0.35); letter-spacing: 0.05em; }

/* 카드 그리드 */
.games-section { max-width: 1100px; margin: 0 auto; padding: 0 24px 100px; }
.games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }

.game-card {
  position: relative; border-radius: 20px; overflow: hidden; cursor: pointer;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  transition: transform 0.35s cubic-bezier(.2,.8,.2,1), border-color 0.3s;
}
.game-card:hover { transform: translateY(-8px) scale(1.02); border-color: rgba(0,245,255,0.4); }
.game-card:hover .card-glow { opacity: 1; }
.game-card:hover .card-scan { animation-play-state: running; }
.game-card:hover .cta-arrow { transform: translateX(4px); }

.card-glow { position: absolute; inset: 0; border-radius: 20px; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
/* ✅ 수정: .card-roulette .card-glow (기존엔 .card-roulette.card-glow 로 잘못 씀) */
.card-lotto    .card-glow { box-shadow: inset 0 0 40px rgba(255,107,107,0.25); }
.card-ladder   .card-glow { box-shadow: inset 0 0 40px rgba(77,150,255,0.25); }
.card-horse    .card-glow { box-shadow: inset 0 0 40px rgba(255,215,61,0.25); }
.card-car      .card-glow { box-shadow: inset 0 0 40px rgba(107,203,119,0.25); }
.card-roulette .card-glow { box-shadow: inset 0 0 40px rgba(162,155,254,0.25); }

.card-scan {
  position: absolute; top: -100%; left: 0; right: 0; height: 60px;
  background: linear-gradient(180deg, transparent, rgba(0,245,255,0.08), transparent);
  animation: scan 2.5s linear infinite paused;
}
@keyframes scan { from { top: -100%; } to { top: 200%; } }

.card-inner { position: relative; padding: 30px 24px; display: flex; flex-direction: column; gap: 10px; min-height: 200px; }
.card-icon { font-size: 3rem; margin-bottom: 4px; }
.card-name { font-size: 1.1rem; font-weight: 700; color: #fff; margin: 0; }
.card-desc { font-size: 0.82rem; color: rgba(255,255,255,0.45); line-height: 1.5; flex: 1; margin: 0; }
.card-cta  { display: flex; align-items: center; gap: 6px; color: #00f5ff; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.12em; margin-top: 4px; }
.cta-arrow { transition: transform 0.2s; }

/* 모달 */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  z-index: 10001; /* ✅ App.vue nav(9999) 보다 높게 */
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-box {
  position: relative; background: #12122a;
  border: 1px solid rgba(255,255,255,0.1); border-radius: 28px;
  width: 100%; max-width: 560px; max-height: 88vh; overflow-y: auto;
  box-shadow: 0 0 60px rgba(0,245,255,0.12), 0 30px 60px rgba(0,0,0,0.6);
}
.modal-close {
  position: absolute; top: 18px; right: 18px;
  background: rgba(255,255,255,0.08); border: none; color: rgba(255,255,255,0.5);
  width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 0.9rem; z-index: 10;
  transition: background 0.2s, color 0.2s;
}
.modal-close:hover { background: rgba(255,80,80,0.35); color: #fff; }
.modal-enter-active { transition: opacity 0.3s, transform 0.3s cubic-bezier(.2,.8,.2,1); }
.modal-leave-active { transition: opacity 0.22s, transform 0.18s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.88) translateY(20px); }

/* 게임 공통 */
.game-wrap { padding: 36px 28px 32px; }
.game-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.g-icon { font-size: 2rem; }
.game-title-row h2 { font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0; }

.setup-panel { display: flex; flex-direction: column; gap: 18px; align-items: center; }
.count-ctrl  { display: flex; align-items: center; gap: 20px; }
.count-btn {
  width: 40px; height: 40px; border-radius: 50%;
  border: 1px solid rgba(0,245,255,0.5); background: rgba(0,245,255,0.08);
  color: #00f5ff; font-size: 1.3rem; cursor: pointer; transition: background 0.2s; line-height: 1;
}
.count-btn:hover { background: rgba(0,245,255,0.2); }
.count-val { font-size: 1.2rem; font-weight: 700; color: #fff; min-width: 60px; text-align: center; }

.name-grid { display: grid; gap: 10px; width: 100%; }
.name-input {
  width: 100%; padding: 10px 14px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; color: #e0e0f0; font-size: 0.9rem; transition: border-color 0.2s; box-sizing: border-box;
}
.name-input:focus { outline: none; border-color: rgba(0,245,255,0.5); }
.name-input::placeholder { color: rgba(255,255,255,0.25); }

.action-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg,#00f5ff,#0071e3); color: #000;
  font-weight: 800; font-size: 1rem; border: none; padding: 14px 32px;
  border-radius: 14px; cursor: pointer; transition: all 0.25s;
  box-shadow: 0 0 20px rgba(0,245,255,0.3); letter-spacing: 0.02em;
}
.action-btn:hover    { transform: translateY(-2px); box-shadow: 0 0 35px rgba(0,245,255,0.5); }
.action-btn:active   { transform: scale(0.97); }
.action-btn:disabled { opacity: 0.5; cursor: default; transform: none !important; box-shadow: none; }
.action-btn.sm       { padding: 10px 22px; font-size: 0.85rem; }
.action-btn.generating { background: linear-gradient(135deg,#a29bfe,#6c5ce7); color: #fff; }

.dots span              { animation: blink 1.2s infinite; }
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%,80%,100%{ opacity:0 } 40%{ opacity:1 } }

/* 로또 */
.lotto-area { min-height: 120px; margin-bottom: 24px; }
.lotto-rows { display: flex; flex-direction: column; gap: 10px; }
.lotto-row {
  display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.04); padding: 10px 14px; border-radius: 12px;
  animation: row-in 0.4s ease both;
}
@keyframes row-in { from { opacity:0; transform: translateX(-16px); } to { opacity:1; transform: translateX(0); } }
.row-num   { font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.3); min-width: 24px; }
.ball-row  { display: flex; gap: 7px; flex-wrap: wrap; }
.ball {
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.78rem; font-weight: 800; color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  animation: ball-in 0.4s cubic-bezier(.2,.8,.2,1) both;
  box-shadow: 0 3px 10px rgba(0,0,0,0.3);
}
@keyframes ball-in { from { transform: scale(0) rotate(-180deg); opacity:0; } to { transform: scale(1) rotate(0); opacity:1; } }
.b-yellow { background: radial-gradient(circle at 35% 35%,#ffe44d,#f9a825); }
.b-blue   { background: radial-gradient(circle at 35% 35%,#64b5f6,#1565c0); }
.b-red    { background: radial-gradient(circle at 35% 35%,#ef9a9a,#c62828); }
.b-gray   { background: radial-gradient(circle at 35% 35%,#b0bec5,#546e7a); }
.b-green  { background: radial-gradient(circle at 35% 35%,#81c784,#2e7d32); }
.empty-hint {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 40px; border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px; color: rgba(255,255,255,0.25);
}
.empty-icon { font-size: 3rem; }

/* 사다리 */
.ladder-viz   { display: flex; flex-direction: column; gap: 8px; }
.top-names, .bottom-slots { display: flex; width: 100%; }
.top-name {
  flex: 1; text-align: center; font-size: 0.78rem; font-weight: 600;
  color: rgba(255,255,255,0.4); padding: 4px 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: color 0.3s, text-shadow 0.3s;
}
.top-name.active { color: #00f5ff; text-shadow: 0 0 8px #00f5ff; }
.ladder-canvas   { width: 100%; height: 300px; display: block; }
.bottom-slot {
  flex: 1; text-align: center; font-size: 0.72rem; font-weight: 700;
  padding: 6px 2px; border-radius: 8px; transition: all 0.4s; color: rgba(255,255,255,0.15);
}
.bottom-slot.win  { background: rgba(0,245,255,0.15); color: #00f5ff; text-shadow: 0 0 8px #00f5ff; }
.bottom-slot.lose { color: rgba(255,255,255,0.12); }

/* 레이스 */
.race-area { position: relative; }
.countdown-overlay {
  position: absolute; inset: 0; z-index: 5;
  display: flex; align-items: center; justify-content: center;
  background: rgba(13,13,26,0.75); border-radius: 16px;
}
.countdown-num {
  font-size: 6rem; font-weight: 900; color: #00f5ff;
  text-shadow: 0 0 40px #00f5ff, 0 0 80px rgba(0,245,255,0.4);
  animation: countdown-pulse 0.9s ease-out forwards;
}
@keyframes countdown-pulse {
  from { transform: scale(1.6); opacity: 0; } 40% { transform: scale(1); opacity: 1; } to { transform: scale(0.7); opacity: 0; }
}
.fade-fast-enter-active, .fade-fast-leave-active { transition: opacity 0.05s; }
.fade-fast-enter-from, .fade-fast-leave-to       { opacity: 0; }

.race-track { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
.race-lane  { display: flex; align-items: center; gap: 10px; padding: 4px 0; border-radius: 10px; transition: background 0.3s; }
.race-lane.leading { background: rgba(255,215,61,0.07); }
.lane-label { font-size: 0.78rem; font-weight: 600; color: rgba(255,255,255,0.45); width: 54px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lane-road  { flex: 1; height: 46px; background: rgba(255,255,255,0.04); border-radius: 23px; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.07); }
.lane-canvas { width: 100%; height: 100%; display: block; }
.lane-dash  {
  position: absolute; top: 50%; left: 5%; right: 10%; height: 1px;
  background: repeating-linear-gradient(90deg,rgba(255,255,255,0.1) 0,rgba(255,255,255,0.1) 10px,transparent 10px,transparent 20px);
}
.racer {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: inline-block;
}
.racer-emoji {
  position: relative;
  z-index: 2;
  font-size: 28px;
}
@keyframes racer-bounce { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-3px); } }
.racer-dust {
  position: absolute;
  right: -22px;   /* 캐릭터 뒤쪽 (진행 방향 반대) */
  top: 2px;
  font-size: 18px;
  opacity: 0.8;
}
@keyframes dust-fade { 0%,100%{ opacity:0.7; } 50%{ opacity:0.2; } }
.finish-flag { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); font-size: 1.3rem; }
.place-badge { font-size: 0.7rem; font-weight: 700; color: #ffd93d; width: 28px; text-align: right; flex-shrink: 0; }

/* 핀볼 */
.pinball-container { position: relative; background: #000; border-radius: 12px; overflow: hidden; }
.pinball-canvas { width: 100%; height: 500px; display: block; }
.pinball-start-overlay {
  position: absolute; inset: 0; display: flex; flex-direction: column; gap: 16px;
  align-items: center; justify-content: center; background: rgba(0,0,0,0.6);
}
.pinball-score { position: absolute; top: 10px; right: 20px; font-weight: 800; color: #00f5ff; }
.pinball-hint { color: rgba(255,255,255,0.6); font-size: 0.8rem; }

/* 새로운 회로 스타일 */
.circuit-container {
  width: 100%;
  height: 320px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0,0.2);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  margin-bottom: 20px;
}
.circuit-canvas {
  width: 100%;
  max-width: 500px;
  height: 320px;
  display: block;
}

/* 룰렛 */
.roulette-setup { display: flex; flex-direction: column; gap: 18px; align-items: center; }
.roulette-wrap  { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.wheel-pointer  { font-size: 2rem; color: #ff6b6b; text-shadow: 0 0 12px rgba(255,107,107,0.8); margin-bottom: -12px; z-index: 2; }
.wheel-container { width: 240px; height: 240px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.12); box-shadow: 0 0 40px rgba(0,0,0,0.5); overflow: hidden; }
.wheel-canvas    { width: 100%; height: 100%; display: block; }
.spin-btn { min-width: 180px; }
.spin-btn.spinning { background: linear-gradient(135deg,#a29bfe,#6c5ce7); color: #fff; animation: spin-pulse 0.8s infinite; }
@keyframes spin-pulse { 0%,100%{ box-shadow:0 0 20px rgba(162,155,254,0.3); } 50%{ box-shadow:0 0 40px rgba(162,155,254,0.7); } }

/* 위너 배너 */
.winner-banner {
  text-align: center; padding: 24px;
  background: rgba(0,245,255,0.06); border: 1px solid rgba(0,245,255,0.25); border-radius: 18px;
  display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 16px;
}
.winner-confetti { font-size: 2.5rem; animation: confetti-spin 0.8s cubic-bezier(.2,.8,.2,1); }
@keyframes confetti-spin { from { transform: rotate(-90deg) scale(0); } to { transform: rotate(0) scale(1); } }
.winner-text {
  font-size: 1.8rem; font-weight: 900;
  background: linear-gradient(135deg,#00f5ff,#a29bfe);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.winner-pop-enter-active { transition: all 0.5s cubic-bezier(.2,.8,.2,1); }
.winner-pop-enter-from   { opacity: 0; transform: scale(0.7) translateY(20px); }

/* 반응형 */
@media (max-width: 600px) {
  .games-grid      { grid-template-columns: repeat(2, 1fr); }
  .game-wrap       { padding: 28px 18px 24px; }
  .name-grid       { grid-template-columns: 1fr 1fr !important; }
  .wheel-container { width: 200px; height: 200px; }
  .winner-text     { font-size: 1.4rem; }
  .countdown-num   { font-size: 4rem; }
  .ladder-canvas   { height: 260px; }
}
@media (max-width: 380px) {
  .games-grid { grid-template-columns: 1fr; }
}
</style>