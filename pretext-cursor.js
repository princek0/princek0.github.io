import {
  prepareWithSegments,
  layoutNextLineRange,
  materializeLineRange,
} from '@chenglou/pretext';

const PARAGRAPH =
  "I'm a first-year mathematics student at the University of Oxford " +
  "simultaneously working at Bluedot Impact. Before starting university, " +
  "I worked at Entrepreneurs First as an investor after originally being " +
  "offered a place to join as a founder. When I was younger, I represented " +
  "Team England in the World Youth Chess Championships.";

const FONT = '15px monospace';
const LINE_HEIGHT = 22;
const OBSTACLE_RADIUS = 50;
const TEXT_COLOR = '#222';
const DPR = window.devicePixelRatio || 1;

const wrap = document.getElementById('pretext-wrap');
const canvas = document.getElementById('pretext-canvas');
const ctx = canvas.getContext('2d');

let prepared = null;
let containerWidth = 0;
let mouseX = -1;
let mouseY = -1;
let rafId = 0;

function init() {
  prepared = prepareWithSegments(PARAGRAPH, FONT);
  resize();
  draw();
}

function resize() {
  containerWidth = wrap.clientWidth;
  canvas.width = containerWidth * DPR;
  // Height is set after each draw to fit actual content
  canvas.style.width = containerWidth + 'px';
}

function obstacleOverlap(lineTop, lineBottom) {
  if (mouseX < 0 || mouseY < 0) return null;

  const oTop = mouseY - OBSTACLE_RADIUS;
  const oBottom = mouseY + OBSTACLE_RADIUS;

  // No vertical overlap with this line
  if (oBottom < lineTop || oTop > lineBottom) return null;

  const oLeft = Math.max(0, mouseX - OBSTACLE_RADIUS);
  const oRight = Math.min(containerWidth, mouseX + OBSTACLE_RADIUS);

  if (oRight <= 0 || oLeft >= containerWidth) return null;

  return { left: oLeft, right: oRight };
}

function draw() {
  if (!prepared) return;

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  const lines = [];
  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  let y = 0;

  while (true) {
    const lineTop = y;
    const lineBottom = y + LINE_HEIGHT;
    const obs = obstacleOverlap(lineTop, lineBottom);

    let maxWidth;
    let xOffset = 0;

    if (obs) {
      // Obstacle overlaps this line — pick the wider side
      const leftSpace = obs.left;
      const rightSpace = containerWidth - obs.right;

      if (leftSpace >= rightSpace) {
        maxWidth = leftSpace;
        xOffset = 0;
      } else {
        maxWidth = rightSpace;
        xOffset = obs.right;
      }
      // Minimum usable width to avoid degenerate breaks
      maxWidth = Math.max(maxWidth, 40);
    } else {
      maxWidth = containerWidth;
    }

    const range = layoutNextLineRange(prepared, cursor, maxWidth);
    if (range === null) break;

    const line = materializeLineRange(prepared, range);
    lines.push({ text: line.text, x: xOffset, y });
    cursor = range.end;
    y += LINE_HEIGHT;
  }

  const totalHeight = y;
  canvas.height = totalHeight * DPR;
  canvas.style.height = totalHeight + 'px';

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, containerWidth, totalHeight);
  ctx.font = FONT;
  ctx.fillStyle = TEXT_COLOR;
  ctx.textBaseline = 'top';

  for (const ln of lines) {
    ctx.fillText(ln.text, ln.x, ln.y + (LINE_HEIGHT - 15) / 2);
  }
}

function scheduleDraw() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    draw();
  });
}

wrap.addEventListener('mousemove', (e) => {
  const rect = wrap.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  scheduleDraw();
});

wrap.addEventListener('mouseleave', () => {
  mouseX = -1;
  mouseY = -1;
  scheduleDraw();
});

window.addEventListener('resize', () => {
  resize();
  scheduleDraw();
});

init();
