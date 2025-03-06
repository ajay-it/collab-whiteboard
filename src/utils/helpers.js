export const roundTo2Deci = (x, y = undefined) => {
  if (y === undefined) {
    return Number(x.toFixed(2));
  }
  return [Number(x.toFixed(2)), Number(y.toFixed(2))];
};
