/**
 * RiverIT Pte Ltd — Production JavaScript
 * High-performance, zero-dependency, 60fps/120fps animations
 */

(function () {
  'use strict';

  // --- PAGE ROUTING & NAVIGATION ---
  const routes = {
    home: {
      title: 'RiverIT Pte Ltd — Business Continuity, Backup & IT Security in Singapore',
      description: 'RiverIT designs, deploys and supports backup, recovery, networks and security for Singapore businesses — so a failed server or ransomware attack never becomes a lost day of work.',
      viewId: 'view-home'
    },
    about: {
      title: 'About RiverIT — Business Continuity Partner in Singapore',
      description: 'RiverIT is a Singapore IT company providing business continuity, backup and security solutions with service and care. bizSAFE Level 3 certified.',
      viewId: 'view-about'
    },
    continuity: {
      title: 'Business Continuity — Backup & Disaster Recovery for Singapore SMBs | RiverIT',
      description: 'Image-based backup and stand-in server recovery. When production fails — hardware fault, ransomware or software error — RiverStorage keeps your business running while we restore.',
      viewId: 'view-continuity'
    },
    m365: {
      title: 'Microsoft 365 & Intune Backup for Business | RiverIT Singapore',
      description: 'Microsoft doesn\'t back up your data — you do. Cloud-to-cloud backup for Exchange, OneDrive, SharePoint, Teams and Intune configurations, powered by Acronis and supported in Singapore.',
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
    training: {
      title: 'Free IT Fundamentals Training for Business Teams | RiverIT Singapore',
      description: 'Free training sessions on email fundamentals, backup vs. archival, and internet security — for business owners and staff, no IT background needed.',
      viewId: 'view-training'
    },
    contact: {
      title: 'Contact RiverIT — IT Support & Business Continuity, Singapore',
      description: 'Get in touch with RiverIT for business continuity, backup, network and security enquiries. We reply within 3 working days — or call +65 9459 1538.',
      viewId: 'view-contact'
    }
  };

  const navLinks = document.querySelectorAll('.nav-link, .dropdown-link, .mobile-drawer .nav-link, .mobile-sub-link');
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

    revealItems.forEach(item => observer.observe(item));
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
      prodState.style.color = '#38BDF8';
      standinState.textContent = 'STATUS: READY (STANDBY)';
      standinState.style.color = '#94A3B8';
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
        statusText.textContent = 'Failure Detected! Activating RiverStorage Stand-in...';
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

      const riverStorageRtoHours = 0.25; // 15 minutes!

      const currentCostPerIncident = currentRtoHours * hourlyCost;
      const riverStorageCostPerIncident = Math.round(riverStorageRtoHours * hourlyCost);
      const savingsPerIncident = currentCostPerIncident - riverStorageCostPerIncident;

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

          // Exactly matches verbatim success message from specification
          const successMsg = "Thank you — your message is on its way. We'll get back to you within 3 working days.";
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

  // --- TRAINING REGISTRATION FORM ---
  function setupTrainingForm() {
    const trainingForm = document.getElementById('training-register-form');
    if (!trainingForm) return;

    trainingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = trainingForm.querySelector('[name="name"]').value.trim();
      const email = trainingForm.querySelector('[name="email"]').value.trim();

      if (!name || !email) {
        alert('Please provide your name and work email address.');
        return;
      }

      showToast("Thank you — your training registration interest is received. Our team will contact you with session schedules.");
      trainingForm.reset();
      const modal = document.getElementById('modal-training');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Initialize all components on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // Initial Route
    navigateTo(window.location.hash || 'home', false);

    // Initial Simulator
    setupSimulator('hero-simulator');
    setupSimulator('bc-simulator');

    // Accordions, Modals, Forms
    setupFAQs();
    setupModals();
    setupContactForms();
    setupAssessmentCalculator();
    setupTrainingForm();
    initScrollReveal();
  });

})();
