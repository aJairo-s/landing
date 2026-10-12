# devStore — Landing Specs (mini specs + plan de implementación)

> Stack elegido: **HTML + CSS + JS vanilla** (sin build). Modo **light blanco**.
> Foco: ecommerce para desarrolladores (cursos, licencias, kits) con énfasis en **confianza y seguridad**.

## 1. Objetivo
Estructura visual de landing que comunique ventajas/beneficios de devStore como ecommerce confiable:
- Qué vende (cursos, licencias, merch/gear dev).
- Por qué comprar aquí (garantía, pagos seguros, soporte real, licencias originales, factura).
- Convertir: CTA a catálogo, carrito demo, prueba social, FAQ que rompe objeciones.

## 2. Audiencia y mensaje
- **Audiencia:** estudiantes dev, freelancers, equipos que compran licencias/cursos.
- **Propuesta:** "Todo para desarrolladores en un solo checkout seguro."
- **Pilares:** Confianza (reseñas, garantías, empresas que compran) / Seguridad (SSL, PCI, 3D Secure, devoluciones) / Beneficio (acceso inmediato, actualizaciones, soporte en español).

## 3. Paleta light (blanca)
```css
--bg: #FFFFFF;
--bg-soft: #F8FAFC;
--bg-muted: #F1F5F9;
--ink: #0F172A;
--ink-soft: #475569;
--line: #E2E8F0;
--brand: #4F46E5;   /* indigo: CTA, links */
--brand-ink: #3730A3;
--trust: #059669;   /* emerald: sellos seguridad */
--warn: #D97706;    /* amber: garantías/stars */
--card: #FFFFFF;
```
- Contraste AA: texto `#0F172A` sobre `#FFFFFF` (15.6:1). Botón brand con texto blanco (6.2:1).
- Sombras suaves, bordes 1px `line`, radios 16-20px. Nada de dark-mode.

## 4. Estructura visual (orden del DOM)
1. **Announcement bar** — envío digital inmediato + 30 días garantía + pago 100% seguro.
2. **Navbar sticky + blur** — logo, links (Beneficios, Catálogo, Seguridad, Opiniones, FAQ), buscador decorativo, carrito con contador, CTA.
3. **Hero (H1 + rotador)** — eyebrow "Ecommerce para developers", H1: `Impulsa tu carrera con [rotador]`, sub, 2 CTAs, micro-trust (★4.9, +12k devs, pago seguro), stats (12k+, 4.9, 24/7), visual: tarjeta producto + badges flotantes + orbes + spotlight cursor.
4. **Trustbar marquee** — métodos pago (Visa, Mastercard, PayPal, Stripe, OXXO, PSE) + "Licencias 100% originales".
5. **Beneficios (6 cards)** — Acceso inmediato, Licencias originales, Pagos protegidos, Soporte dev real, Actualizaciones incluidas, Factura y empresa.
6. **Catálogo destacado** — tabs/filtros (Todos, Cursos, Licencias, Kits) + 6 product cards (precio, antes, rating, badge, add-to-cart).
7. **Seguridad y confianza (split)** — checklist + sellos (SSL 256-bit, PCI DSS, 3D Secure, Garantía 30 días) + mini panel "tu compra protegida" con pasos.
8. **Cómo funciona (3 pasos)** — Elige → Paga seguro → Recibe al instante.
9. **Opiniones (3 testimonios)** — avatar inicial, stars, rol verificada.
10. **Garantía band** — 30 días devolución, sin preguntas.
11. **FAQ (acordeón 6)** — originalidad, entrega, reembolso, factura, métodos pago, soporte.
12. **CTA final** — gradiente light + email capture demo.
13. **Footer** — columnas, métodos pago, legal.
14. **Extras funcionales:** cart drawer demo + toast, back-to-top, scroll progress.

## 5. Animaciones globales (no solo "cajas que saltan")
Principio: todo el DOM respira, con curvas largas y delays escalonados. `prefers-reduced-motion` las desactiva.
- **Navbar:** blur + borde + sombra al hacer scroll; link activo por sección; barra de progreso superior.
- **Hero:** spotlight radial que sigue el mouse (CSS vars `--mx/--my`), orbes con parallax por mouse (translate pequeño), grid de fondo con mask, badges flotantes (float 6s).
- **Reveal on scroll:** `IntersectionObserver`, `.reveal` → opacity 0→1, translateY 24px→0, blur 6px→0, `cubic-bezier(.22,.61,.36,1)` 0.9s, stagger con `--d`. Una sola vez.
- **Contadores:** stats hero animan de 0 al valor al entrar en viewport.
- **Marquee:** cinta infinita CSS (30s linear infinite), pausa en hover.
- **Botones magnéticos sutiles:** translate max 4px hacia el cursor + brillo.
- **Cards producto:** lift 6px + sombra + imagen (gradiente/inicial) con zoom 1.04 lento 0.6s.
- **Seguridad:** sellos con pulso suave en el dot verde; panel con borde gradiente animado.
- **Acordeón FAQ:** grid-rows 0fr→1fr 0.5s ease + rotación icono.
- **Parallax ligero:** `[data-parallax]` translateY según scroll (rAF, max ±20px).
- **Toast/drawer:** slide + fade 0.45s.

## 6. H1 rotador — spec anti layout-shift (bug a corregir)
**Problema anterior:** el cambio de palabras desplazaba/inmutaba el resto del contenido (el ancho/alto del H1 cambiaba por palabra).

**Solución implementada:**
- Contenedor `.rotator` con `display: inline-grid` y todas las palabras en `grid-area: 1/1`. El ancho del contenedor = palabra más larga → **ancho estable, cero shift horizontal**.
- Alto fijo: `min-height: 1.15em; overflow: hidden; vertical-align: bottom` → **cero shift vertical**.
- Palabras absolutamente apiladas vía grid, solo cambia `opacity / transform / filter / blur`.
- **Tiempos exigidos:** 2s visible (pausa) + 2s transición → ciclo 4s por palabra:
  ```css
  .rot-word { transition: opacity 2s ease, transform 2s ease, filter 2s ease; }
  ```
  ```js
  HOLD = 2000; TRANSITION = 2000; // setTimeout en cadena, no setInterval ingenuo
  ```
- Accesibilidad: `aria-live="polite"`, `prefers-reduced-motion` congela en primera palabra.
- Ancho reservado extra: `min-width: 9ch` + `white-space: nowrap`.

## 7. Plan de implementación (pasos)
1. `landing/landing_specs.md` (este archivo).
2. `landing/index.html` — semántico, SEO meta + OG, secciones §4.
3. `landing/styles.css` — tokens, layout, componentes, animaciones, responsive 1024/768/520.
4. `landing/app.js` — rotador, observer reveal, navbar/progress, contadores, filtros, carrito demo, FAQ, spotlight/parallax, back-to-top, año.
5. QA: abrir `index.html`, comprobar: sin scroll-shift en H1, tiempos 2s/2s, reveal una vez, drawer/toast, responsive, sin errores consola.
6. Sin git (decisión usuario: solo archivos).

## 8. Criterios de aceptación
- [ ] H1 no mueve nada al rotar (ni X ni Y), transición suave 2s + pausa 2s.
- [ ] Paleta light blanca, contraste legible.
- [ ] Animaciones en navbar, hero, marquee, reveals, contadores, FAQ, botones, parallax.
- [ ] Filtros catálogo + carrito demo + toast funcionan sin backend.
- [ ] Responsive sin overflow horizontal; `prefers-reduced-motion` respetado.
- [ ] Cero dependencias externas (funciona con `file://`).

## 9. Archivos
```
landing/
├── landing_specs.md  ← tú estás aquí
├── index.html
├── styles.css
└── app.js
```
