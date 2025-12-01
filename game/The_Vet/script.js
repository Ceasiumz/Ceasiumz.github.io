// ------------------------data------------------------
const featureData = [
  {
    title: 'Chrono-Triage Combat',
    blurb: 'Freeze micro-moments, reroute syringe drones, and decide who lives when the room goes flatline.',
  },
  {
    title: 'Squad Psyche Web',
    blurb: 'Every dosage and dialogue thread shifts the loyalty lattice of your four squadmates.',
  },
  {
    title: 'Living City Systems',
    blurb: 'Weather cascades, power brownouts, and faction alarms change routes every mission.',
  },
];

const timelineData = [
  { date: 'Q1 2025', title: 'Reveal Trailer', detail: 'Cinematic premiere with first look at Aya and Delta-12.' },
  { date: 'Q2 2025', title: 'Closed Alpha', detail: 'Invite-only PC test for medical gameplay loop feedback.' },
  { date: 'Q3 2025', title: 'Lore Anthology', detail: 'Three-part narrative podcast bridging uprising events.' },
  { date: 'Q4 2025', title: 'Open Demo', detail: 'Multi-platform slice with vertical hospital raid.' },
  { date: 'Launch', title: 'Global Release', detail: 'Full campaign, co-op ops, and live event cadence.' },
];

const hotspotData = [
  { label: 'Skylance Docks', copy: 'Smuggler haven hovering above the quarantine zone.', x: '65%', y: '20%' },
  { label: 'Hone Core', copy: 'Corporate citadel pulsing with surveillance arrays.', x: '40%', y: '45%' },
  { label: 'Undermarket 12', copy: 'Bazaar for outlaw med-tech & rogue AI surgeons.', x: '25%', y: '70%' },
];

const mediaData = [
  {
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    caption: 'Quarantine skyline',
  },
  {
    src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    caption: 'Wet neon alleys',
  },
  {
    src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
    caption: 'Ops deck briefing',
  },
  {
    src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    caption: 'District lockdown',
  },
];

const developerData = [
  {
    name: 'Zhou Mingjun',
    role: 'Visual Designer',
    bio: 'Present: Organ transplantation, Doctor propaganda, Indoor Scenes.',
    portrait: './avatorZMJ.png',
  },
  {
    name: 'Ou Pengfan',
    role: 'Script Writer',
    bio: 'Present: Narrative arcs, Character dialogues, Worldbuilding lore.',
    portrait: './favicon.png',
  },
  {
    name: 'Xu Sule',
    role: 'Mechanism Builder',
    bio: 'Present: Game mechanics, Player progression.',
    portrait: './favicon.png',
  },
];

// ------------------------functions------------------------

const header = document.querySelector('.site-header');
const featureGrid = document.getElementById('featureGrid');
const timelineTrack = document.getElementById('timelineTrack');
const timelineWrapper = document.querySelector('.timeline__wrapper');
const worldMap = document.getElementById('worldMap');
const mapHotspots = document.getElementById('mapHotspots');
const mapPanel = document.getElementById('mapPanel');
const mediaGrid = document.getElementById('mediaGrid');
const lightbox = document.getElementById('mediaLightbox');
const lightboxImg = lightbox?.querySelector('img');
const lightboxCaption = lightbox?.querySelector('.media-lightbox__caption');
const lightboxClose = lightbox?.querySelector('.media-lightbox__close');
const developerGrid = document.getElementById('developerGrid');

const setYear = () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
};

const handleScrollHeader = () => {
  if (!header) return;
  header.dataset.scrolled = window.scrollY > 80;
};

const initSmoothScroll = () => {
  document.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const target = event.currentTarget.getAttribute('data-scroll');
      const destination = document.querySelector(target);
      destination?.scrollIntoView({ behavior: 'smooth' });
    });
  });
};

const initReveal = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll('[data-reveal]').forEach((section) => observer.observe(section));
};

const renderFeatures = () => {
  if (!featureGrid) return;
  featureGrid.innerHTML = '';
  featureData.forEach((feature) => {
    const card = document.createElement('article');
    card.className = 'feature-card';
    card.innerHTML = `
      <span class="eyebrow">${feature.title}</span>
      <p>${feature.blurb}</p>
    `;
    featureGrid.appendChild(card);
  });
};

const renderTimeline = () => {
  if (!timelineTrack) return;
  timelineTrack.innerHTML = '';
  timelineData.forEach((entry) => {
    const item = document.createElement('article');
    item.className = 'timeline-card';
    item.innerHTML = `
      <time>${entry.date}</time>
      <h3>${entry.title}</h3>
      <p>${entry.detail}</p>
    `;
    timelineTrack.appendChild(item);
  });
};

const initTimelineNav = () => {
  const buttons = document.querySelectorAll('.timeline__nav');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const direction = Number(btn.getAttribute('data-direction'));
      timelineTrack?.scrollBy({ left: direction * timelineTrack.clientWidth * 0.9, behavior: 'smooth' });
    });
  });
};

const initTimelineWheelScroll = () => {
  if (!timelineWrapper || !timelineTrack) return;
  timelineWrapper.addEventListener(
    'wheel',
    (event) => {
      // 只在垂直滾動時攔截，把 deltaY 映射成水平捲動
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      timelineTrack.scrollBy({ left: event.deltaY*5, behavior: 'auto' });
    },
    { passive: false }
  );
};

const renderHotspots = () => {
  if (!mapHotspots || !mapPanel) return;
  mapHotspots.innerHTML = '';
  hotspotData.forEach((hotspot) => {
    const button = document.createElement('button');
    button.className = 'hotspot';
    button.style.left = hotspot.x;
    button.style.top = hotspot.y;
    button.setAttribute('aria-label', hotspot.label);
    button.addEventListener('mouseenter', () => updateMapPanel(hotspot));
    button.addEventListener('focus', () => updateMapPanel(hotspot));
    mapHotspots.appendChild(button);
  });
};

const updateMapPanel = ({ label, copy }) => {
  if (!mapPanel) return;
  const heading = mapPanel.querySelector('h3');
  const body = mapPanel.querySelector('p');
  if (heading) heading.textContent = label;
  if (body) body.textContent = copy;
};

const renderMedia = () => {
  if (!mediaGrid) return;
  mediaGrid.innerHTML = '';
  mediaData.forEach((media) => {
    const card = document.createElement('button');
    card.className = 'media-card';
    card.innerHTML = `
      <img src="${media.src}" alt="${media.caption}" loading="lazy" />
      <span>${media.caption}</span>
    `;
    card.addEventListener('click', () => openLightbox(media));
    mediaGrid.appendChild(card);
  });
};

const renderDevelopers = () => {
  if (!developerGrid) return;
  developerGrid.innerHTML = '';
  developerData.forEach((dev) => {
    const card = document.createElement('article');
    card.className = 'dev-card';
    card.innerHTML = `
      <img src="${dev.portrait}" alt="${dev.name}" loading="lazy" />
      <h3>${dev.name}</h3>
      <span>${dev.role}</span>
      <p>${dev.bio}</p>
    `;
    developerGrid.appendChild(card);
  });
};

const openLightbox = (media) => {
  if (!lightbox || !lightboxImg || !lightboxCaption) return;
  lightbox.hidden = false;
  lightboxImg.src = media.src;
  lightboxImg.alt = media.caption;
  lightboxCaption.textContent = media.caption;
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.style.overflow = '';
};

const initLightbox = () => {
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });
};

const initTrailerButton = () => {
  const trailerBtn = document.querySelector('[data-trailer]');
  trailerBtn?.addEventListener('click', () => {
    document.getElementById('media')?.scrollIntoView({ behavior: 'smooth' });
  });
};

const init = () => {
  setYear();
  renderFeatures();
  renderTimeline();
  initTimelineNav();
  initTimelineWheelScroll();
  renderHotspots();
  renderMedia();
  renderDevelopers();
  initLightbox();
  initSmoothScroll();
  initReveal();
  initTrailerButton();
  handleScrollHeader();
};

window.addEventListener('scroll', handleScrollHeader);
window.addEventListener('DOMContentLoaded', init);
