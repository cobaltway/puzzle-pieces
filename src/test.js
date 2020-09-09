/* eslint-env browser */

import lib from './index';

const el = document.createElement('img');
el.src = 'test.png';
el.onload = () => {
  const pieces = lib({
    image: el
  });

  pieces.forEach(p => {
    const el = document.createElement('img');
    el.src = p;
    document.getElementById('app').appendChild(el);
  });
};
