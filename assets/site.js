/* Plateful — generated from PlatefulCore's LegalSite. Do not edit here. */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  // The estimate demo's tabs.
  const demo = document.querySelector("[data-demo]");
  if (demo) {
    const tabs = Array.from(demo.querySelectorAll("[data-demo-tab]"));
    const panels = Array.from(demo.querySelectorAll("[data-demo-panel]"));
    const show = (index, focus = false) => {
      tabs.forEach((tab, i) => {
        tab.setAttribute("aria-selected", String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      panels.forEach((panel, i) => { panel.hidden = i !== index; });
      if (focus) tabs[index].focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => show(i));
      tab.addEventListener("keydown", (event) => {
        const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        show((i + step + tabs.length) % tabs.length, true);
      });
    });
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
