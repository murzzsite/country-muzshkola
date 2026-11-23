const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/8VL36BEHUT';
const TG_LINK = 'https://t.me/countrystudio_krd';
const PHONE_TEL = 'tel:+79186950400';
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const safe = fn => { try { fn(); } catch (e) { console.error(e); } };
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, cls, t) => { const e = document.createElement(tag); if (cls) e.className = cls; if (t) e.textContent = t; return e; };
  const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const toForm = svc => {
    const s = $('#svc'); if (s && svc) s.value = svc;
    scrollTo({ top: $('#form').getBoundingClientRect().top + scrollY - 56, behavior: reduce ? 'auto' : 'smooth' });
  };

  const bar = $('#bar');
  const fb = () => bar.classList.toggle('show', scrollY > 30);
  addEventListener('scroll', fb, { passive: true }); fb();

  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href'); if (h.length < 2) return;
    const t = $(h); if (!t) return;
    e.preventDefault();
    if (a.dataset.pick) { toForm(a.dataset.pick); return; }
    scrollTo({ top: t.getBoundingClientRect().top + scrollY - 56, behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ===== клавиши в карточке «Фортепиано» ===== */
  safe(() => {
    const svg = $('.keys'); if (!svg) return;
    const W = 220 / 14;
    for (let i = 0; i < 14; i++) {
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('class', 'k'); r.setAttribute('x', i * W); r.setAttribute('y', 0); r.setAttribute('width', W); r.setAttribute('height', 60); r.setAttribute('rx', 2);
      r.style.transitionDelay = (i * 30) + 'ms';
      if ([1, 4, 6, 9, 12].includes(i)) r.classList.add('on');
      svg.append(r);
    }
    [1, 2, 4, 5, 6, 8, 9, 11, 12].forEach(i => {
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('class', 'b'); r.setAttribute('x', i * W - 4); r.setAttribute('y', 0); r.setAttribute('width', 8); r.setAttribute('height', 36); r.setAttribute('rx', 1.5);
      svg.append(r);
    });
  });

  /* ===== секвенсор ===== */
  safe(() => {
    const seq = $('#seq'), grid = $('#seqGrid'), play = $('#seqPlay'), sndBtn = $('#sndBtn');
    const ROWS = [
      { key: 'v', name: 'Вокал', on: [0, 3, 6, 8, 11, 14] },
      { key: 'p', name: 'Фортепиано', on: [0, 4, 7, 10, 12] },
      { key: 'd', name: 'Барабаны', on: [0, 2, 4, 6, 8, 10, 12, 14] }
    ];
    const state = ROWS.map(r => Array.from({ length: 16 }, (_, i) => r.on.includes(i)));
    const cellsRows = [];
    ROWS.forEach((r, ri) => {
      const row = mk('div', 'seq__row row--' + r.key);
      row.append(mk('span', 'seq__lab', r.name));
      const cells = mk('div', 'seq__cells');
      const list = [];
      for (let i = 0; i < 16; i++) {
        const b = mk('button', 'cell'); b.type = 'button';
        b.setAttribute('aria-pressed', state[ri][i]);
        b.setAttribute('aria-label', r.name + ', клетка ' + (i + 1));
        b.dataset.i = i;
        b.addEventListener('click', () => {
          state[ri][i] = !state[ri][i];
          b.setAttribute('aria-pressed', state[ri][i]);
          if (state[ri][i]) { sound(ri, i, true); flash(b); }
        });
        cells.append(b); list.push(b);
      }
      row.append(cells); grid.append(row); cellsRows.push(list);
    });
    const flash = b => { b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit'); };

    /* звук: синтез в Web Audio, включается только по нажатию */
    let ac = null, soundOn = false;
    const ctx = () => { if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (C) ac = new C(); } if (ac && ac.state === 'suspended') ac.resume(); return ac; };
    const env = (g, t, a, d, peak) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
    const noise = (c, dur) => { const b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = c.createBufferSource(); s.buffer = b; return s; };
    const V = [220, 247, 262, 294, 330, 349, 392, 440], P = [262, 330, 392, 523, 392, 330, 294, 349];
    function sound(ri, i, force) {
      if (!soundOn && !force) return;
      const c = ctx(); if (!c) return; const t = c.currentTime + 0.01;
      const g = c.createGain(); g.connect(c.destination);
      if (ri === 0) {
        const o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain();
        o.type = 'sine'; o.frequency.value = V[i % 8]; l.frequency.value = 5.5; lg.gain.value = 5; l.connect(lg); lg.connect(o.frequency);
        env(g, t, 0.05, 0.45, 0.16); o.connect(g); o.start(t); l.start(t); o.stop(t + 0.6); l.stop(t + 0.6);
      } else if (ri === 1) {
        const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = P[i % 8];
        env(g, t, 0.01, 0.6, 0.2); o.connect(g); o.start(t); o.stop(t + 0.7);
      } else {
        const k = i % 4;
        if (k === 0) { const o = c.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.14); env(g, t, 0.005, 0.2, 0.5); o.connect(g); o.start(t); o.stop(t + 0.3); }
        else { const n = noise(c, 0.2), f = c.createBiquadFilter(); f.type = k === 2 ? 'bandpass' : 'highpass'; f.frequency.value = k === 2 ? 1800 : 7000; env(g, t, 0.002, k === 2 ? 0.14 : 0.05, k === 2 ? 0.28 : 0.1); n.connect(f); f.connect(g); n.start(t); n.stop(t + 0.2); }
      }
    }
    sndBtn.addEventListener('click', () => {
      soundOn = !soundOn; sndBtn.setAttribute('aria-pressed', soundOn);
      sndBtn.lastElementChild.textContent = soundOn ? 'Звук включён' : 'Звук выключен';
      if (soundOn) ctx();
    });

    /* проигрыватель: плейхед идёт по шагам, пока секция в кадре */
    const cols = () => matchMedia('(max-width:640px)').matches ? 8 : 16;
    let n = 16, step = -1, visible = false, timer = null;
    const place = () => {
      n = cols();
      $$('.seq__cells', grid).forEach(c => c.classList.toggle('n8', n === 8));
      cellsRows.forEach(l => l.forEach((b, i) => { b.hidden = i >= n; }));
      if (step >= n) step = -1;
    };
    const moveHead = i => {
      const first = cellsRows[0][i], last = cellsRows[2][i]; if (!first) return;
      const g = grid.getBoundingClientRect(), a = first.getBoundingClientRect(), z = last.getBoundingClientRect();
      play.style.width = a.width + 12 + 'px';
      play.style.height = (z.bottom - a.top + 12) + 'px';
      play.style.top = (a.top - g.top - 6) + 'px'; play.style.bottom = 'auto';
      play.style.transform = 'translateX(' + (a.left - g.left - 6) + 'px)';
    };
    const tick = () => {
      step = (step + 1) % n;
      moveHead(step);
      cellsRows.forEach((l, ri) => { if (state[ri][step]) { flash(l[step]); sound(ri, step); } });
    };
    const start = () => { if (timer || reduce) return; seq.classList.add('run'); timer = setInterval(tick, 155); };
    const stop = () => { clearInterval(timer); timer = null; seq.classList.remove('run'); };
    place(); addEventListener('resize', place);
    new IntersectionObserver(es => { es.forEach(e => { visible = e.isIntersecting; visible && !document.hidden ? start() : stop(); }); }, { threshold: .25 }).observe(seq);
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : (visible && start()); });
  });

  /* ===== абонементы: занятия как такты ===== */
  safe(() => {
    const PLANS = { 4: 5000, 8: 9000, 12: 12000 };
    const COLS = ['var(--denim)', 'var(--rust)', 'var(--mustard)'];
    const num = $('#pNum'), per = $('#pPer'), beats = $('#pBeats');
    let cur = 8, shown = 9000, raf;
    const tween = to => {
      cancelAnimationFrame(raf);
      if (reduce) { shown = to; num.textContent = fmt(to); return; }
      const from = shown, t0 = performance.now();
      const f = t => { const k = Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - k, 3); shown = Math.round((from + (to - from) * e) / 10) * 10; num.textContent = fmt(shown); if (k < 1) raf = requestAnimationFrame(f); else { shown = to; num.textContent = fmt(to); } };
      raf = requestAnimationFrame(f);
    };
    const draw = n => {
      cur = n; tween(PLANS[n]);
      per.textContent = fmt(PLANS[n] / n) + ' ₽ за одно занятие';
      beats.textContent = '';
      for (let m = 0; m < n / 4; m++) {
        const bm = mk('div', 'bar-m'); bm.style.setProperty('--c', COLS[m % 3]);
        for (let b = 0; b < 4; b++) { const e = mk('i', 'bt'); e.style.setProperty('--i', m * 4 + b); bm.append(e); }
        beats.append(bm);
      }
    };
    $$('.pr__tabs [data-n]').forEach(b => b.addEventListener('click', () => draw(+b.dataset.n)));
    draw(8);
    $('#pBtn').addEventListener('click', e => { e.preventDefault(); toForm(); });
  });

  /* ===== форма ===== */
  const form = $('#leadForm');
  form && form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]'), orig = btn.textContent, msg = $('#msg');
    const payload = {}; new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    msg.textContent = '';
    if (!payload.name.trim() || !payload.contact.trim()) { msg.textContent = 'Укажите имя и телефон или Telegram.'; return; }
    if (!form.consent.checked) { msg.textContent = 'Отметьте согласие на обработку персональных данных.'; return; }
    payload.phone = payload.contact;
    payload.comment = 'Интерес: ' + payload.service + '. Для кого: ' + payload.who + '. Абонемент на сайте: ' + ($('#pNum') ? $('.pr__tabs .is-active')?.textContent || '' : '') + (payload.comment ? '. ' + payload.comment : '');
    delete payload.consent;
    btn.disabled = true; btn.textContent = 'Отправляем...';
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctrl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      msg.textContent = 'Заявка отправлена. Скоро свяжемся.'; form.reset();
    } catch (err) {
      console.error(err);
      msg.textContent = 'Заявка не ушла автоматически. Позвоните ';
      const t = document.createElement('a'); t.href = PHONE_TEL; t.textContent = '+7 918 69 50 400';
      const a = document.createElement('a'); a.href = TG_LINK; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'канал в Telegram';
      msg.append(t, ' или откройте ', a, '.');
    } finally {
      clearTimeout(timer); btn.disabled = false; btn.textContent = orig;
    }
  });
})();
