Array.prototype.flat = function (arr) {
  return arr.reduce((pre, cur) => {
    return pre.concat(cur instanceof Array ? this.flat(cur) : cur);
  }, []);
};
