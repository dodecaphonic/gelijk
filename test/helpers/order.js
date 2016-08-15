const { sort } = require("ramda");

module.exports = sort((a, b) => {
  const na = a.toLowerCase();
  const nb = b.toLowerCase();

  if (na < nb) {
    return -1;
  } else if (na > nb) {
    return 1;
  }

  return 0;
});
