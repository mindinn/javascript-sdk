const isNode = () => {
  if (typeof process === 'object' &&
      typeof process.versions === 'object' &&
      typeof process.versions.node !== 'undefined')
    return true;

  return false;
};


module.exports = {
  isNode
};
