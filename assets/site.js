/* Plateful — generated from PlatefulCore's LegalSite. Do not edit here. */
(() => {
  "use strict";
  const root = document.documentElement;
  root.classList.add("js-ready");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const format = (n) => Math.round(n).toLocaleString("en-US");

  // Header: a hairline once the page has scrolled, and the small-screen menu.
  const header = document.querySelector("[data-header]");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const toggle = document.querySelector("[data-menu-toggle]");
  if (toggle && header) {
    const setOpen = (open) => {
      header.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    header.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") setOpen(false); });
    window.matchMedia("(min-width: 900px)").addEventListener("change", () => setOpen(false));
  }

  // Numbers count up from zero with an ease-out, the way the ring fills.
  function countUp(el, delay = 0) {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    if (reduce || target === 0) { el.textContent = format(target); return; }
    const duration = 1200;
    let start;
    el.textContent = format(0);
    const step = (now) => {
      if (start === undefined) start = now + delay;
      const progress = Math.min(1, Math.max(0, (now - start) / duration));
      el.textContent = format(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Types text into an element; stops early if `cancelled` says so.
  async function type(el, text, speed, cancelled = () => false) {
    if (!el) return;
    if (reduce) { el.textContent = text; return; }
    el.textContent = "";
    for (const character of text) {
      if (cancelled()) return;
      el.textContent += character;
      await wait(speed + Math.random() * speed * 0.6);
    }
  }

  // Reveal on scroll.
  const reveal = (el) => {
    el.classList.add("is-in");
    el.querySelectorAll("[data-count]").forEach((c) => { if (!c.closest("[data-demo]")) countUp(c, 200); });
  };
  const revealables = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target);
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });
    revealables.forEach((el) => {
      el.querySelectorAll("[data-count]").forEach((c) => { if (!c.closest("[data-demo]")) c.textContent = format(0); });
      observer.observe(el);
    });
  } else {
    revealables.forEach(reveal);
  }

  // Hero: Siri hears the sentence, then the numbers arrive.
  const siri = document.querySelector(".siri-card");
  if (siri) {
    const said = siri.querySelector("[data-hero-typed]");
    const text = said ? said.textContent : "";
    const counts = siri.querySelectorAll("[data-count]");
    if (reduce) {
      siri.classList.add("is-done");
    } else {
      if (said) said.textContent = "";
      counts.forEach((c) => { c.textContent = "0"; });
      (async () => {
        await wait(1250);
        await type(said, text, 42);
        await wait(260);
        siri.classList.add("is-done");
        counts.forEach((c) => countUp(c, 120));
      })();
    }
  }

  // Hero: the phone leans a little toward the pointer.
  const visual = document.querySelector(".hero-visual");
  const heroPhone = visual && visual.querySelector(".phone-hero");
  if (visual && heroPhone && !reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let frame = 0;
    visual.addEventListener("pointermove", (event) => {
      const box = visual.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        heroPhone.style.transform = `perspective(1400px) rotateY(${x * 7}deg) rotateX(${-y * 5}deg)`;
      });
    });
    visual.addEventListener("pointerleave", () => { heroPhone.style.transform = ""; });
  }

  // The estimate demo: tabs, typing, and an autoplay that stops for good
  // the moment someone picks a meal themselves.
  const demo = document.querySelector("[data-demo]");
  if (demo) {
    const tabs = Array.from(demo.querySelectorAll("[data-demo-tab]"));
    const panels = Array.from(demo.querySelectorAll("[data-demo-panel]"));
    let current = 0;
    let token = 0;
    let timer = 0;
    let autoplay = !reduce;
    let visible = false;
    let hovering = false;

    const schedule = () => {
      clearTimeout(timer);
      if (autoplay && visible && !hovering) timer = setTimeout(() => show((current + 1) % panels.length), 6500);
    };

    async function show(index, focus = false) {
      current = index;
      const mine = ++token;
      const cancelled = () => mine !== token;
      tabs.forEach((tab, i) => {
        tab.setAttribute("aria-selected", String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      panels.forEach((panel, i) => {
        panel.hidden = i !== index;
        panel.classList.remove("is-typed", "is-playing");
      });
      if (focus) tabs[index].focus();
      const panel = panels[index];
      const counts = panel.querySelectorAll("[data-count]");
      if (reduce) {
        panel.classList.add("is-typed", "is-playing");
        counts.forEach((c) => { c.textContent = format(Number(c.dataset.count)); });
        return;
      }
      counts.forEach((c) => { c.textContent = "0"; });
      await type(panel.querySelector("[data-typed]"), panel.dataset.prompt || "", 34, cancelled);
      if (cancelled()) return;
      await wait(220);
      if (cancelled()) return;
      panel.classList.add("is-typed");
      await wait(280);
      if (cancelled()) return;
      panel.classList.add("is-playing");
      counts.forEach((c) => countUp(c));
      schedule();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => { autoplay = false; clearTimeout(timer); show(i); });
      tab.addEventListener("keydown", (event) => {
        const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        autoplay = false;
        clearTimeout(timer);
        show((i + step + tabs.length) % tabs.length, true);
      });
    });
    demo.addEventListener("pointerenter", () => { hovering = true; clearTimeout(timer); });
    demo.addEventListener("pointerleave", () => { hovering = false; schedule(); });
    demo.addEventListener("focusin", () => { autoplay = false; clearTimeout(timer); });

    if ("IntersectionObserver" in window) {
      let started = false;
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !started) { started = true; show(0); }
        else if (visible) schedule();
        else clearTimeout(timer);
      }, { threshold: 0.35 }).observe(demo);
    } else {
      show(0);
    }
  }

  // The screen carousel's arrows.
  const carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    const prev = document.querySelector("[data-carousel-prev]");
    const next = document.querySelector("[data-carousel-next]");
    const stride = () => {
      const item = carousel.firstElementChild;
      const gap = parseFloat(getComputedStyle(carousel).columnGap) || 0;
      return item ? item.getBoundingClientRect().width + gap : carousel.clientWidth;
    };
    const update = () => {
      const max = carousel.scrollWidth - carousel.clientWidth - 2;
      if (prev) prev.disabled = carousel.scrollLeft <= 2;
      if (next) next.disabled = carousel.scrollLeft >= max;
    };
    const go = (direction) => carousel.scrollBy({ left: direction * stride(), behavior: reduce ? "auto" : "smooth" });
    if (prev) prev.addEventListener("click", () => go(-1));
    if (next) next.addEventListener("click", () => go(1));
    carousel.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    window.addEventListener("resize", update);
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
    });
    update();
  }

  // A link to one question opens it.
  const openFromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id && document.getElementById(id);
    if (target && target.tagName === "DETAILS") target.open = true;
  };
  window.addEventListener("hashchange", openFromHash);
  openFromHash();

  // Legal pages: on a phone the contents list starts folded, so the
  // words come first; without the script it simply stays open.
  const toc = document.querySelector("[data-toc]");
  if (toc && window.matchMedia("(max-width: 999px)").matches) toc.open = false;

  // Legal pages: the contents list marks the section being read.
  const contents = document.querySelector(".contents");
  if (contents && "IntersectionObserver" in window) {
    const links = new Map();
    contents.querySelectorAll("a[href^='#']").forEach((a) => links.set(a.getAttribute("href").slice(1), a));
    let currentLink = null;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const link = links.get(entry.target.id);
        if (!link || link === currentLink) continue;
        if (currentLink) currentLink.classList.remove("is-current");
        link.classList.add("is-current");
        currentLink = link;
      }
    }, { rootMargin: "-20% 0px -70% 0px" });
    links.forEach((_, id) => { const section = document.getElementById(id); if (section) observer.observe(section); });
  }
})();
