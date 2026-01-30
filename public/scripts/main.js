// DOM Elements
const noBtn = document.getElementById("no");
const yesBtn = document.getElementById("yes");
const response = document.getElementById("response");
const stars = document.getElementById("stars");
const buttonsContainer = document.querySelector('.buttons-container');
const photoFrames = document.querySelectorAll('.photo-frame');

// Variables
let isHoldingNo = false;
let noButtonSpeed = 0.3;
let lastMoveTime = 0;
let mouseMoveTimeout;

// Initialize Stars
function initializeStars() {
  for (let i = 0; i < 70; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = Math.random() * 100 + "vw";
    star.style.top = Math.random() * 100 + "vh";
    star.style.animationDelay = Math.random() * 2 + "s";
    star.style.opacity = 0.3 + Math.random() * 0.7;
    stars.appendChild(star);
  }
}

// Position No Button Initially
function positionNoButtonInitially() {
  const yesRect = yesBtn.getBoundingClientRect();
  const containerRect = buttonsContainer.getBoundingClientRect();
  
  const noX = yesRect.right + 20 - containerRect.left;
  const noY = (containerRect.height - noBtn.offsetHeight) / 2;
  
  noBtn.style.left = noX + 'px';
  noBtn.style.top = noY + 'px';
}

// Move No Button Sharply
function moveNoButtonSharply() {
  const containerRect = buttonsContainer.getBoundingClientRect();
  const btnWidth = noBtn.offsetWidth;
  const btnHeight = noBtn.offsetHeight;
  
  const padding = 10;
  const maxX = containerRect.width - btnWidth - padding;
  const maxY = containerRect.height - btnHeight - padding;
  
  const positions = [
    {x: padding, y: padding},
    {x: maxX, y: padding},
    {x: padding, y: maxY},
    {x: maxX, y: maxY},
    {x: padding, y: maxY/2},
    {x: maxX, y: maxY/2},
    {x: maxX/2, y: padding},
    {x: maxX/2, y: maxY},
  ];
  
  let newX, newY;
  if (Math.random() > 0.5) {
    const randomPos = positions[Math.floor(Math.random() * positions.length)];
    newX = randomPos.x;
    newY = randomPos.y;
  } else {
    newX = Math.max(padding, Math.random() * maxX);
    newY = Math.max(padding, Math.random() * maxY);
  }
  
  noBtn.style.transition = `left ${noButtonSpeed}s linear, top ${noButtonSpeed}s linear`;
  noBtn.style.left = newX + 'px';
  noBtn.style.top = newY + 'px';
  
  setTimeout(() => {
    noBtn.style.transition = '';
  }, noButtonSpeed * 1000);
}

// Handle Mouse Move
function handleMouseMove(e) {
  const now = Date.now();
  const moveCooldown = 300;
  
  if (now - lastMoveTime < moveCooldown) return;
  
  clearTimeout(mouseMoveTimeout);
  mouseMoveTimeout = setTimeout(() => {
    const r = noBtn.getBoundingClientRect();
    const btnCenterX = r.left + r.width / 2;
    const btnCenterY = r.top + r.height / 2;
    
    const dx = e.clientX - btnCenterX;
    const dy = e.clientY - btnCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 120 && !isHoldingNo) {
      moveNoButtonSharply();
      lastMoveTime = now;
      
      const messages = [
        "Whoosh! Too fast for you! 😉",
        "Can't catch me! 🏃‍♂️",
        "My love is quicker! ⚡",
        "Missed me! 😄",
        "Try harder! 💖"
      ];
      response.innerHTML = messages[Math.floor(Math.random() * messages.length)];
    }
  }, 30);
}

// Handle Yes Button Click
function handleYesClick() {
  response.innerHTML = "You just made me the happiest person! 💖<br>I can't wait for our Valentine's date! 🌹";
  
  noBtn.style.display = 'none';
  yesBtn.style.transform = 'scale(1.2)';
  yesBtn.innerHTML = "You Said Yes! 💕";
  
  // Confetti Effects
  confetti({ particleCount: 250, spread: 100, origin: { y: 0.6 } });
  setTimeout(() => confetti({ particleCount: 200, spread: 120, colors: ['#ff4d6d', '#ff8fab', '#ffb3c6'] }), 300);
  setTimeout(() => confetti({ particleCount: 150, spread: 90, origin: { x: 0.3, y: 0.6 } }), 600);
  setTimeout(() => confetti({ particleCount: 150, spread: 90, origin: { x: 0.7, y: 0.6 } }), 900);
  
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      shapes: ['heart'],
      colors: ['#ff4d6d']
    });
  }, 1200);
  
  // Additional Star Effects
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const star = document.createElement("div");
      star.className = "star";
      star.style.width = "6px";
      star.style.height = "6px";
      star.style.left = Math.random() * 100 + "vw";
      star.style.top = Math.random() * 100 + "vh";
      star.style.background = i % 3 === 0 ? "#ff4d6d" : (i % 3 === 1 ? "#ffb3c6" : "#fff");
      star.style.animation = "twinkle 1s infinite ease-in-out";
      stars.appendChild(star);
      
      setTimeout(() => star.remove(), 1000);
    }, i * 40);
  }
  
  // Final Message
  setTimeout(() => {
    response.innerHTML = "You just made me the happiest person! 💖<br>I can't wait for our Valentine's date on February 12th! 🌹<br><br><small>(Had to adjust for cricket matches, but it'll be just as special! 🏏❤️)</small>";
  }, 1000);
}

// Handle No Button Events
function handleNoHover() {
  if (!isHoldingNo) {
    moveNoButtonSharply();
    
    const messages = [
      "Nope! Not that easy! 😉",
      "You'll have to be quicker! 🏃‍♂️",
      "Missed again! 😄",
      "My love is slippery! 💖",
      "Can't click what you can't catch! 🥺"
    ];
    response.innerHTML = messages[Math.floor(Math.random() * messages.length)];
  }
}

function handleNoMouseDown(e) {
  isHoldingNo = true;
  e.preventDefault();
  
  setTimeout(() => {
    moveNoButtonSharply();
    isHoldingNo = false;
  }, 100);
}

function handleNoClick(e) {
  e.preventDefault();
  isHoldingNo = false;
  
  const messages = [
    "You can't escape my love that easily! 💘",
    "Come on, give me a chance! 😉",
    "My heart is begging here! 🥺",
    "Try again! I'm persistent! 💖",
    "You're making this hard on purpose! 😄"
  ];
  response.innerHTML = messages[Math.floor(Math.random() * messages.length)];
}

// Handle Photo Frame Click
function handlePhotoFrameClick() {
  this.style.transform = 'scale(0.95)';
  setTimeout(() => {
    this.style.transform = '';
  }, 150);
}

// Initialize Event Listeners
function initializeEventListeners() {
  // Mouse move for dodging effect
  document.addEventListener("mousemove", handleMouseMove);
  
  // No button events
  noBtn.addEventListener("mouseover", handleNoHover);
  noBtn.addEventListener("mousedown", handleNoMouseDown);
  noBtn.addEventListener("click", handleNoClick);
  
  // Yes button event
  yesBtn.addEventListener("click", handleYesClick);
  
  // Photo frame events
  photoFrames.forEach(frame => {
    frame.addEventListener('click', handlePhotoFrameClick);
  });
  
  // Window resize event
  window.addEventListener('resize', positionNoButtonInitially);
}

// Initialize Application
function init() {
  initializeStars();
  positionNoButtonInitially();
  initializeEventListeners();
  
  console.log("💖 Valentine's Proposal initialized successfully!");
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);