// Banner slider
const banners = document.querySelectorAll(".banner");
const dots = document.querySelectorAll(".dot");
let currentSlide = 0;
let slideInterval;

function showSlide(index) {
  banners.forEach((b, i) => b.classList.toggle("active", i === index));
  dots.forEach((d, i) => d.classList.toggle("active", i === index));
  currentSlide = index;
}

function nextSlide() {
  showSlide((currentSlide + 1) % banners.length);
}

function startSlider() {
  slideInterval = setInterval(nextSlide, 5000);
}

dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    clearInterval(slideInterval);
    showSlide(i);
    startSlider();
  });
});

startSlider();

// Mobile menu
const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

function closeMenu() {
  nav.classList.remove("open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Subject search autocomplete
const SUBJECTS = [
  "English",
  "Science",
  "Maths",
  "SST",
  "History",
  "Geography",
  "Computer Science",
  "Bengali",
  "Physics",
  "Chemistry",
  "Biology",
  "Hindi",
];

const subjectInput = document.getElementById("subject");
const suggestionsEl = document.getElementById("subject-suggestions");
let activeIndex = -1;

function filterSubjects(query) {
  const q = query.trim().toLowerCase();
  if (!q) return SUBJECTS;
  return SUBJECTS.filter((s) => s.toLowerCase().includes(q));
}

function renderSuggestions(items) {
  if (!items.length) {
    suggestionsEl.hidden = true;
    suggestionsEl.innerHTML = "";
    return;
  }

  suggestionsEl.innerHTML = items
    .map(
      (item, i) =>
        `<li role="option" data-value="${item}" class="${i === activeIndex ? "active" : ""}">${highlightMatch(item, subjectInput.value)}</li>`,
    )
    .join("");
  suggestionsEl.hidden = false;
}

function highlightMatch(text, query) {
  if (!query.trim()) return text;
  const regex = new RegExp(
    `(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "ig",
  );
  return text.replace(regex, "<strong>$1</strong>");
}

function selectSubject(value) {
  subjectInput.value = value;
  suggestionsEl.hidden = true;
  activeIndex = -1;
}

subjectInput.addEventListener("input", () => {
  activeIndex = -1;
  renderSuggestions(filterSubjects(subjectInput.value));
});

subjectInput.addEventListener("focus", () => {
  renderSuggestions(filterSubjects(subjectInput.value));
});

subjectInput.addEventListener("keydown", (e) => {
  const items = suggestionsEl.querySelectorAll("li");
  if (suggestionsEl.hidden || !items.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex = Math.min(activeIndex + 1, items.length - 1);
    renderSuggestions(filterSubjects(subjectInput.value));
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex = Math.max(activeIndex - 1, 0);
    renderSuggestions(filterSubjects(subjectInput.value));
  } else if (e.key === "Enter" && activeIndex >= 0) {
    e.preventDefault();
    selectSubject(items[activeIndex].dataset.value);
  } else if (e.key === "Escape") {
    suggestionsEl.hidden = true;
  }
});

suggestionsEl.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (li) selectSubject(li.dataset.value);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrap")) {
    suggestionsEl.hidden = true;
  }
});

document.querySelectorAll(".subject-pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    subjectInput.value = pill.textContent;
    document.getElementById("inquiry").scrollIntoView({ behavior: "smooth" });
    subjectInput.focus();
    renderSuggestions(filterSubjects(subjectInput.value));
  });
});

// Tutor format tabs
const modeTabs = document.querySelectorAll(".mode-tab");
const modePanels = document.querySelectorAll(".mode-panel");

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.target;

    modeTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    modePanels.forEach((panel) => {
      const isActive = panel.id === `panel-${target}`;
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    });
  });
});

// Inquiry form
const form = document.getElementById("inquiry-form");
const messageEl = document.getElementById("form-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const subject = subjectInput.value.trim();
  const class_name = document.getElementById("class_name").value;
  const city = document.getElementById("city").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const submitBtn = form.querySelector(".btn-submit");

  messageEl.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, class_name, city, phone }),
    });

    const data = await res.json();

    messageEl.hidden = false;
    messageEl.className = "form-message " + (res.ok ? "success" : "error");
    messageEl.textContent = data.message || data.error;

    if (res.ok) {
      form.reset();
      suggestionsEl.hidden = true;
    }
  } catch {
    messageEl.hidden = false;
    messageEl.className = "form-message error";
    messageEl.textContent = "Something went wrong. Please try again.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Connect Me with a Tutor";
  }
});
