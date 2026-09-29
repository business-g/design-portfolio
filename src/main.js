import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import './styles.css';

const works = [
  ['01', 'Invarn agents dashboard'],
  ['02', 'Cellframe trading interface'],
  ['03', 'KelVPN mobile application'],
  ['04', 'Auri AI product page'],
  ['05', 'Cellframe mobile wallet'],
  ['06', 'Web3 events application'],
];

document.querySelector('#app').innerHTML = `
  <main class="portfolio">
    <aside class="profile" aria-label="About Bogdan">
      <div class="profile-inner">
        <header class="identity reveal" style="--delay: 0ms">
          <img class="avatar" src="/assets/avatar.jpg" width="56" height="56" alt="Portrait of Bogdan" />
          <div><h1>Bogdan</h1><p>Designer</p></div>
        </header>

        <div class="introduction">
          <p class="reveal" style="--delay: 75ms">I design product interfaces and websites, connecting product thinking with clear visual direction and thoughtful interaction.</p>
          <p class="reveal" style="--delay: 110ms">Whether you’re building something new or improving an existing product, I can help define the direction and turn it into a clear, cohesive experience.</p>
          <p class="reveal" style="--delay: 145ms">View my <span class="social-link social-cv">CV</span> or reach me on <a class="social-link social-telegram" href="https://t.me/kctv_b" target="_blank" rel="noopener noreferrer">Telegram</a> or <a class="social-link social-email" href="mailto:exlambo@gmail.com">by email</a>.</p>
        </div>

        <section class="case-studies reveal" style="--delay: 180ms" aria-labelledby="case-studies-title">
          <h2 id="case-studies-title">Case studies</h2>
          <a class="case-study-row" href="/cellframe-dashboard/"><span>Cellframe dashboard</span><span>Blockchain ecosystem</span></a>
          <a class="case-study-row" href="/surf-2/"><span>Surf 2 access point</span><span>Router admin panel</span></a>
          <a class="case-study-row" href="/cellframe-wallet/"><span>Cellframe wallet</span><span>Crypto wallet</span></a>
        </section>

        <div class="local-time reveal" style="--delay: 215ms">
          <span>My local time <time id="local-time">--:--:--</time></span>
        </div>
      </div>
    </aside>

    <section class="work-area" aria-label="Selected work">
      <div class="gallery" id="design-gallery">
        ${works.map(([number, title], index) => `<figure class="work-frame" id="work-${number}"><img src="/assets/work-${number}.webp" width="3048" height="${index < 2 ? '2184' : '2160'}" alt="${title} design preview" ${index > 1 ? 'loading="lazy"' : 'fetchpriority="high"'} /></figure>`).join('')}
        <figure class="work-frame portfolio-slider" id="work-07" aria-label="Invarn website design, slide 1 of 4">
          <div class="portfolio-slider-track">
            <div class="portfolio-slide">
              <video class="portfolio-video-source" data-src="/assets/invarn-site-01.mp4" muted loop playsinline disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" preload="none" hidden></video>
              <canvas class="portfolio-video-canvas" width="2032" height="1440" role="img" aria-label="Invarn website hero animation"></canvas>
            </div>
            <div class="portfolio-slide"><img src="/assets/invarn-site-03.webp" width="4064" height="2880" loading="lazy" alt="Invarn action control website page" /></div>
            <div class="portfolio-slide">
              <video class="portfolio-video-source" data-src="/assets/invarn-site-04.mp4" muted loop playsinline disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" preload="none" hidden></video>
              <canvas class="portfolio-video-canvas" width="2032" height="1440" role="img" aria-label="Invarn pricing website animation"></canvas>
            </div>
            <div class="portfolio-slide">
              <video class="portfolio-video-source" data-src="/assets/invarn-site-05.mp4" muted loop playsinline disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" preload="none" hidden></video>
              <canvas class="portfolio-video-canvas" width="3048" height="2160" role="img" aria-label="Invarn website footer animation"></canvas>
            </div>
          </div>
          <a class="portfolio-site-link" href="https://invarn.lamborazer.workers.dev" target="_blank" rel="noopener noreferrer" aria-label="Open Invarn website">
            <img src="/assets/circle-arrow-up-right-20.svg" width="20" height="20" alt="" />
          </a>
          <div class="portfolio-slider-dots" role="group" aria-label="Choose Invarn website slide">
            ${[0, 1, 2, 3].map(index => `<button type="button" class="portfolio-slider-dot${index === 0 ? ' is-active' : ''}" data-slide="${index}" aria-label="Show slide ${index + 1}" aria-pressed="${index === 0}"></button>`).join('')}
          </div>
        </figure>
        <figure class="work-frame" id="work-08"><img src="/assets/work-08.webp" width="4064" height="2912" loading="lazy" alt="Surf 2 VPN dashboard design preview" /></figure>
        <figure class="work-frame" id="work-09"><img src="/assets/work-09.webp" width="4064" height="2880" loading="lazy" alt="Wallet connection mobile interface design preview" /></figure>
        <figure class="work-frame" id="work-10"><img src="/assets/work-10.webp" width="4064" height="2880" loading="lazy" alt="Approval pressure analytics design preview" /></figure>
        <figure class="work-frame standalone-video-frame" id="work-12">
          <video class="portfolio-video-source" data-src="/assets/work-12.mp4" muted loop playsinline disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" preload="none" hidden></video>
          <canvas class="portfolio-video-canvas" width="3194" height="2160" role="img" aria-label="Transfer flow interface animation"></canvas>
        </figure>
        <figure class="work-frame" id="work-11"><img src="/assets/work-11.webp" width="4064" height="2880" loading="lazy" alt="Audio and video settings design preview" /></figure>
        <figure class="work-frame standalone-video-frame" id="work-13" style="--video-ratio: 3080 / 2160">
          <video class="portfolio-video-source" data-src="/assets/work-13.mp4" muted loop playsinline disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" preload="none" hidden></video>
          <canvas class="portfolio-video-canvas" width="3080" height="2160" role="img" aria-label="Product interface animation"></canvas>
        </figure>
        <figure class="work-frame standalone-video-frame" id="work-14">
          <video class="portfolio-video-source" data-src="/assets/work-14.mp4" muted loop playsinline disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" preload="none" hidden></video>
          <canvas class="portfolio-video-canvas" width="3194" height="2160" role="img" aria-label="Lottie card interface animation"></canvas>
        </figure>
        <figure class="work-frame standalone-video-frame" id="work-15" style="--video-ratio: 3202 / 2160">
          <video class="portfolio-video-source" data-src="/assets/work-15.mp4" muted loop playsinline disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback" preload="none" hidden></video>
          <canvas class="portfolio-video-canvas" width="3202" height="2160" role="img" aria-label="Product scene interface animation"></canvas>
        </figure>
      </div>
      <div class="components-view" id="components-view" hidden>
        <figure class="work-frame code-component-frame">
          <iframe data-src="/code-components/base-clickable-prototype/index.html" title="Interactive run action component"></iframe>
        </figure>
        <figure class="work-frame code-component-frame code-component-slider">
          <iframe data-src="/code-components/base-slider-prototype/index.html" title="Interactive data export schedule slider"></iframe>
        </figure>
        <figure class="work-frame code-component-frame">
          <iframe data-src="/code-components/agent-card-clickable-prototype/index.html" title="Interactive agent card"></iframe>
        </figure>
        <figure class="work-frame code-component-frame code-component-vpn">
          <iframe data-src="/code-components/legacy-vpn-prototype/index.html" title="Interactive VPN prototype"></iframe>
        </figure>
        <figure class="work-frame code-component-frame code-component-payment">
          <iframe data-src="/code-components/legacy-payment-flow/index.html" title="Interactive payment flow prototype"></iframe>
        </figure>
      </div>
    </section>

    <div class="view-switcher-position">
      <div class="view-switcher switcher-enter" role="group" aria-label="Portfolio view">
        <span class="view-switcher-indicator" aria-hidden="true"></span>
        <button type="button" class="is-active" data-view="design" aria-pressed="true">Design</button>
        <button type="button" data-view="components" aria-pressed="false">Code components</button>
      </div>
    </div>
  </main>
`;

const timeElement = document.querySelector('#local-time');
const timeFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Etc/GMT-3', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
});
function updateTime() {
  const now = new Date();
  timeElement.textContent = timeFormat.format(now).toLowerCase();
}
updateTime();
setInterval(updateTime, 1000);

const gallery = document.querySelector('#design-gallery');
const componentsView = document.querySelector('#components-view');
const componentFrames = [...componentsView.querySelectorAll('iframe[data-src]')];
componentFrames.forEach(frame => {
  frame.addEventListener('load', () => {
    if (frame.hasAttribute('src') && !componentsView.hidden) {
      frame.closest('.code-component-frame').classList.remove('is-loading');
    }
  });
});
const switcher = document.querySelector('.view-switcher');
const switcherIndicator = document.querySelector('.view-switcher-indicator');

function placeSwitcherIndicator(button, animate = true) {
  const switcherRect = switcher.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  const borderLeft = Number.parseFloat(getComputedStyle(switcher).borderLeftWidth);
  const oldLeft = Number.parseFloat(switcherIndicator.style.left) || 2;
  const oldWidth = switcherIndicator.getBoundingClientRect().width || buttonRect.width;
  const newLeft = buttonRect.left - switcherRect.left - borderLeft;
  const newWidth = buttonRect.width;

  switcherIndicator.style.left = `${newLeft}px`;
  switcherIndicator.style.width = `${newWidth}px`;

  if (!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  switcherIndicator.animate(
    [
      { transform: `translateX(${oldLeft - newLeft}px) scaleX(${oldWidth / newWidth})` },
      { transform: 'translateX(0) scaleX(1)' },
    ],
    { duration: 220, easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)' },
  );
}

placeSwitcherIndicator(document.querySelector('[data-view="design"]'), false);

const mobileDesignOnly = window.matchMedia('(max-width: 720px)');

document.querySelectorAll('[data-view]').forEach(button => {
  button.addEventListener('click', () => {
    if (mobileDesignOnly.matches) return;
    if (button.getAttribute('aria-pressed') === 'true') return;
    const design = button.dataset.view === 'design';
    gallery.hidden = !design;
    componentsView.hidden = design;
    if (!design) {
      const topOffset = window.matchMedia('(max-width: 720px)').matches ? 0 : 24;
      const componentsTop = componentsView.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, componentsTop - topOffset), behavior: 'instant' });
    }
    componentFrames.forEach(frame => {
      const container = frame.closest('.code-component-frame');
      if (design) {
        frame.removeAttribute('src');
      } else {
        container.classList.add('is-loading');
        frame.src = frame.dataset.src;
      }
    });
    document.querySelectorAll('[data-view]').forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    placeSwitcherIndicator(button);
  });
});

function showDesignOnMobile() {
  if (!mobileDesignOnly.matches || componentsView.hidden) return;
  gallery.hidden = false;
  componentsView.hidden = true;
  componentFrames.forEach(frame => frame.removeAttribute('src'));
  document.querySelectorAll('[data-view]').forEach(button => {
    const active = button.dataset.view === 'design';
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  switcherIndicator.style.left = '2px';
  switcherIndicator.style.width = '66px';
}

mobileDesignOnly.addEventListener('change', showDesignOnMobile);
showDesignOnMobile();

const portfolioSlider = document.querySelector('.portfolio-slider');
const portfolioSliderTrack = document.querySelector('.portfolio-slider-track');
const portfolioSlides = [...portfolioSlider.querySelectorAll('.portfolio-slide')];
const portfolioSliderVideos = [...portfolioSlider.querySelectorAll('.portfolio-video-source')];
const portfolioVideos = [...document.querySelectorAll('.portfolio-video-source')];
const sliderDots = [...portfolioSlider.querySelectorAll('.portfolio-slider-dot')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const visualFrames = [...gallery.querySelectorAll('.work-frame')];

const showSocialLines = () => document.documentElement.classList.add('social-lines-ready');
const lastTextReveal = getComputedStyle(document.querySelector('.local-time')).display === 'none'
  ? document.querySelector('.case-studies')
  : document.querySelector('.local-time');

if (reduceMotion.matches) showSocialLines();
else lastTextReveal.addEventListener('animationend', showSocialLines, { once: true });
reduceMotion.addEventListener('change', event => {
  if (event.matches) showSocialLines();
});

visualFrames.forEach(frame => {
  const image = frame.querySelector(':scope > img');
  const video = frame.querySelector('.portfolio-video-source');

  if (video || (image && !(image.complete && image.naturalWidth))) {
    frame.classList.add('is-loading');
  }

  if (image) {
    const finishLoading = () => frame.classList.remove('is-loading');
    image.addEventListener('load', finishLoading, { once: true });
    image.addEventListener('error', finishLoading, { once: true });
  }
});

if (!reduceMotion.matches) {
  const visibleFrames = visualFrames.filter(frame => {
    const bounds = frame.getBoundingClientRect();
    return bounds.top < window.innerHeight && bounds.bottom > 0;
  });

  visibleFrames.forEach((frame, index) => {
    frame.classList.add('visual-reveal');
    frame.style.setProperty('--visual-delay', `${Math.min(index * 90, 270)}ms`);
  });
}

let activeSlide = 0;
let sliderInView = false;
let dragStartX = 0;
let dragStartTranslate = 0;
let lastPointerX = 0;
let lastPointerAt = 0;
let dragVelocity = 0;
let isDragging = false;

function drawVideoFrame(video) {
  const canvas = video.nextElementSibling;
  if (video.readyState < 2 || !(canvas instanceof HTMLCanvasElement)) return;
  canvas.getContext('2d', { alpha: false }).drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.classList.add('is-ready');
  const frame = canvas.closest('.work-frame');
  const slide = canvas.closest('.portfolio-slide');
  if (!slide || slide === portfolioSlides[activeSlide]) frame.classList.remove('is-loading');
}

function startVideoFrames(video) {
  if (video.dataset.rendering === 'true') return;
  video.dataset.rendering = 'true';

  const render = () => {
    if (video.paused || video.ended) {
      video.dataset.rendering = 'false';
      return;
    }
    drawVideoFrame(video);
    if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(render);
    else requestAnimationFrame(render);
  };

  render();
}

function loadVideo(video) {
  if (video.hasAttribute('src')) return;
  video.preload = 'auto';
  video.src = video.dataset.src;
}

portfolioVideos.forEach(video => {
  video.addEventListener('loadeddata', () => drawVideoFrame(video), { once: true });
  video.addEventListener('error', () => video.closest('.work-frame').classList.remove('is-loading'), { once: true });
  video.addEventListener('play', () => startVideoFrames(video));
});

portfolioSlides.forEach(slide => {
  const image = slide.querySelector('img');
  if (!image) return;
  const finishLoading = () => {
    if (slide === portfolioSlides[activeSlide]) portfolioSlider.classList.remove('is-loading');
  };
  image.addEventListener('load', finishLoading);
  image.addEventListener('error', finishLoading);
});

const standaloneVideoObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const video = entry.target.querySelector('.portfolio-video-source');
    if (!entry.isIntersecting) {
      video.pause();
      return;
    }
    loadVideo(video);
    if (!reduceMotion.matches) void video.play().catch(() => {});
  });
}, { threshold: .15 });
document.querySelectorAll('.standalone-video-frame').forEach(frame => standaloneVideoObserver.observe(frame));

function showPortfolioSlide(index) {
  activeSlide = Math.max(0, Math.min(index, sliderDots.length - 1));
  const selectedSlide = portfolioSlides[activeSlide];
  const selectedImage = selectedSlide.querySelector('img');
  const selectedCanvas = selectedSlide.querySelector('.portfolio-video-canvas');
  const isReady = selectedImage
    ? selectedImage.complete && selectedImage.naturalWidth > 0
    : selectedCanvas.classList.contains('is-ready');
  portfolioSlider.classList.toggle('is-loading', !isReady);
  portfolioSliderTrack.classList.remove('is-dragging');
  portfolioSliderTrack.style.transform = `translateX(${-activeSlide * 100}%)`;
  portfolioSlider.setAttribute('aria-label', `Invarn website design, slide ${activeSlide + 1} of ${sliderDots.length}`);
  sliderDots.forEach((dot, dotIndex) => {
    const active = dotIndex === activeSlide;
    dot.classList.toggle('is-active', active);
    dot.setAttribute('aria-pressed', String(active));
  });

  portfolioSlides.forEach((slide, slideIndex) => {
    const video = slide.querySelector('.portfolio-video-source');
    if (!video) return;
    if (slideIndex !== activeSlide || !sliderInView) {
      video.pause();
      return;
    }
    loadVideo(video);
    if (!reduceMotion.matches) void video.play().catch(() => {});
  });
}

const sliderObserver = new IntersectionObserver(entries => {
  sliderInView = entries[0].isIntersecting;
  if (sliderInView) showPortfolioSlide(activeSlide);
  else portfolioSliderVideos.forEach(video => video.pause());
}, { threshold: .15 });
sliderObserver.observe(portfolioSlider);

reduceMotion.addEventListener('change', event => {
  if (event.matches) {
    portfolioVideos.forEach(video => video.pause());
    return;
  }
  if (sliderInView) showPortfolioSlide(activeSlide);
  document.querySelectorAll('.standalone-video-frame').forEach(frame => {
    const bounds = frame.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) {
      const video = frame.querySelector('.portfolio-video-source');
      loadVideo(video);
      void video.play().catch(() => {});
    }
  });
});

sliderDots.forEach(dot => {
  dot.addEventListener('click', () => showPortfolioSlide(Number(dot.dataset.slide)));
});

portfolioSlider.addEventListener('dragstart', event => event.preventDefault());

portfolioSlider.addEventListener('pointerdown', event => {
  if (event.button !== 0 || event.target.closest('.portfolio-slider-dots, .portfolio-site-link')) return;

  const transform = new DOMMatrixReadOnly(getComputedStyle(portfolioSliderTrack).transform);
  dragStartTranslate = transform.m41;
  dragStartX = event.clientX;
  lastPointerX = event.clientX;
  lastPointerAt = performance.now();
  dragVelocity = 0;
  isDragging = true;
  portfolioSliderTrack.classList.add('is-dragging');
  portfolioSliderTrack.style.transform = `translateX(${dragStartTranslate}px)`;
  portfolioSlider.setPointerCapture(event.pointerId);
});

portfolioSlider.addEventListener('pointermove', event => {
  if (!isDragging) return;

  const now = performance.now();
  const elapsed = Math.max(now - lastPointerAt, 1);
  dragVelocity = (event.clientX - lastPointerX) / elapsed;
  lastPointerX = event.clientX;
  lastPointerAt = now;

  const width = portfolioSlider.clientWidth;
  const minTranslate = -(sliderDots.length - 1) * width;
  let nextTranslate = dragStartTranslate + event.clientX - dragStartX;

  if (nextTranslate > 0) nextTranslate *= .2;
  if (nextTranslate < minTranslate) nextTranslate = minTranslate + (nextTranslate - minTranslate) * .2;

  portfolioSliderTrack.style.transform = `translateX(${nextTranslate}px)`;
});

function finishPortfolioDrag(event) {
  if (!isDragging) return;
  isDragging = false;

  const distance = event.clientX - dragStartX;
  const distanceThreshold = portfolioSlider.clientWidth * .18;
  const velocityThreshold = .45;
  let targetSlide = activeSlide;

  if (distance < -distanceThreshold || dragVelocity < -velocityThreshold) targetSlide += 1;
  if (distance > distanceThreshold || dragVelocity > velocityThreshold) targetSlide -= 1;

  showPortfolioSlide(targetSlide);
  if (portfolioSlider.hasPointerCapture(event.pointerId)) {
    portfolioSlider.releasePointerCapture(event.pointerId);
  }
}

portfolioSlider.addEventListener('pointerup', finishPortfolioDrag);
portfolioSlider.addEventListener('pointercancel', finishPortfolioDrag);

portfolioSlider.tabIndex = 0;
portfolioSlider.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') showPortfolioSlide(activeSlide - 1);
  if (event.key === 'ArrowRight') showPortfolioSlide(activeSlide + 1);
});

showPortfolioSlide(0);
