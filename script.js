document.addEventListener('DOMContentLoaded', () => {


  const canvas = document.getElementById('floatCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const SYMBOLS = ['💙', '✦', '✨', '⋆', '💫'];

  function makeParticle(){
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height + canvas.height,
      size: 10 + Math.random() * 16,
      speed: 0.25 + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 0.6,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      opacity: 0.25 + Math.random() * 0.45,
      sway: Math.random() * Math.PI * 2
    };
  }

  const PARTICLE_COUNT = window.innerWidth < 600 ? 22 : 38;
  for (let i = 0; i < PARTICLE_COUNT; i++){
    const p = makeParticle();
    p.y = Math.random() * canvas.height; 
    particles.push(p);
  }

  function animateParticles(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y -= p.speed;
      p.sway += 0.01;
      p.x += Math.sin(p.sway) * p.drift;

      if (p.y < -30){
        p.y = canvas.height + 30;
        p.x = Math.random() * canvas.width;
      }

      ctx.globalAlpha = p.opacity;
      ctx.font = `${p.size}px sans-serif`;
      ctx.fillText(p.symbol, p.x, p.y);
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  const page1 = document.getElementById('page1');
  const page2 = document.getElementById('page2');
  const openSurpriseBtn = document.getElementById('openSurpriseBtn');
  const ytFrame = document.getElementById('ytFrame'); // Grab reference early

  // --- UPDATED: Start music on "Open Birthday Surprise" click ---
  openSurpriseBtn.addEventListener('click', () => {
    // Initialize and play the background music immediately
    if (ytFrame) {
      if (!ytFrame.getAttribute('src')) {
        ytFrame.src = ytFrame.getAttribute('data-src');
        ytFrame.load();
      }
      ytFrame.play().catch(error => {
        console.log("Background playback failed: ", error);
      });
    }

    page1.classList.add('leaving');
    setTimeout(() => {
      page1.classList.remove('active', 'leaving');
      page2.classList.add('active');
      spawnConfettiBurst();
    }, 850);
  });

  function spawnConfettiBurst(){
    for (let i = 0; i < 16; i++){
      const extra = makeParticle();
      extra.y = canvas.height * 0.6 + Math.random() * 100;
      extra.speed = 1 + Math.random() * 1.4;
      particles.push(extra);
    }
    // trim back down after a while so it doesn't grow forever
    setTimeout(() => { particles = particles.slice(-PARTICLE_COUNT); }, 6000);
  }


  const menuCards = document.querySelectorAll('.menu-card');
  const overlays = document.querySelectorAll('.overlay');

  menuCards.forEach(card => {
    card.addEventListener('click', () => {
      const targetId = card.getAttribute('data-target');
      openOverlay(targetId);
    });
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeOverlay(btn.getAttribute('data-close'));
    });
  });

  overlays.forEach(ov => {
    ov.addEventListener('click', (e) => {
      if (e.target === ov) closeOverlay(ov.id);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape'){
      overlays.forEach(ov => { if (ov.classList.contains('open')) closeOverlay(ov.id); });
    }
  });

  function openOverlay(id){
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('open');

    if (id === 'modalMusic') startMusicModal();
    if (id === 'sceneAbout') startAboutScene();
    if (id === 'sceneLetter') resetLetterScene();
    if (id === 'sceneMemories') startMemoriesScene();
  }

  function closeOverlay(id){
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('open');


  }


  const modalNotes = document.querySelector('.modal-notes');
  let noteInterval = null;

  ytFrame.addEventListener('error', () => {
    console.error(
      'Gold Rush video failed to load. Make sure "gold-rush.mp4" is uploaded ' +
      'in the exact same folder as index.html, and that the filename matches ' +
      'exactly (including uppercase/lowercase) — most hosts are case-sensitive.'
    );
  });

 
  function startMusicModal(){
    if (!ytFrame.getAttribute('src')) {
      ytFrame.src = ytFrame.getAttribute('data-src');
      ytFrame.load();
    }

    
    if (ytFrame.paused) {
      ytFrame.currentTime = 0;
      const playPromise = ytFrame.play();
      if (playPromise) {
        playPromise.catch(error => {
          console.log("Autoplay was prevented by the browser. User interaction might be required.", error);
        });
      }
    }

    if (!noteInterval){
      noteInterval = setInterval(() => {
        const note = document.createElement('span');
        note.className = 'floating-note';
        note.textContent = ['🎵', '🎶', '💙'][Math.floor(Math.random() * 3)];
        note.style.left = `${5 + Math.random() * 90}%`;
        note.style.animationDuration = `${4 + Math.random() * 3}s`;
        modalNotes.appendChild(note);
        setTimeout(() => note.remove(), 7000);
      }, 500);
    }
  }

  function stopMusicModal(){
  
    ytFrame.pause();

    if (noteInterval){
      clearInterval(noteInterval);
      noteInterval = null;
    }
    modalNotes.querySelectorAll('.floating-note').forEach(n => n.remove());
  }

  const WORDS = [
    'Gorgeous', 'Helpful', 'Hardworking', 'Gleeful', 'Effortless Smile',
    'Thoughtful', 'A Rare Kind of Warmth', 'Grounding', 'Effervescent', 'Kind',
    , 'Smart', 'Amazing', 'Wonderful', 'Sweet', 'Caring', 'Strong??:)',
    'Inspiring', 'Elegant', 'Radiant', 'Adorable', 'Precious', 'Brilliant',
    'Supportive', 'A Nurse with a jeans uniform', 'Lovely', 'Unique', 'Charming', 'Vomits when drunk?? I could never'
  ];

  const wordField = document.getElementById('wordField');
  let wordsBuilt = false;

  function startAboutScene(){
    if (wordsBuilt) return;
    wordsBuilt = true;

    const fieldW = wordField.clientWidth || window.innerWidth * 0.8;
    const fieldH = wordField.clientHeight || window.innerHeight * 0.6;

    WORDS.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'floating-word';
      span.textContent = word;

      
      const scale = 0.8 + Math.random() * 1.1;
      span.style.fontSize = `${scale}rem`;

      const x = Math.random() * Math.max(fieldW - 160, 40);
      const y = Math.random() * Math.max(fieldH - 50, 40);
      span.style.left = `${x}px`;
      span.style.top = `${y}px`;

      span.style.setProperty('--r0', `${(Math.random() * 6 - 3)}deg`);
      span.style.setProperty('--x1', `${Math.random() * 30 - 15}px`);
      span.style.setProperty('--y1', `${Math.random() * 30 - 15}px`);
      span.style.setProperty('--r1', `${Math.random() * 8 - 4}deg`);
      span.style.setProperty('--x2', `${Math.random() * 30 - 15}px`);
      span.style.setProperty('--y2', `${Math.random() * 30 - 15}px`);
      span.style.setProperty('--r2', `${Math.random() * 8 - 4}deg`);
      span.style.setProperty('--x3', `${Math.random() * 30 - 15}px`);
      span.style.setProperty('--y3', `${Math.random() * 30 - 15}px`);
      span.style.setProperty('--r3', `${Math.random() * 8 - 4}deg`);

      span.style.animationDuration = `${8 + Math.random() * 8}s`;
      span.style.animationDelay = `${Math.random() * -8}s`;

      span.addEventListener('mouseenter', (e) => spawnSparkle(e, span));

      wordField.appendChild(span);
    });
  }

  function spawnSparkle(e, parent){
    for (let i = 0; i < 4; i++){
      const s = document.createElement('span');
      s.className = 'hover-sparkle';
      s.textContent = '✨';
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.animationDelay = `${i * 0.05}s`;
      parent.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
  }

 
  const LETTER_MESSAGE = `Happy Birthday, Polgen 💙

I actually don't have any idea what to say to you, but I hope you realize just how much light you bring into the lives of everyone around you likeeee 90%, -10% kasi di ka sumama sa Puerto Galera hahahah. Your smile has a way of making difficult days feel lighter.

You are beautiful not only for your looks, but also for your heart, your warmth, and the way you care for others. The world is so much better because you're in it.

May this year give you happiness, success, and memories that will remain in your treasury of beautiful moments for a lifetime. Continue being the amazing person that you are.

Happy Birthday once again, and may all of your dreams come true. 💙✨`;

  const envelope = document.getElementById('envelope');
  const envelopeWrap = document.getElementById('envelopeWrap');
  const envelopeHint = document.getElementById('envelopeHint');
  const letterText = document.getElementById('letterText');
  let letterTyped = false;
  let typingTimer = null;

  function resetLetterScene(){

    if (!envelope.classList.contains('is-open')){
      envelope.addEventListener('click', openEnvelopeOnce);
    }
  }

  function openEnvelopeOnce(){
    envelope.classList.add('is-open');
    envelopeWrap.classList.add('opened');
    envelope.removeEventListener('click', openEnvelopeOnce);

    if (!letterTyped){
      letterTyped = true;
      setTimeout(typeLetter, 500);
    }
  }

  function typeLetter(){
    let i = 0;
    letterText.textContent = '';
    clearInterval(typingTimer);
    typingTimer = setInterval(() => {
      letterText.textContent += LETTER_MESSAGE.charAt(i);
      i++;
      if (i >= LETTER_MESSAGE.length){
        clearInterval(typingTimer);
      }
    }, 60);
  }


  const PHOTOS = [
    { src: 'Screenshot 2026-07-16 211600.png', caption: 'Cute ni Lola' },
    { src: 'Screenshot 2026-07-16 214505.png', caption: 'Unfiltered warmth' },
    { src: 'Screenshot 2026-07-16 211819.png', caption: 'Me, pag may kasalanan kay mama' },
    { src: 'Screenshot 2026-07-16 213959.png', caption: 'Green Ribbon ngani' },
    { src: 'a12d67d7-8519-47ff-a4b2-8dcba03a4d81.jpg', caption: 'Daragang Magayon💙' }
  ];

  const track = document.getElementById('carouselTrack');
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');

  let carouselBuilt = false;
  let currentSlide = 0;

  function startMemoriesScene(){
    if (!carouselBuilt){
      buildCarousel();
      carouselBuilt = true;
    }
    goToSlide(0);
  }

  function buildCarousel(){
    PHOTOS.forEach((photo, i) => {
      const slide = document.createElement('div');
      slide.className = 'polaroid';

      const tilt = (i % 2 === 0 ? -1 : 1) * (2 + Math.random() * 3);

      slide.innerHTML = `
        <div class="polaroid-frame" style="--tilt:${tilt}deg">
          <img src="${photo.src}" alt="${photo.caption}" loading="lazy">
          <p class="polaroid-caption">${photo.caption}</p>
        </div>
      `;
      track.appendChild(slide);

      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.addEventListener('click', () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });
  }

  function goToSlide(index){
    const total = PHOTOS.length;
    currentSlide = (index + total) % total;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    document.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

});
