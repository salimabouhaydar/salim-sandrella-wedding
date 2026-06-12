const CONFIG = {
  whatsappSalim: "96176004496",
  whatsappSandrella: "9613109575",
  weddingISO: "2026-08-22T19:00:00+03:00",
};

/* ---------- Language toggle EN ⇄ AR ---------- */
(function lang() {
  const KEY = "ss-lang";
  const html = document.documentElement;
  const btn = document.getElementById("langBtn");

  function swapSelectOptions(lang) {
    document.querySelectorAll("option[data-en][data-ar]").forEach((option) => {
      option.textContent = option.getAttribute("data-" + lang) || option.textContent;
    });
  }

  function apply(lang) {
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-en][data-ar]").forEach((el) => {
      if (el.tagName.toLowerCase() === "option") return;
      const txt = el.getAttribute("data-" + lang);
      if (txt !== null) el.textContent = txt;
    });
    swapSelectOptions(lang);
    try { localStorage.setItem(KEY, lang); } catch {}
  }

  let initial = "en";
  try { initial = localStorage.getItem(KEY) || ""; } catch {}
  if (!initial) initial = (navigator.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en";
  apply(initial);

  btn?.addEventListener("click", () => apply(html.lang === "ar" ? "en" : "ar"));
})();

/* ---------- Start gate + optional music start ---------- */
(function startGate() {
  const gate = document.getElementById("startGate");
  const btn = document.getElementById("startBtn");
  const audio = document.getElementById("bgMusic");
  const musicBtn = document.getElementById("musicBtn");

  function hideGate() {
    gate?.classList.add("is-hidden");
    document.body.classList.add("invitation-started");
    if (audio && musicBtn && !audio.paused) musicBtn.classList.add("playing");
    window.setTimeout(() => gate?.remove(), 750);
  }

  btn?.addEventListener("click", () => {
    if (audio) audio.play().catch(() => {});
    hideGate();
  });

  gate?.addEventListener("wheel", hideGate, { once: true, passive: true });
  gate?.addEventListener("touchmove", hideGate, { once: true, passive: true });
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
    const diff = Math.max(0, target - Date.now());
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
  window.setInterval(tick, 1000);
})();

/* ---------- RSVP WhatsApp builder ---------- */
(function rsvp() {
  const btnSalim = document.getElementById("rsvpSalim");
  const btnSandrella = document.getElementById("rsvpSandrella");
  const nameInput = document.getElementById("rsvpName");
  const countInput = document.getElementById("rsvpCount");
  const statusInput = document.getElementById("rsvpStatus");
  const wishInput = document.getElementById("rsvpWish");
  const wishCount = document.getElementById("wishCount");

  wishInput?.addEventListener("input", () => {
    if (wishCount) wishCount.textContent = String(wishInput.value.length);
  });

  function currentLang() { return document.documentElement.lang === "ar" ? "ar" : "en"; }

  function buildMessage(toName, partnerName) {
    const lang = currentLang();
    const name = (nameInput?.value || "").trim();
    const count = Math.max(1, parseInt(countInput?.value, 10) || 1);
    const status = statusInput?.value || "yes";
    const wish = (wishInput?.value || "").trim();

    if (lang === "ar") {
      const intro = name ? `مرحبا ${toName}، أنا ${name}.` : `مرحبا ${toName}.`;
      if (status === "no") return `${intro} للأسف لن نستطيع حضور زفافكم في 22 آب. ألف مبروك لك ولـ${partnerName}! ${wish ? "\nكلمتنا لكم: " + wish : ""}`;
      const people = count === 1 ? "شخص واحد" : `${count} أشخاص`;
      return `${intro} نؤكد حضورنا (${people}) إلى زفافكم في 22 آب. ألف مبروك لك ولـ${partnerName}! 💞${wish ? "\nكلمتنا لكم: " + wish : ""}`;
    }

    const intro = name ? `Hi ${toName}, this is ${name}.` : `Hi ${toName}.`;
    if (status === "no") return `${intro} Sadly, we will not be able to attend your wedding on August 22. Congratulations to you and ${partnerName}! ${wish ? "\nOur wishes: " + wish : ""}`;
    const people = count === 1 ? "1 person" : `${count} people`;
    return `${intro} We confirm our attendance (${people}) at your wedding on August 22. Congratulations to you and ${partnerName}! 💞${wish ? "\nOur wishes: " + wish : ""}`;
  }

  function validate(e) {
    if (nameInput && !nameInput.value.trim()) {
      e.preventDefault();
      nameInput.focus();
      nameInput.reportValidity?.();
      toast(currentLang() === "ar" ? "الرجاء كتابة الاسم" : "Please type your name");
      return false;
    }
    if (statusInput && !statusInput.value) {
      e.preventDefault();
      statusInput.focus();
      statusInput.reportValidity?.();
      toast(currentLang() === "ar" ? "الرجاء اختيار الحضور" : "Please select attendance");
      return false;
    }
    return true;
  }

  function attach(btn, toNumber, toName, partnerName) {
    btn?.addEventListener("click", (e) => {
      if (!validate(e)) return;
      btn.href = `https://wa.me/${toNumber}?text=${encodeURIComponent(buildMessage(toName, partnerName))}`;
    });
  }

  attach(btnSalim, CONFIG.whatsappSalim, "Salim", "Sandrella");
  attach(btnSandrella, CONFIG.whatsappSandrella, "Sandrella", "Salim");
})();

/* ---------- Three.js celebratory petals ---------- */
(function heroScene() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.innerWidth < 720;
  const COUNT = prefersReduced ? 0 : (isMobile ? 46 : 110);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const ringGeo = new THREE.TorusGeometry(2.6, 0.015, 16, 220);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xc9a45c, transparent: true, opacity: 0.22 });
  const ringA = new THREE.Mesh(ringGeo, ringMat);
  const ringB = new THREE.Mesh(ringGeo, ringMat.clone());
  ringA.rotation.x = Math.PI / 2.3;
  ringB.rotation.x = Math.PI / 2.3;
  ringB.rotation.y = Math.PI / 4;
  ringB.position.x = 0.55;
  ringB.material.opacity = 0.16;
  scene.add(ringA, ringB);

  const colors = [0xc9a45c, 0xf2c9ca, 0xd8c7f2, 0xffd8bd];
  const petalGeo = new THREE.PlaneGeometry(0.14, 0.28);
  const petals = [];

  for (let i = 0; i < COUNT; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      transparent: true,
      opacity: 0.26 + Math.random() * 0.34,
      side: THREE.DoubleSide,
    });
    const p = new THREE.Mesh(petalGeo, mat);
    p.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6);
    p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    p.userData = {
      vy: 0.003 + Math.random() * 0.008,
      drift: (Math.random() - 0.5) * 0.006,
      spin: (Math.random() - 0.5) * 0.014,
      wave: Math.random() * Math.PI * 2,
    };
    scene.add(p);
    petals.push(p);
  }

  let raf;
  function animate() {
    ringA.rotation.z += 0.00075;
    ringB.rotation.z -= 0.00055;
    const t = performance.now() * 0.001;
    for (const p of petals) {
      p.position.y += p.userData.vy;
      p.position.x += p.userData.drift + Math.sin(t + p.userData.wave) * 0.002;
      p.rotation.z += p.userData.spin;
      p.rotation.x += p.userData.spin * 0.42;
      if (p.position.y > 6.6) {
        p.position.y = -6.6;
        p.position.x = (Math.random() - 0.5) * 16;
      }
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }

  if (!prefersReduced) animate();
  else renderer.render(scene, camera);

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && !raf && !prefersReduced) animate();
      if (!entry.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
    }
  });
  io.observe(canvas);
})();

/* ---------- GSAP reveals + gallery ---------- */
(function gsapScroll() {
  if (typeof gsap === "undefined") {
    document.querySelectorAll(".reveal").forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.05,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
    });
  });

  gsap.to(".hero .reveal", { opacity: 1, y: 0, duration: 1.15, ease: "power3.out", stagger: 0.1, delay: 0.18 });

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
      y: 28,
      scale: 0.94,
      duration: 0.85,
      ease: "power3.out",
      stagger: { each: 0.045, from: "random" },
      scrollTrigger: { trigger: stack, start: "top 82%", toggleActions: "play none none none" },
    });
  }

  gsap.to(".floating-orb.orb-one", { y: -60, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".floating-orb.orb-two", { y: 70, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
})();

/* ---------- Gallery lightbox ---------- */
(function lightbox() {
  const lb = document.getElementById("lightbox");
  const img = lb?.querySelector("img");
  const close = lb?.querySelector(".lb-close");
  if (!lb || !img || !close) return;

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

/* ---------- Music button ---------- */
(function music() {
  const audio = document.getElementById("bgMusic");
  const btn = document.getElementById("musicBtn");
  if (!audio || !btn) return;
  const noteIcon = btn.querySelector(".note-icon");
  const pauseIcon = btn.querySelector(".pause-icon");

  audio.volume = 0.45;
  audio.addEventListener("canplay", () => { btn.hidden = false; }, { once: true });
  audio.addEventListener("error", () => { btn.hidden = true; });
  audio.load();

  function setPlaying(isPlaying) {
    btn.classList.toggle("playing", isPlaying);
    btn.setAttribute("aria-label", isPlaying ? "Pause background music" : "Play background music");
    if (noteIcon) noteIcon.hidden = isPlaying;
    if (pauseIcon) pauseIcon.hidden = !isPlaying;
  }

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => toast("Tap again to start music"));
    } else {
      audio.pause();
      setPlaying(false);
    }
  });
})();

/* ---------- Calendar file ---------- */
(function addCalendar() {
  const btn = document.getElementById("addCalendar");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const dtStart = "20260822T120000Z"; // 15:00 Beirut
    const dtEnd = "20260823T000000Z";   // 03:00 Beirut next day
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
      "LOCATION:Saydet Al Najat Church, Mina Byblos, Jbeil, Lebanon",
      "DESCRIPTION:Gathering and zaffe at 15:00. Wedding ceremony at 19:00 at Saydet Al Najat Church, Mina Byblos, Jbeil. Dinner and reception after the ceremony.",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "salim-sandrella-wedding.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(document.documentElement.lang === "ar" ? "تم حفظ ملف التقويم" : "Calendar file saved");
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
  toast._tid = setTimeout(() => t.classList.remove("show"), 1900);
}
