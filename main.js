/*=============== JS FLAG (reveal styles only apply when JS runs) ===============*/
document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/*=============== HEADER BACKGROUND ON SCROLL ===============*/
const header = document.getElementById("header");
const progressBar = document.getElementById("progress-bar");
function scrollHeader() {
  header.classList.toggle("scroll-header", window.scrollY >= 50);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = "scaleX(" + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ")";
}
window.addEventListener("scroll", scrollHeader, { passive: true });
scrollHeader();

/*=============== LIGHT / DARK THEME ===============*/
const themeButton = document.getElementById("theme-button");
const themeIcon = document.getElementById("theme-icon");
const themeMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "light" ? "light_mode" : "dark_mode";
  themeButton.setAttribute(
    "aria-label",
    theme === "light" ? "Switch to dark theme" : "Switch to light theme"
  );
  if (themeMeta) themeMeta.setAttribute("content", theme === "light" ? "#F6F5FC" : "#0A0B14");
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("portfolio-theme");
} catch (e) {}
applyTheme(savedTheme || "dark");

themeButton.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
  try {
    localStorage.setItem("portfolio-theme", next);
  } catch (e) {}
});

/*=============== HERO PHOTO: DROP-IN ANIMATION ===============*/
const homeImg = document.getElementById("home-img");
const homeCircle = document.querySelector(".home__circle");

function replayIntro() {
  if (reduceMotion) return;
  [homeCircle, homeImg].forEach((el) => {
    el.style.animation = "none";
    void el.offsetWidth; // restart the CSS animation
    el.style.animation = "";
  });
}

document.getElementById("intro-button").addEventListener("click", replayIntro);

// "About me" also replays the intro as the page scrolls down
document.querySelector(".home__button .button--ghost").addEventListener("click", () => {
  setTimeout(replayIntro, 300);
});

// Replay every time the hero comes back into view after leaving it
const homeSection = document.getElementById("home");
let homeWasHidden = false;
new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        homeWasHidden = true;
      } else if (homeWasHidden) {
        homeWasHidden = false;
        replayIntro();
      }
    });
  },
  { threshold: 0.35 }
).observe(homeSection);

/*=============== SCROLL REVEAL + COUNTERS ===============*/
function runCounter(el) {
  const target = Number(el.dataset.count);
  if (reduceMotion || !target) return;
  const duration = 1200;
  const start = performance.now();
  el.textContent = "0";
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      entry.target.querySelectorAll(".count").forEach(runCounter);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  // stagger siblings a little
  el.style.transitionDelay = (i % 3) * 90 + "ms";
  revealObserver.observe(el);
});

/*=============== SERVICES PANEL ===============*/
const services = [
  {
    title: "Web development",
    text: "I design and develop consumer products with a creative, hands-on approach that meets what customers and markets need.",
    items: [
      "I develop the user interfaces.",
      "Web page design and development.",
      "I create the UX element interactions.",
      "I position your company brand.",
      "Create modern 3D experiences.",
    ],
  },
  {
    title: "Modern stack",
    text: "I build web-based software with modern technology: Python, Flask and FastAPI with a properly designed MySQL database.",
    items: [
      "I develop the modern technology backend.",
      "Web page design and development.",
      "I create backend logic with interactions.",
      "I position your company brand.",
      "Create modern technology web apps.",
    ],
  },
  {
    title: "API development and design",
    text: "I design and develop clean APIs that connect your products and keep them fast, secure and easy to extend.",
    items: [
      "I develop the user interfaces.",
      "Web page design and development.",
      "I create the UX element interactions.",
      "I position your company brand.",
      "Create modern 3D experiences.",
    ],
  },
];

const serviceCards = document.querySelectorAll(".services__card");
const panel = document.getElementById("service-panel");
const panelTitle = document.getElementById("panel-title");
const panelDesc = document.getElementById("panel-desc");
const panelList = document.getElementById("panel-list");

function showService(index) {
  const s = services[index];
  panelTitle.textContent = s.title;
  panelDesc.textContent = s.text;
  panelList.innerHTML = "";
  s.items.forEach((text) => {
    const li = document.createElement("li");
    const icon = document.createElement("span");
    icon.className = "ms";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "check_circle";
    li.append(icon, document.createTextNode(text));
    panelList.appendChild(li);
  });
  serviceCards.forEach((card, i) => {
    const open = i === index;
    card.classList.toggle("is-open", open);
    card.setAttribute("aria-expanded", String(open));
    card.querySelector(".services__button-text").textContent = open ? "Details open" : "See more";
  });
  panel.classList.remove("is-changing");
  void panel.offsetWidth;
  panel.classList.add("is-changing");
}

serviceCards.forEach((card, i) => card.addEventListener("click", () => showService(i)));
showService(0);

/*=============== ACTIVE NAV LINK ===============*/
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav__link");

function scrollActive() {
  const y = window.scrollY + window.innerHeight * 0.35;
  let currentId = sections[0].id;
  sections.forEach((s) => {
    if (y >= s.offsetTop) currentId = s.id;
  });
  // "services" has no nav entry, so keep Skills highlighted there
  if (currentId === "services") currentId = "skills";
  navLinks.forEach((link) => {
    link.classList.toggle("active-link", link.getAttribute("href") === "#" + currentId);
  });
}
window.addEventListener("scroll", scrollActive, { passive: true });
scrollActive();

/*=============== SECTION TITLES: WORD-BY-WORD REVEAL ===============*/
document.querySelectorAll(".section__title").forEach((title) => {
  const words = title.textContent.trim().split(/\s+/);
  title.setAttribute("aria-label", title.textContent.trim());
  title.innerHTML = "";
  words.forEach((word, i) => {
    const outer = document.createElement("span");
    outer.className = "w";
    outer.setAttribute("aria-hidden", "true");
    const inner = document.createElement("span");
    inner.style.setProperty("--i", i);
    inner.textContent = word;
    outer.appendChild(inner);
    title.appendChild(outer);
    if (i < words.length - 1) title.appendChild(document.createTextNode(" "));
  });
});

/*=============== TYPED ROLE ===============*/
const typedEl = document.getElementById("typed");
if (typedEl && !reduceMotion) {
  const roles = [
    "Software Engineer, Python",
    "Backend Developer",
    "Flask & Django Developer",
    "API & Database Designer",
  ];
  let r = 0, c = 0, deleting = false;
  function type() {
    const word = roles[r];
    c += deleting ? -1 : 1;
    typedEl.textContent = word.slice(0, c);
    let delay = deleting ? 35 : 70;
    if (!deleting && c === word.length) { deleting = true; delay = 1800; }
    else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
    setTimeout(type, delay);
  }
  setTimeout(() => { deleting = true; c = roles[0].length; type(); }, 2200);
}

/*=============== CARD SPOTLIGHT + PHOTO TILT (mouse only) ===============*/
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (finePointer && !reduceMotion) {
  document
    .querySelectorAll(".about__box, .skills__content, .services__card, .services__panel, .work__card, .contact__card, .contact__form")
    .forEach((card) => {
      card.classList.add("spot");
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - rect.left + "px");
        card.style.setProperty("--my", e.clientY - rect.top + "px");
      });
    });

  const handle = document.querySelector(".home__handle");
  handle.addEventListener("pointermove", (e) => {
    const rect = handle.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    homeCircle.style.transform = "rotateY(" + x * 10 + "deg) rotateX(" + -y * 10 + "deg)";
  });
  handle.addEventListener("pointerleave", () => {
    homeCircle.style.transform = "";
  });
}

/*=============== CONTACT FORM (opens your email app) ===============*/
const form = document.getElementById("contact-form");
const note = document.getElementById("form-note");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const subject = "Portfolio message from " + data.get("name");
  const body = data.get("message") + "\n\nFrom: " + data.get("name") + " (" + data.get("email") + ")";
  window.location.href =
    "mailto:ahmadultani2004@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  note.textContent = "Your email app should open with the message ready to send.";
});