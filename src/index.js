const FloodFill = require('q-floodfill');
const curve = require('curve').default;

const RANDOM = {
  midpoint: 0.1,
  lineVariation: 0.025
};

const random = (min = 0, max = 1) => (Math.random() * (max - min)) + min;

const getPixelFromData = (data, x, y, width) => {
  const index = ((y * (width * 4)) + (x * 4));
  return [data[index], data[index + 1], data[index + 2], data[index + 3]];
};

const createCanvas = (image, width, height) => {
  const canvas = document.createElement('canvas');
  canvas.height = height || image.height;
  canvas.width = width || image.width;
  return canvas.getContext('2d');
};

const createLines = (ctx, [[x, y], [width, height], [cols, lines]], invert = false) => {
  if (y >= height * lines) return;

  const size = Math.min(width, height);
  const midpoint = random(0.5 - RANDOM.midpoint, 0.5 + RANDOM.midpoint);
  const direction = random() > 0.5 ? 1 : -1;

  ctx.moveTo(invert ? y : x, invert ? x : y);

  let points = [
    0, 0,
    (midpoint - 0.1) * size, size * random(RANDOM.lineVariation * -1, RANDOM.lineVariation),
    (midpoint - 0.125) * size, 0.15 * size * direction,
    midpoint * size, 0.25 * size * direction,
    (midpoint + 0.125) * size, 0.15 * size * direction,
    (midpoint + 0.1) * size, size * random(RANDOM.lineVariation * -1, RANDOM.lineVariation),
    width, 0
  ].map((p, i) => i % 2 ? y + p : x + p);
  if (invert) points = points.map((e, i, arr) => i % 2 ? arr[i - 1] : arr[i + 1]);
  curve(ctx, points, 0.5, 100);

  createLines(ctx, [[x < (cols * width) ? x + width : 0, x < (cols * width) ? y : y + height], [width, height], [cols, lines]], invert);
};

export default ({image, cols = 6, lines = 6}, callback) => {
  const width = image.width / cols;
  const height = image.height / lines;

  const edgeCtx = createCanvas(image);
  const imageCtx = createCanvas(image);
  const piecesCtx = createCanvas(image, width * 1.5, height * 1.5);

  imageCtx.drawImage(image, 0, 0);

  createLines(edgeCtx, [[0, height], [width, height], [cols, lines]]);
  createLines(edgeCtx, [[0, height], [height, width], [lines, cols]], true);
  edgeCtx.stroke();
  const edges = edgeCtx.getImageData(0, 0, image.width, image.height);

  const {data: imageData} = imageCtx.getImageData(0, 0, image.width, image.height);
  for (let x = 0; x < cols; x++)
    for (let y = 0; y < lines; y++) {
      piecesCtx.clearRect(0, 0, width * 1.5, height * 1.5);

      const floodFill = new FloodFill(edges);
      floodFill.collectModifiedPixels = true;
      floodFill.fill('rgba(0,0,0,1)', Math.floor((x * width) + (width / 2)), Math.floor((y * height) + (height / 2)), 0);
      const pixels = Array.from(floodFill.modifiedPixels).map(p => p.split('|'));

      const bounds = [Math.min(...pixels.map(p => p[0])), Math.min(...pixels.map(p => p[1]))];

      pixels.forEach(([x, y]) => {
        const pixel = getPixelFromData(imageData, x, y, image.width);
        piecesCtx.fillStyle = `rgba(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`;
        piecesCtx.fillRect(x - bounds[0], y - bounds[1], 1, 1);
      });

      callback(piecesCtx.canvas, {x, y});
    }
};
