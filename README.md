# puzzle-pieces

Generate puzzles pieces from an image. Works on browser only.

## Library
Exports a single function `puzzlePieces(config, callback)`:
- `config` is an object with the following properties:
  - `config.image`: DOM image element; must be already loaded.
  - `config.cols`: Number of columns of pieces to generate (default 6).
  - `config.lines`: Number of lines of pieces to generate (default 6).
- `callback(piece, {x, y})` is a function called each time a piece is generated, it receives the following arguments
  - `piece` is a canvas containing the piece. For performances reason the canvas is reused for other pieces to duplicate it if you want to make async actions on it.
  - `{x, y}` position of the piece on the grid defined by `config.cols` and `config.lines`. 

The lib does not scale the image up or down, and is not-that-fast™. So if your resolution is high, better resize your image to reasonable values before passing it to the library.

## Example

```js
import puzzlePieces from 'puzzle-pieces';

const image = document.createElement('img');
image.src = 'test.jpg';
image.onload = () => {

  const pieces = [];
  puzzlePieces({image, col: 10, lines: 10}, (piece, {x, y}) => {
    if (!pieces[x]) pieces[x] = [];
    pieces[x][y] = piece.toDataURL();
    const image = document.createElement('img');
    image.src = pieces[x][y];
    document.getElementById('app').appendChild(image);
  });

};
```