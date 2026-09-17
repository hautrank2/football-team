import * as THREE from "three";
import { proxiedImage } from "@/lib/image";
import type { PlayerModel } from "@/types";

// Everything the 3D pitch shows is painted into a 2D canvas first and used as a
// texture. Two reasons: the pitch markings are far simpler (and sharper) drawn
// with 2D path commands than built out of line geometry, and drawing the player
// tokens this way means no 3D-text dependency — the name, number and captain
// ring are just pixels, exactly like the 2D pitch draws them.

// Pitch proportions in world units, roughly a real 68×105m pitch scaled down.
export const PITCH_W = 6.8;
export const PITCH_L = 10.5;

const TURF = "#15803d";
const LINE = "rgba(255,255,255,0.78)";

// ---------------------------------------------------------------------------
// Pitch surface
// ---------------------------------------------------------------------------

export const createPitchTexture = (): THREE.CanvasTexture => {
  // 2:3 like the 2D pitch, big enough to stay crisp when the camera leans in.
  const w = 1024;
  const h = 1536;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = TURF;
  ctx.fillRect(0, 0, w, h);

  // Mowing stripes, running across the pitch like the 2D version.
  const stripes = 12;
  for (let i = 0; i < stripes; i += 1) {
    ctx.fillStyle =
      i % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    ctx.fillRect(0, (i * h) / stripes, w, h / stripes);
  }

  // Markings sit inside a margin, same 3% inset as the 2D pitch.
  const m = w * 0.03;
  const fx = m;
  const fy = m;
  const fw = w - m * 2;
  const fh = h - m * 2;

  ctx.strokeStyle = LINE;
  ctx.lineWidth = 6;
  ctx.strokeRect(fx, fy, fw, fh);

  // Halfway line + centre circle + spot
  ctx.beginPath();
  ctx.moveTo(fx, fy + fh / 2);
  ctx.lineTo(fx + fw, fy + fh / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(fx + fw / 2, fy + fh / 2, fw * 0.13, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = LINE;
  ctx.beginPath();
  ctx.arc(fx + fw / 2, fy + fh / 2, 6, 0, Math.PI * 2);
  ctx.fill();

  // Penalty + goal areas at both ends.
  const box = (depthPct: number, widthPct: number, atTop: boolean) => {
    const bw = fw * widthPct;
    const bh = fh * depthPct;
    const bx = fx + (fw - bw) / 2;
    const by = atTop ? fy : fy + fh - bh;
    ctx.strokeRect(bx, by, bw, bh);
  };
  const spot = (atTop: boolean) => {
    ctx.beginPath();
    ctx.arc(
      fx + fw / 2,
      atTop ? fy + fh * 0.105 : fy + fh - fh * 0.105,
      5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  };
  for (const atTop of [true, false]) {
    box(0.16, 0.58, atTop); // penalty area
    box(0.07, 0.3, atTop); // goal area
    spot(atTop);
  }

  // Corner arcs
  const r = fw * 0.02;
  const corners: [number, number, number][] = [
    [fx, fy, 0],
    [fx + fw, fy, Math.PI / 2],
    [fx + fw, fy + fh, Math.PI],
    [fx, fy + fh, -Math.PI / 2],
  ];
  for (const [cx, cy, start] of corners) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, start + Math.PI / 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};

// ---------------------------------------------------------------------------
// Player token
// ---------------------------------------------------------------------------

export const TOKEN_W = 256;
export const TOKEN_H = 320;

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const loadImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image();
    // Same-origin via the proxy, but the attribute is what lets WebGL accept it.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

// One player as a texture: circular photo in a ring (gold for the captain),
// jersey number badge, and the short name on a dark pill underneath.
export const createTokenTexture = async (
  player: PlayerModel | undefined,
  isCaptain: boolean,
): Promise<THREE.CanvasTexture> => {
  const canvas = document.createElement("canvas");
  canvas.width = TOKEN_W;
  canvas.height = TOKEN_H;
  const ctx = canvas.getContext("2d")!;

  const cx = TOKEN_W / 2;
  const cy = 118;
  const radius = 92;

  // Photo, clipped to a circle.
  const src = proxiedImage(player?.avatarNoBg || player?.avatarUrl);
  const img = src ? await loadImage(src) : null;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = "#064e3b";
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  if (img) {
    // object-cover inside the circle.
    const scale = Math.max((radius * 2) / img.width, (radius * 2) / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  } else if (player) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 80px Oswald, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(player.fullName.charAt(0), cx, cy);
  }
  ctx.restore();

  // Ring
  ctx.lineWidth = 8;
  ctx.strokeStyle = isCaptain ? "#facc15" : "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Jersey number badge, bottom-right of the circle.
  if (player?.jerseyNumber != null) {
    const bx = cx + radius * 0.72;
    const by = cy + radius * 0.72;
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(bx, by, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#06122b";
    ctx.font = "bold 28px Oswald, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(player.jerseyNumber), bx, by);
  }

  // Captain star, top-left of the circle.
  if (isCaptain) {
    const sx = cx - radius * 0.72;
    const sy = cy - radius * 0.72;
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(sx, sy, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#422006";
    ctx.font = "bold 26px Oswald, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("C", sx, sy);
  }

  // Name pill
  if (player) {
    const name = player.fullName.trim().split(/\s+/).pop() ?? player.fullName;
    ctx.font = "600 34px Oswald, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textW = Math.min(ctx.measureText(name).width, TOKEN_W - 24);
    const pillW = textW + 28;
    const pillH = 48;
    const pillX = cx - pillW / 2;
    const pillY = 240;
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 10);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(name, cx, pillY + pillH / 2 + 2, TOKEN_W - 24);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};

// Soft round shadow under each token, so they read as standing on the grass.
export const createShadowTexture = (): THREE.CanvasTexture => {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(0,0,0,0.45)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

// Slot coordinates are percentages on a portrait pitch (0,0 = top-left, the top
// end being the one being attacked). Map them onto the 3D plane.
export const slotToWorld = (x: number, y: number): [number, number] => [
  (x / 100 - 0.5) * PITCH_W,
  (y / 100 - 0.5) * PITCH_L,
];
