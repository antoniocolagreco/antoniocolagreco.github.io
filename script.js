const page = document.querySelector(".page");
const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const windAtmosphere = document.querySelector("[data-wind-atmosphere]");
const leafAtmosphere = document.querySelector("[data-leaf-atmosphere]");
const fullImages = document.querySelectorAll("[data-full-image]");

for (const image of fullImages) {
  const placeholder = document.querySelector(
    `[data-placeholder-for="${image.id}"]`,
  );

  const revealImage = async () => {
    try {
      await image.decode();
    } catch {
      if (!image.naturalWidth) {
        return;
      }
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const hidePlaceholder = () => {
          placeholder?.classList.add("scene__placeholder--hidden");
        };

        if (reducedMotion.matches) {
          hidePlaceholder();
        } else if (placeholder) {
          placeholder.addEventListener("transitionend", hidePlaceholder, {
            once: true,
          });
          placeholder.classList.add("scene__placeholder--fading");
        }

        image.classList.add("scene__image--loaded");
      });
    });
  };

  if (image.complete && image.naturalWidth > 0) {
    revealImage();
  } else {
    image.addEventListener("load", revealImage, { once: true });
  }
}

let targetX = 0;
let targetY = 0;
let pendingX = 0;
let pendingY = 0;
let currentX = 0;
let currentY = 0;
let velocityX = 0;
let velocityY = 0;
let animationFrame = 0;
let previousFrameTime = 0;
let pointerStopTimer = 0;

const pointerStopDelay = 0;
const springStrength = 3;
const springDamping = 2.3;

function renderParallax(time) {
  const delta = previousFrameTime
    ? Math.min((time - previousFrameTime) / 1000, 1 / 30)
    : 0;
  previousFrameTime = time;

  velocityX += (targetX - currentX) * springStrength * delta;
  velocityY += (targetY - currentY) * springStrength * delta;

  const damping = Math.exp(-springDamping * delta);
  velocityX *= damping;
  velocityY *= damping;

  currentX += velocityX * delta;
  currentY += velocityY * delta;

  root.style.setProperty("--pointer-x", currentX.toFixed(4));
  root.style.setProperty("--pointer-y", currentY.toFixed(4));

  const stillMoving =
    Math.abs(targetX - currentX) > 0.0005 ||
    Math.abs(targetY - currentY) > 0.0005 ||
    Math.abs(velocityX) > 0.0005 ||
    Math.abs(velocityY) > 0.0005;

  if (stillMoving) {
    animationFrame = window.requestAnimationFrame(renderParallax);
    return;
  }

  currentX = targetX;
  currentY = targetY;
  velocityX = 0;
  velocityY = 0;
  animationFrame = 0;
}

function startAnimation() {
  if (!animationFrame) {
    previousFrameTime = 0;
    animationFrame = window.requestAnimationFrame(renderParallax);
  }
}

function commitPointerTarget() {
  targetX = pendingX;
  targetY = pendingY;
  startAnimation();
}

function handlePointerMove(event) {
  if (reducedMotion.matches || event.pointerType === "touch") {
    return;
  }

  pendingX = -(event.clientX / window.innerWidth - 0.5) * 2;
  pendingY = -(event.clientY / window.innerHeight - 0.5) * 2;

  window.clearTimeout(pointerStopTimer);
  pointerStopTimer = window.setTimeout(commitPointerTarget, pointerStopDelay);
}

function resetParallax() {
  window.clearTimeout(pointerStopTimer);
  pendingX = 0;
  pendingY = 0;
  targetX = 0;
  targetY = 0;
  startAnimation();
}

page?.addEventListener("pointermove", handlePointerMove, { passive: true });
page?.addEventListener("pointerleave", resetParallax);

if (windAtmosphere && leafAtmosphere && !reducedMotion.matches) {
  const windContext = windAtmosphere.getContext("2d");
  const leafContext = leafAtmosphere.getContext("2d");
  const leaves = [];
  const windStreaks = [];
  const mobileWindCount = 4;
  const desktopWindCount = 8;
  const windPrimaryColor = "#fff8d6";
  const windSecondaryOpacity = 0.68;
  const windBandTopRatio = 0.14;
  const windBandBottomRatio = 0.76;
  const windPathStrokePadding = 2;
  const windVerticalGap = 12;
  const windHorizontalGap = 28;
  const windPositionAttempts = 48;
  const windMinimumLength = 90;
  const windLengthRatio = 0.65;
  const windMaximumLength = 285;
  const windSpeed = 48;
  const windMinimumSpawnDelay = 2000;
  const windMaximumSpawnDelay = 4000;
  const windSpawnRetryDelay = 250;
  let atmosphereFrame = 0;
  let previousTime = performance.now();
  let viewportWidth = 0;
  let viewportHeight = 0;
  let windBandTop = 0;
  let windBandBottom = 0;
  let nextWindSpawnTime = 0;

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

  function getWindPathExtents(amplitude) {
    const mainCurveExtent = amplitude * 2;
    const secondaryCurveExtent = Math.max(
      mainCurveExtent,
      amplitude + 5,
      8 - amplitude,
    );

    return {
      top: mainCurveExtent + windPathStrokePadding,
      bottom: secondaryCurveExtent + windPathStrokePadding,
    };
  }

  function randomizeWind(streak) {
    const maximumLength = Math.min(viewportWidth * 0.27, windMaximumLength);
    const minimumLength = Math.min(
      maximumLength,
      Math.max(windMinimumLength, maximumLength * windLengthRatio),
    );

    streak.length =
      minimumLength + Math.random() * (maximumLength - minimumLength);
    streak.amplitude = 7 + Math.random() * 5;
    streak.speed = windSpeed;
    streak.phase = Math.random() * Math.PI * 2;
    streak.opacity = 0.24 + Math.random() * 0.12;
    streak.width = Math.random() > 0.5 ? 3 : 2;
  }

  function getWindBounds(streak) {
    const pathExtents = getWindPathExtents(streak.amplitude);

    return {
      left: streak.x - streak.length - windPathStrokePadding,
      right: streak.x + windPathStrokePadding,
      top: streak.y - pathExtents.top,
      bottom: streak.y + pathExtents.bottom,
    };
  }

  function hasHorizontalSpace(streak) {
    const candidate = getWindBounds(streak);

    return windStreaks.every((otherStreak) => {
      if (!otherStreak.active || otherStreak === streak) {
        return true;
      }

      const other = getWindBounds(otherStreak);
      return (
        candidate.right + windHorizontalGap <= other.left ||
        candidate.left >= other.right + windHorizontalGap
      );
    });
  }

  function positionWindVertically(streak) {
    const pathExtents = getWindPathExtents(streak.amplitude);
    const minimumY = windBandTop + pathExtents.top;
    const maximumY = windBandBottom - pathExtents.bottom;

    if (minimumY > maximumY) {
      return false;
    }

    for (let attempt = 0; attempt < windPositionAttempts; attempt += 1) {
      streak.y = minimumY + Math.random() * (maximumY - minimumY);
      const candidate = getWindBounds(streak);
      const hasSpace = windStreaks.every((otherStreak) => {
        if (!otherStreak.active || otherStreak === streak) {
          return true;
        }

        const other = getWindBounds(otherStreak);
        return (
          candidate.bottom + windVerticalGap <= other.top ||
          candidate.top >= other.bottom + windVerticalGap
        );
      });

      if (hasSpace) {
        return true;
      }
    }

    return false;
  }

  function prepareWind(streak, headX = null) {
    for (let attempt = 0; attempt < windPositionAttempts; attempt += 1) {
      randomizeWind(streak);
      streak.x =
        headX ?? viewportWidth + streak.length + windPathStrokePadding;

      if (hasHorizontalSpace(streak) && positionWindVertically(streak)) {
        streak.active = true;
        return true;
      }
    }

    streak.active = false;
    return false;
  }

  function scheduleNextWind(time) {
    nextWindSpawnTime =
      time +
      windMinimumSpawnDelay +
      Math.random() * (windMaximumSpawnDelay - windMinimumSpawnDelay);
  }

  function spawnWind(time) {
    const streak = windStreaks.find((candidate) => !candidate.active);

    if (!streak || !prepareWind(streak)) {
      nextWindSpawnTime = time + windSpawnRetryDelay;
      return;
    }

    scheduleNextWind(time);
  }

  function seedWindField(time) {
    let nextHeadX = null;

    for (const streak of windStreaks) {
      if (nextHeadX !== null && nextHeadX <= 0) {
        break;
      }

      if (!prepareWind(streak, nextHeadX)) {
        continue;
      }

      const bounds = getWindBounds(streak);
      nextHeadX =
        bounds.left -
        windHorizontalGap -
        windPathStrokePadding -
        Math.random() * windHorizontalGap;
    }

    scheduleNextWind(time);
  }

  function resizeAtmosphere() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    windAtmosphere.width = Math.round(viewportWidth * pixelRatio);
    windAtmosphere.height = Math.round(viewportHeight * pixelRatio);
    leafAtmosphere.width = Math.round(viewportWidth * pixelRatio);
    leafAtmosphere.height = Math.round(viewportHeight * pixelRatio);
    windContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    windContext.imageSmoothingEnabled = false;
    leafContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    leafContext.imageSmoothingEnabled = false;

    const leafCount = viewportWidth < 760 ? 3 : 5;
    const windCount = viewportWidth < 760 ? mobileWindCount : desktopWindCount;
    windBandTop = viewportHeight * windBandTopRatio;
    windBandBottom = viewportHeight * windBandBottomRatio;

    leaves.length = leafCount;
    windStreaks.length = windCount;

    for (let index = 0; index < leafCount; index += 1) {
      leaves[index] ??= {};
      resetLeaf(leaves[index], true);
    }

    for (let index = 0; index < windCount; index += 1) {
      windStreaks[index] ??= {};
      windStreaks[index].active = false;
    }

    seedWindField(performance.now());
  }

  function drawLeaf(leaf) {
    leafContext.save();
    leafContext.globalAlpha = leaf.opacity;
    leafContext.translate(Math.round(leaf.x), Math.round(leaf.y));
    leafContext.rotate(leaf.rotation);

    leafContext.fillStyle = "#30351f";
    leafContext.beginPath();
    leafContext.moveTo(-leaf.size * 0.55, 0);
    leafContext.lineTo(-leaf.size * 0.2, -leaf.size * 0.34);
    leafContext.lineTo(leaf.size * 0.3, -leaf.size * 0.25);
    leafContext.lineTo(leaf.size * 0.52, 0);
    leafContext.lineTo(leaf.size * 0.18, leaf.size * 0.32);
    leafContext.lineTo(-leaf.size * 0.3, leaf.size * 0.22);
    leafContext.closePath();
    leafContext.fill();

    leafContext.scale(0.78, 0.78);
    leafContext.fillStyle = leaf.color;
    leafContext.fill();
    leafContext.fillStyle = "#d1ae62";
    leafContext.fillRect(-leaf.size * 0.42, -1, leaf.size * 0.76, 2);
    leafContext.fillStyle = "#4b512a";
    leafContext.fillRect(leaf.size * 0.28, -1, leaf.size * 0.38, 2);
    leafContext.restore();
  }

  function drawWind(streak) {
    if (!streak.active) {
      return;
    }

    const halfLength = streak.length * 0.5;
    const wave = Math.sin(streak.phase) * streak.amplitude;

    windContext.save();
    windContext.globalAlpha = streak.opacity;
    windContext.strokeStyle = windPrimaryColor;
    windContext.lineWidth = streak.width;
    windContext.lineCap = "round";
    windContext.beginPath();
    windContext.moveTo(streak.x, streak.y);
    windContext.bezierCurveTo(
      streak.x - halfLength * 0.45,
      streak.y - streak.amplitude + wave,
      streak.x - halfLength * 1.25,
      streak.y + streak.amplitude + wave,
      streak.x - streak.length,
      streak.y + wave * 0.25,
    );
    windContext.stroke();

    windContext.globalAlpha = streak.opacity * windSecondaryOpacity;
    windContext.beginPath();
    windContext.moveTo(streak.x - streak.length * 0.18, streak.y + 7);
    windContext.bezierCurveTo(
      streak.x - streak.length * 0.43,
      streak.y + streak.amplitude + 5,
      streak.x - streak.length * 0.7,
      streak.y - streak.amplitude + 8,
      streak.x - streak.length * 0.86,
      streak.y + 4,
    );
    windContext.stroke();
    windContext.restore();
  }

  function renderAtmosphere(time) {
    const delta = Math.min((time - previousTime) / 1000, 0.04);
    previousTime = time;
    const slowWind = 0.72 + Math.sin(time * 0.00024) * 0.16;
    const gust = slowWind + Math.max(0, Math.sin(time * 0.000071)) ** 6 * 0.8;

    windContext.clearRect(0, 0, viewportWidth, viewportHeight);
    leafContext.clearRect(0, 0, viewportWidth, viewportHeight);

    for (const streak of windStreaks) {
      if (!streak.active) {
        continue;
      }

      streak.phase += delta * 0.8;
      streak.x -= streak.speed * gust * delta;

      if (streak.x < -windPathStrokePadding) {
        streak.active = false;
        continue;
      }

      drawWind(streak);
    }

    if (time >= nextWindSpawnTime) {
      spawnWind(time);
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

    windContext.globalAlpha = 1;
    leafContext.globalAlpha = 1;
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
