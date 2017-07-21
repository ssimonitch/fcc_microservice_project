const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const base = alphabet.length;

// utility function to convert base 10 integer to base 36 string
// https://coligo.io/create-url-shortener-with-node-express-mongo/

const encode = (num) => {
  let encoded = '';
  while (num) {
    let remainder = num % base;
    num = Math.floor(num / base);
    encoded = alphabet[remainder].toString() + encoded;
  }
  return encoded;
};

// utility function to convert base 36 string to base 10 integer
const decode = (str) => {
  let decoded = 0;
  while (str) {
    let index = alphabet.indexOf(str[0]);
    let power = str.length - 1;
    decoded += index * (Math.pow(base, power));
    str = str.substring(1);
  }
  return decoded;
};

module.exports.encode = encode;
module.exports.decode = decode;
