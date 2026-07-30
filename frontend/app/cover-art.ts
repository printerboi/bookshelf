import type { CatalogBook } from "./catalog";
import { siteConfig } from "./site-config";

const serif = '"Newsreader Variable", "Iowan Old Style", Georgia, serif';
const sans = '"Inter Variable", Inter, Arial, sans-serif';

const _DEFAULTINK = "#212121";
const _DEFAULTACCENT = "#FF0000"

function seeded(seed: string) {
  let state = 2166136261;
  for (const char of seed) {
    state ^= char.charCodeAt(0);
    state = Math.imul(state, 16777619);
  }
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 8,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((entry, index) => {
    ctx.fillText(entry, x, y + index * lineHeight);
  });
  return Math.min(lines.length, maxLines);
}

function strokeLine(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
  width = 4,
) {
  if (!points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (const [x, y] of points.slice(1)) ctx.lineTo(x, y);
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawMotif(
  ctx: CanvasRenderingContext2D,
  book: CatalogBook,
  width: number,
  height: number,
) {
  const random = seeded(book.id);
  ctx.save();
  ctx.strokeStyle = _DEFAULTACCENT;
  ctx.fillStyle = _DEFAULTACCENT;
  ctx.globalAlpha = 0.88;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.restore();
}

function addPaperGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: string,
) {
  const random = seeded(`${seed}-grain`);
  ctx.save();
  for (let i = 0; i < 1600; i += 1) {
    const alpha = 0.018 + random() * 0.03;
    ctx.fillStyle = random() > 0.5
      ? `rgba(255,255,255,${alpha})`
      : `rgba(0,0,0,${alpha})`;
    const size = random() * 2.2 + 0.35;
    ctx.fillRect(random() * width, random() * height, size, size);
  }
  ctx.restore();
}

function drawCoverTypography(
  ctx: CanvasRenderingContext2D,
  book: CatalogBook,
  width: number,
  height: number,
  decalOnly = false,
) {
  ctx.save();
  ctx.fillStyle = _DEFAULTINK;
  ctx.textBaseline = "top";
  ctx.letterSpacing = "7px";
  ctx.font = `600 25px ${sans}`;
  ctx.fillText(siteConfig.coverImprint, 82, 74);

  ctx.letterSpacing = "0px";
  const titleSize =
    book.title.length > 38 ? 74 : book.title.length > 24 ? 86 : 112;
  ctx.font = `520 ${titleSize}px ${serif}`;
  const titleY = 142;
  const titleLines = wrapText(
    ctx,
    book.title,
    78,
    titleY,
    width - 156,
    titleSize * 0.91,
    5,
  );

  ctx.font = `520 31px ${sans}`;
  ctx.letterSpacing = "0.2px";
  ctx.fillText(
    book.author,
    82,
    Math.max(320, titleY + titleLines * titleSize * 0.91 + 35),
  );

  if (!decalOnly) {
    ctx.globalAlpha = 0.75;
    ctx.font = `500 20px ${sans}`;
    ctx.letterSpacing = "3px";
    ctx.fillText(siteConfig.coverTagline, 82, height - 90);
  }
  ctx.restore();
}

export function createFrontCover(book: CatalogBook) {
  const logicalWidth = 1024;
  const logicalHeight = 1536;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(0.5, 0.5);

  ctx.fillStyle = book.cover;
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  drawMotif(ctx, book, logicalWidth, logicalHeight);
  addPaperGrain(ctx, logicalWidth, logicalHeight, book.id);

  ctx.save();
  ctx.globalAlpha = 0.26;
  ctx.strokeStyle = _DEFAULTINK;
  ctx.lineWidth = 4;
  ctx.strokeRect(22, 22, logicalWidth - 44, logicalHeight - 44);
  ctx.restore();

  drawCoverTypography(ctx, book, logicalWidth, logicalHeight);
  return canvas;
}

export function createTitleDecal(book: CatalogBook) {
  const logicalWidth = 1024;
  const logicalHeight = 1536;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(0.5, 0.5);
  drawCoverTypography(ctx, book, logicalWidth, logicalHeight, true);
  return canvas;
}

export function createSpineCover(book: CatalogBook) {
  const logicalWidth = 256;
  const logicalHeight = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(0.5, 0.5);

  ctx.fillStyle = book.cover;
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  addPaperGrain(ctx, logicalWidth, logicalHeight, `${book.id}-spine`);

  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.fillRect(20, 24, 8, logicalHeight - 48);
  ctx.fillStyle = "#212121";
  ctx.translate(logicalWidth / 2 + 24, logicalHeight - 130);
  ctx.rotate(-Math.PI / 2);
  const size = book.title.length > 24 ? 68 : 82;
  ctx.font = `560 ${size}px ${serif}`;
  ctx.textBaseline = "middle";
  ctx.fillText(book.title, 0, 0, 1660);
  ctx.font = `520 35px ${sans}`;
  ctx.fillText(book.author.replace(/^Edited by /, ""), 0, 72, 1450);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = _DEFAULTINK;
  ctx.font = `700 26px ${sans}`;
  ctx.textAlign = "center";
  ctx.fillText(siteConfig.spineMark, logicalWidth / 2 + 10, logicalHeight - 42);
  ctx.restore();
  return canvas;
}

export function createBackCover(book: CatalogBook) {
  const logicalWidth = 1024;
  const logicalHeight = 1536;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(0.5, 0.5);

  ctx.fillStyle = book.cover;
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  addPaperGrain(ctx, logicalWidth, logicalHeight, `${book.id}-back`);

  ctx.fillStyle = _DEFAULTINK;
  ctx.font = `500 45px ${serif}`;
  ctx.textBaseline = "top";
  // const lines = wrapText(ctx, book.description, 108, 180, 808, 58, 12);

  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = _DEFAULTACCENT;
  // ctx.fillRect(108, 180 + lines * 58 + 78, 108, 9);
  ctx.restore();

  ctx.font = `italic 500 54px ${serif}`;
  // wrapText(
  //   ctx,
  //   `“${book.quote}”`,
  //   108,
  //   180 + lines * 58 + 132,
  //   808,
  //   63,
  //   6,
  // );
  ctx.font = `600 24px ${sans}`;
  ctx.letterSpacing = "2px";
  // ctx.fillText(book.quoteBy.toUpperCase(), 110, 1160);

  ctx.globalAlpha = 0.78;
  ctx.font = `500 20px ${sans}`;
  ctx.letterSpacing = "3px";
  ctx.fillText(
    `${siteConfig.coverImprint} · ${siteConfig.coverTagline}`,
    110,
    1380,
  );
  ctx.restore();
  return canvas;
}
