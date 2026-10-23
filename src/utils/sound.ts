/**
 * すし処 魚偏亭 - 音響合成エンジン (Web Audio API)
 *
 * 外部音声ファイル（mp3/wav等）に一切依存せず、
 * 100% オフラインで動作する純粋な和風サウンドシンセサイザー。
 */

// ---------------------------------------------------------------------------
// AudioContext 管理 & ミュート設定永続化
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'sakana_kanji_muted';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // ユーザー操作前は保留される場合があるため無視
    });
  }

  return audioCtx;
}

let mutedState: boolean = (() => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
})();

const muteListeners = new Set<(muted: boolean) => void>();

/**
 * 現在ミュート状態かどうかを取得
 */
export function isMuted(): boolean {
  return mutedState;
}

/**
 * ミュート状態を設定（localStorage へ永続化）
 */
export function setMuted(muted: boolean): void {
  mutedState = muted;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(muted));
    }
  } catch {
    // localStorage への書き込み制限等のエラーを安全に無視
  }
  muteListeners.forEach((listener) => listener(mutedState));
}

/**
 * ミュート状態をトグル反転
 */
export function toggleMute(): boolean {
  const next = !mutedState;
  setMuted(next);
  return next;
}

/**
 * ミュート状態の変更を監視
 */
export function subscribeMute(listener: (muted: boolean) => void): () => void {
  muteListeners.add(listener);
  return () => {
    muteListeners.delete(listener);
  };
}

// ---------------------------------------------------------------------------
// ノイズ生成ユーティリティ（打楽器のアタック音用）
// ---------------------------------------------------------------------------

function createNoiseBuffer(ctx: AudioContext, durationSeconds: number): AudioBuffer {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * durationSeconds));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // ホワイトノイズ (-1.0 〜 1.0)
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// ---------------------------------------------------------------------------
// 和風効果音シンセサイザー群
// ---------------------------------------------------------------------------

/**
 * 1. 拍子木 (Hyoshigi Clack)
 * ボタンクリック・選択肢選択時に鳴る鋭い「カーンッ！」という硬質な木製打撃音
 */
export function playWoodClack(): void {
  if (mutedState) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1-A. 木製の硬い衝突過渡ノイズ（高域バンドパス）
  const noiseBuffer = createNoiseBuffer(ctx, 0.02);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(3200, now);
  noiseFilter.Q.setValueAtTime(3.0, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.4, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start(now);
  noiseSource.stop(now + 0.025);

  // 1-B. 拍子木の基本共鳴 (硬い樫の木: ~1040Hz)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(1040, now);
  osc1.frequency.exponentialRampToValueAtTime(980, now + 0.08);

  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.6, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.085);

  // 1-C. 拍子木の上音高周波共鳴 (~2480Hz)
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(2480, now);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.35, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + 0.05);
}

/**
 * 2. 和太鼓 (Taiko Drum Boom)
 * 正解時に鳴る重厚で力強い「ドンッ！！」という腹に響く太鼓の轟き
 */
export function playTaikoDrum(): void {
  if (mutedState) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 2-A. バチが革に当たった瞬間の低域ノイズアタック
  const attackNoise = createNoiseBuffer(ctx, 0.04);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = attackNoise;

  const attackFilter = ctx.createBiquadFilter();
  attackFilter.type = 'lowpass';
  attackFilter.frequency.setValueAtTime(450, now);

  const attackGain = ctx.createGain();
  attackGain.gain.setValueAtTime(0.8, now);
  attackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  noiseSource.connect(attackFilter);
  attackFilter.connect(attackGain);
  attackGain.connect(ctx.destination);
  noiseSource.start(now);
  noiseSource.stop(now + 0.045);

  // 2-B. 太鼓の革の基本周波数ドロップ (165Hz -> 58Hz)
  const drumOsc = ctx.createOscillator();
  drumOsc.type = 'sine';
  drumOsc.frequency.setValueAtTime(165, now);
  drumOsc.frequency.exponentialRampToValueAtTime(58, now + 0.07);

  const drumGain = ctx.createGain();
  drumGain.gain.setValueAtTime(1.0, now);
  drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

  drumOsc.connect(drumGain);
  drumGain.connect(ctx.destination);
  drumOsc.start(now);
  drumOsc.stop(now + 0.9);

  // 2-C. 胴（木樽）の重低音の余韻・鳴り (~48Hz)
  const bodyOsc = ctx.createOscillator();
  bodyOsc.type = 'triangle';
  bodyOsc.frequency.setValueAtTime(95, now);
  bodyOsc.frequency.exponentialRampToValueAtTime(48, now + 0.1);

  const bodyFilter = ctx.createBiquadFilter();
  bodyFilter.type = 'lowpass';
  bodyFilter.frequency.setValueAtTime(180, now);

  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(0.6, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

  bodyOsc.connect(bodyFilter);
  bodyFilter.connect(bodyGain);
  bodyGain.connect(ctx.destination);
  bodyOsc.start(now);
  bodyOsc.stop(now + 1.0);
}

/**
 * 3. 木魚 / ウッドブロック (Woodblock / Mokugyo Gong)
 * 不正解時に鳴る、どこかユーモラスで哀愁漂う乾いた「ポクッ…」という木魚音
 */
export function playWoodGong(): void {
  if (mutedState) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 3-A. 木魚の空洞共鳴（バンドパスを通した三角波）
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(540, now);
  osc.frequency.exponentialRampToValueAtTime(460, now + 0.04);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(490, now);
  filter.Q.setValueAtTime(6.0, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.85, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);

  // 3-B. 先端の軽いコツンという打撃音
  const tapOsc = ctx.createOscillator();
  tapOsc.type = 'sine';
  tapOsc.frequency.setValueAtTime(1100, now);
  tapOsc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

  const tapGain = ctx.createGain();
  tapGain.gain.setValueAtTime(0.3, now);
  tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  tapOsc.connect(tapGain);
  tapGain.connect(ctx.destination);
  tapOsc.start(now);
  tapOsc.stop(now + 0.03);
}

/**
 * 4. 祝賀の神楽鈴・ファンファーレ (Celebration Chime / Suzu Fanfare)
 * クイズ完走時（特に高得点時）に鳴り響く、めでたい和風の鐘・鈴のきらめくファンファーレ
 */
export function playCelebrationChime(): void {
  if (mutedState) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 和音階（陽旋法・祝祭スケール）：D5, F#5, A5, B5, D6, F#6
  const notes = [
    { freq: 587.33, time: 0.00, duration: 0.7 }, // D5
    { freq: 739.99, time: 0.10, duration: 0.7 }, // F#5
    { freq: 880.00, time: 0.20, duration: 0.8 }, // A5
    { freq: 987.77, time: 0.30, duration: 0.8 }, // B5
    { freq: 1174.66, time: 0.42, duration: 1.2 }, // D6
    { freq: 1479.98, time: 0.52, duration: 1.5 }, // F#6
  ];

  notes.forEach(({ freq, time, duration }) => {
    const noteStart = now + time;

    // 基本鈴音（サイン波）
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteStart);

    // 鐘の倍音（非整数倍音 2.75倍で鈴・鐘の質感を付与）
    const overtone = ctx.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2.75, noteStart);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.12, noteStart);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration * 0.5);

    osc.connect(gain);
    overtone.connect(overtoneGain);
    gain.connect(ctx.destination);
    overtoneGain.connect(ctx.destination);

    osc.start(noteStart);
    overtone.start(noteStart);
    osc.stop(noteStart + duration + 0.05);
    overtone.stop(noteStart + duration + 0.05);
  });

  // 神楽鈴の微細な金属シャラシャラ音（高域バンドパスノイズ）
  const shimmerTimes = [0.0, 0.12, 0.24, 0.44, 0.56];
  shimmerTimes.forEach((shimmerTime) => {
    const sStart = now + shimmerTime;
    const noiseBuffer = createNoiseBuffer(ctx, 0.05);
    const sSource = ctx.createBufferSource();
    sSource.buffer = noiseBuffer;

    const sFilter = ctx.createBiquadFilter();
    sFilter.type = 'bandpass';
    sFilter.frequency.setValueAtTime(3600 + Math.random() * 400, sStart);
    sFilter.Q.setValueAtTime(4.0, sStart);

    const sGain = ctx.createGain();
    sGain.gain.setValueAtTime(0.18, sStart);
    sGain.gain.exponentialRampToValueAtTime(0.001, sStart + 0.05);

    sSource.connect(sFilter);
    sFilter.connect(sGain);
    sGain.connect(ctx.destination);
    sSource.start(sStart);
    sSource.stop(sStart + 0.06);
  });
}
