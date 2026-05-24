/* =========================================================
   Salim & Sandrella — wedding site script
   ========================================================= */

/* ---------- Language toggle (EN ⇄ AR) ---------- */
(function lang() {
  const KEY = "ss-lang";
  const html = document.documentElement;
  const btn = document.getElementById("langBtn");

  function apply(l) {
    html.lang = l;
    html.dir  = (l === "ar") ? "rtl" : "ltr";
    // Swap textContent for every element with data-en / data-ar
    document.querySelectorAll("[data-en][data-ar]").forEach((el) => {
      const txt = el.getAttribute("data-" + l);
      if (txt !== null) el.textContent = txt;
    });
    try { localStorage.setItem(KEY, l); } catch {}
  }

  // Initial: stored choice → browser preference → English
  let initial = "en";
  try { initial = localStorage.getItem(KEY) || ""; } catch {}
  if (!initial) {
    const nav = (navigator.language || "en").toLowerCase();
    initial = nav.startsWith("ar") ? "ar" : "en";
  }
  apply(initial);

  if (btn) {
    btn.addEventListener("click", () => {
      apply(html.lang === "ar" ? "en" : "ar");
    });
  }
})();


/* ---------- EDIT ME ---------- */
const CONFIG = {
  // WhatsApp numbers in international format (no '+', no spaces).
  // 961 = Lebanon country code. Mobile numbers drop the leading 0.
  whatsappSalim:     "96176004496",   // Salim — 76 004 496
  whatsappSandrella: "9613109575",    // Sandrella — 03 109 575
  // Wedding moment in Beirut time (UTC+3 during August / EEST).
  weddingISO: "2026-08-22T19:00:00+03:00",
  // Church coordinates (Eglise Saydet Al Najat — Mina, Jbeil/Byblos).
  mapLat: 34.1209,
  mapLng: 35.6434,
};
/* ----------------------------- */


// RSVP buttons — build the WhatsApp message from the form on each click
(function wireRsvp() {
  const btnSalim     = document.getElementById("rsvpSalim");
  const btnSandrella = document.getElementById("rsvpSandrella");
  const nameInput    = document.getElementById("rsvpName");
  const countInput   = document.getElementById("rsvpCount");

  function buildMessage(toName, partnerName) {
    const lang  = document.documentElement.lang === "ar" ? "ar" : "en";
    const name  = (nameInput?.value || "").trim();
    const count = Math.max(1, parseInt(countInput?.value, 10) || 1);
    if (lang === "ar") {
      const intro = name ? `مرحبا ${toName}، أنا ${name}.` : `مرحبا ${toName}.`;
      const people = count === 1 ? "شخص واحد" : `${count} أشخاص`;
      return `${intro} سنحضر ${people} لحفل زفافكم في 22 آب. ألف مبروك لك ولـ${partnerName}! 💞`;
    }
    const intro = name ? `Hi ${toName}, this is ${name}.` : `Hi ${toName}.`;
    const people = count === 1 ? "1 person" : `${count} people`;
    return `${intro} We'll be ${people} at your wedding on August 22. Congratulations to you and ${partnerName}! 💞`;
  }

  function attach(btn, toNumber, toName, partnerName) {
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      if (nameInput && !nameInput.value.trim()) {
        e.preventDefault();
        nameInput.focus();
        nameInput.reportValidity?.();
        toast(document.documentElement.lang === "ar" ? "الرجاء كتابة الاسم" : "Please type your name");
        return;
      }
      const url = "https://wa.me/" + toNumber + "?text=" + encodeURIComponent(buildMessage(toName, partnerName));
      btn.href = url;
      // Default anchor behavior will now open the URL
    });
  }

  attach(btnSalim,     CONFIG.whatsappSalim,     "Salim",     "Sandrella");
  attach(btnSandrella, CONFIG.whatsappSandrella, "Sandrella", "Salim");
})();


/* ---------- Countdown ---------- */
(function countdown() {
  const target = new Date(CONFIG.weddingISO).getTime();
  const els = {
    d: document.querySelector('[data-cd="d"]'),
    h: document.querySelector('[data-cd="h"]'),
    m: document.querySelector('[data-cd="m"]'),
    s: document.querySelector('[data-cd="s"]'),
  };
  if (!els.d) return;
  function pad(n) { return String(Math.max(0, n)).padStart(2, "0"); }
  function tick() {
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    els.d.textContent = pad(d);
    els.h.textContent = pad(h);
    els.m.textContent = pad(m);
    els.s.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);
})();


/* ---------- Three.js hero: drifting petals + ring ---------- */
(function heroScene() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.innerWidth < 720;
  const COUNT = prefersReduced ? 0 : (isMobile ? 40 : 90);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  // Soft gold ring (subtle, slowly rotating)
  const ringGeo = new THREE.TorusGeometry(2.4, 0.018, 16, 200);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xC9A86B, transparent: true, opacity: 0.35 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.4;
  scene.add(ring);

  const ring2 = new THREE.Mesh(ringGeo, ringMat.clone());
  ring2.material.opacity = 0.22;
  ring2.rotation.x = Math.PI / 2.4;
  ring2.rotation.y = Math.PI / 4;
  ring2.position.x = 0.5;
  scene.add(ring2);

  // Petals — small flat planes drifting upward, gently rotating
  const petalGeo = new THREE.PlaneGeometry(0.18, 0.32);
  const petalMat = new THREE.MeshBasicMaterial({
    color: 0xC9A86B, transparent: true, opacity: 0.55, side: THREE.DoubleSide,
  });

  const petals = [];
  for (let i = 0; i < COUNT; i++) {
    const p = new THREE.Mesh(petalGeo, petalMat.clone());
    p.material.opacity = 0.25 + Math.random() * 0.4;
    p.position.set(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 6
    );
    p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    p.userData = {
      vy: 0.003 + Math.random() * 0.006,
      drift: (Math.random() - 0.5) * 0.004,
      spin: (Math.random() - 0.5) * 0.01,
    };
    scene.add(p);
    petals.push(p);
  }

  let raf;
  function animate() {
    ring.rotation.z += 0.0008;
    ring2.rotation.z -= 0.0006;
    for (const p of petals) {
      p.position.y += p.userData.vy;
      p.position.x += p.userData.drift;
      p.rotation.z += p.userData.spin;
      if (p.position.y > 6.5) {
        p.position.y = -6.5;
        p.position.x = (Math.random() - 0.5) * 16;
      }
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }
  if (!prefersReduced) animate();
  else renderer.render(scene, camera);

  // Pause when hero is off-screen (save battery)
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !raf && !prefersReduced) animate();
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
    }
  });
  io.observe(canvas);
})();


/* ---------- GSAP reveals + gallery 3D tilt ---------- */
(function gsapScroll() {
  if (typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  // Generic reveal — fade-up on scroll
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });
  });

  // Hero reveals run on load (no scrolling needed)
  gsap.to(".hero .reveal", { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: 0.12, delay: 0.15 });

  // Shuffle the gallery photos in place, then animate them in with a stagger
  const stack = document.querySelector(".photo-stack");
  if (stack) {
    const items = Array.from(stack.children);
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    items.forEach((el) => stack.appendChild(el));

    gsap.from(stack.children, {
      opacity: 0,
      y: 30,
      scale: 0.94,
      duration: 0.9,
      ease: "power3.out",
      stagger: { each: 0.06, from: "random" },
      scrollTrigger: {
        trigger: stack,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
  }

  // Subtle parallax for hero text on scroll
  gsap.to(".hero-inner", {
    yPercent: -15,
    opacity: 0.6,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
})();


function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(toast._tid);
  toast._tid = setTimeout(() => t.classList.remove("show"), 1800);
}


/* ---------- Gallery lightbox ---------- */
(function lightbox() {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const img = lb.querySelector("img");
  const close = lb.querySelector(".lb-close");

  document.querySelectorAll(".photo img").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      img.src = thumb.src;
      lb.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });
  function hide() {
    lb.hidden = true;
    img.src = "";
    document.body.style.overflow = "";
  }
  close.addEventListener("click", hide);
  lb.addEventListener("click", (e) => { if (e.target === lb) hide(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) hide(); });
})();


/* ---------- Background music (tap-to-play) ---------- */
(function music() {
  const audio = document.getElementById("bgMusic");
  const btn = document.getElementById("musicBtn");
  if (!audio || !btn) return;

  const noteIcons = btn.querySelectorAll(".note-icon").length ? btn.querySelector("svg") : null;
  const pauseIcon = btn.querySelector(".pause-icon");
  const noteIcon  = btn.querySelector("svg:not(.pause-icon)");

  audio.volume = 0.5;

  // Reveal the button only if the audio file actually loads
  audio.addEventListener("canplay", () => { btn.hidden = false; }, { once: true });
  audio.addEventListener("error",   () => { btn.hidden = true; });
  // Kick off metadata load (preload="none" means we have to trigger)
  audio.load();

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(() => {
        btn.classList.add("playing");
        btn.setAttribute("aria-label", "Pause background music");
        if (noteIcon) noteIcon.style.display = "none";
        if (pauseIcon) pauseIcon.style.display = "block";
      }).catch(() => {
        toast("Tap again to start music");
      });
    } else {
      audio.pause();
      btn.classList.remove("playing");
      btn.setAttribute("aria-label", "Play background music");
      if (noteIcon) noteIcon.style.display = "block";
      if (pauseIcon) pauseIcon.style.display = "none";
    }
  });
})();


/* ---------- Add to calendar (.ics download) ---------- */
(function addCalendar() {
  const btn = document.getElementById("addCalendar");
  if (!btn) return;
  btn.addEventListener("click", () => {
    // Build ICS in UTC. Beirut is UTC+3 in August (EEST).
    // Whole day: procession 15:00 → ceremony 19:00 → reception until late.
    const dtStart = "20260822T120000Z"; // 15:00 Beirut
    const dtEnd   = "20260823T000000Z"; // 03:00 Beirut next day
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Salim & Sandrella//Wedding//EN",
      "BEGIN:VEVENT",
      "UID:salim-sandrella-2026-08-22@wedding",
      "DTSTAMP:" + dtStart,
      "DTSTART:" + dtStart,
      "DTEND:" + dtEnd,
      "SUMMARY:Salim & Sandrella — Wedding",
      "LOCATION:Eglise Saydet Al Najat, Mina, Jbeil, Lebanon",
      "DESCRIPTION:Procession (Zaffe) at 15:00 — Salim from a friend's house in Kahloon (Mon Liban\\, Nammoura\\, Keserwan)\\, Sandrella from her family home. Ceremony at 19:00 at Eglise Saydet Al Najat (Mina\\, Jbeil). Cocktail reception in the church garden right after.",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "salim-sandrella-wedding.ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Calendar file saved");
  });
})();
