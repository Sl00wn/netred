// ============================================================================
// COLORPONG DATA STRINGS // GENERATIVE HARMONIC STRING BUNDLES & DATA STREAMS
// Inspired by Colorpong "Data Strings" by Karol Gadzala
// High-energy vector cords, chromatic dispersion, interactive tension & pulses
// ============================================================================

export class CyberCanvas {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Colorpong Data Strings Chromatic Palette
    this.colors = {
      voidDark: '#07090e',       // Base Obsidian Void
      voidNavy: '#0a0e17',       // Deep Void Navy
      voidViolet: '#0f0f1c',     // Midnight Chroma
      cyan: '#0da9f3',           // Electric Data Cyan
      cyanLight: '#38bdf8',
      magenta: '#e0248a',        // Vivid Cyber Magenta
      magentaLight: '#f43f5e',
      violet: '#8b5cf6',         // Electric Violet
      violetLight: '#a855f7',
      lime: '#a3e635',           // Acid Data Lime
      limeLight: '#bef264',
      amber: '#f59e0b',          // Solar Amber
      white: '#ffffff',
      gridLine: 'rgba(162, 215, 245, 0.035)',
      crosshair: 'rgba(13, 169, 243, 0.12)'
    };

    // State & Timers
    this.time = 0;
    this.lastFrameTime = performance.now();
    this.animationFrameId = null;
    this.isRunning = true;
    this.speedMultiplier = 1.0;

    // Mouse & Pointer State (Smooth Lerp)
    this.mouse = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      isDown: false,
      radius: 220,
      velocity: 0,
      lastX: -2000,
      lastY: -2000
    };

    // Data Strings Bundles Configuration
    // 5 primary chromatic bundles weaving across the canvas
    this.bundles = [
      {
        id: 'cyan-stream',
        name: 'CH-CYAN // 100Gbps',
        baseYFrac: 0.32,
        stringCount: 9,
        spread: 38,
        freqX: 0.0016,
        freqT: 1.15,
        amp: 65,
        colorStart: '#0da9f3',
        colorEnd: '#38bdf8',
        shadowColor: 'rgba(13, 169, 243, 0.65)',
        phaseSpeed: 0.85
      },
      {
        id: 'magenta-wave',
        name: 'CH-MAGENTA // 400Gbps-ZR',
        baseYFrac: 0.52,
        stringCount: 10,
        spread: 44,
        freqX: 0.0021,
        freqT: 0.95,
        amp: 85,
        colorStart: '#e0248a',
        colorEnd: '#f43f5e',
        shadowColor: 'rgba(224, 36, 138, 0.65)',
        phaseSpeed: -1.05
      },
      {
        id: 'violet-cord',
        name: 'CH-VIOLET // 800G-TERA',
        baseYFrac: 0.68,
        stringCount: 8,
        spread: 36,
        freqX: 0.0014,
        freqT: 0.75,
        amp: 72,
        colorStart: '#8b5cf6',
        colorEnd: '#c084fc',
        shadowColor: 'rgba(139, 92, 246, 0.65)',
        phaseSpeed: 0.70
      },
      {
        id: 'lime-frequency',
        name: 'CH-LIME // TELEMETRY',
        baseYFrac: 0.84,
        stringCount: 8,
        spread: 32,
        freqX: 0.0024,
        freqT: 1.35,
        amp: 55,
        colorStart: '#a3e635',
        colorEnd: '#4ade80',
        shadowColor: 'rgba(163, 230, 53, 0.65)',
        phaseSpeed: 1.2
      },
      {
        id: 'amber-pulse',
        name: 'CH-AMBER // CONTROL-BUS',
        baseYFrac: 0.20,
        stringCount: 6,
        spread: 26,
        freqX: 0.0019,
        freqT: 0.80,
        amp: 48,
        colorStart: '#f59e0b',
        colorEnd: '#fbbf24',
        shadowColor: 'rgba(245, 158, 11, 0.6)',
        phaseSpeed: -0.65
      }
    ];

    // Dynamic Systems
    this.packets = [];           // Pulses racing along strings
    this.ripples = [];           // Shockwave rings vibrating strings
    this.dataAnchors = [];       // Tension nodes at harmonic intersections
    this.scanSweep = 0;

    this.init();
  }

  init() {
    this.resize();
    this.bindEvents();
    this.initDataAnchors();
    this.seedInitialPackets();
    this.animate();
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      this.mouse.targetX = -2000;
      this.mouse.targetY = -2000;
    });

    window.addEventListener('mousedown', (e) => {
      this.mouse.isDown = true;
      this.createPingRipple(e.clientX, e.clientY);
      this.burstPacketsAt(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isRunning = false;
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
      } else {
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animate();
      }
    });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.initDataAnchors();
  }

  initDataAnchors() {
    this.dataAnchors = [];
    const count = this.width < 768 ? 5 : 8;
    for (let i = 0; i < count; i++) {
      const bIdx = i % this.bundles.length;
      const b = this.bundles[bIdx];
      const xFrac = (i + 0.6) / (count + 0.2);
      this.dataAnchors.push({
        bundleIndex: bIdx,
        xFrac,
        label: b.name,
        pulse: Math.random() * Math.PI * 2,
        color: b.colorStart
      });
    }
  }

  seedInitialPackets() {
    this.packets = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      this.spawnStringPacket();
    }
  }

  spawnStringPacket() {
    const bIdx = Math.floor(Math.random() * this.bundles.length);
    const bundle = this.bundles[bIdx];
    const sIdx = Math.floor(Math.random() * bundle.stringCount);
    const direction = Math.random() > 0.5 ? 1 : -1;
    const progress = direction === 1 ? 0 : 1;

    this.packets.push({
      bundleIndex: bIdx,
      stringIndex: sIdx,
      progress,
      direction,
      speed: (0.0025 + Math.random() * 0.0045) * this.speedMultiplier,
      size: Math.random() * 1.6 + 2.2,
      color: Math.random() > 0.3 ? bundle.colorStart : '#ffffff',
      trail: []
    });
  }

  // API called by app.js or mouse click
  createPingRipple(x, y) {
    this.ripples.push({
      x,
      y,
      radius: 0,
      maxRadius: Math.max(this.width, this.height) * 0.9,
      speed: 11 * this.speedMultiplier,
      alpha: 1.0,
      decay: 0.018
    });
  }

  // Spawns a burst of high-velocity packets across all string bundles
  burstPacketsAt(x, y) {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const bIdx = i % this.bundles.length;
      const bundle = this.bundles[bIdx];
      const sIdx = Math.floor(Math.random() * bundle.stringCount);
      const direction = i % 2 === 0 ? 1 : -1;
      const startProg = Math.max(0.05, Math.min(0.95, x / this.width));

      this.packets.push({
        bundleIndex: bIdx,
        stringIndex: sIdx,
        progress: startProg,
        direction,
        speed: (0.006 + Math.random() * 0.007) * this.speedMultiplier,
        size: 3.5,
        color: i % 2 === 0 ? bundle.colorStart : '#ffffff',
        trail: []
      });
    }
  }

  // Compute instantaneous Y elevation for a given string point
  getStringY(bundle, sIdx, x, t) {
    const H = this.height;
    const baseY = H * bundle.baseYFrac;
    const count = bundle.stringCount;

    // Harmonic offset within the bundle
    const normIndex = (sIdx - (count - 1) * 0.5);
    const stringSpreadOffset = normIndex * (bundle.spread / count);
    const phaseOffset = normIndex * 0.16;

    // Primary harmonic waves
    const w1 = Math.sin(x * bundle.freqX + t * bundle.freqT + phaseOffset) * bundle.amp;
    const w2 = Math.cos(x * (bundle.freqX * 1.8) - t * (bundle.freqT * 0.65) + phaseOffset * 1.4) * (bundle.amp * 0.42);
    const w3 = Math.sin(x * (bundle.freqX * 0.4) + t * (bundle.freqT * 1.5)) * (bundle.amp * 0.22);
    let y = baseY + stringSpreadOffset + w1 + w2 + w3;

    // Mouse gravity & interactive plucking
    const mx = this.mouse.x;
    const my = this.mouse.y;
    const distToMouse = Math.hypot(x - mx, y - my);

    if (distToMouse < this.mouse.radius) {
      const mFactor = Math.pow(1 - distToMouse / this.mouse.radius, 2);
      // Pluck deflection
      const pluck = -mFactor * 52 * Math.cos(distToMouse * 0.05 - t * 4);
      y += pluck;
    }

    // Ripple shockwave deflection
    for (let i = 0; i < this.ripples.length; i++) {
      const rip = this.ripples[i];
      const dRip = Math.hypot(x - rip.x, y - rip.y);
      const deltaR = Math.abs(dRip - rip.radius);

      if (deltaR < 90) {
        const rFactor = (1 - deltaR / 90) * rip.alpha;
        y += rFactor * 46 * Math.sin(deltaR * 0.09);
      }
    }

    return y;
  }

  // Draw Deep Obsidian Backdrop & Atmospheric Blooms
  drawAtmosphere() {
    const ctx = this.ctx;
    const W = this.width;
    const H = this.height;

    // Base deep void gradient
    const baseGrad = ctx.createLinearGradient(0, 0, 0, H);
    baseGrad.addColorStop(0, '#07090e');
    baseGrad.addColorStop(0.4, '#090d16');
    baseGrad.addColorStop(0.7, '#0c101c');
    baseGrad.addColorStop(1, '#06080d');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, W, H);

    // Deep Cyan bloom (Top-Left)
    const cyanBloom = ctx.createRadialGradient(W * 0.2, H * 0.3, 10, W * 0.2, H * 0.3, W * 0.55);
    cyanBloom.addColorStop(0, 'rgba(13, 169, 243, 0.12)');
    cyanBloom.addColorStop(1, 'rgba(7, 9, 14, 0)');
    ctx.fillStyle = cyanBloom;
    ctx.fillRect(0, 0, W, H);

    // Vivid Magenta bloom (Center-Right)
    const magBloom = ctx.createRadialGradient(W * 0.8, H * 0.55, 10, W * 0.8, H * 0.55, W * 0.55);
    magBloom.addColorStop(0, 'rgba(224, 36, 138, 0.10)');
    magBloom.addColorStop(1, 'rgba(7, 9, 14, 0)');
    ctx.fillStyle = magBloom;
    ctx.fillRect(0, 0, W, H);

    // Electric Violet bloom (Bottom-Left)
    const vioBloom = ctx.createRadialGradient(W * 0.35, H * 0.82, 10, W * 0.35, H * 0.82, W * 0.45);
    vioBloom.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
    vioBloom.addColorStop(1, 'rgba(7, 9, 14, 0)');
    ctx.fillStyle = vioBloom;
    ctx.fillRect(0, 0, W, H);
  }

  // Draw Technical Graph Grid & Coordinates
  drawTechnicalGrid() {
    const ctx = this.ctx;
    const W = this.width;
    const H = this.height;
    const step = 90;

    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.colors.gridLine;

    // Hairline Cartesian grid
    for (let x = 0; x < W; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    for (let y = 0; y < H; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Micro crosshairs at intersections
    ctx.strokeStyle = this.colors.crosshair;
    const cSize = 3;
    for (let x = step; x < W; x += step * 2) {
      for (let y = step; y < H; y += step * 2) {
        ctx.beginPath();
        ctx.moveTo(x - cSize, y);
        ctx.lineTo(x + cSize, y);
        ctx.moveTo(x, y - cSize);
        ctx.lineTo(x, y + cSize);
        ctx.stroke();
      }
    }

    // Technical frequency scale marks along bottom & left borders
    ctx.font = '9px "DM Mono", "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(162, 215, 245, 0.25)';
    ctx.textBaseline = 'bottom';

    for (let x = 120; x < W - 80; x += 180) {
      ctx.beginPath();
      ctx.moveTo(x, H - 6);
      ctx.lineTo(x, H);
      ctx.stroke();
      const freq = (100 + (x / W) * 800).toFixed(0);
      ctx.fillText(`${freq} THz`, x + 4, H - 4);
    }

    ctx.restore();
  }

  // Draw the Dynamic Data Strings Bundles (Core Feature)
  drawDataStrings() {
    const ctx = this.ctx;
    const W = this.width;
    const t = this.time;
    const stepX = this.width < 768 ? 20 : 14; // Horizontal evaluation density

    ctx.save();

    for (let b = 0; b < this.bundles.length; b++) {
      const bundle = this.bundles[b];
      const count = bundle.stringCount;

      for (let s = 0; s < count; s++) {
        // String styling & alpha gradient
        const norm = s / (count - 1);
        const isCore = s === Math.floor(count / 2);
        
        let strokeColor;
        let lineWidth;

        if (isCore) {
          strokeColor = bundle.colorStart;
          lineWidth = 1.6;
        } else {
          const alpha = 0.35 + 0.45 * Math.sin(norm * Math.PI);
          strokeColor = bundle.colorStart;
          lineWidth = 0.95;
          ctx.globalAlpha = alpha;
        }

        ctx.beginPath();
        let started = false;

        // Trace harmonic path
        for (let x = -40; x <= W + 40; x += stepX) {
          const y = this.getStringY(bundle, s, x, t);

          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;

        // Subtle glow for core strings
        if (isCore) {
          ctx.shadowColor = bundle.shadowColor;
          ctx.shadowBlur = 8;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      }
    }

    ctx.restore();
  }

  // Draw Data Anchors / Tension Nodes at Harmonic Points
  drawDataAnchors() {
    const ctx = this.ctx;
    const W = this.width;
    const t = this.time;

    ctx.save();
    this.dataAnchors.forEach(anchor => {
      const bundle = this.bundles[anchor.bundleIndex];
      const x = anchor.xFrac * W;
      const y = this.getStringY(bundle, Math.floor(bundle.stringCount / 2), x, t);

      anchor.pulse += 0.035;
      const radius = 3.5 + Math.sin(anchor.pulse) * 0.8;

      // Outer halo
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(13, 169, 243, 0.08)`;
      ctx.fill();

      // Middle ring
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.6, 0, Math.PI * 2);
      ctx.strokeStyle = anchor.color;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center bright bead
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = anchor.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Micro telemetry label
      ctx.font = '9px "DM Mono", "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(213, 219, 230, 0.65)';
      ctx.textBaseline = 'top';
      ctx.fillText(anchor.label, x + 10, y - 5);
    });
    ctx.restore();
  }

  // Draw Data Packets Gliding Along the Strings
  updateAndDrawPackets() {
    const ctx = this.ctx;
    const W = this.width;
    const t = this.time;

    // Ambient spawn
    if (Math.random() < 0.065 && this.packets.length < 24) {
      this.spawnStringPacket();
    }

    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      const bundle = this.bundles[p.bundleIndex];

      if (!bundle) {
        this.packets.splice(i, 1);
        continue;
      }

      p.progress += p.speed * p.direction;

      if (p.progress < 0 || p.progress > 1) {
        this.packets.splice(i, 1);
        continue;
      }

      const curX = p.progress * W;
      const curY = this.getStringY(bundle, p.stringIndex, curX, t);

      p.trail.unshift({ x: curX, y: curY });
      if (p.trail.length > 8) {
        p.trail.pop();
      }

      ctx.save();

      // Glowing trail
      if (p.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let tr = 1; tr < p.trail.length; tr++) {
          ctx.lineTo(p.trail[tr].x, p.trail[tr].y);
        }
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.75;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
      }

      // Bright packet head
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.restore();
    }
  }

  // Draw Expanding Ripples
  updateAndDrawRipples() {
    const ctx = this.ctx;

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radius += rip.speed;
      rip.alpha -= rip.decay;

      if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(13, 169, 243, ${rip.alpha * 0.35})`;
      ctx.lineWidth = 1.4;
      ctx.shadowColor = this.colors.cyan;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Telemetry Watermark & Laser Scanline
  drawTelemetryWatermark() {
    const ctx = this.ctx;
    const W = this.width;
    const H = this.height;

    // Scanline sweep
    this.scanSweep += 1.6;
    if (this.scanSweep > H) this.scanSweep = 0;

    ctx.save();
    const scanGrad = ctx.createLinearGradient(0, this.scanSweep - 16, 0, this.scanSweep + 16);
    scanGrad.addColorStop(0, 'rgba(13, 169, 243, 0)');
    scanGrad.addColorStop(0.5, 'rgba(13, 169, 243, 0.035)');
    scanGrad.addColorStop(1, 'rgba(13, 169, 243, 0)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, this.scanSweep - 16, W, 32);

    // Monospace Telemetry
    ctx.font = '10px "DM Mono", "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(162, 215, 245, 0.45)';
    ctx.textBaseline = 'top';

    // Top-Left
    ctx.fillText('COLORPONG // DATA STRINGS v2.7', 24, 20);
    ctx.fillStyle = 'rgba(224, 36, 138, 0.55)';
    ctx.fillText(`STRINGS: 42 // BUNDLES: 5 // HARMONIC: SYNC`, 24, 34);

    // Top-Right
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(162, 215, 245, 0.45)';
    ctx.fillText('OPTICAL-BUS: DWDM 800Gbps // QAM-16', W - 24, 20);
    ctx.fillStyle = 'rgba(163, 230, 53, 0.65)';
    ctx.fillText('CARRIER STATUS: LOCKED [NOMINAL]', W - 24, 34);

    ctx.restore();
  }

  // Animation Loop
  animate() {
    if (!this.isRunning) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = now;
    this.time += dt * this.speedMultiplier;

    // Smooth mouse coordinates
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.14;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.14;

    this.drawAtmosphere();
    this.drawTechnicalGrid();
    this.drawDataStrings();
    this.drawDataAnchors();
    this.updateAndDrawPackets();
    this.updateAndDrawRipples();
    this.drawTelemetryWatermark();

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  // Public Controls
  setSpeed(multiplier) {
    this.speedMultiplier = Math.max(0.2, Math.min(3.0, multiplier));
  }

  setDensity(count) {
    // Dynamically adjust string count per bundle
    const factor = count / 34;
    this.bundles.forEach(b => {
      b.stringCount = Math.floor(Math.max(4, Math.min(14, 8 * factor)));
    });
  }
}
