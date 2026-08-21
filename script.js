(function(){
  "use strict";

  /* ---------- Header scroll shadow ---------- */
  var header = document.getElementById('siteHeader');
  var onScroll = function(){
    if (window.scrollY > 12) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', function(){
    var isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Animated stat counters ---------- */
  var stats = document.querySelectorAll('.stat-card .num');
  var animateCount = function(el){
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var duration = 1200;
    var start = null;
    var step = function(ts){
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window){
    var statObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach(function(el){ statObserver.observe(el); });
  } else {
    stats.forEach(animateCount);
  }

  /* ---------- Reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll('.project-card, .service-card, .stat-card, .site-row');
  revealTargets.forEach(function(el){ el.style.opacity = '0'; el.style.transform = 'translateY(18px)'; el.style.transition = 'opacity .5s ease, transform .5s ease'; });
  if ('IntersectionObserver' in window){
    var revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function(el){ revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function(el){ el.style.opacity = '1'; el.style.transform = 'none'; });
  }

  /* ---------- Work filter pills ---------- */
  var pills = document.querySelectorAll('.pill');
  var cards = document.querySelectorAll('.project-card');
  pills.forEach(function(pill){
    pill.addEventListener('click', function(){
      pills.forEach(function(p){ p.classList.remove('is-active'); });
      pill.classList.add('is-active');
      var filter = pill.dataset.filter;
      cards.forEach(function(card){
        var show = (filter === 'all' || card.dataset.cat === filter);
        card.hidden = !show;
      });
    });
  });

  /* ---------- Project lightbox data ---------- */
  var PROJECTS = {
    'catavento': {
      eyebrow: 'Escola · 2026',
      title: 'Colégio Cata Vento',
      text: 'Campanha de volta às aulas para o Colégio Cata Vento: peças de contagem regressiva, comunicação com as famílias e divulgação de vagas, unindo identidade lúdica e organização de conteúdo.',
      imgs: ['escola-1.jpg','escola-2.jpg','escola-3.jpg','escola-4.jpg']
    },
    'futebol-interativo': {
      eyebrow: 'Futebol · 2024',
      title: 'Futebol Interativo',
      text: 'Conteúdo editorial esportivo sobre grandes seleções, análise tática e bastidores do futebol, com produção de artes e roteiro para redes sociais.',
      imgs: ['futebol-banner.jpg','futebol-2.jpg']
    },
    'esportes': {
      eyebrow: 'Juca · Cobertura esportiva',
      title: 'Esportes',
      text: 'Registro fotográfico de jogos, treinos e bastidores esportivos — trabalho de cobertura de eventos com foco em ação e emoção em quadra e campo.',
      imgs: ['esportes-1.jpg','esportes-2.jpg','esportes-3.jpg','esportes-4.jpg']
    },
    'lua': {
      eyebrow: 'Agências · Lua Marketing',
      title: 'Lua Marketing',
      text: 'Guia de conteúdos estratégicos e trends para redes sociais, planejamento de calendário editorial e criação de artes para clientes da agência.',
      imgs: ['lua-1.jpg','lua-2.jpg']
    },
    'palmeiras': {
      eyebrow: 'Agências · 2025',
      title: 'Conteúdo Editorial Esportivo',
      text: 'Produção de artes editoriais e análises sobre futebol para clientes de agência, incluindo curiosidades históricas e cobertura de contratações.',
      imgs: ['agencias-1.jpg','agencias-2.jpg','agencias-3.jpg']
    },
    'barbixas': {
      eyebrow: 'Barbixas · 2023/24',
      title: 'Drome Barbixas',
      text: 'Cobertura de conteúdo para o grupo de stand-up comedy Barbixas: bastidores, trechos de shows e comunicação com o público nas redes.',
      imgs: ['barbixas-1.jpg','barbixas-2.jpg','barbixas-3.jpg','barbixas-4.jpg']
    },
    'religiosos': {
      eyebrow: 'Religiosos · Freelance',
      title: 'Eventos Religiosos',
      text: 'Artes de divulgação freelance para giras e eventos religiosos, com identidade visual sóbria e informações claras de local e horário.',
      imgs: ['religiosos-1.jpg','religiosos-2.jpg']
    }
  };

  var lightbox = document.getElementById('lightbox');
  var lbClose = document.getElementById('lightboxClose');
  var lbEyebrow = document.getElementById('lightboxEyebrow');
  var lbTitle = document.getElementById('lightboxTitle');
  var lbText = document.getElementById('lightboxText');
  var lbImgs = document.getElementById('lightboxImgs');
  var lastFocused = null;

  function openLightbox(key){
    var data = PROJECTS[key];
    if (!data) return;
    lbEyebrow.textContent = data.eyebrow;
    lbTitle.textContent = data.title;
    lbText.textContent = data.text;
    lbImgs.innerHTML = '';
    data.imgs.forEach(function(src){
      var img = document.createElement('img');
      img.src = 'assets/img/' + src;
      img.alt = data.title + ' — peça de conteúdo';
      img.loading = 'lazy';
      lbImgs.appendChild(img);
    });
    lastFocused = document.activeElement;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    lbClose.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  cards.forEach(function(card){
    card.addEventListener('click', function(){
      openLightbox(card.dataset.project);
    });
  });
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function(e){
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });

})();
