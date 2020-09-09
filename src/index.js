import './curve';
import FloodFill from 'q-floodfill';

const random = (min = 0, max = 1) => (Math.random() * (max - min)) + min;

const invertPoints = (points, invert = true) => invert ? points.map((e, i, arr) => i % 2 ? arr[i - 1] : arr[i + 1]) : points;

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
  if (y >= height * lines) {
    return;
  }

  const size = Math.min(width, height);
  const midpoint = random(0.4, 0.6);
  const direction = random() > 0.5 ? 1 : -1;

  ctx.moveTo(invert ? y : x, invert ? x : y);
  ctx.curve(invertPoints([
    x,
    y,
    x + ((midpoint - 0.1) * size),
    y + (size * random(-0.025, 0.025)),
    x + ((midpoint - 0.125) * size),
    y + (0.15 * size * direction),
    x + (midpoint * size),
    y + (0.25 * size * direction),
    x + ((midpoint + 0.125) * size),
    y + (0.15 * size * direction),
    x + ((midpoint + 0.1) * size),
    y + (size * random(-0.025, 0.025)),
    x + width,
    y
  ], invert), 0.5, 100);

  createLines(ctx, [[x < (cols * width) ? x + width : 0, x < (cols * width) ? y : y + height], [width, height], [cols, lines]], invert);
};

export default ({image, cols = 24, lines = 16}) => {
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
  const pieces = [];
  Array.from(Array(cols).keys()).forEach(x => {
    Array.from(Array(lines).keys()).forEach(y => {
      piecesCtx.clearRect(0, 0, width * 1.5, height * 1.5);

      const floodFill = new FloodFill(edges);
      floodFill.collectModifiedPixels = true;
      floodFill.fill('rgba(0,0,0,.5)', Math.floor((x * width) + (width / 2)), Math.floor((y * height) + (height / 2)), 0);
      const pixels = Array.from(floodFill.modifiedPixels).map(p => p.split('|'));

      const area = [Math.min(...pixels.map(p => p[0])), Math.min(...pixels.map(p => p[1]))];

      pixels.forEach(([x, y]) => {
        const pixel = getPixelFromData(imageData, x, y, image.width);
        piecesCtx.fillStyle = `rgba(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`;
        piecesCtx.fillRect(x - area[0], y - area[1], 1, 1);
      });

      pieces.push(piecesCtx.canvas.toDataURL());
    });
  });

  return pieces;
};
