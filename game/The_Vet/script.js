// ------------------------EmailJS config------------------------
const EMAILJS_CONFIG = {
    serviceId: 'service_qj1wsr4', // TODO: replace with your EmailJS service ID
    templateId: 'template_4ulxkc6', // TODO: replace with your EmailJS template ID
    publicKey: 'sFhsyTFdDnWUNErOf', // TODO: replace with your EmailJS public key
    publicInbox: 'ceasiumzmj@gmail.com', // TODO: replace with the public email you want notified
};

// ------------------------data------------------------
const featureData = [
    {
        title: 'Narrivation: Event Driven',
        blurb: 'The unit of game progression is an operation instead of a mission, but each operation is driven by emergent events. You never know what kind of patient you will get, or what kind of complications will arise during surgery. Adapt your strategy on the fly to deal with as many lives as possible.',
        img: './assets/logo_v.png',
    },
    {
        title: 'Narrivation: Deep Dialogue',
        blurb: 'As Doc. Blank, you can start all kinds of dialogue with the weirdest patient to find out their problems—both physically and psychologically. Meanwhile, you can choose to be faithful to your patients, or you can always show your fangs, and double cross your patients.',
        img: './assets/logo_e.png',
    },
    {
        title: 'Interaction: Operation Simulation',
        blurb: 'You have access to a wide range of medical tools and equipment to perform surgeries. Each tool has its own unique function and can be used in different ways to achieve the desired outcome. Master the use of these tools to become a skilled surgeon in the chaotic world of The Vet.',
        img: './assets/logo_t.png',
    },
];

const timelineData = [
    { date: 'Q1 2026', title: 'Reveal Trailer', detail: 'Cinematic premiere with first look at Aya and Delta-12.' },
    { date: 'Q2 2026', title: 'Closed Alpha', detail: 'Invite-only PC test for medical gameplay loop feedback.' },
    { date: 'Q3 2026', title: 'Lore Anthology', detail: 'Three-part narrative podcast bridging uprising events.' },
    { date: 'Q4 2026', title: 'Open Demo', detail: 'Multi-platform slice with vertical hospital raid.' },
    { date: 'Launch', title: 'Global Release', detail: 'Full campaign, co-op ops, and live event cadence.' },
];

const hotspotData = [
    { label: 'High-position', copy: 'Check if patient still have breath.', x: '40%', y: '15%', img: './assets/position-high.png' },
    { label: 'Medium-position', copy: 'Check if patient still have pulse', x: '25%', y: '20%', img: './assets/position-medium.png' },
    { label: 'Low-position', copy: 'Check if patient still have heart', x: '25%', y: '30%', img: './assets/position-low.png' },
];

const storyPointMedia = [
    {
        img: './assets/desk.png',
        alt: 'Patient waits in the dim hallway outside the operating room.',
    },
    {
        img: './assets/poster.png',
        alt: 'Thoracic surgery setup with Vet Clinic instruments.',
    },
    {
        img: './assets/portrait.jpg',
        alt: 'Recovered organ sealed in a crate ready for transport.',
    },
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
        role: 'Visual Designer, Character Designer',
        bio: 'Present: Organ transplantation, Doctor propaganda, Indoor Scenes.',
        portrait: './avatorZMJ.png',
    },
    {
        name: 'Ou Pengfan',
        role: 'Script Writer, Scene Writer',
        bio: 'Present: Narrative arcs, Character dialogues, Worldbuilding lore.',
        portrait: './avatorOPF.png',
    },
    {
        name: 'Xu Sule',
        role: 'Mechanism Builder, System Builder',
        bio: 'Present: Game mechanics, Player progression.',
        portrait: './avatorXSL.png',
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
const communityForm = document.querySelector('.community__form');
const communitySuccess = document.getElementById('communitySuccess');
let emailJsReady = false;

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
      card.style.setProperty('--card-bg-image', `url(${feature.img})`);
      console.log(feature.img);
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
            timelineTrack.scrollBy({ left: event.deltaY * 5, behavior: 'auto' });
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

const updateMapPanel = ({ label, copy, img }) => {
    if (!mapPanel) return;
    const heading = mapPanel.querySelector('h3');
    const body = mapPanel.querySelector('p');
    if (heading) heading.textContent = label;
    if (body) body.textContent = copy;
    if (img) //set style variable posImg to img
        mapPanel.style.setProperty('--panel-bg-image', `url(${img})`);
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

const initStoryPointGallery = () => {
    const storyList = document.querySelector('.split .story-points');
    if (!storyList) return;
    const items = Array.from(storyList.querySelectorAll('li'));
    if (!items.length) return;

    const preview = document.createElement('div');
    preview.className = 'story-points__preview';
    const previewImg = document.createElement('img');
    previewImg.loading = 'lazy';
    previewImg.alt = '';
    previewImg.hidden = true;
    preview.appendChild(previewImg);
    storyList.insertAdjacentElement('afterend', preview);

    const clearActive = () => items.forEach((item) => item.classList.remove('active'));

    const activateItem = (item, media) => {
        if (!media?.img) return;
        clearActive();
        item.classList.add('active');
        previewImg.src = media.img;
        previewImg.alt = media.alt || item.textContent.trim();
        previewImg.hidden = false;
    };

    items.forEach((item, index) => {
        const media = storyPointMedia[index];
        if (!media) return;
        item.dataset.img = media.img;
        item.dataset.alt = media.alt || item.textContent.trim();
        item.tabIndex = 0;
        const handleSelect = (event) => {
            event.preventDefault();
            activateItem(item, media);
        };
        item.addEventListener('click', handleSelect);
        item.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                handleSelect(event);
            }
        });
    });

    const firstMedia = storyPointMedia.find((media) => media?.img);
    const firstItemWithMedia = firstMedia ? items[storyPointMedia.indexOf(firstMedia)] : null;
    if (firstMedia && firstItemWithMedia) activateItem(firstItemWithMedia, firstMedia);
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
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    });
};

const initEmailJS = () => {
    if (!window.emailjs) {
        console.warn('EmailJS SDK not loaded; skipping notification email.');
        return;
    }
    if (!EMAILJS_CONFIG.publicKey || EMAILJS_CONFIG.publicKey.startsWith('YOUR_')) {
        console.warn('EmailJS public key missing; skipping notification email.');
        return;
    }
    window.emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
    emailJsReady = true;
};

const sendCommunityEmail = ({ email, platform, message }) => {
    if (
        !emailJsReady ||
        !EMAILJS_CONFIG.serviceId ||
        !EMAILJS_CONFIG.templateId ||
        EMAILJS_CONFIG.serviceId.startsWith('YOUR_') ||
        EMAILJS_CONFIG.templateId.startsWith('YOUR_')
    ) {
        return Promise.resolve();
    }
    return window.emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
        subscriber_email: email,
        subscriber_platform: platform,
        inbox: EMAILJS_CONFIG.publicInbox,
        message,
    });
};

const initCommunityForm = () => {
    if (!communityForm) return;
    communityForm.addEventListener('submit', (event) => {
        event.preventDefault();
        //get email and platform value
        const formData = new FormData(communityForm);
        const email = formData.get('email');
        const platform = formData.get('platform');
        console.log('Subscribed Email:', email);
        console.log('Preferred Platform:', platform);
        

        // communityForm.reset();
        if (communitySuccess) {
            communitySuccess.hidden = false;
            const successHtml = `Thanks for joining <span class="text-accent">VET CLINIC</span> in ${platform}! Check ${email} for friendship from THE VET Clinic<br>(Maybe a few days Later)`;
            const successHtmlplain = `Thanks for joining VET CLINIC in ${platform}! Check ${email} for friendship from THE VET Clinic (Maybe a few days Later)`;
            communitySuccess.innerHTML = successHtml;
            sendCommunityEmail({ email, platform, message: successHtmlplain })?.catch((error) =>
                console.error('EmailJS failed to send subscription notice:', error)
            );
        }
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
    initStoryPointGallery();
    initEmailJS();
    initCommunityForm();
    handleScrollHeader();
};

window.addEventListener('scroll', handleScrollHeader);
window.addEventListener('DOMContentLoaded', init);
