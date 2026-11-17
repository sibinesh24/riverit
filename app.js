/**
 * RiverIT Pte Ltd — Production JavaScript
 * High-performance, zero-dependency, 60fps/120fps animations
 */

(function () {
  'use strict';

  // --- PAGE ROUTING & NAVIGATION ---
  const routes = {
    home: {
      title: 'RiverIT Pte Ltd — Everyday IT Support for Singapore Businesses',
      description: 'RiverIT provides day-to-day IT support for Singapore businesses. We troubleshoot issues with computers, Microsoft 365, printers, Wi-Fi and servers, and help your team adopt new tools securely.',
      viewId: 'view-home'
    },
    about: {
      title: 'About RiverIT — Business Continuity Partner in Singapore',
      description: 'RiverIT is a Singapore IT company providing business continuity, backup and security solutions with service and care. bizSAFE Level 3 certified.',
      viewId: 'view-about'
    },
    continuity: {
      title: 'Business Continuity — Backup & Disaster Recovery for Singapore SMBs | RiverIT',
      description: 'Image-based backup and stand-in server recovery. When production fails — hardware fault, ransomware or software error — Acronis keeps your business running while we restore.',
      viewId: 'view-continuity'
    },
    m365: {
      title: 'Microsoft 365 & Intune Management and Backup | RiverIT Singapore',
      description: 'Microsoft 365 and Intune managed properly — device enrolment, Conditional Access, Microsoft Defender, staff onboarding and offboarding — plus cloud-to-cloud backup for Exchange, OneDrive, SharePoint, Teams and Intune configurations, powered by Acronis and supported in Singapore.',
      viewId: 'view-m365'
    },
    archival: {
      title: 'Data Archival Solutions — RDX Removable Disk Storage | RiverIT Singapore',
      description: 'Long-term data retention with rugged, removable Overland-Tandberg RDX QuikStor disk storage — fast, portable and ideal for offline copies and compliance archives.',
      viewId: 'view-archival'
    },
    network: {
      title: 'Business Network & Firewall Solutions | RiverIT Singapore',
      description: 'Design, deployment and management of business networks — Fortinet and WatchGuard firewalls, Cisco switching, secure remote access and business Wi-Fi in Singapore.',
      viewId: 'view-network'
    },
    security: {
      title: 'Cyber Security — Vulnerability Audits & Network Monitoring | RiverIT Singapore',
      description: 'Web security audits with Acunetix, network and system monitoring with Progress WhatsUp Gold, and layered anti-ransomware protection for Singapore businesses.',
      viewId: 'view-security'
    },
    support: {
      title: 'IT Support for Businesses in Singapore | RiverIT',
      description: 'Responsive helpdesk and on-site IT support from Singapore-based engineers — troubleshooting, maintenance, hardware and user support for your business.',
      viewId: 'view-support'
    },
    contact: {
      title: 'Contact RiverIT — IT Support & Business Continuity, Singapore',
      description: 'Get in touch with RiverIT for business continuity, backup, network and security enquiries. We reply the same business day — or call +65 9459 1538.',
      viewId: 'view-contact'
    }
  };

  const navLinks = document.querySelectorAll('.nav-link, .dropdown-link, .mobile-drawer .nav-link, .mobile-sub-link, a.dock-item');
  const pageViews = document.querySelectorAll('.page-view');
  const header = document.querySelector('.site-header');

  function navigateTo(hash, updateHistory = true) {
    const rawHash = (hash || '').replace(/^#\/?/, '').toLowerCase() || 'home';
    const isServicesSection = rawHash === 'services';
    const cleanHash = isServicesSection ? 'home' : rawHash;
    const targetRoute = routes[cleanHash] || routes.home;

    // Switch active view
    pageViews.forEach(view => {
      view.classList.remove('active');
    });

    const activeView = document.getElementById(targetRoute.viewId);
    if (activeView) {
      activeView.classList.add('active');
    }

    // Update Document Title and Meta Description
    document.title = targetRoute.title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && targetRoute.description) {
      metaDesc.setAttribute('content', targetRoute.description);
    }

    // Update Nav Highlights
    navLinks.forEach(link => {
      const linkHash = (link.getAttribute('href') || '').replace(/^#\/?/, '').toLowerCase();
      if (linkHash === rawHash || (isServicesSection && linkHash === 'services')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close Mobile Drawer if open
    closeMobileDrawer();

    // Scroll handling
    if (isServicesSection) {
      setTimeout(() => {
        const servicesEl = document.getElementById('services');
        if (servicesEl) {
          servicesEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Re-trigger scroll reveal in new view
    setTimeout(initScrollReveal, 60);

    if (updateHistory) {
      history.pushState(null, '', `#${cleanHash}`);
    }
  }

  window.addEventListener('popstate', () => {
    navigateTo(window.location.hash, false);
  });

  // Intercept hash clicks
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const href = anchor.getAttribute('href');
      // Ignore empty or modal hashes
      if (href && href !== '#' && !href.startsWith('#modal-')) {
        e.preventDefault();
        navigateTo(href);
      }
    }
  });

  // Header scroll shadow toggle
  let lastScrollY = 0;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  // --- MOBILE DRAWER ---
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileOverlay = document.getElementById('mobile-drawer-overlay');

  function openMobileDrawer() {
    mobileToggle.classList.add('active');
    mobileDrawer.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    mobileToggle.classList.remove('active');
    mobileDrawer.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      if (mobileDrawer.classList.contains('open')) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileDrawer);
  }

  // --- HARDWARE-ACCELERATED SCROLL REVEAL (IntersectionObserver) ---
  function initScrollReveal() {
    const revealItems = document.querySelectorAll('.page-view.active .reveal-item:not(.revealed)');
    if (!('IntersectionObserver' in window)) {
      revealItems.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    // Auto-stagger siblings (cards in a grid) that don't set their own delay
    const groups = new Map();
    revealItems.forEach(item => {
      if (/\bdelay-\d\b/.test(item.className)) return;
      const parent = item.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(item);
    });
    groups.forEach(items => {
      if (items.length < 2) return;
      items.forEach((item, i) => { item.style.transitionDelay = `${Math.min(i, 8) * 70}ms`; });
    });

    revealItems.forEach(item => observer.observe(item));
  }

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  // --- CARD SPOTLIGHT: warm glow follows the pointer across cards ---
  function setupSpotlight() {
    if (prefersReducedMotion || !hasFinePointer) return;
    const selector = '.feature-card, .numbered-card, .pillar-card, .step-card, .why-item, .ecosystem-item';
    let frame = 0;
    let lastEvent = null;

    document.addEventListener('pointermove', (e) => {
      lastEvent = e;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const card = lastEvent.target.closest && lastEvent.target.closest(selector);
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${lastEvent.clientX - rect.left}px`);
        card.style.setProperty('--my', `${lastEvent.clientY - rect.top}px`);
      });
    }, { passive: true });

    document.addEventListener('pointerout', (e) => {
      const card = e.target.closest && e.target.closest(selector);
      if (card && !card.contains(e.relatedTarget)) {
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      }
    });
  }

  // --- QUICK-NAV DOCK: macOS-style magnification with spring physics ---
  // Vanilla port of the React/framer-motion MagnificationDock.
  function setupDock() {
    const dock = document.getElementById('quick-dock');
    if (!dock) return;
    const panel = dock.querySelector('.dock-panel');
    const items = Array.from(dock.querySelectorAll('.dock-item'));

    const BASE = 50;          // baseItemSize
    const MAG = 72;           // magnification
    const DISTANCE = 200;     // distance where magnification starts
    const MASS = 0.1, STIFFNESS = 150, DAMPING = 12; // spring (component defaults)

    // The dock is the top navigation bar on desktop, so it is always shown
    dock.classList.add('is-visible');

    if (prefersReducedMotion || !hasFinePointer) return; // static dock, no magnification

    const state = items.map(() => ({ size: BASE, velocity: 0 }));
    let mouseX = Infinity;
    let raf = 0;
    let last = 0;

    function targetFor(item) {
      if (mouseX === Infinity) return BASE;
      const rect = item.getBoundingClientRect();
      const distance = Math.abs(mouseX - (rect.left + rect.width / 2));
      if (distance >= DISTANCE) return BASE;
      return BASE + (MAG - BASE) * (1 - distance / DISTANCE);
    }

    function step(now) {
      const dt = Math.min((now - (last || now)) / 1000, 1 / 30);
      last = now;
      let moving = false;

      items.forEach((item, i) => {
        const s = state[i];
        const target = targetFor(item);
        // damped spring: F = -k(x - target) - c·v ; a = F / m (semi-implicit Euler, 2 substeps)
        for (let sub = 0; sub < 2; sub++) {
          const h = dt / 2;
          const force = -STIFFNESS * (s.size - target) - DAMPING * s.velocity;
          s.velocity += (force / MASS) * h;
          s.size += s.velocity * h;
        }
        if (Math.abs(s.size - target) > 0.05 || Math.abs(s.velocity) > 0.05) moving = true;
        else { s.size = target; s.velocity = 0; }
        item.style.width = item.style.height = `${s.size.toFixed(2)}px`;
      });

      if (moving || mouseX !== Infinity) {
        raf = requestAnimationFrame(step);
      } else {
        raf = 0;
        last = 0;
      }
    }

    const kick = () => { if (!raf) raf = requestAnimationFrame(step); };

    panel.addEventListener('mousemove', (e) => { mouseX = e.clientX; kick(); });
    panel.addEventListener('mouseleave', () => { mouseX = Infinity; kick(); });
  }

  // --- SCROLL EFFECTS: home data curve draws with scroll; tracker rail fills ---
  // One rAF-throttled handler. The partner marquee is pure CSS (no JS needed).
  function setupScrollEffects() {
    const home = document.getElementById('view-home');
    const curve = home && home.querySelector('.data-curve-line');
    const tracker = home && home.querySelector('[data-tracker]');
    const rail = tracker && tracker.querySelector('.tracker-rail');
    const fill = tracker && tracker.querySelector('.tracker-fill');
    const steps = tracker ? Array.from(tracker.querySelectorAll('.tracker-step')) : [];
    const nodes = tracker ? Array.from(tracker.querySelectorAll('.tracker-node')) : [];
    const clamp01 = (v) => Math.min(1, Math.max(0, v));

    // Place the rail from the first node to the last; works for the horizontal
    // (desktop) and vertical (mobile) layouts, whichever CSS produced.
    // Layout (offset*) positions, so the steps' scroll-in transform doesn't skew the rail
    function centerOf(node) {
      let x = node.offsetWidth / 2;
      let y = node.offsetHeight / 2;
      let el = node;
      while (el && el !== tracker) {
        x += el.offsetLeft;
        y += el.offsetTop;
        el = el.offsetParent;
      }
      return { x, y };
    }

    function layoutRail() {
      if (!tracker || nodes.length < 2 || !tracker.offsetParent) return;
      const { x: x1, y: y1 } = centerOf(nodes[0]);
      const { x: x2, y: y2 } = centerOf(nodes[nodes.length - 1]);
      const vertical = Math.abs(x2 - x1) < Math.abs(y2 - y1);
      tracker.dataset.orient = vertical ? 'vertical' : 'horizontal';
      Object.assign(rail.style, vertical
        ? { left: `${x1 - 1}px`, top: `${y1}px`, width: '2px', height: `${y2 - y1}px`, right: 'auto' }
        : { left: `${x1}px`, top: `${y1 - 1}px`, width: `${x2 - x1}px`, height: '2px', right: 'auto' });
    }

    function setTracker(p) {
      if (!fill) return;
      const vertical = tracker.dataset.orient === 'vertical';
      fill.style.transform = vertical ? `scaleY(${p})` : `scaleX(${p})`;
      steps.forEach((step, i) => {
        // step 1 lights as soon as the fill starts; the others as the fill reaches them
        const at = i / (steps.length - 1);
        step.classList.toggle('is-reached', i === 0 ? p > 0 : p >= at - 0.001);
      });
    }

    function update() {
      if (!home || !home.offsetParent) return; // home page not showing
      const vh = window.innerHeight;
      if (curve) {
        const r = home.getBoundingClientRect();
        // 0 at the top of the page → 1 at the bottom; the drawn tip leads 60% down the screen
        const p = clamp01((vh * 0.6 - r.top) / r.height);
        curve.style.strokeDashoffset = String(1 - p);
      }
      if (tracker) {
        const r = tracker.getBoundingClientRect();
        // starts filling when the tracker reaches 80% down the screen, done by 35%
        const p = clamp01((vh * 0.8 - r.top) / Math.max(r.height + vh * 0.1, vh * 0.45));
        setTracker(p);
      }
    }

    layoutRail();
    if (prefersReducedMotion) {
      // static, fully drawn state
      if (curve) curve.style.strokeDashoffset = '0';
      setTracker(1);
      window.addEventListener('resize', layoutRail);
      return;
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; update(); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { layoutRail(); onScroll(); });
    window.addEventListener('popstate', () => setTimeout(() => { layoutRail(); update(); }, 80));
    document.addEventListener('click', (e) => {
      // re-measure after in-page navigation back to the home view
      if (e.target.closest && e.target.closest('a[href^="#"]')) setTimeout(() => { layoutRail(); update(); }, 80);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layoutRail(); update(); });
    update();
  }

  // --- INTERACTIVE DISASTER RECOVERY SIMULATOR ---
  function setupSimulator(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const prodNode = container.querySelector('.server-node-prod');
    const standinNode = container.querySelector('.server-node-standin');
    const prodState = container.querySelector('.node-state-prod');
    const standinState = container.querySelector('.node-state-standin');
    const downtimeCounter = container.querySelector('.sim-downtime');
    const statusText = container.querySelector('.sim-status');
    const failBtn = container.querySelector('.btn-trigger-fail');
    const restoreBtn = container.querySelector('.btn-trigger-restore');
    const dataStream = container.querySelector('.data-pulse');

    let simTimer = null;
    let secondsElapsed = 0;

    function resetToNormal() {
      if (simTimer) clearInterval(simTimer);
      prodNode.className = 'server-node server-node-prod active-prod';
      standinNode.className = 'server-node server-node-standin';
      prodState.textContent = 'STATUS: ONLINE (PRIMARY)';
      prodState.style.color = '#FF5C6F';
      standinState.textContent = 'STATUS: READY (STANDBY)';
      standinState.style.color = '#9C9C9D';
      if (downtimeCounter) downtimeCounter.textContent = '00:00';
      if (statusText) {
        statusText.textContent = 'Active Replication (Continuous RPO: 15m)';
        statusText.style.color = '#10B981';
      }
      if (dataStream) dataStream.style.display = 'block';
    }

    function triggerFailure() {
      if (simTimer) clearInterval(simTimer);
      secondsElapsed = 0;

      // Stage 1: Production fails
      prodNode.className = 'server-node server-node-prod server-failed';
      prodState.textContent = 'STATUS: CRASH / RANSOMWARE';
      prodState.style.color = '#EF4444';
      if (statusText) {
        statusText.textContent = 'Failure Detected! Activating Acronis Instant Restore...';
        statusText.style.color = '#F59E0B';
      }

      // Count seconds
      simTimer = setInterval(() => {
        secondsElapsed++;
        const formatted = String(secondsElapsed).padStart(2, '0');
        if (downtimeCounter) downtimeCounter.textContent = `00:${formatted}`;

        // At 3 seconds (~minutes in real time), Stand-in activates
        if (secondsElapsed === 3) {
          standinNode.className = 'server-node server-node-standin active-standin';
          standinState.textContent = 'STATUS: LIVE PRODUCTION (STAND-IN)';
          standinState.style.color = '#10B981';
          if (statusText) {
            statusText.textContent = 'Failover Complete. Business Running Uninterrupted!';
            statusText.style.color = '#10B981';
          }
          clearInterval(simTimer);
        }
      }, 700);
    }

    if (failBtn) {
      failBtn.addEventListener('click', (e) => {
        e.preventDefault();
        triggerFailure();
      });
    }

    if (restoreBtn) {
      restoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        resetToNormal();
      });
    }

    resetToNormal();
  }

  // --- FAQ ACCORDION ---
  function setupFAQs() {
    document.addEventListener('click', (e) => {
      const question = e.target.closest('.faq-question');
      if (!question) return;

      const item = question.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Optional: close other accordions in the same group
      const parent = item.closest('.faq-section');
      if (parent) {
        parent.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
      }

      if (!isOpen) {
        item.classList.add('open');
      }
    });
  }

  // --- MODAL CONTROLLER ---
  function setupModals() {
    // Open modal triggers: data-modal-target="#id"
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal-target]');
      if (!trigger) return;
      e.preventDefault();
      const targetSelector = trigger.getAttribute('data-modal-target');
      const targetModal = document.querySelector(targetSelector);
      if (targetModal) {
        // switching from one dialog to another (e.g. "Talk to us" ↔ "Report an IT issue")
        const currentModal = trigger.closest('.modal-overlay');
        if (currentModal && currentModal !== targetModal) currentModal.classList.remove('open');
        targetModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });

    // Close buttons & overlay click
    document.addEventListener('click', (e) => {
      if (e.target.closest('.modal-close-btn') || e.target.classList.contains('modal-overlay')) {
        const openModal = e.target.closest('.modal-overlay');
        if (openModal) {
          openModal.classList.remove('open');
          document.body.style.overflow = '';
        }
      }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal-overlay.open');
        openModals.forEach(m => m.classList.remove('open'));
        document.body.style.overflow = '';
      }
    });
  }

  // --- TOAST NOTIFICATION ---
  function showToast(message) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.className = 'toast-notice';
      toast.innerHTML = `
        <div class="toast-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="toast-text" id="toast-text">${message}</div>
      `;
      document.body.appendChild(toast);
    } else {
      document.getElementById('toast-text').textContent = message;
    }

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  // --- CONTINUITY ASSESSMENT CALCULATOR ---
  function setupAssessmentCalculator() {
    const calcForm = document.getElementById('continuity-calc-form');
    const calcResult = document.getElementById('continuity-calc-result');
    if (!calcForm) return;

    calcForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const servers = parseInt(calcForm.querySelector('[name="servers"]').value || '3', 10);
      const backupType = calcForm.querySelector('[name="backupType"]').value;
      const hourlyCost = parseInt(calcForm.querySelector('[name="hourlyCost"]').value || '2000', 10);

      // Status Quo RTO estimation in hours
      let currentRtoHours = 24; // Default tape/drive
      if (backupType === 'cloud') currentRtoHours = 12;
      if (backupType === 'snapshot') currentRtoHours = 6;
      if (backupType === 'none') currentRtoHours = 72;

      const acronisRtoHours = 0.25; // 15 minutes!

      const currentCostPerIncident = currentRtoHours * hourlyCost;
      const acronisCostPerIncident = Math.round(acronisRtoHours * hourlyCost);
      const savingsPerIncident = currentCostPerIncident - acronisCostPerIncident;

      document.getElementById('calc-current-rto').textContent = `${currentRtoHours} hrs`;
      document.getElementById('calc-river-rto').textContent = `< 15 mins`;
      document.getElementById('calc-savings').textContent = `S$${savingsPerIncident.toLocaleString()}`;

      calcResult.style.display = 'block';
      calcResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // --- CONTACT FORM HANDLING & VALIDATION ---
  function setupContactForms() {
    const contactForms = document.querySelectorAll('.contact-form-el');

    contactForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = form.querySelector('[name="name"]');
        const emailInput = form.querySelector('[name="email"]');
        const messageInput = form.querySelector('[name="message"]');
        const enquiryType = form.querySelector('[name="enquiry_type"]');

        let isValid = true;

        // Validation for Name
        if (!nameInput.value.trim()) {
          nameInput.classList.add('error');
          isValid = false;
        } else {
          nameInput.classList.remove('error');
        }

        // Validation for Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
          emailInput.classList.add('error');
          isValid = false;
        } else {
          emailInput.classList.remove('error');
        }

        // Validation for Message
        if (!messageInput.value.trim()) {
          messageInput.classList.add('error');
          isValid = false;
        } else {
          messageInput.classList.remove('error');
        }

        if (!isValid) return;

        // Button Loading State
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          Sending message...
        `;

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          form.reset();

          // Default success message from the specification; a form can override it (e.g. the support form)
          const successMsg = form.dataset.success || "Thank you — your message is on its way. We'll get back to you the same business day.";
          showToast(successMsg);

          // Close modal if form is in a modal
          const parentModal = form.closest('.modal-overlay');
          if (parentModal) {
            parentModal.classList.remove('open');
            document.body.style.overflow = '';
          }
        }, 600);
      });

      // Clear error on input
      form.querySelectorAll('.form-control').forEach(ctrl => {
        ctrl.addEventListener('input', () => {
          if (ctrl.classList.contains('error')) {
            ctrl.classList.remove('error');
          }
        });
      });
    });
  }

  // Initialize all components on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // Initial Route
    navigateTo(window.location.hash || 'home', false);

    // Backup simulator on the Business Continuity page
    setupSimulator('bc-simulator');

    // Accordions, Modals, Forms
    setupFAQs();
    setupModals();
    setupContactForms();
    setupAssessmentCalculator();
    setupScrollEffects();
    initScrollReveal();

    // Motion layer
    setupSpotlight();
    setupDock();
  });

})();
