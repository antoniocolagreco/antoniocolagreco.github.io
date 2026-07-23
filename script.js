const page = document.querySelector(".page");
const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const atmosphere = document.querySelector("[data-atmosphere]");

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

if (atmosphere && !reducedMotion.matches) {
  const context = atmosphere.getContext("2d");
  const leaves = [];
  const windStreaks = [];
  let atmosphereFrame = 0;
  let previousTime = performance.now();
  let viewportWidth = 0;
  let viewportHeight = 0;

  function resetLeaf(leaf, initial = false) {
    leaf.x = initial
      ? viewportWidth * 0.58 + Math.random() * viewportWidth * 0.5
      : viewportWidth + 30 + Math.random() * viewportWidth * 0.2;
    leaf.y = initial
      ? Math.random() * viewportHeight * 0.68
      : -30 + Math.random() * viewportHeight * 0.38;
    leaf.size = 12 + Math.floor(Math.random() * 7);
    leaf.speed = 18 + Math.random() * 18;
    leaf.fall = 8 + Math.random() * 12;
    leaf.phase = Math.random() * Math.PI * 2;
    leaf.sway = 12 + Math.random() * 20;
    leaf.rotation = Math.random() * Math.PI;
    leaf.spin = (Math.random() - 0.5) * 1.7;
    leaf.opacity = 0.68 + Math.random() * 0.24;
    leaf.color = Math.random() > 0.45 ? "#b18a3e" : "#65743a";
  }

  function resetWind(streak, initial = false) {
    streak.length = Math.min(viewportWidth * 0.27, 200 + Math.random() * 170);
    streak.x = initial
      ? Math.random() * (viewportWidth + streak.length)
      : viewportWidth + streak.length + Math.random() * 120;
    streak.y = viewportHeight * 0.14 + Math.random() * viewportHeight * 0.62;
    streak.speed = 34 + Math.random() * 28;
    streak.amplitude = 7 + Math.random() * 12;
    streak.phase = Math.random() * Math.PI * 2;
    streak.opacity = 0.1 + Math.random() * 0.1;
    streak.width = Math.random() > 0.5 ? 2 : 1;
  }

  function resizeAtmosphere() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    atmosphere.width = Math.round(viewportWidth * pixelRatio);
    atmosphere.height = Math.round(viewportHeight * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.imageSmoothingEnabled = false;

    const leafCount = viewportWidth < 760 ? 3 : 5;
    const windCount = viewportWidth < 760 ? 2 : 4;

    leaves.length = leafCount;
    windStreaks.length = windCount;

    for (let index = 0; index < leafCount; index += 1) {
      leaves[index] ??= {};
      resetLeaf(leaves[index], true);
    }

    for (let index = 0; index < windCount; index += 1) {
      windStreaks[index] ??= {};
      resetWind(windStreaks[index], true);
    }
  }

  function drawLeaf(leaf) {
    context.save();
    context.globalAlpha = leaf.opacity;
    context.translate(Math.round(leaf.x), Math.round(leaf.y));
    context.rotate(leaf.rotation);

    context.fillStyle = "#30351f";
    context.beginPath();
    context.moveTo(-leaf.size * 0.55, 0);
    context.lineTo(-leaf.size * 0.2, -leaf.size * 0.34);
    context.lineTo(leaf.size * 0.3, -leaf.size * 0.25);
    context.lineTo(leaf.size * 0.52, 0);
    context.lineTo(leaf.size * 0.18, leaf.size * 0.32);
    context.lineTo(-leaf.size * 0.3, leaf.size * 0.22);
    context.closePath();
    context.fill();

    context.scale(0.78, 0.78);
    context.fillStyle = leaf.color;
    context.fill();
    context.fillStyle = "#d1ae62";
    context.fillRect(-leaf.size * 0.42, -1, leaf.size * 0.76, 2);
    context.fillStyle = "#4b512a";
    context.fillRect(leaf.size * 0.28, -1, leaf.size * 0.38, 2);
    context.restore();
  }

  function drawWind(streak) {
    const halfLength = streak.length * 0.5;
    const wave = Math.sin(streak.phase) * streak.amplitude;

    context.save();
    context.globalAlpha = streak.opacity;
    context.strokeStyle = "#fff2cf";
    context.lineWidth = streak.width;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(streak.x, streak.y);
    context.bezierCurveTo(
      streak.x - halfLength * 0.45,
      streak.y - streak.amplitude + wave,
      streak.x - halfLength * 1.25,
      streak.y + streak.amplitude + wave,
      streak.x - streak.length,
      streak.y + wave * 0.25,
    );
    context.stroke();

    context.globalAlpha = streak.opacity * 0.58;
    context.beginPath();
    context.moveTo(streak.x - streak.length * 0.18, streak.y + 7);
    context.bezierCurveTo(
      streak.x - streak.length * 0.43,
      streak.y + streak.amplitude + 5,
      streak.x - streak.length * 0.7,
      streak.y - streak.amplitude + 8,
      streak.x - streak.length * 0.86,
      streak.y + 4,
    );
    context.stroke();
    context.restore();
  }

  function renderAtmosphere(time) {
    const delta = Math.min((time - previousTime) / 1000, 0.04);
    previousTime = time;
    const slowWind = 0.72 + Math.sin(time * 0.00024) * 0.16;
    const gust = slowWind + Math.max(0, Math.sin(time * 0.000071)) ** 6 * 0.8;

    context.clearRect(0, 0, viewportWidth, viewportHeight);

    for (const streak of windStreaks) {
      streak.phase += delta * 0.8;
      streak.x -= streak.speed * gust * delta;
      drawWind(streak);

      if (streak.x < -streak.length) {
        resetWind(streak);
      }
    }

    for (const leaf of leaves) {
      leaf.phase += delta * 1.6;
      leaf.x -= leaf.speed * gust * delta;
      leaf.y += (leaf.fall + Math.sin(leaf.phase) * leaf.sway) * delta;
      leaf.rotation += leaf.spin * delta;
      drawLeaf(leaf);

      if (leaf.x < -30 || leaf.y > viewportHeight + 30) {
        resetLeaf(leaf);
      }
    }

    context.globalAlpha = 1;
    atmosphereFrame = window.requestAnimationFrame(renderAtmosphere);
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      window.cancelAnimationFrame(atmosphereFrame);
      atmosphereFrame = 0;
      return;
    }

    if (!atmosphereFrame) {
      previousTime = performance.now();
      atmosphereFrame = window.requestAnimationFrame(renderAtmosphere);
    }
  }

  resizeAtmosphere();
  atmosphereFrame = window.requestAnimationFrame(renderAtmosphere);
  window.addEventListener("resize", resizeAtmosphere, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);
}
