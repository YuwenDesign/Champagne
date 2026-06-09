const places = {
  reims: {
    title: "Reims",
    region: "Montagne de Reims",
    note: "Vineyard roads, pale distance, and the first quiet green outside the city.",
  },
  epernay: {
    title: "Epernay",
    region: "Vallee de la Marne",
    note: "Champagne houses, pale roads, and vines folding softly into the hills.",
  },
  ay: {
    title: "Ay",
    region: "Grand Cru village",
    note: "Small streets, low roofs, and vineyards that feel close enough to touch.",
  },
  troyes: {
    title: "Troyes",
    region: "Aube",
    note: "Old stone, cellar stairs, and the darker texture of the travel archive.",
  },
};

const photoFiles = Array.from(
  { length: 60 },
  (_, index) => `images/champagne-${String(index + 1).padStart(3, "0")}.jpeg`,
);

const featuredPhotoCopy = {
  0: {
    location: "Troyes",
    title: "Cellar Stair",
    caption: "A spiral of cellar metal and old stone, looking up toward light.",
  },
  1: {
    location: "Reims",
    title: "Road Through Green",
    caption: "A hillside road seen from the car, soft with afternoon distance.",
  },
  2: {
    location: "Ay",
    title: "Small House on the Hill",
    caption: "A single house held by the vineyard horizon and pale blue air.",
  },
  3: {
    location: "Epernay",
    title: "Between the Vines",
    caption: "A long road through vineyards, the itinerary opening into green.",
  },
  4: {
    location: "Epernay",
    title: "Two Glasses",
    caption: "A tasting table, two glasses, and the warm theatre of Champagne.",
  },
};

const locationCycle = ["Reims", "Epernay", "Ay", "Troyes"];

const photos = photoFiles.map((src, index) => {
  const copy = featuredPhotoCopy[index];
  return {
    src,
    location: copy?.location || locationCycle[index % locationCycle.length],
    title: copy?.title || `Champagne Frame ${String(index + 1).padStart(2, "0")}`,
    caption: copy?.caption || "A quiet frame from the Champagne travel archive.",
  };
});

const pins = document.querySelectorAll(".map-pin");
const placeRegion = document.querySelector("#place-region");
const placeTitle = document.querySelector("#place-title");
const placeNote = document.querySelector("#place-note");
const placeCard = document.querySelector("[data-place-card]");
const closePlace = document.querySelector("[data-close-place]");
const jumpGallery = document.querySelector("[data-jump-gallery]");
const largePhoto = document.querySelector("#large-photo");
const photoLocation = document.querySelector("#photo-location");
const photoTitle = document.querySelector("#photo-title");
const photoCaption = document.querySelector("#photo-caption");
const thumbList = document.querySelector(".thumb-list");
const gallerySection = document.querySelector("#gallery");
const galleryMain = document.querySelector(".gallery-main");
const toastCursor = document.querySelector(".toast-cursor");
const bubbleLayer = document.querySelector(".bubble-layer");
const coverPreview = document.querySelector(".cover-preview");
const coverImage = document.querySelector("#cover-image");
const coverPlace = document.querySelector("#cover-place");
const coverPicker = document.querySelector(".cover-picker");
const coverOptions = document.querySelectorAll("[data-style]");
const discArt = document.querySelector("#disc-art");
const coverArtistInput = document.querySelector("[data-cover-artist]");
const coverTitleInput = document.querySelector("[data-cover-title]");
const coverArtist = document.querySelector("#cover-artist");
const coverTitleText = document.querySelector("#cover-title-text");
const discRingTitle = document.querySelector("#disc-ring-title");
const downloadCover = document.querySelector("[data-download-cover]");
const bgmToggle = document.querySelector("[data-bgm-toggle]");
const bgmAudio = document.querySelector("[data-bgm-audio]");
const memorySection = document.querySelector("#memory");
const memoryStage = document.querySelector("[data-memory-stage]");
const memoryCamera = document.querySelector("[data-memory-camera]");
const memoryCanvas = document.querySelector("[data-memory-canvas]");
const memoryBaseVideo = document.querySelector("[data-memory-base-video]");
const memoryRevealVideo = document.querySelector("[data-memory-reveal-video]");
const memoryClip = document.querySelector("[data-memory-clip]");
const memoryStart = document.querySelector("[data-memory-start]");
const memoryNext = document.querySelector("[data-memory-next]");

let currentPhoto = 3;
let currentCoverPhoto = 0;
let currentCoverStyle = "archive";
const bgmTrackUrl = "audio/glowing-frames.mp3";
const memoryVideos = [
  "video/memory-01.mp4",
  "video/memory-02.mp4",
  "video/memory-03.mp4",
  "video/memory-04.mp4",
];
let processedCoverUrl;
let currentMemory = -1;
let nextMemory = 0;
let pinchWasClosed = false;
let tearCommitted = false;
let memoryTears = [];
let activeMemoryTear = null;
let memoryFabricPoints = [];
let memoryFabricConstraints = [];
let memoryFabricEdges = new Set();
let memoryFabricCols = 0;
let memoryFabricRows = 0;
let lastHandLandmarks = null;
let memoryAnimationStarted = false;
const handTearStates = new Map();
const maxMemoryTears = 7;
const fabricSettings = {
  gravity: 0.055,
  friction: 0.985,
  spacing: 34,
  tearDistance: 118,
  iterations: 4,
};
const legacyPhotoClasses = [
  "reims-one",
  "epernay-one",
  "ay-one",
  "troyes-one",
  "tasting-one",
];

function setPlace(placeKey) {
  const place = places[placeKey];

  pins.forEach((pin) => {
    pin.classList.toggle("active", pin.dataset.place === placeKey);
  });

  placeRegion.textContent = place.region;
  placeTitle.textContent = place.title;
  placeNote.textContent = place.note;
  placeCard.classList.add("open");

  const matchingIndex = photos.findIndex(
    (photo) => photo.location.toLowerCase() === place.title.toLowerCase(),
  );
  if (matchingIndex >= 0) {
    setPhoto(matchingIndex);
  }
}

function resetPhotoClass(element) {
  legacyPhotoClasses.forEach((className) => element.classList.remove(className));
}

function setPhotoBackground(element, photo, withShade = true) {
  const shade = withShade
    ? "linear-gradient(180deg, rgba(23, 23, 19, 0.03), rgba(23, 23, 19, 0.2)), "
    : "";
  element.style.backgroundImage = `${shade}url("${photo.src}")`;
}

function clearProcessedCover() {
  if (processedCoverUrl) {
    URL.revokeObjectURL(processedCoverUrl);
    processedCoverUrl = null;
  }
  coverImage.style.backgroundImage = "";
  discArt.style.backgroundImage = "";
}

function setPhoto(index) {
  const photo = photos[index];
  currentPhoto = index;

  largePhoto.classList.add("switching");

  window.setTimeout(() => {
    resetPhotoClass(largePhoto);
    setPhotoBackground(largePhoto, photo);
    largePhoto.classList.remove("switching");
  }, 120);

  if (photoLocation) {
    photoLocation.textContent = photo.location;
  }
  if (photoTitle) {
    photoTitle.textContent = photo.title;
  }
  if (photoCaption) {
    photoCaption.textContent = photo.caption;
  }
  coverPlace.textContent = photo.location;
  setCoverPhoto(index);

  document.querySelectorAll(".thumb").forEach((thumb, thumbIndex) => {
    thumb.classList.toggle("active", thumbIndex === index);
  });
}

function renderThumbs() {
  photos.forEach((photo, index) => {
    const button = document.createElement("button");
    button.className = "thumb";
    button.type = "button";
    button.innerHTML = `
      <span class="thumb-image"></span>
      <span>
        <strong>${photo.title}</strong>
        <span>${photo.location}</span>
      </span>
    `;
    button.querySelector(".thumb-image").style.backgroundImage = `url("${photo.src}")`;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      setPhoto(index);
    });
    thumbList.appendChild(button);
  });
}

function setCoverPhoto(index) {
  const photo = photos[index];
  currentCoverPhoto = index;

  clearProcessedCover();
  resetPhotoClass(coverImage);
  resetPhotoClass(discArt);
  setPhotoBackground(coverImage, photo, false);
  setPhotoBackground(discArt, photo, false);
  coverPlace.textContent = photo.location;

  document.querySelectorAll(".cover-photo-option").forEach((button, buttonIndex) => {
    button.classList.toggle("active", buttonIndex === index);
  });

  if (currentCoverStyle === "y2k") {
    renderY2KPreview();
  } else if (currentCoverStyle === "halftone") {
    renderHalftonePreview();
  }
}

function syncCoverText() {
  const artist = coverArtistInput.value.trim() || "HexinZhang";
  const title = coverTitleInput.value.trim() || "Champagne Field Notes";

  coverArtist.textContent = artist;
  coverTitleText.textContent = title;
  discRingTitle.textContent = `${title} / ${artist} / Champagne, France / `;
}

function renderCoverPicker() {
  photos.forEach((photo, index) => {
    const button = document.createElement("button");
    button.className = "cover-photo-option";
    button.type = "button";
    button.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span>`;
    button.style.backgroundImage = `url("${photo.src}")`;
    button.addEventListener("click", () => setCoverPhoto(index));
    coverPicker.appendChild(button);
  });
}

pins.forEach((pin) => {
  pin.addEventListener("click", () => setPlace(pin.dataset.place));
});

closePlace.addEventListener("click", () => {
  placeCard.classList.remove("open");
});

jumpGallery.addEventListener("click", () => {
  document.querySelector("#gallery").scrollIntoView({ behavior: "smooth" });
});

galleryMain.addEventListener("pointermove", (event) => {
  const rect = galleryMain.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  toastCursor.style.left = `${x}px`;
  toastCursor.style.top = `${y}px`;
});

thumbList.addEventListener("pointerenter", () => {
  galleryMain.classList.add("browsing-thumbs");
});

thumbList.addEventListener("pointerleave", () => {
  galleryMain.classList.remove("browsing-thumbs");
});

function makeBubble(x, y) {
  const bubble = document.createElement("span");
  const size = `${Math.random() * 0.55 + 0.35}rem`;

  bubble.className = "bubble";
  bubble.style.left = `${x}px`;
  bubble.style.top = `${y}px`;
  bubble.style.setProperty("--size", size);
  bubble.style.setProperty("--drift", `${Math.random() * 5 - 2.5}rem`);
  bubble.style.setProperty("--rise", `${Math.random() * 4 + 3}rem`);
  bubbleLayer.appendChild(bubble);

  window.setTimeout(() => bubble.remove(), 920);
}

galleryMain.addEventListener("click", (event) => {
  const rect = galleryMain.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  galleryMain.classList.remove("cheers");
  window.requestAnimationFrame(() => {
    galleryMain.classList.add("cheers");
  });

  for (let index = 0; index < 18; index += 1) {
    window.setTimeout(() => makeBubble(x, y), index * 18);
  }
});

coverOptions.forEach((button) => {
  button.addEventListener("click", () => {
    coverOptions.forEach((option) => option.classList.remove("active"));
    button.classList.add("active");
    currentCoverStyle = button.dataset.style;
    coverPreview.dataset.coverStyle = currentCoverStyle;
    if (currentCoverStyle === "y2k") {
      renderY2KPreview();
    } else if (currentCoverStyle === "halftone") {
      renderHalftonePreview();
    } else {
      setCoverPhoto(currentCoverPhoto);
    }
  });
});

coverArtistInput.addEventListener("input", syncCoverText);
coverTitleInput.addEventListener("input", syncCoverText);

function getImagePath(photo) {
  return photo.src;
}

function fitImageCover(ctx, image, size) {
  const scale = Math.max(size / image.width, size / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (size - width) / 2;
  const y = (size - height) / 2;

  ctx.drawImage(image, x, y, width, height);
}

function makePixelCanvas(image, size = 900, pixelSize = 28) {
  const smallSize = Math.max(24, Math.round(size / pixelSize));
  const smallCanvas = document.createElement("canvas");
  const smallCtx = smallCanvas.getContext("2d");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const palette = [
    [18, 22, 38],
    [62, 52, 156],
    [35, 120, 210],
    [56, 196, 222],
    [70, 210, 130],
    [165, 226, 82],
    [255, 232, 106],
    [255, 168, 82],
    [255, 104, 122],
    [236, 84, 178],
    [166, 92, 226],
    [248, 241, 220],
  ];

  smallCanvas.width = smallSize;
  smallCanvas.height = smallSize;
  canvas.width = size;
  canvas.height = size;

  smallCtx.imageSmoothingEnabled = true;
  fitImageCover(smallCtx, image, smallSize);

  const imageData = smallCtx.getImageData(0, 0, smallSize, smallSize);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let best = palette[0];
    let bestDistance = Infinity;

    palette.forEach((color) => {
      const distance =
        (data[i] - color[0]) ** 2 +
        (data[i + 1] - color[1]) ** 2 +
        (data[i + 2] - color[2]) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = color;
      }
    });

    data[i] = Math.min(255, best[0] + 10);
    data[i + 1] = Math.min(255, best[1] + 8);
    data[i + 2] = Math.min(255, best[2] + 12);
  }

  smallCtx.putImageData(imageData, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(smallCanvas, 0, 0, size, size);

  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  for (let y = 0; y < size; y += pixelSize * 2) {
    ctx.fillRect(0, y, size, 2);
  }

  ctx.fillStyle = "rgba(255, 120, 220, 0.08)";
  for (let x = 0; x < size; x += pixelSize * 3) {
    ctx.fillRect(x, 0, 2, size);
  }

  ctx.fillStyle = "rgba(80, 220, 255, 0.08)";
  for (let x = pixelSize; x < size; x += pixelSize * 4) {
    ctx.fillRect(x, 0, 2, size);
  }

  return canvas;
}

function makeHalftoneCanvas(image, size = 900, cellSize = 18) {
  const sourceCanvas = document.createElement("canvas");
  const sourceCtx = sourceCanvas.getContext("2d");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  sourceCanvas.width = size;
  sourceCanvas.height = size;
  canvas.width = size;
  canvas.height = size;

  fitImageCover(sourceCtx, image, size);
  const imageData = sourceCtx.getImageData(0, 0, size, size).data;

  ctx.fillStyle = "#ead8b3";
  ctx.fillRect(0, 0, size, size);

  for (let y = cellSize / 2; y < size; y += cellSize) {
    for (let x = cellSize / 2; x < size; x += cellSize) {
      const pixelX = Math.min(size - 1, Math.floor(x));
      const pixelY = Math.min(size - 1, Math.floor(y));
      const index = (pixelY * size + pixelX) * 4;
      const r = imageData[index];
      const g = imageData[index + 1];
      const b = imageData[index + 2];
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      const radius = (1 - brightness) * (cellSize * 0.54) + 1.1;
      const greenLift = g > r ? 16 : 0;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${42 + greenLift}, ${49 + greenLift}, 38, 0.9)`;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.28;
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  for (let y = 0; y < size; y += cellSize * 2) {
    ctx.fillRect(0, y, size, 1);
  }

  return canvas;
}

function applyCanvasStyle(ctx, style) {
  const filters = {
    archive: "saturate(0.82) contrast(0.95)",
    cellar: "sepia(0.42) saturate(0.8) brightness(0.72)",
    noir: "grayscale(1) contrast(1.25) brightness(0.82)",
    pastoral: "saturate(1.15) brightness(1.05)",
    y2k: "saturate(1.45) contrast(1.28) brightness(1.08)",
  };

  ctx.filter = filters[style] || filters.archive;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function renderY2KPreview() {
  const photo = photos[currentCoverPhoto];
  const image = await loadImage(getImagePath(photo));
  const canvas = makePixelCanvas(image, 900, 21);

  canvas.toBlob((blob) => {
    if (!blob) {
      return;
    }
    if (processedCoverUrl) {
      URL.revokeObjectURL(processedCoverUrl);
    }
    processedCoverUrl = URL.createObjectURL(blob);
    coverImage.className = "cover-image";
    discArt.className = "disc-art";
    coverImage.style.backgroundImage = `url("${processedCoverUrl}")`;
    discArt.style.backgroundImage = `url("${processedCoverUrl}")`;
  }, "image/png");
}

async function renderHalftonePreview() {
  const photo = photos[currentCoverPhoto];
  const image = await loadImage(getImagePath(photo));
  const canvas = makeHalftoneCanvas(image, 900, 20);

  canvas.toBlob((blob) => {
    if (!blob) {
      return;
    }
    if (processedCoverUrl) {
      URL.revokeObjectURL(processedCoverUrl);
    }
    processedCoverUrl = URL.createObjectURL(blob);
    coverImage.className = "cover-image";
    discArt.className = "disc-art";
    coverImage.style.backgroundImage = `url("${processedCoverUrl}")`;
    discArt.style.backgroundImage = `url("${processedCoverUrl}")`;
  }, "image/png");
}

async function downloadCurrentCover() {
  const photo = photos[currentCoverPhoto];
  const image = await loadImage(getImagePath(photo));
  const size = 1400;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const artist = coverArtistInput.value.trim() || "HexinZhang";
  const title = coverTitleInput.value.trim() || "Champagne Field Notes";

  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = "#11130f";
  ctx.fillRect(0, 0, size, size);
  if (currentCoverStyle === "y2k") {
    const pixelCanvas = makePixelCanvas(image, size, 25);
    ctx.drawImage(pixelCanvas, 0, 0, size, size);
  } else if (currentCoverStyle === "halftone") {
    const halftoneCanvas = makeHalftoneCanvas(image, size, 30);
    ctx.drawImage(halftoneCanvas, 0, 0, size, size);
  } else {
    applyCanvasStyle(ctx, currentCoverStyle);
    fitImageCover(ctx, image, size);
    ctx.filter = "none";
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, "rgba(0,0,0,0.18)");
  gradient.addColorStop(0.52, "rgba(0,0,0,0.06)");
  gradient.addColorStop(1, "rgba(0,0,0,0.68)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "rgba(248,241,228,0.9)";
  ctx.font = "42px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText(artist.toUpperCase(), 86, size - 118);

  ctx.font = "82px Georgia, serif";
  ctx.textAlign = "right";
  ctx.fillText(title, size - 86, size - 78);

  ctx.save();
  ctx.translate(42, 80);
  ctx.rotate(Math.PI / 2);
  ctx.font = "24px Arial, sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText(`${photo.location.toUpperCase()} / PRIVATE ARCHIVE`, 0, 0);
  ctx.restore();

  const link = document.createElement("a");
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "champagne-cover"}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

downloadCover.addEventListener("click", () => {
  downloadCurrentCover().catch(() => {
    downloadCover.textContent = "Download failed";
    window.setTimeout(() => {
      downloadCover.textContent = "Download cover";
    }, 1600);
  });
});

function stopBgm() {
  bgmAudio.pause();
  bgmToggle.classList.remove("active");
  bgmToggle.textContent = "BGM off";
}

function setBgmTrack() {
  const wasPlaying = bgmToggle.classList.contains("active");
  bgmAudio.src = bgmTrackUrl;
  bgmAudio.volume = 0.36;

  if (wasPlaying) {
    bgmAudio.play();
  }
}

bgmToggle.addEventListener("click", async () => {
  if (bgmToggle.classList.contains("active")) {
    stopBgm();
    return;
  }

  setBgmTrack();
  await bgmAudio.play();
  bgmToggle.classList.add("active");
  bgmToggle.textContent = "BGM on";
});

function clampPercent(value) {
  return Math.max(0, Math.min(100, value));
}

function getVisualHandPoint(point) {
  return {
    x: (1 - point.x) * 100,
    y: point.y * 100,
  };
}

function buildTearPoints(start, end, amount) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / length;
  const ny = dx / length;
  const openness = Math.max(0.18, amount / 100);
  const width = Math.min(20, Math.max(3.8, length * 0.2 + openness * 10));
  const leftPoints = [];
  const rightPoints = [];
  const steps = 16;
  const bow = Math.min(8, length * 0.08 + openness * 3.2);

  for (let index = 0; index <= steps; index += 1) {
    const progress = index / steps;
    const softProgress = progress * progress * (3 - 2 * progress);
    const clothCurve = Math.sin(progress * Math.PI);
    const px = start.x + dx * softProgress + nx * Math.sin((progress - 0.5) * Math.PI) * bow * 0.26;
    const py = start.y + dy * softProgress + ny * Math.sin((progress - 0.5) * Math.PI) * bow * 0.26;
    const taper = Math.sin(progress * Math.PI);
    const jag =
      Math.sin(progress * Math.PI * 2.7) * width * 0.08 +
      Math.sin(progress * Math.PI * 6.4) * width * 0.045;
    const edge = Math.max(1.1, width * (0.12 + taper * 0.88));
    const elasticLift = clothCurve * bow;

    leftPoints.push({
      x: clampPercent(px + nx * (edge + jag + elasticLift * 0.34)),
      y: clampPercent(py + ny * (edge + jag + elasticLift * 0.34)),
    });
    rightPoints.unshift({
      x: clampPercent(px - nx * (edge - jag * 0.42 + elasticLift * 0.28)),
      y: clampPercent(py - ny * (edge - jag * 0.42 + elasticLift * 0.28)),
    });
  }

  return leftPoints.concat(rightPoints);
}

function renderMemoryTears() {
  const tears = activeMemoryTear
    ? memoryTears.concat([activeMemoryTear])
    : memoryTears;

  memoryClip.replaceChildren();

  tears.forEach((tear) => {
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute(
      "points",
      tear
        .map((point) => `${(point.x / 100).toFixed(4)},${(point.y / 100).toFixed(4)}`)
        .join(" "),
    );
    memoryClip.appendChild(polygon);
  });

  memoryStage.classList.toggle("has-tears", memoryTears.length > 0);
}

function clearActiveMemoryTear() {
  activeMemoryTear = null;
  memoryStage.classList.remove("tearing");
  renderMemoryTears();
}

class MemoryFabricPoint {
  constructor(x, y, index, pinned = false) {
    this.x = x;
    this.y = y;
    this.px = x;
    this.py = y;
    this.ox = x;
    this.oy = y;
    this.index = index;
    this.pinned = pinned;
  }

  update(width, height) {
    if (this.pinned) {
      return;
    }

    const vx = (this.x - this.px) * fabricSettings.friction;
    const vy = (this.y - this.py) * fabricSettings.friction;

    this.px = this.x;
    this.py = this.y;
    this.x += vx;
    this.y += vy + fabricSettings.gravity;
    this.x = Math.max(-24, Math.min(width + 24, this.x));
    this.y = Math.max(-24, Math.min(height + 24, this.y));
  }
}

class MemoryFabricConstraint {
  constructor(p1, p2, length) {
    this.p1 = p1;
    this.p2 = p2;
    this.length = length;
    this.key = getFabricEdgeKey(p1.index, p2.index);
  }

  resolve() {
    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;
    const distance = Math.max(0.001, Math.hypot(dx, dy));

    if (distance > fabricSettings.tearDistance) {
      return false;
    }

    const diff = (this.length - distance) / distance;
    const offsetX = dx * diff * 0.5;
    const offsetY = dy * diff * 0.5;

    if (!this.p1.pinned) {
      this.p1.x -= offsetX;
      this.p1.y -= offsetY;
    }
    if (!this.p2.pinned) {
      this.p2.x += offsetX;
      this.p2.y += offsetY;
    }

    return true;
  }
}

function getFabricEdgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function hasFabricEdge(a, b) {
  return memoryFabricEdges.has(getFabricEdgeKey(a.index, b.index));
}

function removeFabricConstraint(index) {
  const [constraint] = memoryFabricConstraints.splice(index, 1);
  if (constraint) {
    memoryFabricEdges.delete(constraint.key);
  }
}

function initMemoryFabric() {
  const width = memoryCanvas.width || memoryStage.clientWidth;
  const height = memoryCanvas.height || memoryStage.clientHeight;
  const spacing = fabricSettings.spacing;
  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);

  memoryFabricPoints = [];
  memoryFabricConstraints = [];
  memoryFabricEdges = new Set();
  memoryFabricCols = cols;
  memoryFabricRows = rows;

  for (let y = 0; y <= rows; y += 1) {
    for (let x = 0; x <= cols; x += 1) {
      const index = y * (cols + 1) + x;
      const isEdge = y === 0 || x === 0 || x === cols;
      memoryFabricPoints.push(
        new MemoryFabricPoint(
          Math.min(width, x * spacing),
          Math.min(height, y * spacing),
          index,
          isEdge && (x + y) % 2 === 0,
        ),
      );
    }
  }

  for (let y = 0; y <= rows; y += 1) {
    for (let x = 0; x <= cols; x += 1) {
      const index = y * (cols + 1) + x;

      if (x < cols) {
        const constraint = new MemoryFabricConstraint(memoryFabricPoints[index], memoryFabricPoints[index + 1], spacing);
        memoryFabricConstraints.push(constraint);
        memoryFabricEdges.add(constraint.key);
      }
      if (y < rows) {
        const constraint = new MemoryFabricConstraint(memoryFabricPoints[index], memoryFabricPoints[index + cols + 1], spacing);
        memoryFabricConstraints.push(constraint);
        memoryFabricEdges.add(constraint.key);
      }
    }
  }
}

function segmentsIntersect(a, b, c, d) {
  const det = (b.x - a.x) * (d.y - c.y) - (d.x - c.x) * (b.y - a.y);
  if (Math.abs(det) < 0.001) {
    return false;
  }

  const lambda = ((d.y - c.y) * (d.x - a.x) + (c.x - d.x) * (d.y - a.y)) / det;
  const gamma = ((a.y - b.y) * (d.x - a.x) + (b.x - a.x) * (d.y - a.y)) / det;
  return lambda > 0 && lambda < 1 && gamma > 0 && gamma < 1;
}

function cutMemoryFabric(start, end) {
  const width = memoryCanvas.width;
  const height = memoryCanvas.height;
  const cutStart = { x: (start.x / 100) * width, y: (start.y / 100) * height };
  const cutEnd = { x: (end.x / 100) * width, y: (end.y / 100) * height };
  const dx = cutEnd.x - cutStart.x;
  const dy = cutEnd.y - cutStart.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / length;
  const ny = dx / length;

  for (let index = memoryFabricConstraints.length - 1; index >= 0; index -= 1) {
    const constraint = memoryFabricConstraints[index];
    if (segmentsIntersect(cutStart, cutEnd, constraint.p1, constraint.p2)) {
      removeFabricConstraint(index);
    }
  }

  memoryFabricPoints.forEach((point) => {
    const t = Math.max(0, Math.min(1, ((point.x - cutStart.x) * dx + (point.y - cutStart.y) * dy) / (length * length)));
    const closestX = cutStart.x + dx * t;
    const closestY = cutStart.y + dy * t;
    const distance = Math.hypot(point.x - closestX, point.y - closestY);

    if (!point.pinned && distance < 74) {
      const side = (point.x - cutStart.x) * nx + (point.y - cutStart.y) * ny > 0 ? 1 : -1;
      const strength = (1 - distance / 74) * 19;
      point.x += nx * side * strength;
      point.y += ny * side * strength;
      point.px -= nx * side * strength * 0.8;
      point.py -= ny * side * strength * 0.8;
    }
  });
}

function pullMemoryFabric(start, end, amount) {
  const width = memoryCanvas.width;
  const height = memoryCanvas.height;
  const pullStart = { x: (start.x / 100) * width, y: (start.y / 100) * height };
  const pullEnd = { x: (end.x / 100) * width, y: (end.y / 100) * height };
  const dx = pullEnd.x - pullStart.x;
  const dy = pullEnd.y - pullStart.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / length;
  const ny = dx / length;
  const radius = 92;
  const pullStrength = Math.min(28, Math.max(2, amount * 0.22));

  memoryFabricPoints.forEach((point) => {
    if (point.pinned) {
      return;
    }

    const t = Math.max(0, Math.min(1, ((point.x - pullStart.x) * dx + (point.y - pullStart.y) * dy) / (length * length)));
    const closestX = pullStart.x + dx * t;
    const closestY = pullStart.y + dy * t;
    const distance = Math.hypot(point.x - closestX, point.y - closestY);

    if (distance < radius) {
      const side = (point.x - pullStart.x) * nx + (point.y - pullStart.y) * ny > 0 ? 1 : -1;
      const falloff = (1 - distance / radius) ** 2;
      point.x += nx * side * pullStrength * falloff;
      point.y += ny * side * pullStrength * falloff;
    }
  });
}

function updateMemoryFabric() {
  const width = memoryCanvas.width;
  const height = memoryCanvas.height;

  memoryFabricPoints.forEach((point) => point.update(width, height));

  for (let iteration = 0; iteration < fabricSettings.iterations; iteration += 1) {
    for (let index = memoryFabricConstraints.length - 1; index >= 0; index -= 1) {
      if (!memoryFabricConstraints[index].resolve()) {
        removeFabricConstraint(index);
      }
    }
  }
}

function drawMemoryFabric(ctx) {
  if (currentMemory < 0 && !memoryTears.length && !activeMemoryTear) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = "rgba(248, 241, 228, 0.1)";
  ctx.lineWidth = 0.7;
  ctx.beginPath();

  memoryFabricConstraints.forEach((constraint) => {
    ctx.moveTo(constraint.p1.x, constraint.p1.y);
    ctx.lineTo(constraint.p2.x, constraint.p2.y);
  });

  ctx.stroke();
  ctx.restore();
}

function getCurrentMemorySource() {
  if (currentMemory >= 0 && memoryBaseVideo.videoWidth) {
    return memoryBaseVideo;
  }

  if (memoryCamera.videoWidth) {
    return memoryCamera;
  }

  return null;
}

function getCoverCrop(source, area) {
  const canvasWidth = memoryCanvas.width;
  const canvasHeight = memoryCanvas.height;
  const sourceWidth = source.videoWidth || source.naturalWidth || canvasWidth;
  const sourceHeight = source.videoHeight || source.naturalHeight || canvasHeight;
  const scale = Math.max(canvasWidth / sourceWidth, canvasHeight / sourceHeight);
  const displayWidth = sourceWidth * scale;
  const displayHeight = sourceHeight * scale;
  const offsetX = (canvasWidth - displayWidth) / 2;
  const offsetY = (canvasHeight - displayHeight) / 2;

  const sw = Math.min(sourceWidth, area.width / scale);
  const baseSx = Math.max(0, (area.x - offsetX) / scale);

  return {
    sx: source === memoryCamera ? Math.max(0, sourceWidth - baseSx - sw) : baseSx,
    sy: Math.max(0, (area.y - offsetY) / scale),
    sw,
    sh: Math.min(sourceHeight, area.height / scale),
  };
}

function clipCell(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  ctx.clip();
}

function drawFabricVideoCell(ctx, source, points, area) {
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const crop = getCoverCrop(source, area);

  if (maxX - minX < 1 || maxY - minY < 1 || crop.sw < 1 || crop.sh < 1) {
    return;
  }

  ctx.save();
  clipCell(ctx, points);
  ctx.drawImage(source, crop.sx, crop.sy, crop.sw, crop.sh, minX, minY, maxX - minX, maxY - minY);
  ctx.restore();
}

function drawFullCameraPreview(ctx, source) {
  const width = memoryCanvas.width;
  const height = memoryCanvas.height;
  const sourceWidth = source.videoWidth || width;
  const sourceHeight = source.videoHeight || height;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(source, x, y, drawWidth, drawHeight);
  ctx.restore();
}

function drawMemoryFabricTexture(ctx) {
  const source = getCurrentMemorySource();

  if (!source) {
    ctx.save();
    ctx.fillStyle = "rgba(12, 13, 10, 0.84)";
    ctx.fillRect(0, 0, memoryCanvas.width, memoryCanvas.height);
    ctx.restore();
    return;
  }

  if (source === memoryCamera && !memoryTears.length && !activeMemoryTear) {
    drawFullCameraPreview(ctx, source);
    return;
  }

  for (let y = 0; y < memoryFabricRows; y += 1) {
    for (let x = 0; x < memoryFabricCols; x += 1) {
      const index = y * (memoryFabricCols + 1) + x;
      const p00 = memoryFabricPoints[index];
      const p10 = memoryFabricPoints[index + 1];
      const p01 = memoryFabricPoints[index + memoryFabricCols + 1];
      const p11 = memoryFabricPoints[index + memoryFabricCols + 2];

      if (!p00 || !p10 || !p01 || !p11) {
        continue;
      }

      if (
        !hasFabricEdge(p00, p10) ||
        !hasFabricEdge(p10, p11) ||
        !hasFabricEdge(p01, p11) ||
        !hasFabricEdge(p00, p01)
      ) {
        continue;
      }

      drawFabricVideoCell(ctx, source, [p00, p10, p11, p01], {
        x: p00.ox,
        y: p00.oy,
        width: p10.ox - p00.ox,
        height: p01.oy - p00.oy,
      });
    }
  }

  ctx.save();
  ctx.fillStyle = "rgba(248, 241, 228, 0.045)";
  ctx.fillRect(0, 0, memoryCanvas.width, memoryCanvas.height);
  ctx.restore();
}

function drawTrackedFingers(ctx) {
  const width = memoryCanvas.width;
  const height = memoryCanvas.height;

  if (!lastHandLandmarks?.length) {
    return;
  }

  lastHandLandmarks.forEach((landmarks) => {
    ctx.fillStyle = "rgba(248, 241, 228, 0.86)";
    [4, 8].forEach((index) => {
      const point = landmarks[index];
      ctx.beginPath();
      ctx.arc((1 - point.x) * width, point.y * height, 5.5, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}

function renderMemoryCanvas() {
  const ctx = memoryCanvas.getContext("2d");

  ctx.clearRect(0, 0, memoryCanvas.width, memoryCanvas.height);
  updateMemoryFabric();
  drawMemoryFabricTexture(ctx);
  drawMemoryFabric(ctx);
  drawTrackedFingers(ctx);
  window.requestAnimationFrame(renderMemoryCanvas);
}

function playVideo(video) {
  const promise = video.play();

  if (promise?.catch) {
    promise.catch(() => {});
  }
}

function prepareRevealVideo() {
  if (!memoryVideos.length) {
    return;
  }

  if (!memoryRevealVideo.src.endsWith(memoryVideos[nextMemory])) {
    memoryRevealVideo.src = memoryVideos[nextMemory];
  }
  playVideo(memoryRevealVideo);
}

function commitMemory() {
  if (!memoryVideos.length) {
    return;
  }

  currentMemory = nextMemory;
  nextMemory = (nextMemory + 1) % memoryVideos.length;
  memoryBaseVideo.src = memoryVideos[currentMemory];
  playVideo(memoryBaseVideo);
  memoryStage.classList.add("has-memory");
  memoryStage.classList.remove("tearing");
  memoryStage.classList.remove("has-tears");
  memoryTears = [];
  activeMemoryTear = null;
  handTearStates.clear();
  renderMemoryTears();
  initMemoryFabric();
  prepareRevealVideo();
}

function openNextMemory() {
  const manualTears = [
    [{ x: 42, y: 45 }, { x: 58, y: 55 }],
    [{ x: 24, y: 36 }, { x: 43, y: 32 }],
    [{ x: 62, y: 26 }, { x: 78, y: 43 }],
    [{ x: 34, y: 68 }, { x: 54, y: 72 }],
    [{ x: 68, y: 68 }, { x: 84, y: 58 }],
  ];
  const [start, end] = manualTears[memoryTears.length % manualTears.length];

  prepareRevealVideo();
  activeMemoryTear = buildTearPoints(start, end, 72);
  cutMemoryFabric(start, end);
  memoryTears.push(activeMemoryTear);
  activeMemoryTear = null;
  renderMemoryTears();

  if (memoryTears.length >= maxMemoryTears) {
    window.setTimeout(commitMemory, 260);
  }
}

function handleHandResults(results) {
  lastHandLandmarks = results.multiHandLandmarks || null;
  const hands = results.multiHandLandmarks || [];
  if (!hands.length) {
    return;
  }

  const activeHandIds = new Set();

  hands.forEach((landmarks, handIndex) => {
    const handedness = results.multiHandedness?.[handIndex];
    const label = handedness?.label || `hand-${handIndex}`;
    const handId = `${label}-${handIndex}`;
    activeHandIds.add(handId);

    if (!handTearStates.has(handId)) {
      handTearStates.set(handId, {
        pinchWasClosed: false,
        tearCommitted: false,
        activeTear: null,
      });
    }

    updateHandTear(landmarks, handTearStates.get(handId));
  });

  [...handTearStates.keys()].forEach((handId) => {
    if (!activeHandIds.has(handId)) {
      const state = handTearStates.get(handId);
      if (state?.activeTear === activeMemoryTear) {
        activeMemoryTear = null;
      }
      handTearStates.delete(handId);
    }
  });
}

function updateHandTear(landmarks, state) {
  const thumb = landmarks[4];
  const indexFinger = landmarks[8];
  const dx = thumb.x - indexFinger.x;
  const dy = thumb.y - indexFinger.y;
  const distance = Math.hypot(dx, dy);
  const thumbPoint = getVisualHandPoint(thumb);
  const indexPoint = getVisualHandPoint(indexFinger);
  const centerX = (thumbPoint.x + indexPoint.x) / 2;
  const centerY = (thumbPoint.y + indexPoint.y) / 2;
  const openAmount = Math.min(100, Math.max(0, (distance - 0.04) * 320));

  if (distance < 0.07) {
    state.pinchWasClosed = true;
    state.tearCommitted = false;
    if (state.activeTear === activeMemoryTear) {
      clearActiveMemoryTear();
    }
    state.activeTear = null;
    return;
  }

  if (state.pinchWasClosed && openAmount > 3) {
    prepareRevealVideo();
    pullMemoryFabric(thumbPoint, indexPoint, openAmount);
    state.activeTear = buildTearPoints(thumbPoint, indexPoint, openAmount);
    activeMemoryTear = state.activeTear;
    memoryStage.classList.add("tearing");
    memoryStage.style.setProperty("--memory-x", `${centerX}%`);
    memoryStage.style.setProperty("--memory-y", `${centerY}%`);
    renderMemoryTears();
  }

  if (state.pinchWasClosed && !state.tearCommitted && distance > 0.22) {
    state.pinchWasClosed = false;
    state.tearCommitted = true;
    if (state.activeTear) {
      cutMemoryFabric(thumbPoint, indexPoint);
      memoryTears.push(state.activeTear);
      if (activeMemoryTear === state.activeTear) {
        activeMemoryTear = null;
      }
      state.activeTear = null;
      memoryStage.classList.remove("tearing");
      renderMemoryTears();
    }

    if (memoryTears.length >= maxMemoryTears) {
      commitMemory();
    }
  }
}

async function startMemoryCamera() {
  if (!window.Hands || !window.Camera) {
    memoryStart.textContent = "Use button";
    return;
  }

  resizeMemoryCanvas();

  const hands = new window.Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.62,
    minTrackingConfidence: 0.62,
  });

  hands.onResults(handleHandResults);

  const camera = new window.Camera(memoryCamera, {
    onFrame: async () => {
      await hands.send({ image: memoryCamera });
    },
    width: 1280,
    height: 720,
  });

  await camera.start();
  memoryStage.classList.add("ready");
  memoryStart.textContent = "Camera on";
}

memoryStart.addEventListener("click", () => {
  startMemoryCamera().catch(() => {
    memoryStart.textContent = "Camera blocked";
  });
});

memoryNext.addEventListener("click", openNextMemory);

function resizeMemoryCanvas() {
  memoryCanvas.width = memoryStage.clientWidth;
  memoryCanvas.height = memoryStage.clientHeight;
  initMemoryFabric();
}

window.addEventListener("resize", resizeMemoryCanvas);

renderThumbs();
renderCoverPicker();
setBgmTrack();
setPhoto(currentPhoto);
syncCoverText();
prepareRevealVideo();
resizeMemoryCanvas();
if (!memoryAnimationStarted) {
  memoryAnimationStarted = true;
  renderMemoryCanvas();
}

const galleryObserver = new IntersectionObserver(
  ([entry]) => {
    gallerySection.classList.toggle("in-view", entry.isIntersecting);
  },
  { threshold: 0.28 },
);

galleryObserver.observe(gallerySection);

const memoryObserver = new IntersectionObserver(
  ([entry]) => {
    document.body.classList.toggle(
      "memory-active",
      entry.isIntersecting && entry.intersectionRatio > 0.42,
    );
  },
  { threshold: [0, 0.42, 0.75] },
);

memoryObserver.observe(memorySection);
