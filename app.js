/* devStore landing interactions */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- H1 ROTADOR: 2s pausa + 2s transición, sin layout-shift ---------- */
  // El ancho estable lo da CSS (inline-grid + grid-area 1/1 = ancho de la palabra más larga).
  // Aquí solo alternamos clases; el alto es fijo (min-height) así que nada se mueve.
  const HOLD = 2000;        // pausa con palabra visible
  const TRANSITION = 2000;  // debe igualar el transition de CSS (2s)
  const rotator = $('#rotator');
  const words = $$('.rot-word', rotator || document.createElement('div'));
  if (rotator && words.length > 1 && !reduced) {
    let i = 0;
    const show = (next) => {
      const cur = words[i];
      const nxt = words[next];
      cur.classList.add('is-exit');       // sale hacia arriba con blur (2s)
      nxt.classList.add('is-active');     // entra desde abajo con blur (2s)
      nxt.removeAttribute('aria-hidden');
      rotator.setAttribute('aria-label', nxt.textContent.trim());
      setTimeout(() => {
        cur.classList.remove('is-active', 'is-exit');
        cur.setAttribute('aria-hidden', 'true');
        i = next;
        setTimeout(() => show((i + 1) % words.length), HOLD);
      }, TRANSITION);
    };
    setTimeout(() => show(1), HOLD);
  }

  /* ---------- progress + navbar blur + link activo + top ---------- */
  const nav = $('#nav'), progress = $('#progress'), toTop = $('#toTop');
  const sections = ['beneficios', 'catalogo', 'seguridad', 'opiniones', 'faq'];
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', y > 12);
    toTop.classList.toggle('show', y > 700);
    let cur = '';
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < 160) cur = id;
    }
    $$('.nav__links a').forEach(a => a.classList.toggle('active', a.dataset.link === cur));
    // parallax ligero
    if (!reduced) $$('[data-parallax]').forEach(el => {
      const r = el.getBoundingClientRect();
      const off = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.translate = `0 ${(-off * parseFloat(el.dataset.parallax)).toFixed(1)}px`;
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

  /* ---------- burger ---------- */
  const burger = $('#burger'), mm = $('#mobilemenu');
  burger.addEventListener('click', () => {
    const open = mm.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  mm.addEventListener('click', e => { if (e.target.tagName === 'A') mm.classList.remove('open'); });

  /* ---------- reveal on scroll (una sola vez, con stagger --d) ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- contadores ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * ease).toLocaleString('es-MX');
      if (p < 1) requestAnimationFrame(tick);
    };
    reduced ? el.textContent = end.toLocaleString('es-MX') : requestAnimationFrame(tick);
    cio.unobserve(el);
  }), { threshold: 0.5 });
  $$('.count').forEach(el => cio.observe(el));

  /* ---------- spotlight + tilt hero ---------- */
  const hero = $('#hero'), spot = $('#spot'), mock = $('#mockCard');
  if (hero && !reduced) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100;
      hero.style.setProperty('--mx', x + '%'); hero.style.setProperty('--my', y + '%');
      // parallax orbes
      $$('.orb', hero).forEach((o, k) => {
        const f = (k + 1) * 6;
        o.style.translate = `${((x - 50) / 50 * f).toFixed(1)}px ${((y - 30) / 50 * f).toFixed(1)}px`;
      });
      // tilt sutil tarjeta
      if (mock && e.pointerType === 'mouse') {
        const mr = mock.getBoundingClientRect();
        const dx = (e.clientX - (mr.left + mr.width / 2)) / mr.width;
        const dy = (e.clientY - (mr.top + mr.height / 2)) / mr.height;
        if (Math.abs(dx) < 1.4 && Math.abs(dy) < 1.6)
          mock.style.transform = `rotateY(${(dx * 7).toFixed(2)}deg) rotateX(${(-dy * 7).toFixed(2)}deg)`;
      }
    });
    hero.addEventListener('pointerleave', () => { if (mock) mock.style.transform = ''; });
  }
  void spot;

  /* ---------- botones magnéticos sutiles ---------- */
  if (!reduced && matchMedia('(pointer:fine)').matches) $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.08).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * 0.12).toFixed(1)}px)`;
    });
    b.addEventListener('pointerleave', () => b.style.transform = '');
  });

  /* ---------- filtros + búsqueda ---------- */
  const chips = $$('.chip'), cards = $$('.prod'), noRes = $('#noRes'), search = $('#searchInput');
  let filter = 'all', q = '';
  const apply = () => {
    let n = 0;
    cards.forEach(c => {
      const okF = filter === 'all' || c.dataset.cat === filter;
      const okQ = !q || (c.dataset.name + ' ' + c.textContent).toLowerCase().includes(q);
      const show = okF && okQ;
      c.classList.toggle('hide', !show); if (show) n++;
    });
    noRes.hidden = n !== 0;
  };
  chips.forEach(ch => ch.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('is-on')); ch.classList.add('is-on');
    filter = ch.dataset.filter; apply();
  }));
  search?.addEventListener('input', () => { q = search.value.trim().toLowerCase(); apply(); });

  /* ---------- carrito demo ---------- */
  const cart = new Map();
  const drawer = $('#drawer'), scrim = $('#scrim');
  const openDrawer = (o) => {
    drawer.classList.toggle('open', o); scrim.hidden = !o;
    drawer.setAttribute('aria-hidden', !o); document.body.style.overflow = o ? 'hidden' : '';
  };
  $('#cartOpen').addEventListener('click', () => openDrawer(true));
  $('#cartClose').addEventListener('click', () => openDrawer(false));
  scrim.addEventListener('click', () => openDrawer(false));
  addEventListener('keydown', e => { if (e.key === 'Escape') openDrawer(false); });

  const prices = { 'Master TypeScript 2026': 49, 'JetBrains All Products 1 año': 159, 'Next.js + IA: de cero a SaaS': 59, 'Microsoft 365 Dev + Copilot': 89, 'Kit Mecánico Dev Pro': 129, 'Pack Carrera Full-Stack': 99 };
  const render = () => {
    const box = $('#cartItems'); let total = 0, count = 0;
    if (!cart.size) box.innerHTML = '<p class="empty">Tu carrito está vacío.<br /><small>Añade un curso o licencia para ver la magia ✨</small></p>';
    else box.innerHTML = [...cart.entries()].map(([name, qty]) => {
      const p = prices[name] ?? 49; total += p * qty; count += qty;
      return `<div class="citem"><span class="th">${name.slice(0, 2).toUpperCase()}</span><div><b>${name}</b><small>$${p} × ${qty}</small></div><button data-del="${name}" aria-label="Quitar">✕</button></div>`;
    }).join('');
    $('#cartTotal').textContent = '$' + total;
    $('#cartCount').textContent = count; $('#drawerCount').textContent = `(${count})`;
  };
  const toast = (msg) => {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
  };
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) {
      const n = add.dataset.add; cart.set(n, (cart.get(n) ?? 0) + 1); render();
      toast(`✅ ${n} añadido · Checkout cifrado SSL`);
      return;
    }
    const del = e.target.closest('[data-del]');
    if (del) { cart.delete(del.dataset.del); render(); }
  });
  $('#checkoutBtn').addEventListener('click', () => {
    if (!cart.size) return toast('Tu carrito está vacío 👀');
    toast('🔒 Demo: aquí iría Stripe/PayPal con 3D Secure');
  });
  render();

  /* ---------- lead + año + solo un details abierto ---------- */
  $('#leadForm').addEventListener('submit', e => {
    e.preventDefault(); e.target.reset();
    toast('🎉 Código DEV20 enviado. Revisa tu email.');
  });
  $('#year').textContent = new Date().getFullYear();
  $$('.faq details').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) $$('.faq details').forEach(o => { if (o !== d) o.open = false; });
  }));

  console.log('%cdevStore%c landing lista · rotador 2s/2s sin layout-shift', 'background:#4F46E5;color:#fff;padding:2px 8px;border-radius:6px', 'color:#059669;font-weight:bold');
})();
