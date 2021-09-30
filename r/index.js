const wid = document.querySelector('#width');
const hei = document.querySelector('#height');
const tar = document.querySelector('#target');
const res = document.querySelector('#result')

// First n primes. More than enough for our use case of resizing small images.
const firstPrimes = [
  2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,
  113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,
  239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,
  373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,
  503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,
  647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,
  809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,
  953,967,971,977,983,991,997,1009,1013,1019,1021,1031,1033,1039,1049,1051,1061,1063,1069,
  1087,1091,1093,1097,1103,1109,1117,1123,1129,1151,1153,1163,1171,1181,1187,1193,1201,1213,
  1217,1223,1229,1231,1237,1249,1259,1277,1279,1283,1289,1291,1297,1301,1303,1307,1319,1321,
  1327,1361,1367,1373,1381,1399,1409,1423,1427,1429,1433,1439,1447,1451,1453,1459,1471,1481,
  1483,1487,1489,1493,1499,1511,1523,1531,1543,1549,1553,1559,1567,1571,1579,1583,1597,1601
];

// Use list of primes to get array of prime factors for a number
// e.g. factorize(168) --> [2, 2, 2, 3, 7]
function factorize(n) {
  n =  Math.abs(n | 0) || 1;

  const factors = [];
  firstPrimes.every(prime => {
    if (n === 1) {
      return false;
    }

    while (n % prime === 0) {
      n = n / prime;
      factors.push(prime);
    }
    return true;
  });

  return factors;
}


// Takes two int array of prime factors
// Returns "AxB" string with the smallest possible fraction for the ratio
//
// e.g. factors of 1024 and 768
// findFraction([2, 2, 2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2, 3]) --> "4x3"
function getRatio(arr1, arr2) {
  arr1 = arr1.filter(factor => {
    const idx = arr2.indexOf(factor);
    if (idx > -1) {
      arr2.splice(idx, 1);
      return false;
    }
    return true;
  });

  n1 = arr1.reduce((a, b) => a * b, 1);
  n2 = arr2.reduce((a, b) => a * b, 1);
  return `${n1}x${n2}`; 
}


// Calculates ratio and new sizes, if all values are given
// Aborts and empties result div if not
function calc() {
  const [w, h, t] = [wid.value, hei.value, tar.value].map(v => Math.abs(parseInt(parseFloat(v), 10) || 0));
  if (!w || !h || !t) {
    res.innerHTML = '';
    return;
  }

  const factorNice = getRatio(factorize(w), factorize(h));
  const factor = w / h;
  const newH = Math.round(t / factor) || 1;
  const newW = Math.round(t * factor) || 1;

  res.innerHTML = `
    <p>Seitenverhältnis: ${factorNice}</p>
    <p>Zielbreite ${t}? ➡️ ${t}x${newH}<p>
    <p>Zielhöhe ${t}? ➡️ ${newW}x${t}</p>
  `;
}


// Set up event listeners
const elems = [].slice.call(document.querySelectorAll('#width,#height,#target'));
elems.forEach(elem => {
  elem.addEventListener('input', calc, false);
  elem.addEventListener('blur', calc, false);
});

calc();
