import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import './surf-2.css';

const asset = (name) => `/assets/surf-2/${name}.webp`;
const image = (name, alt, caption, options = {}) => ({ name, alt, caption, ...options });

const sections = [
  {
    id: 'challenge',
    title: 'The challenge',
    navTitle: 'The challenge',
    paragraphs: [
      'The admin panel had to serve two completely different people: someone who opens it once a year to change a Wi-Fi password, and a network administrator configuring WAN, LAN, and routing rules.',
      'Surf 2 also has a built-in Hybrid VPN, where people decide which traffic goes through the tunnel and which goes directly to the internet. Most router owners have never used a feature like this.',
    ],
  },
  {
    id: 'research',
    title: 'Learning an unfamiliar domain',
    navTitle: 'Research',
    paragraphs: [
      'I was designing for a domain I knew nothing about, so first I had to understand who actually uses a router admin panel and what they come there to do.',
      'I went through six router admin interfaces in emulators, including ASUS and TP-Link. The same pattern showed up repeatedly: simple actions were mixed with technical settings. Changing a Wi-Fi password could sit beside encryption and channel controls that most people would not know how to use.',
      'ASUS showed me how much control a router panel can offer, but also how overwhelming that depth can be. TP-Link grouped settings more clearly, yet buried common actions such as rebooting. Neither example solved both everyday use and detailed administration at once.',
      'Then I spoke with two network administrators to understand the panel from their side. They did not look for “simple” or “advanced” settings as categories. They looked for parts of the network: WAN, LAN, DHCP, routing, wireless, and logs. In many of the panels I reviewed, those controls were scattered across tabs, turning routine work into a search.',
      'That research set the direction. Occasional users needed a short path to familiar tasks; administrators needed the panel to follow the structure of the network. I split the controls into Basic and Advanced modes while keeping the same sections in place, so switching modes would not mean learning a second interface.',
    ],
  },
  {
    id: 'first-access',
    title: 'First access',
    navTitle: 'First access',
    paragraphs: [
      'The sign-in screen points people to the default password on the router package. It gives a first-time owner a clear next step before they reach the admin panel.',
    ],
    media: [image('sign_in_3x', 'Surf 2 admin sign-in screen', 'Admin sign-in', { width: 4320, height: 2760 })],
  },
  {
    id: 'home',
    title: 'Home',
    navTitle: 'Home',
    paragraphs: [
      'Once the structure was set, I made Home the place to answer the first question people have when they open the panel: is the network working? The dashboard puts connection health and the controls used most often within reach, so an owner can check the router and act without first finding the right settings section.',
    ],
    media: [image('home_page_3x', 'Surf 2 home dashboard with VPN, traffic and network status', 'Home dashboard')],
  },
  {
    id: 'wireless',
    title: 'Wireless',
    navTitle: 'Wireless',
    paragraphs: [
      'Most people open Wireless to change who can join their Wi-Fi or to rename the network. They should not have to deal with technical Wi-Fi settings to finish that task, or risk changing them by mistake. Basic keeps the decisions relevant to everyday setup in view. Advanced gives administrators the controls they need to troubleshoot coverage, performance and compatibility, without moving them to a different part of the panel.',
    ],
    media: [
      image('wireless_basic__3x', 'Surf 2 basic wireless settings', 'Wireless · Basic'),
      image('wireless_advanced__3x', 'Surf 2 advanced wireless settings', 'Wireless · Advanced'),
    ],
  },
  {
    id: 'network',
    title: 'Network',
    navTitle: 'Network',
    paragraphs: [
      'The conversations with administrators shaped Advanced Network. They thought in terms of WAN, LAN, and DHCP, so I organized the controls around those parts of the network instead of scattering them by individual task. Basic stays focused on getting a connection running; Advanced gives experienced users a predictable route to detailed configuration and troubleshooting.',
    ],
    media: [
      image('network_basic__3x', 'Surf 2 basic internet connection settings', 'Network · Basic'),
      image('network_advanced__3x', 'Surf 2 advanced WAN configuration', 'Network · WAN'),
      { pair: [
        image('network_lan_advanced__3x', 'Surf 2 advanced LAN settings', 'Network · LAN'),
        image('network_dhcp_advanced__3x', 'Surf 2 advanced DHCP settings', 'Network · DHCP'),
      ] },
    ],
  },
  {
    id: 'devices',
    title: 'Devices',
    navTitle: 'Devices',
    paragraphs: [
      'The device list shows who is connected, how they connect and whether they are active. From a device, an owner can inspect its address and control internet access or VPN behavior without searching through router-wide settings.',
    ],
    media: [
      image('devices_3x', 'List of devices connected to Surf 2', 'Connected devices'),
      image('device_management_3x', 'Device identity, internet access and VPN settings', 'Device controls'),
    ],
  },
  {
    id: 'vpn',
    title: 'VPN and Hybrid VPN',
    navTitle: 'VPN',
    paragraphs: [
      'Hybrid VPN was the least familiar part of the router. Before adding a website or app to a list, a person has to understand what the list will do: route only selected traffic through the VPN, or let selected traffic bypass it. Without that explanation, the controls are easy to use incorrectly.',
      'I made the inactive state explain the feature, then put the routing choice before list management. Each mode describes what happens to selected and unselected traffic. Only after choosing a mode does the user build the list, with separate paths for websites and apps.',
    ],
    media: [
      image('vpn_3x', 'Surf 2 VPN controls and connection details', 'VPN control'),
      image('vpn_hybrid_vpn_settings_blank_3x', 'Inactive Hybrid VPN screen with a diagram of traffic routing', 'Hybrid VPN before activation'),
      image('hybrid_vpn_3x', 'Hybrid VPN routing modes and selected websites', 'Hybrid VPN routing rules'),
      { pair: [
        image('add_to_list_websites__3x', 'Add a website to a Hybrid VPN list', 'Add websites', { width: 2124, height: 2760 }),
        image('add_to_list_apps__3x', 'Add an app to a Hybrid VPN list', 'Add apps', { width: 2124, height: 2760 }),
      ] },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    navTitle: 'Settings',
    paragraphs: [
      'System updates, regional preferences and administrator credentials live together in the router’s Settings section.',
    ],
    media: [image('settings_3x', 'Surf 2 system and administrator settings', 'Router settings')],
  },
  {
    id: 'help',
    title: 'Help inside the admin panel',
    navTitle: 'Help',
    paragraphs: [
      'While reviewing other router panels, I found they often assume people already know networking terms and where to look for a setting. Manufacturer support pages and forums kept answering questions about basic tasks, such as finding the login page or changing a Wi-Fi password. That guidance sat on external websites, away from the settings people were trying to change.',
      'I added a Manual section to Surf 2 so people could find those answers without searching the web. Each guide starts with a task, shows which page and fields to use, and explains what will happen after the change. The Wi-Fi guide, for example, warns that changing the password will disconnect devices. If the guide does not resolve the issue, a support form lets the user describe the problem and include a screenshot alongside the router model.',
    ],
    media: [
      image('manual_3x', 'Surf 2 manual overview with guides for router tasks', 'Manual overview'),
      image('manual_set_up_wifi__3x', 'Step-by-step guide to changing Surf 2 Wi-Fi settings', 'Wi-Fi setup guide'),
      image('contact_form_3x', 'Surf 2 support form with diagnostic information', 'Contact support', { width: 4320, height: 2760 }),
    ],
  },
  {
    id: 'reflection',
    title: 'Result',
    navTitle: 'Result',
    paragraphs: [
      'Surf 2 shipped with an admin panel designed around the questions people bring to a router, rather than the terminology inside it. People can find the setting they need and see what will happen when they change it, without looking up instructions elsewhere. The router is now on the market and in active use.',
    ],
    media: [image('surf-2-router-result', 'Pink Surf 2 router on a desk', 'Surf 2 router', { width: 4608, height: 3048 })],
  },
];

function renderImage(item) {
  const src = asset(item.name);
  const width = item.width || 4656;
  const height = item.height || 3096;
  const content = `<img src="${src}" alt="${item.alt}" width="${width}" height="${height}" loading="lazy" decoding="async" />`;
  return `<figure class="case-image case-image-rounded">
    <button class="case-image-surface" type="button" data-zoom-src="${src}" data-zoom-alt="${item.alt}" aria-label="Enlarge: ${item.caption}">${content}</button>
    <figcaption>${item.caption}</figcaption>
  </figure>`;
}

function renderSection(section) {
  return `<section class="case-section" id="${section.id}" aria-labelledby="${section.id}-title">
    <h2 id="${section.id}-title">${section.title}</h2>
    <div class="case-copy">${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}</div>
    ${section.media ? `<div class="case-images">${section.media.map((item) => item.pair ? `<div class="surf-image-pair">${item.pair.map(renderImage).join('')}</div>` : renderImage(item)).join('')}</div>` : ''}
  </section>`;
}

document.querySelector('#app').innerHTML = `
  <div id="top"></div>
  <a class="case-back" href="/" aria-label="Back to selected work">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.99992 12L3.33325 9.33333L5.99992 6.66667M3.33325 9.33333L10.6666 9.33333C11.3738 9.33333 12.0521 9.05238 12.5522 8.55229C13.0523 8.05219 13.3333 7.37391 13.3333 6.66667C13.3333 5.95942 13.0523 5.28115 12.5522 4.78105C12.0521 4.28095 11.3738 4 10.6666 4L9.99992 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </a>
  <nav class="case-nav" aria-label="Case study sections">
    ${sections.map((section, index) => `<a href="${index === 0 ? '#top' : `#${section.id}`}" data-section="${section.id}"${index === 0 ? ' aria-current="location"' : ''}>${section.navTitle}</a>`).join('')}
  </nav>
  <main class="case-main">
    <article>
      <header class="case-intro">
        <h1>Surf 2 access point</h1>
        <p>Surf 2 is a home router with a built-in VPN.</p>
        <dl class="case-facts">
          <div><dt>Role</dt><dd>Product designer</dd></div>
          <div><dt>Impact</dt><dd>Made routine router setup easier for home users while keeping advanced network controls accessible to administrators</dd></div>
          <div><dt>Product</dt><dd>Router admin panel</dd></div>
        </dl>
      </header>
      ${sections.map(renderSection).join('')}
      <div class="case-end-divider" aria-hidden="true"></div>
      <div class="case-bottom-nav">
        <a class="case-next-preview case-previous-preview" href="/cellframe-dashboard/">
          <span class="case-next-label">Previous</span>
          <span class="case-next-title">Cellframe dashboard</span>
        </a>
        <a class="case-next-preview" href="/cellframe-wallet/">
          <span class="case-next-label">Next</span>
          <span class="case-next-title">Cellframe wallet</span>
        </a>
      </div>
    </article>
  </main>
  <div class="case-lightbox" role="dialog" aria-modal="true" aria-label="Expanded case study image" hidden>
    <button type="button" class="case-lightbox-close" aria-label="Close image">×</button>
    <img alt="" />
  </div>
`;

const navLinks = [...document.querySelectorAll('.case-nav a')];
const navigationOffset = parseFloat(getComputedStyle(document.querySelector('.case-section')).scrollMarginTop) || 0;
function updateNavigation() {
  const marker = navigationOffset + 16;
  let activeId = sections[0].id;
  for (const section of sections) {
    if (document.getElementById(section.id).getBoundingClientRect().top > marker) break;
    activeId = section.id;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) activeId = sections.at(-1).id;
  navLinks.forEach((link) => {
    if (link.dataset.section === activeId) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
let navFrame = 0;
window.addEventListener('scroll', () => {
  if (navFrame) return;
  navFrame = requestAnimationFrame(() => { navFrame = 0; updateNavigation(); });
}, { passive: true });
window.addEventListener('resize', updateNavigation);
updateNavigation();

const lightbox = document.querySelector('.case-lightbox');
const lightboxImage = lightbox.querySelector('img');
let lastTrigger = null;
function closeLightbox() {
  if (lightbox.hidden) return;
  lightbox.hidden = true;
  document.body.style.overflow = '';
  lightboxImage.removeAttribute('src');
  lastTrigger?.focus();
}
document.querySelectorAll('[data-zoom-src]').forEach((button) => {
  button.addEventListener('click', () => {
    lastTrigger = button;
    lightboxImage.src = button.dataset.zoomSrc;
    lightboxImage.alt = button.dataset.zoomAlt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.case-lightbox-close').focus();
  });
});
lightbox.querySelector('.case-lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });
