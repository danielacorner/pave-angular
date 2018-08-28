export { getWidth, getHeight };
const getDims = (d, w) => document.querySelector(d).getBoundingClientRect()[w];
const getWidth = d => getDims(d, 'width');
const getHeight = d => getDims(d, 'height');
