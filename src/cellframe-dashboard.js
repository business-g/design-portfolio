import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import './cellframe-dashboard.css';

const asset = (name) => `/assets/cellframe-dashboard/${name}.webp`;
const imageDimensions = {
  'ia-light': [3999, 2640],
  'connection-mode-matrix-light': [3840, 2352],
  'node-modes-light': [2672, 6632],
};

const nodeStory = `
  <div class="case-copy">
    <p>Cellframe wanted more independent validators: they confirm transactions and make the network less dependent on a small group of operators. To examine the launch flow, I modeled two four-week periods before and after the screen changed, looking at CELL holders without an active node. Each person was counted once, from their first view of the Master node launch screen; a launch counted only if the node started successfully within seven days.</p>
    <p>In the first period, 1,347 people opened the screen and 64 launched a node: 4.8% of viewers. “Interacted with setup” means changing a form field or pressing Start master node on the prefilled form. Opening the section alone does not count as starting setup.</p>
  </div>
  <div class="node-funnel" aria-label="Master node launch funnel">
    <div><strong>1,347</strong><span>opened the launch screen</span></div>
    <div><strong>296</strong><span>interacted with setup</span></div>
    <div><strong>95</strong><span>pressed Start master node</span></div>
    <div><strong>64</strong><span>launched a node</span></div>
  </div>
  <figure class="case-image node-comparison-image">
    <button class="case-image-surface" type="button" data-zoom-src="/assets/cellframe-dashboard/master-node-before-4x.webp" data-zoom-alt="Original Cellframe master node launch screen" aria-label="Enlarge original master node launch screen">
      <img src="/assets/cellframe-dashboard/master-node-before-4x.webp" alt="Original launch screen with a requirements list and master node form" width="5760" height="3968" loading="lazy" decoding="async" />
    </button>
    <figcaption>Original launch screen</figcaption>
  </figure>
  <div class="case-copy">
    <p>I spoke with eight CELL holders: two had opened the section without starting, four had stopped during setup, and two had launched a node. Each walked me through their last attempt.</p>
    <p>Six could not tell if their machine met the requirements. Seven sought a reward estimate; five were unsure what would happen to their mCELL. I used those findings to form three hypotheses about the launch decision, and tested validator activity as a fourth idea.</p>
    <p>Six CELL holders tested a launch prototype: four from the interviews and two new participants. They used their own device details and a sample mCELL balance, then decided whether to launch and explained why. Stopping was a valid choice; no transaction was made. I checked what they understood and which information affected their decision.</p>
  </div>
  <h3 class="node-subheading">Hypotheses and prototype results</h3>
  <div class="node-hypotheses" aria-label="Four launch hypotheses">
    <div>
      <h4>Compatibility</h4>
      <p><strong>Hypothesis</strong> Comparing requirements with device and network values would help people judge whether they could launch.</p>
      <p><strong>Check</strong> Could they identify whether their setup met the requirements?</p>
      <p><strong>Result</strong> 6/6 identified the compatibility result.</p>
    </div>
    <div>
      <h4>Reward estimate</h4>
      <p><strong>Hypothesis</strong> A reward range would help people assess the potential return without treating it as guaranteed.</p>
      <p><strong>Check</strong> Did they understand the amount was an estimate?</p>
      <p><strong>Result</strong> 5/6 recognized it as an estimate.</p>
    </div>
    <div>
      <h4>Stake terms</h4>
      <p><strong>Hypothesis</strong> Explaining the mCELL lock and withdrawal terms before launch would make the commitment clearer.</p>
      <p><strong>Check</strong> Could they explain what happens to mCELL when the validator role starts and ends?</p>
      <p><strong>Result</strong> 5/6 explained the lock and withdrawal steps.</p>
    </div>
    <div>
      <h4>Validator activity</h4>
      <p><strong>Hypothesis</strong> Active validator counts and recent payouts would help people decide whether to launch.</p>
      <p><strong>Check</strong> Did those figures affect their decision?</p>
      <p><strong>Result</strong> 1/6 used them in their reasoning; none changed their decision.</p>
    </div>
  </div>
  <div class="case-copy">
    <p>The first three ideas helped people understand the launch decision in the prototype. Validator activity did not influence that decision, so I left it out of the revised screen.</p>
  </div>
  <figure class="case-image node-comparison-image">
    <button class="case-image-surface" type="button" data-zoom-src="/assets/cellframe-dashboard/master-node-after-4x.webp" data-zoom-alt="Revised Cellframe master node launch screen" aria-label="Enlarge revised master node launch screen">
      <img src="/assets/cellframe-dashboard/master-node-after-4x.webp" alt="Revised launch screen with compatibility results, stake terms and estimated reward" width="5760" height="3968" loading="lazy" decoding="async" />
    </button>
    <figcaption>Revised launch screen</figcaption>
  </figure>
  <div class="case-copy">
    <p>I compared successful node launches among people who opened the screen in two equal four-week periods, before and after the redesign.</p>
  </div>
  <div class="node-result" aria-label="View-to-launch conversion before and after">
    <div><strong>4.8%</strong><span>Before · 64 / 1,347</span></div>
    <span class="node-result-arrow" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 12h16m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <div><strong>6.3%</strong><span>After · 88 / 1,392</span></div>
    <p>Absolute change: +1.6% · Relative change: +33%</p>
  </div>
  <div class="case-copy">
    <p>The number of people who opened the launch screen barely changed between periods, while successful launches increased. For Cellframe, the meaningful result was more people bringing a node online.</p>
  </div>
`;

const sections = [
  {
    id: 'brief',
    title: 'A desktop app for different jobs',
    navTitle: 'The challenge',
    paragraphs: [
      'The design challenge was to organize everyday asset tasks and technical node operations within one desktop product. I mapped what each area needed to show and how people would move between related tasks.',
    ],
  },
  {
    id: 'structure',
    title: 'Mapping the product',
    navTitle: 'Product map',
    paragraphs: [
      'I worked through the technical documentation and team requirements, then mapped the main tasks and their next steps. Portfolio, Explorer, Trade and node operations each got a direct entry in the navigation. The map also covered deeper views such as transaction details, address pages and node diagnostics.',
      'Cellframe dashboard needs a blockchain connection before people can use it. On first launch, they can run a node on their computer (Local), connect to their own node elsewhere (Remote), or use public RPC (Light). I compared setup, wallet storage and feature access across these modes to shape that first decision.',
    ],
    images: [
      { name: 'ia-light', alt: 'Information architecture of Cellframe dashboard', caption: 'Dashboard information architecture', rounded: true },
      { name: 'connection-mode-matrix-light', alt: 'Comparison of Local, Remote and Light node modes', caption: 'Connection mode matrix', rounded: true },
    ],
  },
  {
    id: 'node-modes',
    title: 'First run: choosing a connection',
    navTitle: 'First run',
    paragraphs: [
      'The first-run screen shows what each connection mode requires before confirmation. Selecting Remote reveals the node-address field; Light shows which modules are unavailable. The mode can be changed later in Settings.',
    ],
    images: [
      { name: 'node-modes-light', alt: 'Local, Remote and Light mode selection screens', caption: 'Mode selection on first launch', zoom: false, rounded: true },
    ],
  },
  {
    id: 'wallet',
    title: 'Wallet',
    navTitle: 'Wallet',
    paragraphs: [
      'The portfolio is the entry point for someone’s CELL and other assets. Alongside balances and recent activity, I gave P&amp;L its own space and separated asset gains and losses from network fees. That makes a change in total value easier to account for.',
    ],
    images: [
      { name: 'empty-portfolio-4x', alt: 'Cellframe wallet before setup', caption: 'No wallet connected' },
      { name: 'portfolio', alt: 'Cellframe wallet with assets and activity', caption: 'Wallet overview' },
      { name: 'swap-4x', alt: 'Cellframe token swap interface', caption: 'Token swap' },
    ],
  },
  {
    id: 'dex',
    title: 'DEX',
    navTitle: 'DEX',
    paragraphs: [
      'Cellframe offers two ways to exchange assets. Swap quotes a conversion through a Cellframe DEX pool on Mainnet. Trade is for choosing a price and managing an order against the book. I gave each its own route because the decisions before confirmation are different.',
    ],
    images: [
      { name: 'trade-4x', alt: 'Cellframe decentralized exchange trading screen', caption: 'Trading screen' },
    ],
  },
  {
    id: 'explorer',
    title: 'Network explorer',
    navTitle: 'Explorer',
    paragraphs: [
      'Explorer is a full Mainnet view inside the desktop app. It opens on network-wide transactions and lets people search by transaction hash, block, address or token. From there, they can follow a transaction’s status, amount and fee, or open an address to see its balances and activity. The entry point is the network itself, regardless of which wallet is connected.',
    ],
    images: [
      { name: 'explorer-4x', alt: 'Cellframe transaction explorer', caption: 'Mainnet transaction list' },
      { name: 'address-page-4x', alt: 'Cellframe address details page', caption: 'Address details' },
    ],
  },
  {
    id: 'console',
    title: 'Console',
    navTitle: 'Console',
    paragraphs: [
      'The Console brings Cellframe CLI work into the same app. Recent executions show what ran and whether it succeeded; quick commands make recurring checks such as node status or ledger lookup easier to repeat.',
    ],
    images: [
      { name: 'console-4x', alt: 'Cellframe console with commands and execution history', caption: 'CLI commands and execution history' },
    ],
  },
  {
    id: 'master-node',
    title: 'Master node',
    navTitle: 'Master node',
    paragraphs: [
      'Cellframe lets CELL holders run a master node: a validator that confirms network transactions and can earn rewards. Running one requires staked tokens and a computer or server that stays online.',
      'For validators, uptime and chain sync affect participation and rewards. I designed the master node view for ongoing monitoring, with node status, availability, synchronization, system resources and alerts in one place.',
    ],
    images: [
      { name: 'master-node-4x', alt: 'Cellframe master node monitoring dashboard', caption: 'Validator monitoring' },
    ],
  },
  {
    id: 'node-study',
    title: 'Increasing master node launches',
    navTitle: 'Launch conversion',
    content: nodeStory,
  },
  {
    id: 'reflection',
    title: 'Final thoughts',
    navTitle: 'Reflection',
    paragraphs: [
      'What I value most about this project is the product logic behind the screens. I defined how wallet operations, trading, Mainnet exploration, and node management fit together, working with the product owner, stakeholders, and developers to balance user needs, business priorities, and technical constraints. Since launch, Cellframe has processed more than 1 million successful transactions.',
    ],
  },
];


function renderImage(image) {
  const src = asset(image.name);
  const [width, height] = imageDimensions[image.name] || [5760, 3968];
  const content = `<img src="${src}" alt="${image.alt}" width="${width}" height="${height}" loading="lazy" decoding="async" />`;
  return `<figure class="case-image${image.zoom === false ? ' case-image-static' : ''}${image.rounded ? ' case-image-rounded' : ''}">
    ${image.zoom === false ? `<div class="case-image-surface">${content}</div>` : `<button class="case-image-surface" type="button" data-zoom-src="${src}" data-zoom-alt="${image.alt}" aria-label="Enlarge: ${image.caption}">${content}</button>`}
    <figcaption>${image.caption}</figcaption>
  </figure>`;
}

function renderSection(section) {
  return `<section class="case-section" id="${section.id}" aria-labelledby="${section.id}-title">
    <h2 id="${section.id}-title">${section.title}</h2>
    ${section.content || (section.paragraphs?.length ? `<div class="case-copy">${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}</div>` : '')}
    ${section.images ? `<div class="case-images">${section.images.map(renderImage).join('')}</div>` : ''}
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
    ${sections.map((section, index) => `<a href="${index === 0 ? '#top' : `#${section.id}`}" data-section="${section.id}"${index === 0 ? ' aria-current="location"' : ''}>${section.navTitle || section.title}</a>`).join('')}
  </nav>
  <main class="case-main">
    <article>
      <header class="case-intro">
        <h1>Cellframe dashboard</h1>
        <p>Cellframe dashboard is a desktop app for managing assets, trading, exploring the network and operating nodes.</p>
        <dl class="case-facts">
          <div><dt>Role</dt><dd>Product designer</dd></div>
          <div><dt>Product scale</dt><dd>1M+ transactions</dd></div>
          <div><dt>Contribution</dt><dd>I mapped the ecosystem, designed its core flows and redesigned master node launch</dd></div>
        </dl>
      </header>
      ${sections.map(renderSection).join('')}
      <div class="case-end-divider" aria-hidden="true"></div>
      <a class="case-next-preview" href="/surf-2/">
        <span class="case-next-label">Next</span>
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
    const element = document.getElementById(section.id);
    if (element.getBoundingClientRect().top > marker) break;
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
    lightboxImage.classList.toggle('case-lightbox-image-rounded', button.closest('.case-image')?.classList.contains('case-image-rounded'));
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.case-lightbox-close').focus();
  });
});
lightbox.querySelector('.case-lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });
