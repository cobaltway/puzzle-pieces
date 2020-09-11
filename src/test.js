/* eslint-env browser */

import lib from './index';

const image = document.createElement('img');
image.src = 'test.jpg';
image.onload = () => {
  const pieces = [];
  lib({image}, (piece, {x, y}) => {
    if (!pieces[x]) pieces[x] = [];
    pieces[x][y] = piece.toDataURL();
    const image = document.createElement('img');
    image.src = pieces[x][y];
    document.getElementById('app').appendChild(image);
  });
};
