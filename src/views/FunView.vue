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

          <!-- ===== 경마 ===== -->
          <div v-if="activeGame === 'horse'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">🐎</span>
              <h2>경마 복불복</h2>
            </div>
            <div v-if="!raceActive && !raceWinner" class="setup-panel">
              <div class="count-ctrl">
                <button class="count-btn" @click="pCount = Math.max(2, pCount - 1)">－</button>
                <span class="count-val">{{ pCount }}명</span>
                <button class="count-btn" @click="pCount = Math.min(6, pCount + 1)">＋</button>
              </div>
              <div class="name-grid" :style="{ gridTemplateColumns: `repeat(${Math.min(pCount, 3)}, 1fr)` }">
                <input
                  v-for="i in pCount" :key="i"
                  v-model="pNames[i-1]"
                  class="name-input"
                  :placeholder="`참가자 ${i}`"
                />
              </div>
              <button class="action-btn" @click="startRace">🏁 경기 시작!</button>
            </div>
            <div v-else class="race-area">
              <Transition name="fade-fast">
                <div v-if="countdown > 0" class="countdown-overlay">
                  <div class="countdown-num" :key="countdown">{{ countdown }}</div>
                </div>
              </Transition>
              <div class="race-track">
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
              <span class="g-icon">🎮</span>
              <h2>핀볼 복불복</h2>
            </div>
            <div class="pinball-container">
              <canvas ref="pinballCanvas" class="pinball-canvas"></canvas>
              <!-- 이름 입력 + 리더보드 -->
              <div v-if="!pinballActive && !pbGameOver" class="pinball-start-overlay">
                <div class="pb-logo">⚡ PINBALL ⚡</div>
                <input v-model="pbPlayerName" class="pb-name-input" placeholder="플레이어 이름 입력" maxlength="10" @keyup.enter="startPinball" />
                <button class="action-btn" @click="startPinball" :disabled="!pbPlayerName.trim()">🔮 구슬 발사!</button>
                <p class="pinball-hint">⌨️ A/D 또는 ←→ 키 &nbsp;|&nbsp; 📱 좌우 터치</p>
                <div class="pb-lb" v-if="pbLeaderboard.length > 0">
                  <div class="pb-lb-hdr">🏆 TOP 5</div>
                  <div class="pb-lb-row" v-for="(e,i) in pbLeaderboard.slice(0,5)" :key="i">
                    <span class="pb-lb-rank">{{ ['🥇','🥈','🥉'][i] || (i+1)+'위' }}</span>
                    <span class="pb-lb-name">{{ e.name }}</span>
                    <span class="pb-lb-score">{{ e.score.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
              <!-- 게임 오버 -->
              <div v-if="pbGameOver" class="pb-gameover-overlay">
                <div class="pb-go-title">GAME OVER</div>
                <div class="pb-go-player">{{ pbPlayerName }}</div>
                <div class="pb-go-score">{{ pinballScore.toLocaleString() }}</div>
                <div class="pb-go-rank" v-if="pbMyRank <= 10">🏆 {{ pbMyRank }}위 등재!</div>
                <div class="pb-lb">
                  <div class="pb-lb-hdr">🏆 TOP 10</div>
                  <div class="pb-lb-row" v-for="(e,i) in pbLeaderboard" :key="i" :class="{highlight: e._isNew}">
                    <span class="pb-lb-rank">{{ ['🥇','🥈','🥉'][i] || (i+1)+'위' }}</span>
                    <span class="pb-lb-name">{{ e.name }}</span>
                    <span class="pb-lb-score">{{ e.score.toLocaleString() }}</span>
                  </div>
                </div>
                <button class="action-btn" @click="pbRestart">🔄 다시 도전!</button>
              </div>
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
              <div class="wheel-pointer-wrap">
                <div class="roulette-pointer"></div>
              </div>
              <div class="wheel-stage">
                <div class="wheel-outer-ring">
                  <div class="wheel-container">
                    <canvas
                      ref="wheelCanvas"
                      class="wheel-canvas"
                      :style="{ transform: `rotate(${wheelAngle}deg)`, transition: wheelTransition }"
                    ></canvas>
                  </div>
                </div>
              </div>
              <Transition name="winner-pop">
                <div v-if="wheelWinner" class="winner-banner roulette-winner">
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

          <!-- ===== 지뢰 찾기 ===== -->
          <div v-if="activeGame === 'minesweeper'" class="game-wrap ms-wrap">
            <div class="game-title-row">
              <span class="g-icon">💣</span>
              <h2>지뢰 찾기</h2>
            </div>
            <!-- 설정 / 상태 바 -->
            <div class="ms-toolbar">
              <div class="ms-info">
                <span class="ms-mines-left">💣 {{ msRemainingMines }}</span>
                <button class="ms-face-btn" @click="msNewGame">{{ msFaceEmoji }}</button>
                <span class="ms-timer">⏱ {{ msTime }}</span>
              </div>
              <div class="ms-difficulty">
                <button v-for="d in msDifficulties" :key="d.label"
                  class="ms-diff-btn" :class="{ active: msDiff === d.label }"
                  @click="msSetDiff(d)">{{ d.label }}</button>
              </div>
            </div>
            <!-- 게임 보드 -->
            <div class="ms-board-wrap">
              <div class="ms-board" :style="{ gridTemplateColumns: `repeat(${msCols}, 1fr)`, maxWidth: `${msCols * 34}px` }">
                <div
                  v-for="(cell, idx) in msBoard"
                  :key="idx"
                  class="ms-cell"
                  :class="{
                    'revealed': cell.revealed,
                    'flagged':  cell.flagged && !cell.revealed,
                    'mine':     cell.revealed && cell.mine,
                    'boom':     cell.boom,
                    [`n${cell.count}`]: cell.revealed && !cell.mine && cell.count > 0
                  }"
                  @click="msReveal(idx)"
                  @contextmenu.prevent="msFlag(idx)"
                >
                  <template v-if="cell.revealed">
                    <span v-if="cell.mine">💣</span>
                    <span v-else-if="cell.count > 0">{{ cell.count }}</span>
                  </template>
                  <template v-else-if="cell.flagged">🚩</template>
                </div>
              </div>
            </div>
            <!-- 결과 -->
            <Transition name="winner-pop">
              <div v-if="msStatus !== 'playing'" class="winner-banner" :class="msStatus === 'win' ? '' : 'ms-lose-banner'">
                <div class="winner-confetti">{{ msStatus === 'win' ? '🎉' : '💥' }}</div>
                <div class="winner-text" :style="{ fontSize: '1.4rem' }">
                  {{ msStatus === 'win' ? `클리어! ${msTime}초` : '폭발... 다시 도전!' }}
                </div>
                <button class="action-btn sm" @click="msNewGame">🔄 다시 하기</button>
              </div>
            </Transition>
          </div>

        </div><!-- /.modal-box -->
      </div><!-- /.modal-overlay -->
    </Transition>

  </div>
</template>

<script>
import { ref, computed, nextTick, watch } from 'vue';
import AdComponent from '@/components/AdComponent.vue';

const GAME_CARDS = [
  { id: 'lotto',     icon: '🎰', name: '로또 번호 생성기', desc: '행운의 번호를 자동으로 뽑아보세요!' },
  { id: 'ladder',    icon: '🪜', name: '사다리 타기',       desc: '긴장감 넘치는 사다리 타기 애니메이션!' },
  { id: 'horse',     icon: '🐎', name: '경마 복불복',       desc: '내 이름을 걸고 달리는 짜릿한 레이스!' },
  { id: 'roulette',  icon: '🎡', name: '룰렛 복불복',       desc: '운명의 룰렛을 돌려보세요!' },
  { id: 'pinball',   icon: '🔮', name: '핀볼 게임',         desc: '짜릿한 손맛! 고득점에 도전하세요!' },
  { id: 'minesweeper', icon: '💣', name: '지뢰 찾기',       desc: '윈도우 고전 지뢰 찾기! 안전하게 탐색하세요!' },
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

    /* ══════════ 핀볼 (완전 재작성) ══════════ */
    const pinballCanvas  = ref(null);
    const pinballActive  = ref(false);
    const pinballScore   = ref(0);
    const pbPlayerName   = ref('');
    const pbGameOver     = ref(false);
    const pbLeaderboard  = ref([]);
    const pbMyRank       = ref(99);
    let   pbAnimId       = null;
    let   pbLastTime     = null;
    let   pbKeys         = { left: false, right: false };
    let   pbCleanup      = null;

    // ── 리더보드 (localStorage + 원격 DB) ──
    const pbGetLB  = () => { try { return JSON.parse(localStorage.getItem('pb_lb') || '[]'); } catch { return []; } };
    const pbSaveLBRemote = async (name, score) => {
      try {
        await fetch('https://dongtan-api.infiniblue.workers.dev/api/pinball/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, score })
        });
      } catch (_e) { /* localStorage 폴백 */ }
    };
    const pbGetLBRemote = async () => {
      try {
        const res = await fetch('https://dongtan-api.infiniblue.workers.dev/api/pinball/scores');
        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        }
      } catch (_e) { /* ignore */ }
      return [];
    };
    const pbSaveLB = (name, score) => {
      const lb = pbGetLB();
      lb.push({ name, score });
      lb.sort((a, b) => b.score - a.score);
      lb.splice(10);
      localStorage.setItem('pb_lb', JSON.stringify(lb));
      pbSaveLBRemote(name, score);
      return lb;
    };

    // ── 사운드 (Web Audio API) ──
    const pbSounds = (() => {
      let ac = null;
      const ctx = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch(_e) { /* unsupported */ } } return ac; };
      const tone = (freq, type, dur, vol = 0.3, freqEnd) => {
        const a = ctx(); if (!a) return;
        try {
          const o = a.createOscillator(), g = a.createGain();
          o.connect(g); g.connect(a.destination);
          o.type = type; o.frequency.value = freq;
          if (freqEnd) o.frequency.linearRampToValueAtTime(freqEnd, a.currentTime + dur);
          g.gain.setValueAtTime(vol, a.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
          o.start(a.currentTime); o.stop(a.currentTime + dur);
        } catch(_e) { /* audio error */ }
      };
      return {
        bumper:   () => { tone(560, 'square', 0.10, 0.35); tone(900, 'sine', 0.06, 0.15); },
        wall:     () => tone(200, 'triangle', 0.08, 0.18),
        flipper:  () => tone(130, 'sine', 0.10, 0.22, 75),
        target:   () => { tone(1000, 'sine', 0.08, 0.30); tone(1300, 'sine', 0.06, 0.18); },
        drain:    () => { tone(180, 'sawtooth', 0.4, 0.35, 70); setTimeout(() => tone(100, 'sawtooth', 0.5, 0.4, 50), 350); },
        bonus:    () => [523,659,784,1047].forEach((f,i) => setTimeout(() => tone(f,'sine',0.18,0.28), i*90)),
        gameover: () => { tone(300,'sawtooth',0.25,0.3,100); setTimeout(()=>tone(80,'sawtooth',0.6,0.4,50),280); },
      };
    })();

    const BUMPER_DEFS = [
      { ci: ['#fef08a','#ca8a04'], score: 100 },
      { ci: ['#6ee7b7','#059669'], score: 75  },
      { ci: ['#93c5fd','#2563eb'], score: 75  },
      { ci: ['#fca5a5','#dc2626'], score: 50  },
      { ci: ['#d8b4fe','#7c3aed'], score: 50  },
    ];

    const PB = {
      W: 340, H: 580,
      ball: null, livesLeft: 3,
      bumpers: [], targets: [], slings: [], particles: [], ballTrail: [],
      leftFlipperUp: false, rightFlipperUp: false,
      lp: null, rp: null,
      tick: 0,
    };

    const pbInit = () => {
      PB.W = 340; PB.H = 580;
      PB.ball = { x: PB.W/2 + (Math.random()-0.5)*20, y: 80, vx: (Math.random()-0.5)*2, vy: 2.5, r: 9 };
      PB.livesLeft = 3;
      PB.tick = 0;
      PB.ballTrail = [];
      PB.particles = [];
      // 범퍼 5개 — 충분한 간격으로 공이 빠져나올 수 있게
      PB.bumpers = [
        { x: PB.W/2,     y: 160, r: 28, flash: 0, ...BUMPER_DEFS[0] },
        { x: PB.W/2-82,  y: 248, r: 21, flash: 0, ...BUMPER_DEFS[1] },
        { x: PB.W/2+82,  y: 248, r: 21, flash: 0, ...BUMPER_DEFS[2] },
        { x: PB.W/2-46,  y: 328, r: 18, flash: 0, ...BUMPER_DEFS[3] },
        { x: PB.W/2+46,  y: 328, r: 18, flash: 0, ...BUMPER_DEFS[4] },
      ];
      // 드롭 타겟 4개
      PB.targets = [
        { x: 38, y: 130, hit: false, flash: 0 },
        { x: 38, y: 178, hit: false, flash: 0 },
        { x: PB.W-38, y: 130, hit: false, flash: 0 },
        { x: PB.W-38, y: 178, hit: false, flash: 0 },
      ];
      // 슬링샷 (장식용 — 충돌은 대각선 가이드 벽이 처리)
      PB.slings = [
        { side: 'left',  y1: 380, y2: 440, flash: 0 },
        { side: 'right', y1: 380, y2: 440, flash: 0 },
      ];
      PB.lp = { x: 78,          y: PB.H - 78 };
      PB.rp = { x: PB.W - 78,   y: PB.H - 78 };
      PB.leftFlipperUp  = false;
      PB.rightFlipperUp = false;
      pbKeys = { left: false, right: false };
    };

    const pbFlipperEndpoints = () => {
      const len = 76;
      const la = PB.leftFlipperUp  ? -0.46 :  0.40;
      const ra = PB.rightFlipperUp ? -0.46 :  0.40;
      return {
        lEnd: { x: PB.lp.x + Math.cos(la)*len, y: PB.lp.y + Math.sin(la)*len },
        rEnd: { x: PB.rp.x - Math.cos(ra)*len, y: PB.rp.y + Math.sin(ra)*len },
        la, ra,
      };
    };

    const pbSegCollide = (ball, ax, ay, bx, by, flipSide) => {
      const dx = bx-ax, dy = by-ay;
      const len2 = dx*dx+dy*dy;
      if (len2 === 0) return;
      let t = ((ball.x-ax)*dx+(ball.y-ay)*dy)/len2;
      t = Math.max(0, Math.min(1, t));
      const cx = ax+t*dx, cy = ay+t*dy;
      const distX = ball.x-cx, distY = ball.y-cy;
      const dist = Math.sqrt(distX*distX+distY*distY);
      if (dist < ball.r + 5) {
        const nx = distX/Math.max(dist,0.01), ny = distY/Math.max(dist,0.01);
        ball.x += nx*(ball.r + 5 - dist);
        ball.y += ny*(ball.r + 5 - dist);
        const dot = ball.vx*nx + ball.vy*ny;
        // 기본 반사 (에너지 약간 감쇠)
        ball.vx = (ball.vx - 2*dot*nx) * 0.72;
        ball.vy = (ball.vy - 2*dot*ny) * 0.72;
        // 플리퍼 활성 시: 위치 기반 킥 (끝단에 맞을수록 강하게)
        if (flipSide === 'left' && PB.leftFlipperUp) {
          ball.vy -= 6 + t * 5;  // 6~11 (t=0 피벗, t=1 끝단)
          ball.vx += 1 + t * 2;
          if (ball.vy > -4) ball.vy = -6;
        } else if (flipSide === 'right' && PB.rightFlipperUp) {
          ball.vy -= 6 + t * 5;
          ball.vx -= 1 + t * 2;
          if (ball.vy > -4) ball.vy = -6;
        }
      }
    };

    const pbSpawnParticles = (x, y, color) => {
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 + Math.random()*0.5;
        const speed = 1.5 + Math.random() * 3;
        PB.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 22 + Math.floor(Math.random()*12),
          maxLife: 34,
          color, r: 1.5 + Math.random() * 2,
        });
      }
    };

    const pbUpdate = (dt = 1) => {
      const b = PB.ball;
      const W = PB.W, H = PB.H;
      PB.tick++;
      const prevLeft = PB.leftFlipperUp, prevRight = PB.rightFlipperUp;
      PB.leftFlipperUp  = pbKeys.left;
      PB.rightFlipperUp = pbKeys.right;
      if (PB.leftFlipperUp  && !prevLeft)  pbSounds.flipper();
      if (PB.rightFlipperUp && !prevRight) pbSounds.flipper();

      PB.ballTrail.push({ x: b.x, y: b.y });
      if (PB.ballTrail.length > 10) PB.ballTrail.shift();

      b.vy += 0.13 * dt;
      b.vx *= Math.pow(0.999, dt);
      b.x += b.vx * dt; b.y += b.vy * dt;

      // 최대 속도 제한 (벽 터널링 방지)
      const spd = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
      if (spd > 14) { b.vx = b.vx/spd*14; b.vy = b.vy/spd*14; }

      // 벽 충돌
      if (b.x - b.r < 14) { b.x = 14+b.r; b.vx = Math.abs(b.vx)*0.75; pbSounds.wall(); }
      if (b.x + b.r > W-14) { b.x = W-14-b.r; b.vx = -Math.abs(b.vx)*0.75; pbSounds.wall(); }
      if (b.y - b.r < 14) { b.y = 14+b.r; b.vy = Math.abs(b.vy)*0.75; pbSounds.wall(); }

      // 대각선 가이드 벽 충돌 (플리퍼 옆 구멍 막기)
      pbSegCollide(b, 14, H-210, PB.lp.x - 6, PB.lp.y);
      pbSegCollide(b, W-14, H-210, PB.rp.x + 6, PB.rp.y);

      // 범퍼 충돌 — 1.5x 에너지 증폭, 최솟값 3.5
      PB.bumpers.forEach(bump => {
        const dx = b.x-bump.x, dy = b.y-bump.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < b.r+bump.r && dist > 0) {
          const nx=dx/dist, ny=dy/dist;
          const speed = Math.max(Math.sqrt(b.vx*b.vx+b.vy*b.vy), 3.5);
          b.vx = nx*speed*1.5; b.vy = ny*speed*1.5;
          b.x = bump.x + nx*(b.r+bump.r+1);
          b.y = bump.y + ny*(b.r+bump.r+1);
          pinballScore.value += bump.score;
          bump.flash = 14;
          pbSpawnParticles(bump.x, bump.y, bump.ci[0]);
          pbSounds.bumper();
        }
        if (bump.flash > 0) bump.flash--;
      });

      // 드롭 타겟 충돌
      PB.targets.forEach(tgt => {
        if (tgt.flash > 0) tgt.flash--;
        if (tgt.hit) return;
        const dx = b.x - tgt.x, dy = b.y - tgt.y;
        if (Math.abs(dx) < 13 && Math.abs(dy) < 13) {
          b.vx = Math.sign(dx || 1) * Math.max(Math.abs(b.vx), 2) * 0.9;
          b.vy *= -0.8;
          pinballScore.value += 150;
          tgt.hit = true; tgt.flash = 20;
          pbSpawnParticles(tgt.x, tgt.y, '#fbbf24');
          pbSounds.target();
        }
      });
      if (PB.targets.every(t => t.hit)) {
        PB.targets.forEach(t => { t.hit = false; t.flash = 0; });
        pinballScore.value += 500;
        pbSpawnParticles(W/2, H/2 - 80, '#ffffff');
        pbSounds.bonus();
      }

      // 플리퍼 충돌
      const { lEnd, rEnd } = pbFlipperEndpoints();
      pbSegCollide(b, PB.lp.x, PB.lp.y, lEnd.x, lEnd.y, 'left');
      pbSegCollide(b, PB.rp.x, PB.rp.y, rEnd.x, rEnd.y, 'right');

      // 파티클 업데이트
      PB.particles = PB.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--;
        return p.life > 0;
      });

      // 공 낙사
      if (b.y - b.r > H) {
        PB.livesLeft--;
        pinballScore.value = Math.max(0, pinballScore.value - 30);
        pbSounds.drain();
        if (PB.livesLeft <= 0) {
          pinballActive.value = false;
          pbCleanup && pbCleanup();
          // 게임 오버 처리
          pbSounds.gameover();
          setTimeout(() => {
            const name = pbPlayerName.value.trim() || '익명';
            const lb = pbSaveLB(name, pinballScore.value);
            lb.forEach(e => delete e._isNew);
            const idx = lb.findIndex(e => e.name === name && e.score === pinballScore.value);
            if (idx >= 0) { lb[idx] = { ...lb[idx], _isNew: true }; pbMyRank.value = idx + 1; }
            pbLeaderboard.value = lb;
            pbGameOver.value = true;
          }, 400);
          return false;
        }
        b.x = W/2 + (Math.random()-0.5)*20; b.y = 80;
        b.vx = (Math.random()-0.5)*2; b.vy = 2.5;
        PB.ballTrail = [];
      }
      return true;
    };

    const pbDraw = (ctx) => {
      const W = PB.W, H = PB.H, tick = PB.tick;

      // ── 배경: 다크 그라디언트 ──
      const bgG = ctx.createLinearGradient(0, 0, W, H);
      bgG.addColorStop(0, '#06061a'); bgG.addColorStop(0.5, '#0a0820'); bgG.addColorStop(1, '#040410');
      ctx.fillStyle = bgG; ctx.fillRect(0, 0, W, H);

      // 헥사곤 격자 패턴
      const hs = 20;
      ctx.strokeStyle = 'rgba(0,120,255,0.05)'; ctx.lineWidth = 0.5;
      for (let row = -1; row < H/hs/1.5 + 1; row++) {
        for (let col = -1; col < W/(hs*1.73) + 1; col++) {
          const hx = col * hs * 1.73 + (row % 2 ? hs * 0.865 : 0);
          const hy = row * hs * 1.5;
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = Math.PI/6 + k * Math.PI/3;
            const px2 = hx + hs * Math.cos(a), py2 = hy + hs * Math.sin(a);
            k === 0 ? ctx.moveTo(px2, py2) : ctx.lineTo(px2, py2);
          }
          ctx.closePath(); ctx.stroke();
        }
      }

      // ── 중앙 원형 장식 (스피너 디스크) ──
      const cx = W/2, discY = 390, discR = 52;
      const dPulse = Math.sin(tick * 0.04) * 0.5 + 0.5;
      const dg = ctx.createRadialGradient(cx, discY, 0, cx, discY, discR);
      dg.addColorStop(0, `rgba(0,80,200,${0.08 + dPulse*0.05})`);
      dg.addColorStop(1, 'rgba(0,0,80,0)');
      ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(cx, discY, discR, 0, Math.PI*2); ctx.fill();
      [36, 46, 52].forEach((r, i) => {
        ctx.beginPath(); ctx.arc(cx, discY, r, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(0,160,255,${0.07 + i*0.02 + dPulse*0.05})`; ctx.lineWidth = 1; ctx.stroke();
      });
      // 스피너 라인 회전
      ctx.save(); ctx.translate(cx, discY); ctx.rotate(tick * 0.025);
      ctx.strokeStyle = 'rgba(0,160,255,0.12)'; ctx.lineWidth = 1;
      for (let k = 0; k < 6; k++) {
        const a = k * Math.PI/3;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*36, Math.sin(a)*36); ctx.stroke();
      }
      ctx.restore();

      // ── 상단 아치 (궤도 레인) ──
      ctx.save();
      ctx.shadowColor = '#ff6600'; ctx.shadowBlur = 12;
      ctx.strokeStyle = '#dd5500'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(W/2, -15, W/2 - 22, 0.08*Math.PI, 0.92*Math.PI); ctx.stroke();
      ctx.shadowColor = '#ff9900'; ctx.shadowBlur = 6; ctx.strokeStyle = '#ff8800'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(W/2, -15, W/2 - 28, 0.08*Math.PI, 0.92*Math.PI); ctx.stroke();
      ctx.restore();

      // ── LED 도트 (벽 따라 깜박임) ──
      ctx.save();
      for (let i = 0; i < 14; i++) {
        const ly = 25 + i * (H - 50) / 13;
        const on = ((tick >> 2) + i * 2) % 14 < 7;
        ctx.beginPath(); ctx.arc(16, ly, 2.2, 0, Math.PI*2);
        ctx.shadowColor = '#0088ff'; ctx.shadowBlur = on ? 8 : 0;
        ctx.fillStyle = on ? '#44aaff' : '#001133'; ctx.fill();
        ctx.beginPath(); ctx.arc(W-16, ly, 2.2, 0, Math.PI*2);
        ctx.fillStyle = on ? '#44aaff' : '#001133'; ctx.fill();
      }
      ctx.restore();

      // ── 사이드 레일 (이중 레일) ──
      ctx.save();
      ctx.shadowColor = '#0033aa'; ctx.shadowBlur = 20;
      ctx.strokeStyle = '#112288'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(14,H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W-14,0); ctx.lineTo(W-14,H); ctx.stroke();
      ctx.shadowColor = '#2266ff'; ctx.shadowBlur = 8; ctx.strokeStyle = '#3377ff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(14,H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W-14,0); ctx.lineTo(W-14,H); ctx.stroke();
      ctx.restore();

      // ── 슬링샷 킥백 구간 ──
      PB.slings.forEach(sling => {
        const flash = sling.flash > 0;
        const sx = sling.side === 'left' ? 14 : W - 14;
        const d   = sling.side === 'left' ? 1 : -1;
        const midY = (sling.y1 + sling.y2) / 2;
        ctx.save();
        ctx.shadowColor = flash ? '#ff6600' : '#cc3300';
        ctx.shadowBlur = flash ? 20 : 8;
        ctx.fillStyle = flash ? '#ff5500' : '#6B1A00';
        ctx.strokeStyle = flash ? '#ffaa00' : '#ff5500';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx, sling.y1);
        ctx.lineTo(sx + d * 34, midY);
        ctx.lineTo(sx, sling.y2);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      });

      // ── 대각선 가이드 벽 ──
      ctx.save();
      ctx.shadowColor = '#2244cc'; ctx.shadowBlur = 8;
      ctx.strokeStyle = '#3366ee'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(14, H-210); ctx.lineTo(PB.lp.x-6, PB.lp.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W-14, H-210); ctx.lineTo(PB.rp.x+6, PB.rp.y); ctx.stroke();
      ctx.restore();

      // ── 롤오버 레인 도트 (상단) ──
      [52, 76, 100].forEach((ax, i) => {
        const p2 = Math.sin(tick * 0.07 + i * 1.2) * 0.5 + 0.5;
        ctx.save(); ctx.shadowColor='#00ccff'; ctx.shadowBlur = 6 + p2*8;
        ctx.fillStyle = `rgba(0,180,255,${0.3 + p2*0.5})`;
        ctx.beginPath(); ctx.arc(ax, 68, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(W-ax, 68, 4, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // ── 범퍼 ──
      PB.bumpers.forEach(b => {
        const flash = b.flash > 0;
        const [c1, c2] = b.ci;
        // 외부 광륜
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r+8, 0, Math.PI*2);
        ctx.strokeStyle = c1 + (flash ? 'cc' : '28'); ctx.lineWidth = 1.5; ctx.stroke();
        if (flash) {
          ctx.save(); ctx.shadowColor = c1; ctx.shadowBlur = 40;
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r+14, 0, Math.PI*2);
          ctx.strokeStyle = c1+'99'; ctx.lineWidth = 4; ctx.stroke();
          ctx.restore();
        }
        // 본체 (3D 느낌)
        const g = ctx.createRadialGradient(b.x-b.r*0.4, b.y-b.r*0.4, 1, b.x, b.y, b.r);
        g.addColorStop(0, flash ? '#ffffff' : c1+'ee');
        g.addColorStop(0.45, flash ? c1 : c2);
        g.addColorStop(0.85, c2+'cc');
        g.addColorStop(1, '#00001a');
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = flash ? '#fff' : c1+'cc'; ctx.lineWidth = 2; ctx.stroke();
        // 하이라이트 스펙큘러
        ctx.beginPath(); ctx.arc(b.x-b.r*0.32, b.y-b.r*0.32, b.r*0.22, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.30)'; ctx.fill();
        // 점수
        ctx.save();
        ctx.fillStyle = flash ? '#000' : 'rgba(255,255,255,0.9)';
        ctx.font = `bold ${Math.floor(b.r*0.42)}px monospace`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(b.score, b.x, b.y);
        ctx.restore();
      });

      // ── 드롭 타겟 ──
      PB.targets.forEach(tgt => {
        const flash = tgt.flash > 0;
        ctx.save();
        ctx.shadowColor = tgt.hit ? 'transparent' : '#ffaa00';
        ctx.shadowBlur = flash ? 22 : 8;
        ctx.fillStyle = tgt.hit ? '#0c0c20' : (flash ? '#ffe000' : '#ff9900');
        ctx.strokeStyle = tgt.hit ? '#1a1a33' : '#ffcc44';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.rect(tgt.x-9, tgt.y-11, 18, 22); ctx.fill(); ctx.stroke();
        if (!tgt.hit) {
          ctx.fillStyle = flash ? '#000' : '#fff'; ctx.font = 'bold 7px monospace';
          ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('150', tgt.x, tgt.y);
        }
        ctx.restore();
      });

      // ── 볼 트레일 ──
      PB.ballTrail.forEach((pt, i) => {
        const r = i / PB.ballTrail.length;
        const size = Math.max(PB.ball.r * r * 0.7, 0.8);
        const tg = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, size);
        tg.addColorStop(0, `rgba(80,200,255,${r*0.45})`);
        tg.addColorStop(1, 'rgba(0,80,200,0)');
        ctx.beginPath(); ctx.arc(pt.x, pt.y, size, 0, Math.PI*2);
        ctx.fillStyle = tg; ctx.fill();
      });

      // ── 파티클 ──
      PB.particles.forEach(p => {
        const ratio = p.life / p.maxLife;
        ctx.save(); ctx.shadowColor = p.color; ctx.shadowBlur = 5;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(p.r*ratio, 0.5), 0, Math.PI*2);
        ctx.fillStyle = p.color + Math.floor(ratio*255).toString(16).padStart(2,'0');
        ctx.fill(); ctx.restore();
      });

      // ── 볼 ──
      ctx.save();
      ctx.shadowColor = '#66eeff'; ctx.shadowBlur = 22;
      const ballG = ctx.createRadialGradient(
        PB.ball.x-PB.ball.r*0.4, PB.ball.y-PB.ball.r*0.4, 1,
        PB.ball.x, PB.ball.y, PB.ball.r
      );
      ballG.addColorStop(0, '#ffffff');
      ballG.addColorStop(0.3, '#aaeeff');
      ballG.addColorStop(0.7, '#2277bb');
      ballG.addColorStop(1, '#003366');
      ctx.beginPath(); ctx.arc(PB.ball.x, PB.ball.y, PB.ball.r, 0, Math.PI*2);
      ctx.fillStyle = ballG; ctx.fill();
      ctx.beginPath(); ctx.arc(PB.ball.x-3, PB.ball.y-3, 3, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fill();
      ctx.restore();

      // ── 플리퍼 (테이퍼드 형태) ──
      const { lEnd, rEnd } = pbFlipperEndpoints();
      const drawFlipper = (px, py, ex, ey, isUp) => {
        const col = isUp ? '#ffe044' : '#ee2288';
        const glow = isUp ? '#ffaa00' : '#cc0066';
        const angle = Math.atan2(ey-py, ex-px);
        const pX = Math.cos(angle + Math.PI/2), pY = Math.sin(angle + Math.PI/2);
        ctx.save();
        ctx.shadowColor = glow; ctx.shadowBlur = isUp ? 28 : 14;
        const fg = ctx.createLinearGradient(px, py, ex, ey);
        fg.addColorStop(0, col); fg.addColorStop(1, col+'77');
        ctx.fillStyle = fg; ctx.strokeStyle = col; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px+pX*9, py+pY*9); ctx.lineTo(ex+pX*4, ey+pY*4);
        ctx.lineTo(ex-pX*4, ey-pY*4); ctx.lineTo(px-pX*9, py-pY*9);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // 피벗
        const pg = ctx.createRadialGradient(px-2, py-2, 1, px, py, 9);
        pg.addColorStop(0,'#ffffff'); pg.addColorStop(1, glow);
        ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI*2); ctx.fillStyle=pg; ctx.fill();
        ctx.restore();
      };
      drawFlipper(PB.lp.x, PB.lp.y, lEnd.x, lEnd.y, pbKeys.left);
      drawFlipper(PB.rp.x, PB.rp.y, rEnd.x, rEnd.y, pbKeys.right);

      // ── 드레인 표시 ──
      ctx.strokeStyle='rgba(255,40,40,0.15)'; ctx.lineWidth=1; ctx.setLineDash([5,4]);
      ctx.beginPath(); ctx.moveTo(14, H-12); ctx.lineTo(PB.lp.x-10, H-12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PB.rp.x+10, H-12); ctx.lineTo(W-14, H-12); ctx.stroke();
      ctx.setLineDash([]);

      // ── 스코어 패널 ──
      ctx.fillStyle='rgba(0,0,18,0.75)';
      ctx.beginPath(); ctx.roundRect(W/2-85, 6, 170, 48, 8); ctx.fill();
      ctx.strokeStyle='rgba(0,140,255,0.3)'; ctx.lineWidth=1; ctx.stroke();
      ctx.save();
      ctx.shadowColor='#00ccff'; ctx.shadowBlur=14;
      ctx.fillStyle='rgba(0,200,255,0.5)'; ctx.font='9px monospace';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('◆  S C O R E  ◆', W/2, 18);
      ctx.shadowBlur=22; ctx.fillStyle='#00f5ff'; ctx.font='bold 22px monospace';
      ctx.fillText(pinballScore.value.toLocaleString(), W/2, 38);
      ctx.restore();

      // ── 목숨 ──
      for (let i = 0; i < PB.livesLeft; i++) {
        ctx.save(); ctx.shadowColor='#ffaa00'; ctx.shadowBlur=10;
        ctx.font='16px serif'; ctx.fillText('⚡', 18+i*22, H-10);
        ctx.restore();
      }
      // ── 플레이어명 ──
      ctx.save();
      ctx.fillStyle='rgba(200,200,255,0.45)'; ctx.font='10px monospace';
      ctx.textAlign='right'; ctx.textBaseline='middle';
      ctx.fillText(pbPlayerName.value || '', W-18, H-10);
      ctx.restore();
    };

    const pbLoop = (ctx, t) => {
      if (!pinballActive.value) return;
      const dt = pbLastTime != null ? Math.min((t - pbLastTime) / 16.67, 3) : 1;
      pbLastTime = t;
      const alive = pbUpdate(dt);
      pbDraw(ctx);
      if (alive) pbAnimId = requestAnimationFrame((ts) => pbLoop(ctx, ts));
    };

    const pbRestart = async () => {
      pbGameOver.value = false;
      const remote = await pbGetLBRemote();
      pbLeaderboard.value = remote.length > 0 ? remote : pbGetLB();
    };

    const startPinball = async () => {
      if (!pbPlayerName.value.trim()) return;
      pbGameOver.value = false;
      pinballScore.value = 0;
      pbInit();
      pinballActive.value = true;
      await nextTick();
      const canvas = pinballCanvas.value;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = PB.W * dpr;
      canvas.height = PB.H * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const onKey = (e) => {
        const down = e.type === 'keydown';
        if (e.key==='a'||e.key==='ArrowLeft')  { pbKeys.left  = down; e.preventDefault(); }
        if (e.key==='d'||e.key==='ArrowRight') { pbKeys.right = down; e.preventDefault(); }
      };
      const onTouch = (e) => {
        e.preventDefault();
        pbKeys.left = false; pbKeys.right = false;
        const rect = canvas.getBoundingClientRect();
        Array.from(e.touches).forEach(t => {
          if (t.clientX - rect.left < rect.width / 2) pbKeys.left  = true;
          else                                          pbKeys.right = true;
        });
      };
      const onTouchEnd = (e) => {
        e.preventDefault();
        pbKeys.left = false; pbKeys.right = false;
        const rect = canvas.getBoundingClientRect();
        Array.from(e.touches).forEach(t => {
          if (t.clientX - rect.left < rect.width / 2) pbKeys.left  = true;
          else                                          pbKeys.right = true;
        });
      };

      window.addEventListener('keydown', onKey);
      window.addEventListener('keyup',   onKey);
      canvas.addEventListener('touchstart', onTouch,    { passive: false });
      canvas.addEventListener('touchmove',  onTouch,    { passive: false });
      canvas.addEventListener('touchend',   onTouchEnd, { passive: false });

      pbCleanup = () => {
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('keyup',   onKey);
        canvas.removeEventListener('touchstart', onTouch);
        canvas.removeEventListener('touchmove',  onTouch);
        canvas.removeEventListener('touchend',   onTouchEnd);
      };

      pbLastTime = null;
      pbAnimId = requestAnimationFrame((ts) => pbLoop(ctx, ts));
    };

    const stopPinball = () => {
      pinballActive.value = false;
      if (pbAnimId) { cancelAnimationFrame(pbAnimId); pbAnimId = null; }
      pbCleanup && pbCleanup();
    };

    const startLadder = async () => {
      ladderStarted.value   = true;
      ladderDone.value      = false;
      ladderResultCol.value = -1;
      ladderActiveCol.value = -1;
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

      // 가로 막대 생성
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

      // 모든 참가자의 경로 계산
      const PATH_COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff9f43','#a29bfe','#fd79a8','#00b894'];
      const allPaths = [];
      const destinations = [];
      for (let sc = 0; sc < cols; sc++) {
        let cur = sc;
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
        allPaths.push(path);
        destinations.push(cur);
      }

      // 당첨자 결정 (랜덤)
      const winnerStartCol = Math.floor(Math.random() * cols);
      const winnerEndCol   = destinations[winnerStartCol];
      ladderResultCol.value  = winnerEndCol;
      ladderWinnerName.value = pNames.value[winnerStartCol] || `참가자${winnerStartCol + 1}`;

      // 애니메이션 순서: 당첨자가 마지막
      const animOrder = [];
      for (let i = 0; i < cols; i++) { if (i !== winnerStartCol) animOrder.push(i); }
      animOrder.push(winnerStartCol);

      const completedPaths = [];

      const drawScene = (animIdx, progress) => {
        ctx.clearRect(0, 0, W, H);
        // 세로 기둥
        for (let i = 0; i < cols; i++) {
          ctx.beginPath(); ctx.strokeStyle = 'rgba(180,180,220,0.28)'; ctx.lineWidth = 3;
          ctx.moveTo(PAD_X + i * colW, PAD_Y); ctx.lineTo(PAD_X + i * colW, H - PAD_Y); ctx.stroke();
        }
        // 가로 막대
        bars.forEach(bar => {
          ctx.beginPath(); ctx.strokeStyle = 'rgba(180,180,220,0.5)'; ctx.lineWidth = 3;
          ctx.moveTo(PAD_X + bar.col * colW, bar.y); ctx.lineTo(PAD_X + (bar.col + 1) * colW, bar.y); ctx.stroke();
        });
        // 완료된 경로 그리기
        completedPaths.forEach(({ path, color, isWinner }) => {
          ctx.beginPath();
          ctx.strokeStyle = color; ctx.lineWidth = isWinner ? 6 : 3.5;
          ctx.shadowColor = color; ctx.shadowBlur = isWinner ? 20 : 8;
          ctx.moveTo(path[0].x, path[0].y);
          for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
          ctx.stroke(); ctx.shadowBlur = 0;
        });
        // 현재 애니메이션 중인 경로
        if (animIdx !== null && animIdx < animOrder.length && progress > 0) {
          const origIdx = animOrder[animIdx];
          const path    = allPaths[origIdx];
          const color   = PATH_COLORS[origIdx % PATH_COLORS.length];
          const isWinner = origIdx === winnerStartCol;
          const total    = path.length - 1;
          const segIdx   = Math.min(Math.floor(progress * total), total - 1);
          ctx.beginPath();
          ctx.strokeStyle = color; ctx.lineWidth = isWinner ? 6 : 3.5;
          ctx.shadowColor = color; ctx.shadowBlur = isWinner ? 20 : 8;
          ctx.moveTo(path[0].x, path[0].y);
          for (let i = 0; i < segIdx; i++) ctx.lineTo(path[i + 1].x, path[i + 1].y);
          const frac = (progress * total) % 1;
          const p0 = path[segIdx], p1 = path[Math.min(segIdx + 1, total)];
          ctx.lineTo(p0.x + (p1.x - p0.x) * frac, p0.y + (p1.y - p0.y) * frac);
          ctx.stroke(); ctx.shadowBlur = 0;
        }
      };

      let currentAnimIdx = 0;
      const SPEED_NORMAL = 0.014;
      const SPEED_WINNER = 0.009;

      const animateNext = () => {
        if (currentAnimIdx >= cols) {
          drawScene(null, 0);
          ladderActiveCol.value = -1;
          ladderDone.value = true;
          return;
        }
        const origIdx  = animOrder[currentAnimIdx];
        const isWinner = origIdx === winnerStartCol;
        const color    = PATH_COLORS[origIdx % PATH_COLORS.length];
        ladderActiveCol.value = origIdx;
        let p = 0;
        const speed = isWinner ? SPEED_WINNER : SPEED_NORMAL;
        const step = () => {
          p = Math.min(p + speed, 1);
          drawScene(currentAnimIdx, p);
          if (p < 1) {
            requestAnimationFrame(step);
          } else {
            completedPaths.push({ path: allPaths[origIdx], color, isWinner });
            currentAnimIdx++;
            setTimeout(animateNext, isWinner ? 300 : 80);
          }
        };
        requestAnimationFrame(step);
      };

      animateNext();
    };

    /* ══════════ 레이스 ══════════ */
    const racers        = ref([]);
    const raceActive    = ref(false);
    const raceWinner    = ref(null);
    const countdown     = ref(0);
    const raceLeader    = ref(-1);
    const laneCanvases  = ref([]);
    let   raceInterval  = null;
    let   placeCounter  = 1;

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

        const emoji = '🐎';
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
      
      laneCanvases.value = [];
      await nextTick();
      racers.value.forEach((r, idx) => {
        drawLane(laneCanvases.value[idx], r, false);
      });

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

        racers.value.forEach((r, idx) => {
          drawLane(laneCanvases.value[idx], r, raceActive.value);
        });

        if (placeCounter > pCount.value) {
          clearInterval(raceInterval); raceInterval = null; raceActive.value = false;
          racers.value.forEach((r, idx) => drawLane(laneCanvases.value[idx], r, false));
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

    /* ══════════ 지뢰 찾기 ══════════ */
    const msDifficulties = [
      { label: '쉬움',   rows: 9,  cols: 9,  mines: 10 },
      { label: '보통',   rows: 9,  cols: 16, mines: 26 },
      { label: '어려움', rows: 9,  cols: 16, mines: 40 },
    ];
    const msDiff    = ref('쉬움');
    const msRows    = ref(9);
    const msCols    = ref(9);
    const msMines   = ref(10);
    const msBoard   = ref([]);
    const msStatus  = ref('playing');   // 'playing' | 'win' | 'lose'
    const msTime    = ref(0);
    const msStarted = ref(false);
    let   msTimerID = null;
    const msRemainingMines = computed(() => msMines.value - msBoard.value.filter(c => c.flagged).length);
    const msFaceEmoji = computed(() => msStatus.value === 'win' ? '😎' : msStatus.value === 'lose' ? '😵' : '🙂');

    const msSetDiff = (d) => {
      msDiff.value  = d.label;
      msRows.value  = d.rows;
      msCols.value  = d.cols;
      msMines.value = d.mines;
      msNewGame();
    };

    const msNewGame = () => {
      clearInterval(msTimerID);
      msTime.value = 0;
      msStarted.value = false;
      msStatus.value = 'playing';
      const total = msRows.value * msCols.value;
      msBoard.value = Array.from({ length: total }, () => ({
        mine: false, revealed: false, flagged: false, count: 0, boom: false
      }));
    };

    const msPlantMines = (safeIdx) => {
      const total = msRows.value * msCols.value;
      const pool = [...Array(total).keys()].filter(i => i !== safeIdx);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      pool.slice(0, msMines.value).forEach(i => { msBoard.value[i].mine = true; });
      for (let idx = 0; idx < total; idx++) {
        if (msBoard.value[idx].mine) continue;
        msBoard.value[idx].count = msNeighbors(idx).filter(n => msBoard.value[n].mine).length;
      }
    };

    const msNeighbors = (idx) => {
      const r = Math.floor(idx / msCols.value), c = idx % msCols.value;
      const result = [];
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < msRows.value && nc >= 0 && nc < msCols.value)
          result.push(nr * msCols.value + nc);
      }
      return result;
    };

    const msFloodReveal = (idx) => {
      const board = msBoard.value;
      const stack = [idx];
      while (stack.length) {
        const i = stack.pop();
        if (board[i].revealed || board[i].flagged) continue;
        board[i].revealed = true;
        if (board[i].count === 0) msNeighbors(i).forEach(n => { if (!board[n].revealed) stack.push(n); });
      }
    };

    const msReveal = (idx) => {
      const board = msBoard.value;
      if (msStatus.value !== 'playing' || board[idx].revealed || board[idx].flagged) return;
      if (!msStarted.value) {
        msPlantMines(idx);
        msStarted.value = true;
        msTimerID = setInterval(() => { if (msStatus.value === 'playing') msTime.value++; else clearInterval(msTimerID); }, 1000);
      }
      if (board[idx].mine) {
        board[idx].revealed = true;
        board[idx].boom = true;
        board.forEach(c => { if (c.mine) c.revealed = true; });
        msStatus.value = 'lose';
        clearInterval(msTimerID);
        return;
      }
      msFloodReveal(idx);
      const unrevealed = board.filter(c => !c.revealed && !c.mine).length;
      if (unrevealed === 0) {
        msStatus.value = 'win';
        board.forEach(c => { if (c.mine) c.flagged = true; });
        clearInterval(msTimerID);
      }
    };

    const msFlag = (idx) => {
      const board = msBoard.value;
      if (msStatus.value !== 'playing' || board[idx].revealed) return;
      board[idx].flagged = !board[idx].flagged;
    };

    msNewGame();

    return {
      gameCards, activeGame, openGame, closeGame, pCount, pNames, ballColor,
      lottoRows, isGenerating, generateLotto,
      ladderCanvas, ladderStarted, ladderDone, ladderWinnerName, ladderResultCol, ladderActiveCol, startLadder,
      racers, raceActive, raceWinner, countdown, raceLeader, laneCanvases, startRace, resetRace,
      wheelCanvas, rouletteStarted, wheelAngle, wheelTransition, isSpinning, wheelWinner, spinWheel, resetRoulette,
      pinballCanvas, pinballActive, pinballScore, startPinball,
      pbPlayerName, pbGameOver, pbLeaderboard, pbMyRank, pbRestart,
      // 지뢰찾기
      msDifficulties, msDiff, msCols, msBoard, msStatus, msTime, msFaceEmoji,
      msRemainingMines, msSetDiff, msNewGame, msReveal, msFlag,
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
.ladder-viz { display: flex; flex-direction: column; gap: 10px; }
.top-names  { display: flex; width: 100%; gap: 4px; }
.bottom-slots { display: flex; width: 100%; gap: 4px; }

.top-name {
  flex: 1; text-align: center; font-size: 0.72rem; font-weight: 700;
  color: rgba(255,255,255,0.35); padding: 7px 3px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: all 0.35s cubic-bezier(0.2,0.8,0.2,1);
}
.top-name.active {
  color: #00f5ff;
  text-shadow: 0 0 10px #00f5ff, 0 0 20px rgba(0,245,255,0.5);
  background: rgba(0,245,255,0.12);
  border-color: rgba(0,245,255,0.4);
  box-shadow: 0 0 16px rgba(0,245,255,0.3), inset 0 0 8px rgba(0,245,255,0.08);
  transform: scaleY(1.06);
}

.ladder-canvas {
  width: 100%; height: 300px; display: block;
  border-radius: 14px;
  background: rgba(0,0,20,0.55);
  border: 1px solid rgba(0,245,255,0.1);
  box-shadow: inset 0 0 30px rgba(0,0,30,0.5), 0 4px 20px rgba(0,0,0,0.3);
}

.bottom-slot {
  flex: 1; text-align: center; font-size: 0.68rem; font-weight: 700;
  padding: 10px 2px; border-radius: 10px;
  transition: all 0.5s cubic-bezier(0.2,0.8,0.2,1);
  border: 1px solid rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.02);
}
.bottom-slot.win {
  background: linear-gradient(135deg, rgba(0,245,255,0.22), rgba(0,100,255,0.15));
  border-color: rgba(0,245,255,0.45);
  color: #00f5ff;
  text-shadow: 0 0 10px #00f5ff, 0 0 20px rgba(0,245,255,0.5);
  box-shadow: 0 0 24px rgba(0,245,255,0.3), inset 0 0 10px rgba(0,245,255,0.1);
  transform: scaleY(1.08);
}
.bottom-slot.lose {
  color: rgba(255,60,60,0.2);
  background: rgba(255,0,0,0.02);
  border-color: rgba(255,0,0,0.05);
}

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
.pinball-container {
  position: relative; border-radius: 18px; overflow: hidden;
  display: flex; justify-content: center;
  box-shadow: 0 0 50px rgba(0,100,255,0.2), 0 0 100px rgba(0,50,180,0.12);
  border: 1px solid rgba(0,160,255,0.2);
}
.pinball-canvas { width: 340px; max-width: 100%; height: auto; display: block; touch-action: none; cursor: pointer; }
.pinball-start-overlay, .pb-gameover-overlay {
  position: absolute; inset: 0; display: flex; flex-direction: column; gap: 8px;
  align-items: center; justify-content: center;
  background: rgba(3,3,16,0.88); backdrop-filter: blur(6px);
  overflow: hidden; padding: 16px 12px;
}
.pb-logo {
  font-size: 1.3rem; font-weight: 900; letter-spacing: 0.15em;
  color: #00f5ff; text-shadow: 0 0 20px #00aaff, 0 0 40px #0066cc;
  margin-bottom: 4px;
}
.pb-name-input {
  background: rgba(0,50,100,0.4); border: 1px solid rgba(0,180,255,0.35);
  border-radius: 10px; padding: 10px 16px; color: #fff; font-size: 1rem;
  text-align: center; width: 200px; outline: none; font-family: inherit;
}
.pb-name-input::placeholder { color: rgba(255,255,255,0.35); }
.pb-name-input:focus { border-color: #00f5ff; box-shadow: 0 0 10px rgba(0,200,255,0.3); }
.pinball-hint { color: rgba(255,255,255,0.45); font-size: 0.75rem; margin-top: -4px; }
.pb-lb {
  width: 90%; background: rgba(0,10,30,0.6); border-radius: 12px;
  border: 1px solid rgba(0,150,255,0.15); padding: 10px 12px;
  margin-top: 4px;
}
.pb-lb-hdr { text-align: center; font-size: 0.75rem; font-weight: 800; color: #fbbf24; letter-spacing: 0.1em; margin-bottom: 8px; }
.pb-lb-row {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 0.8rem;
}
.pb-lb-row:last-child { border-bottom: none; }
.pb-lb-row.highlight { background: rgba(255,200,0,0.08); border-radius: 6px; padding: 4px 6px; }
.pb-lb-rank { width: 28px; font-size: 0.85rem; flex-shrink: 0; }
.pb-lb-name { flex: 1; color: rgba(255,255,255,0.8); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pb-lb-score { color: #00f5ff; font-weight: 800; font-variant-numeric: tabular-nums; }
/* 게임 오버 */
.pb-go-title { font-size: 1.8rem; font-weight: 900; letter-spacing: 0.1em; color: #ff4455; text-shadow: 0 0 20px #ff0033; }
.pb-go-player { font-size: 1rem; color: rgba(255,255,255,0.7); margin-top: -4px; }
.pb-go-score { font-size: 2rem; font-weight: 900; color: #00f5ff; font-variant-numeric: tabular-nums; text-shadow: 0 0 16px #00aaff; }
.pb-go-rank { font-size: 1rem; font-weight: 800; color: #fbbf24; text-shadow: 0 0 10px #ff9900; }

/* 룰렛 */
.roulette-setup { display: flex; flex-direction: column; gap: 18px; align-items: center; }
.roulette-wrap  { display: flex; flex-direction: column; align-items: center; gap: 14px; }

.wheel-pointer-wrap {
  display: flex; justify-content: center;
  z-index: 10; margin-bottom: -6px;
}
.roulette-pointer {
  width: 0; height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 32px solid #ff4757;
  filter: drop-shadow(0 0 8px rgba(255,71,87,0.9)) drop-shadow(0 0 18px rgba(255,71,87,0.5));
  animation: pointer-pulse 2s ease-in-out infinite;
}
@keyframes pointer-pulse {
  0%,100% { filter: drop-shadow(0 0 8px rgba(255,71,87,0.9)) drop-shadow(0 0 18px rgba(255,71,87,0.5)); }
  50% { filter: drop-shadow(0 0 16px rgba(255,71,87,1)) drop-shadow(0 0 32px rgba(255,71,87,0.7)); }
}

.wheel-stage {
  position: relative;
  display: flex; align-items: center; justify-content: center;
}
.wheel-stage::before {
  content: '';
  position: absolute;
  inset: -14px;
  border-radius: 50%;
  background: conic-gradient(
    rgba(255,107,107,0.18) 0deg,
    rgba(255,217,61,0.18) 60deg,
    rgba(107,203,119,0.18) 120deg,
    rgba(77,150,255,0.18) 180deg,
    rgba(162,155,254,0.18) 240deg,
    rgba(253,121,168,0.18) 300deg,
    rgba(255,107,107,0.18) 360deg
  );
  animation: wheel-glow-spin 10s linear infinite;
  z-index: -1;
  filter: blur(8px);
}
@keyframes wheel-glow-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.wheel-outer-ring {
  width: 280px; height: 280px; border-radius: 50%;
  background: linear-gradient(135deg, #1e1e40, #0d0d26);
  border: 2px solid rgba(255,255,255,0.08);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  padding: 10px;
}
.wheel-container { width: 260px; height: 260px; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 3px rgba(255,255,255,0.12); }
.wheel-canvas    { width: 100%; height: 100%; display: block; }
.spin-btn { min-width: 200px; }
.spin-btn.spinning { background: linear-gradient(135deg,#a29bfe,#6c5ce7); color: #fff; animation: spin-pulse 0.8s infinite; }
@keyframes spin-pulse { 0%,100%{ box-shadow:0 0 20px rgba(162,155,254,0.3); } 50%{ box-shadow:0 0 50px rgba(162,155,254,0.8); } }

.roulette-winner { margin-top: 0; }


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

/* ── 지뢰 찾기 ── */
.ms-wrap { padding: 24px 20px; }
.ms-toolbar {
  display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px;
}
.ms-info {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; padding: 10px 16px;
}
.ms-mines-left, .ms-timer {
  font-size: 1.1rem; font-weight: 700; font-variant-numeric: tabular-nums;
  color: #00f5ff; min-width: 60px;
}
.ms-timer { text-align: right; }
.ms-face-btn {
  font-size: 1.6rem; background: none; border: none; cursor: pointer;
  filter: drop-shadow(0 0 6px rgba(255,220,50,0.6));
  transition: transform 0.15s; line-height: 1;
}
.ms-face-btn:hover { transform: scale(1.15); }
.ms-difficulty {
  display: flex; gap: 8px; justify-content: center;
}
.ms-diff-btn {
  padding: 5px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 700;
  border: 1px solid rgba(0,245,255,0.3); background: rgba(0,245,255,0.06);
  color: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.2s;
}
.ms-diff-btn.active { background: rgba(0,245,255,0.2); border-color: #00f5ff; color: #00f5ff; }
.ms-diff-btn:hover:not(.active) { border-color: rgba(0,245,255,0.6); color: rgba(255,255,255,0.8); }

.ms-board-wrap { overflow-x: auto; display: flex; justify-content: center; padding-bottom: 4px; }
.ms-board {
  display: grid; gap: 2px; padding: 4px;
  background: rgba(0,0,20,0.5); border-radius: 10px;
  border: 1px solid rgba(0,245,255,0.1);
}
.ms-cell {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 6px; font-size: 0.85rem; font-weight: 800;
  cursor: pointer; user-select: none;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  transition: background 0.12s, transform 0.08s;
}
.ms-cell:hover:not(.revealed) {
  background: rgba(0,245,255,0.15);
  border-color: rgba(0,245,255,0.4);
  transform: scale(0.95);
}
.ms-cell.revealed {
  background: rgba(255,255,255,0.03);
  border-color: rgba(255,255,255,0.05);
  cursor: default;
}
.ms-cell.mine { background: rgba(255,50,50,0.15); }
.ms-cell.boom {
  background: rgba(255,60,20,0.55);
  box-shadow: 0 0 12px rgba(255,80,0,0.8);
  animation: boom-pulse 0.4s ease;
}
@keyframes boom-pulse { 0%{transform:scale(1.4)} 100%{transform:scale(1)} }
.ms-cell.flagged { background: rgba(255,100,0,0.12); border-color: rgba(255,130,0,0.4); }
/* 숫자 색상 */
.ms-cell.n1 { color: #4d96ff; }
.ms-cell.n2 { color: #6bcb77; }
.ms-cell.n3 { color: #ff6b6b; }
.ms-cell.n4 { color: #9b59b6; }
.ms-cell.n5 { color: #e74c3c; }
.ms-cell.n6 { color: #00b4d8; }
.ms-cell.n7 { color: #f39c12; }
.ms-cell.n8 { color: #aaa; }
.ms-lose-banner { border-color: rgba(255,80,80,0.4); background: rgba(255,30,30,0.08); }

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