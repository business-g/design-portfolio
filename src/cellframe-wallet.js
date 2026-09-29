import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import './cellframe-wallet.css';

const asset = (name) => `/assets/cellframe-wallet/${name}`;
const phone = (name, alt, dimensions = {}) => ({ name, alt, ...dimensions });

const sections = [
  {
    id: 'challenge',
    title: 'The challenge',
    navTitle: 'The challenge',
    paragraphs: [
      'Most mobile crypto wallets make it easy to check a balance or send assets, while trading often takes people into a separate product. The wallet had to bring those jobs together.',
      'Routine actions needed a short path. Swaps and limit orders needed enough information for someone to understand the terms before committing their assets.',
    ],
  },
  {
    id: 'research',
    title: 'Research and structure',
    navTitle: 'Approach',
    paragraphs: [
      'I reviewed mobile wallets and DEX apps to understand how they handle navigation, transaction review, and trading on a phone. A swap and a limit order both start with an asset pair, but they ask for different decisions: one depends on a changing quote; the other on the price and expiry someone chooses. I designed them as separate flows so each could show the information needed before confirmation.',
      'The swap needed a closer look because quotes and transaction states can change while someone is acting. I mapped its normal route and failure cases before designing the screens, so the necessary review would appear at the moment of commitment instead of weighing down the rest of the wallet.',
    ],
  },
  {
    id: 'home',
    title: 'Home',
    navTitle: 'Home',
    paragraphs: [
      'Home gives a quick, readable picture of the wallet’s current balance and holdings.',
    ],
    media: [{ kind: 'phones', caption: 'Empty and funded wallet states', items: [
      phone('cellframe-wallet-home-empty.webp', 'Empty wallet home with a prompt to receive or bridge assets'),
      phone('cellframe-wallet-home-filled.webp', 'Funded wallet home with balances, holdings, and staking'),
    ] }],
  },
  {
    id: 'swap',
    title: 'Swap',
    navTitle: 'Swap',
    paragraphs: [
      'A swap can change while someone is preparing it: the quote may fail, the price may move, or the wallet may not have enough to cover the amount and fee. I mapped those cases before finalizing the main path so the interface would not only work when everything goes right.',
      'The flow moves from choosing the pair and amount to a review of the rate, network, fee, minimum received, and route. Settings such as slippage remain available without becoming a hurdle for a routine swap. The user sees the terms of the transaction before confirming it.',
    ],
    media: [
      { kind: 'video', caption: 'Swap flow', name: 'cellframe-wallet-swap.mp4' },
      { kind: 'diagram', caption: 'Swap flow and error states', name: 'cellframe-wallet-swap-structure-v2.webp', alt: 'Map of the swap journey and error states', width: 5396, height: 4070 },
    ],
  },
  {
    id: 'explore',
    title: 'Explore',
    navTitle: 'Explore',
    paragraphs: [
      'Explore gives people a way to open the ecosystem’s services and dApps from the wallet. Recent apps and browser tabs let them return to an active session without finding it again.',
    ],
    media: [{ kind: 'phones', caption: 'Discovering and returning to dApps', items: [
      phone('cellframe-wallet-explore-discovery.webp', 'Explore screen with services, recent apps, and dApp discovery'),
      phone('cellframe-wallet-explore-tabs.webp', 'Browser tab view showing an open dApp and a new tab'),
    ] }],
  },
  {
    id: 'trade',
    title: 'Trade',
    navTitle: 'Trade',
    paragraphs: [
      'I structured Trade to start with the market. The chart and order book each have room to be read on a phone, while the order form stays out of the way until someone taps Buy or Sell. That transition separates looking at prices from setting an order without sending the user into another part of the app.',
    ],
    media: [{ kind: 'phones', caption: 'Market view, order book, and limit order', items: [
      phone('cellframe-wallet-trade-chart-v2.webp', 'Trading chart for the ETH and USDT market', { width: 1904, height: 3776 }),
      phone('cellframe-wallet-trade-order-book-v2.webp', 'Order book for the ETH and USDT market', { width: 1904, height: 3776 }),
      phone('cellframe-wallet-trade-buy-v2.webp', 'Limit buy order form with price, amount, expiry, and fee', { width: 1904, height: 3776 }),
    ] }],
  },
  {
    id: 'history',
    title: 'History',
    navTitle: 'History',
    paragraphs: [
      'History lets people trace a change in their balance back to the transfer or swap behind it, then open the full record to check the details.',
    ],
    media: [{ kind: 'phones', caption: 'Activity and transaction details', items: [
      phone('cellframe-wallet-history.webp', 'Transaction history with pending and completed activity'),
      phone('cellframe-wallet-transaction-details.webp', 'Transaction detail sheet with hash, fee, addresses, and explorer link'),
    ] }],
  },
  {
    id: 'settings',
    title: 'Settings',
    navTitle: 'Settings',
    paragraphs: [
      'Network, security, and wallet management affect what the app can do with someone’s assets. I grouped those controls separately from everyday preferences such as currency and appearance, so the more consequential settings are easier to find when needed.',
    ],
    media: [{ kind: 'phones', caption: 'Wallet settings and preferences', items: [
      phone('cellframe-wallet-settings-overview.webp', 'Wallet settings overview with security, networks, and account controls'),
      phone('cellframe-wallet-settings-general.webp', 'General settings with currency, language, explorer, and app icon options'),
      phone('cellframe-wallet-settings-app-icon.webp', 'App icon selection sheet'),
    ] }],
  },
  {
    id: 'result',
    title: 'Final thoughts',
    navTitle: 'Final thoughts',
    paragraphs: [
      'I wanted to make room for trading without losing the feeling of a wallet. Someone can open it to check what they own and leave in seconds, or stay to make a considered trade.',
    ],
  },
];

function renderMedia(item) {
  if (item.kind === 'video') {
    return `<figure class="wallet-media wallet-video">
      <div class="wallet-video-frame">
        <video autoplay loop muted playsinline preload="metadata" poster="${asset('swap-poster.webp')}" width="1676" height="1676" aria-label="Wallet swap flow">
          <source src="${asset(item.name)}" type="video/mp4" />
        </video>
      </div>
      <figcaption>${item.caption}</figcaption>
    </figure>`;
  }
  if (item.kind === 'diagram') {
    return `<figure class="wallet-media wallet-diagram">
      <button class="case-image-surface" type="button" data-zoom-src="${asset(item.name)}" data-zoom-alt="${item.alt}" aria-label="Enlarge: ${item.caption}">
        <img src="${asset(item.name)}" alt="${item.alt}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async" />
      </button>
      <figcaption>${item.caption}</figcaption>
    </figure>`;
  }
  return `<figure class="wallet-media">
    <div class="wallet-phone-grid${item.items.length === 3 ? ' wallet-phone-grid--three' : ''}">
      ${item.items.map((screen) => `<button class="case-image-surface" type="button" data-zoom-src="${asset(screen.name)}" data-zoom-alt="${screen.alt}" aria-label="Enlarge: ${screen.alt}">
        <img src="${asset(screen.name)}" alt="${screen.alt}" width="${screen.width || 1048}" height="${screen.height || 2080}" loading="lazy" decoding="async" />
      </button>`).join('')}
    </div>
    <figcaption>${item.caption}</figcaption>
  </figure>`;
}

function renderSection(section) {
  return `<section class="case-section" id="${section.id}" aria-labelledby="${section.id}-title">
    <h2 id="${section.id}-title">${section.title}</h2>
    ${section.paragraphs.length ? `<div class="case-copy">${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}</div>` : ''}
    ${section.media ? `<div class="case-images">${section.media.map(renderMedia).join('')}</div>` : ''}
  </section>`;
}

document.querySelector('#app').innerHTML = `
  <div id="top"></div>
  <a class="case-back" href="/" aria-label="Back to selected work">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.99992 12L3.33325 9.33333L5.99992 6.66667M3.33325 9.33333L10.6666 9.33333C11.3738 9.33333 12.0521 9.05238 12.5522 8.55229C13.0523 8.05219 13.3333 7.37391 13.3333 6.66667C13.3333 5.95942 13.0521 5.28115 12.5522 4.78105C12.0521 4.28095 11.3738 4 10.6666 4L9.99992 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </a>
  <nav class="case-nav" aria-label="Case study sections">
    ${sections.map((section, index) => `<a href="${index === 0 ? '#top' : `#${section.id}`}" data-section="${section.id}"${index === 0 ? ' aria-current="location"' : ''}>${section.navTitle}</a>`).join('')}
  </nav>
  <main class="case-main">
    <article>
      <header class="case-intro">
        <h1>Cellframe wallet</h1>
        <p>In the same ecosystem as the Cellframe dashboard, this mobile wallet brings asset management and trading into one app.</p>
        <dl class="case-facts">
          <div><dt>Role</dt><dd>Product designer</dd></div>
          <div><dt>Product</dt><dd>Mobile wallet with integrated DEX</dd></div>
        </dl>
      </header>
      ${sections.map(renderSection).join('')}
      <div class="case-end-divider" aria-hidden="true"></div>
      <a class="case-next-preview case-previous-preview" href="/surf-2/">
        <span class="case-next-label">Previous</span>
        <span class="case-next-title">Surf 2 access point</span>
      </a>
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
