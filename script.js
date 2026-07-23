const page = document.querySelector(".page");
const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let animationFrame = 0;

function renderParallax() {
  currentX += (targetX - currentX) * 0.08;
  currentY += (targetY - currentY) * 0.08;

  root.style.setProperty("--pointer-x", currentX.toFixed(4));
  root.style.setProperty("--pointer-y", currentY.toFixed(4));

  const stillMoving = Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001;
  animationFrame = stillMoving ? window.requestAnimationFrame(renderParallax) : 0;
}

function startAnimation() {
  if (!animationFrame) {
    animationFrame = window.requestAnimationFrame(renderParallax);
  }
}

function handlePointerMove(event) {
  if (reducedMotion.matches || event.pointerType === "touch") {
    return;
  }

  targetX = (event.clientX / window.innerWidth - 0.5) * 2;
  targetY = (event.clientY / window.innerHeight - 0.5) * 2;
  startAnimation();
}

function resetParallax() {
  targetX = 0;
  targetY = 0;
  startAnimation();
}

page?.addEventListener("pointermove", handlePointerMove, { passive: true });
page?.addEventListener("pointerleave", resetParallax);
