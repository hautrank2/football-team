import * as THREE from "three";
import { proxiedImage } from "@/lib/image";
import type { PlayerModel } from "@/types";

// A hung portrait is one texture: gilt frame, dark mat, the player's photo, and
// a brass plaque with their name underneath. Painting it into a canvas keeps the
// scene to a single quad per player — no frame geometry, no 3D text.

const TEX_W = 512;
const TEX_H = 720;

// World size of a hung frame, matching the texture's proportions.
export const FRAME_W = 2.1;
export const FRAME_H = (TEX_H / TEX_W) * FRAME_W;

const loadImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image();
    // Same-origin through the proxy, but WebGL still needs the attribute set.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const gilt = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#f3d488");
  g.addColorStop(0.35, "#b98b3a");
  g.addColorStop(0.55, "#f7e6b5");
  g.addColorStop(1, "#8a5f22");
  return g;
};

export const createPortraitTexture = async (
  player: PlayerModel,
): Promise<THREE.CanvasTexture> => {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d")!;

  const frame = 22; // gilt border thickness
  const artH = 560; // height of the picture area
  const plaqueTop = artH + 34;

  // Gilt frame
  ctx.fillStyle = gilt(ctx, TEX_W, artH);
  ctx.fillRect(0, 0, TEX_W, artH);
  // Inner bevel
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(frame - 5, frame - 5, TEX_W - (frame - 5) * 2, artH - (frame - 5) * 2);

  // Mat
  const mx = frame;
  const my = frame;
  const mw = TEX_W - frame * 2;
  const mh = artH - frame * 2;
  ctx.fillStyle = "#11161f";
  ctx.fillRect(mx, my, mw, mh);

  // The background-removed cut-out is the better picture and is preferred; the
  // plain photo is the fallback. They need OPPOSITE treatments, the same way
  // <PlayerPortrait> handles them: a cut-out is contained and stood on the
  // bottom of the mat (crop it and you lop off the head or the boots), a normal
  // photo is cover-cropped to fill the frame.
  const isCutout = !!player.avatarNoBg;
  const src = proxiedImage(player.avatarNoBg || player.avatarUrl);
  const img = src ? await loadImage(src) : null;
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(mx, my, mw, mh);
    ctx.clip();
    // A soft studio wash so a cut-out isn't floating on flat black.
    const wash = ctx.createRadialGradient(
      mx + mw / 2,
      my + mh * 0.38,
      10,
      mx + mw / 2,
      my + mh * 0.38,
      mw * 0.85,
    );
    wash.addColorStop(0, "rgba(126,166,226,0.34)");
    wash.addColorStop(1, "rgba(10,14,22,0)");
    ctx.fillStyle = wash;
    ctx.fillRect(mx, my, mw, mh);

    if (isCutout) {
      const pad = 16;
      const scale = Math.min(
        (mw - pad * 2) / img.width,
        (mh - pad) / img.height,
      );
      const dw = img.width * scale;
      const dh = img.height * scale;
      // Grounded on the bottom edge of the mat, so they stand in the frame.
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 26;
      ctx.shadowOffsetY = 10;
      ctx.drawImage(img, mx + (mw - dw) / 2, my + mh - dh, dw, dh);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    } else {
      const scale = Math.max(mw / img.width, mh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      // Bias upward so a cover crop keeps the face rather than the chest.
      ctx.drawImage(img, mx + (mw - dw) / 2, my + (mh - dh) * 0.25, dw, dh);
    }
    ctx.restore();
  } else {
    ctx.fillStyle = "#1c2534";
    ctx.fillRect(mx, my, mw, mh);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "bold 180px Oswald, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(player.fullName.charAt(0), TEX_W / 2, artH / 2);
  }

  // Jersey number, stamped in the corner of the mat.
  if (player.jerseyNumber != null) {
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.font = "900 italic 96px Oswald, system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(String(player.jerseyNumber), TEX_W - frame - 14, my + 6);
  }

  // Brass plaque
  const pw = TEX_W - 120;
  const px = 60;
  const ph = 96;
  ctx.fillStyle = gilt(ctx, TEX_W, TEX_H);
  ctx.fillRect(px, plaqueTop, pw, ph);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(px + 6, plaqueTop + 6, pw - 12, ph - 12);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#1a1206";
  ctx.font = "700 40px Oswald, system-ui, sans-serif";
  ctx.fillText(
    player.fullName.toUpperCase(),
    TEX_W / 2,
    plaqueTop + (player.nickname ? 36 : ph / 2),
    pw - 40,
  );
  if (player.nickname) {
    ctx.font = "500 28px Oswald, system-ui, sans-serif";
    ctx.fillStyle = "#3a2a10";
    ctx.fillText(`"${player.nickname}"`, TEX_W / 2, plaqueTop + 70, pw - 40);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};
