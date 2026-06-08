<template>
  <canvas ref="cv" class="connection-globe"></canvas>
</template>

<script>
// Happy Dongtan — rotating connection globe (Dongtan origin → world cities)
// Self-contained: canvas 2D orthographic sphere, auto-rotate + drag to spin.
export default {
  name: 'ConnectionGlobe',
  props: {
    speed: { type: Number, default: 0.4 },      // auto-rotate multiplier
    styleName: { type: String, default: 'wireframe' }, // wireframe | constellation | aurora
    accent: { type: Array, default: () => [96, 165, 250] },   // #60a5fa
    accent2: { type: Array, default: () => [125, 211, 252] }, // #7dd3fc
  },
  mounted() {
    const TAU = Math.PI * 2, D2R = Math.PI / 180;
    const canvas = this.$refs.cv;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const ORIGIN = { name: 'DONGTAN', lat: 37.2, lon: 127.07 };
    const CITIES = [
      { lat: 35.68, lon: 139.69 }, { lat: 1.35, lon: 103.82 },
      { lat: 19.08, lon: 72.88 },  { lat: 25.20, lon: 55.27 },
      { lat: 52.52, lon: 13.40 },  { lat: 51.51, lon: -0.13 },
      { lat: 40.71, lon: -74.01 }, { lat: 37.77, lon: -122.42 },
      { lat: -23.55, lon: -46.63 },{ lat: -33.87, lon: 151.21 },
      { lat: -1.29, lon: 36.82 },  { lat: 6.52, lon: 3.38 },
    ];
    const ll = (lat, lon) => {
      const la = lat * D2R, lo = lon * D2R;
      return { x: Math.cos(la) * Math.sin(lo), y: Math.sin(la), z: Math.cos(la) * Math.cos(lo) };
    };
    const slerp = (a, b, t) => {
      let d = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
      const om = Math.acos(d);
      if (om < 1e-4) return { ...a };
      const s = Math.sin(om), w1 = Math.sin((1 - t) * om) / s, w2 = Math.sin(t * om) / s;
      return { x: a.x * w1 + b.x * w2, y: a.y * w1 + b.y * w2, z: a.z * w1 + b.z * w2 };
    };

    // geometry
    const meridians = [], parallels = [];
    for (let lon = 0; lon < 360; lon += 30) {
      const line = [];
      for (let lat = -90; lat <= 90; lat += 4) line.push(ll(lat, lon));
      meridians.push(line);
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const line = [];
      for (let lon = 0; lon <= 360; lon += 5) line.push(ll(lat, lon));
      parallels.push(line);
    }
    const segs = meridians.concat(parallels);
    const originVec = ll(ORIGIN.lat, ORIGIN.lon);
    const cityVecs = CITIES.map(c => ll(c.lat, c.lon));
    const arcs = cityVecs.map((c, i) => {
      const pts = [];
      for (let k = 0; k <= 52; k++) pts.push(slerp(originVec, c, k / 52));
      return { pts, phase: (i * 0.37) % 1 };
    });
    const stars = [];
    for (let i = 0; i < 240; i++) stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + 0.2, tw: Math.random() * TAU, sp: Math.random() * 1.5 + 0.3 });

    // point cloud (fibonacci sphere) for constellation style
    const GOLDEN = Math.PI * (3 - Math.sqrt(5)), cloud = [];
    for (let i = 0; i < 1500; i++) {
      const y = 1 - (i / 1499) * 2, r = Math.sqrt(Math.max(0, 1 - y * y)), th = i * GOLDEN;
      cloud.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r });
    }

    // per-style visual weights
    const STYLES = {
      wireframe:     { grid: 0.5,  gridBack: 0.08, cloud: 0,    atmo: 0.4, arcW: 1.15 },
      constellation: { grid: 0.0,  gridBack: 0.0,  cloud: 1,    atmo: 0.25, arcW: 0.85 },
      aurora:        { grid: 0.14, gridBack: 0.05, cloud: 0,    atmo: 1.0, arcW: 2.0 },
    };

    // state
    const st = this._st = {
      rotY: -2.0, rotX: -0.42, vY: 0, dragging: false, lastX: 0, lastY: 0, t: 0,
      W: 0, H: 0, raf: 0, speed: this.speed, accent: this.accent.slice(), accent2: this.accent2.slice(),
      style: STYLES[this.styleName] ? this.styleName : 'wireframe',
    };
    this._STYLES = STYLES; this._cloud = cloud;

    const resize = () => {
      const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      st.W = w; st.H = h;
    };
    resize();
    this._resize = resize;
    window.addEventListener('resize', resize);

    // drag (mouse only; let touch scroll)
    const down = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      st.dragging = true; st.lastX = e.clientX; st.lastY = e.clientY; st.vY = 0;
      canvas.style.cursor = 'grabbing';
    };
    const move = (e) => {
      if (!st.dragging) return;
      const dx = e.clientX - st.lastX, dy = e.clientY - st.lastY;
      st.rotY += dx * 0.006; st.rotX = Math.max(-1.25, Math.min(1.25, st.rotX + dy * 0.006));
      st.vY = dx * 0.006; st.lastX = e.clientX; st.lastY = e.clientY;
    };
    const up = () => { if (st.dragging) { st.dragging = false; canvas.style.cursor = 'grab'; } };
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    this._handlers = { move, up };

    const project = (p, cx, cy, R) => {
      const cyy = Math.cos(st.rotY), sy = Math.sin(st.rotY);
      let x = p.x * cyy + p.z * sy, z = -p.x * sy + p.z * cyy;
      const cxx = Math.cos(st.rotX), sx = Math.sin(st.rotX);
      let y = p.y * cxx - z * sx, z2 = p.y * sx + z * cxx;
      return { sx: cx + R * x, sy: cy - R * y, d: z2 };
    };

    const frame = (ts) => {
      st.raf = requestAnimationFrame(frame);
      const W = st.W, H = st.H; st.t = ts * 0.001;
      const A = st.accent, A2 = st.accent2;
      const cfg = this._STYLES[st.style] || this._STYLES.wireframe;
      ctx.save(); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, W, H);

      // stars
      for (const s of stars) {
        const a = 0.35 + 0.4 * Math.sin(st.t * s.sp + s.tw);
        ctx.fillStyle = `rgba(200,220,255,${Math.max(0, a) * 0.55})`;
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, TAU); ctx.fill();
      }

      const cx = W * 0.5, cy = H * 0.5, R = Math.min(W, H) * 0.38;

      if (!st.dragging) { st.rotY += 0.0016 * st.speed + st.vY; st.vY *= 0.94; if (Math.abs(st.vY) < 5e-4) st.vY = 0; }

      // body glow
      const bg = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
      bg.addColorStop(0, `rgba(${A[0]},${A[1]},${A[2]},0.10)`);
      bg.addColorStop(0.7, `rgba(${A[0]},${A[1]},${A[2]},0.03)`);
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();

      // atmosphere
      const ag = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R * 1.16);
      ag.addColorStop(0, 'rgba(0,0,0,0)');
      ag.addColorStop(0.7, `rgba(${A[0]},${A[1]},${A[2]},${0.05 * cfg.atmo})`);
      ag.addColorStop(0.8, `rgba(${A2[0]},${A2[1]},${A2[2]},${0.16 * cfg.atmo})`);
      ag.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cx, cy, R * 1.16, 0, TAU); ctx.fill();

      // point cloud (constellation)
      if (cfg.cloud > 0) {
        for (const p of this._cloud) {
          const pr = project(p, cx, cy, R);
          if (pr.d <= -0.15) continue;
          const al = pr.d > 0 ? 0.22 + 0.5 * pr.d : 0.05;
          ctx.fillStyle = `rgba(${A[0]},${A[1]},${A[2]},${al})`;
          ctx.beginPath(); ctx.arc(pr.sx, pr.sy, 1.1 * (0.6 + 0.5 * Math.max(0, pr.d)), 0, TAU); ctx.fill();
        }
      }

      // grid
      if (cfg.grid > 0 || cfg.gridBack > 0) {
        ctx.lineWidth = 1;
        for (const line of segs) {
          for (let i = 0; i < line.length - 1; i++) {
            const a0 = project(line[i], cx, cy, R), a1 = project(line[i + 1], cx, cy, R);
            const md = (a0.d + a1.d) / 2, al = md > 0 ? cfg.grid * (0.4 + 0.6 * md) : cfg.gridBack;
            if (al <= 0.005) continue;
            ctx.strokeStyle = `rgba(${A[0]},${A[1]},${A[2]},${al})`;
            ctx.beginPath(); ctx.moveTo(a0.sx, a0.sy); ctx.lineTo(a1.sx, a1.sy); ctx.stroke();
          }
        }
      }

      // arcs
      for (const arc of arcs) {
        const sp = [];
        for (let k = 0; k < arc.pts.length; k++) {
          const tt = k / (arc.pts.length - 1), scale = 1 + 0.42 * Math.sin(Math.PI * tt), p = arc.pts[k];
          sp.push(project({ x: p.x * scale, y: p.y * scale, z: p.z * scale }, cx, cy, R));
        }
        ctx.lineWidth = cfg.arcW;
        for (let k = 0; k < sp.length - 1; k++) {
          const md = (sp[k].d + sp[k + 1].d) / 2;
          const al = 0.85 * (md > 0 ? (0.25 + 0.75 * Math.min(1, md + 0.3)) : 0.12);
          if (al <= 0.01) continue;
          ctx.strokeStyle = `rgba(${A[0]},${A[1]},${A[2]},${al})`;
          ctx.beginPath(); ctx.moveTo(sp[k].sx, sp[k].sy); ctx.lineTo(sp[k + 1].sx, sp[k + 1].sy); ctx.stroke();
        }
        const tp = (st.t * 0.35 + arc.phase) % 1, idx = Math.floor(tp * (sp.length - 1)), pp = sp[idx];
        if (pp.d > -0.1) {
          const pa = pp.d > 0 ? 1 : 0.3;
          const g = ctx.createRadialGradient(pp.sx, pp.sy, 0, pp.sx, pp.sy, 10);
          g.addColorStop(0, `rgba(${A2[0]},${A2[1]},${A2[2]},${0.9 * pa})`);
          g.addColorStop(1, `rgba(${A2[0]},${A2[1]},${A2[2]},0)`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pp.sx, pp.sy, 10, 0, TAU); ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${0.95 * pa})`; ctx.beginPath(); ctx.arc(pp.sx, pp.sy, 1.6, 0, TAU); ctx.fill();
        }
      }

      // nodes
      const node = (v, origin) => {
        const pr = project(v, cx, cy, R * 1.005);
        if (pr.d <= -0.05) return;
        const front = pr.d > 0, pa = front ? 0.6 + 0.4 * pr.d : 0.18;
        const col = origin ? A2 : A, halo = (origin ? 13 : 7) * (0.7 + 0.4 * Math.max(0, pr.d));
        const pulse = origin ? (0.7 + 0.3 * Math.sin(st.t * 2)) : 1;
        const g = ctx.createRadialGradient(pr.sx, pr.sy, 0, pr.sx, pr.sy, halo);
        g.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${0.7 * pa * pulse})`);
        g.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pr.sx, pr.sy, halo, 0, TAU); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${pa})`; ctx.beginPath(); ctx.arc(pr.sx, pr.sy, origin ? 2.8 : 2, 0, TAU); ctx.fill();
        if (origin && front) {
          ctx.font = '600 11px ui-monospace, monospace';
          ctx.fillStyle = `rgba(${A2[0]},${A2[1]},${A2[2]},${0.9 * pa})`;
          ctx.textBaseline = 'middle';
          ctx.fillText('◦ ' + ORIGIN.name, pr.sx + 10, pr.sy);
          ctx.fillStyle = `rgba(180,200,230,${0.55 * pa})`;
          ctx.font = '400 9px ui-monospace, monospace';
          ctx.fillText('37.2°N 127.1°E', pr.sx + 10, pr.sy + 12);
        }
      };
      for (const c of cityVecs) node(c, false);
      node(originVec, true);

      ctx.restore();
    };
    st.raf = requestAnimationFrame(frame);
  },
  watch: {
    speed(v) { if (this._st) this._st.speed = v; },
    styleName(v) { if (this._st && this._STYLES[v]) this._st.style = v; },
    accent(v) { if (this._st) this._st.accent = v.slice(); },
    accent2(v) { if (this._st) this._st.accent2 = v.slice(); },
  },
  beforeUnmount() {
    if (this._st) cancelAnimationFrame(this._st.raf);
    if (this._resize) window.removeEventListener('resize', this._resize);
    if (this._handlers) {
      window.removeEventListener('pointermove', this._handlers.move);
      window.removeEventListener('pointerup', this._handlers.up);
      window.removeEventListener('pointercancel', this._handlers.up);
    }
  },
};
</script>

<style scoped>
.connection-globe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  touch-action: pan-y;
  z-index: 0;
}
.connection-globe:active { cursor: grabbing; }
</style>
