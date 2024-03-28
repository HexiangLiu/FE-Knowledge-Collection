String.prototype.trim2 = function () {
  var str = this,
    str = str.replace(/^\s+/, '');
  for (var i = str.length - 1; i >= 0; i--) {
    if (/\S/.test(str.charAt(i))) {
      str = str.substring(0, i + 1);
      break;
    }
  }
  return str;
};

const greeting = '   Hello world!   ';

console.log(greeting);
// Expected output: "   Hello world!   ";

console.log(greeting.trim2());
// Expected output: "Hello world!";

String.prototype.trim2 = function () {
  const str = this;
  let i = 0;
  let j = str.length - 1;
  while (/\s/.test(str[i]) || /\s/.test(str[j])) {
    if (/\s/.test(str[i])) {
      i++;
    }
    if (/\s/.test(str[j])) {
      j--;
    }
  }
  return str.substring(i, j + 1);
};
