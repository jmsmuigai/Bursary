// Password hashing for locally stored applicant accounts (SHA-256, salted with the account email).
// Plain-text passwords are never stored. Older plain-text records are upgraded on next login.
(function () {
  'use strict';
  function sha256(ascii) {
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    var bytes = unescape(encodeURIComponent(ascii)), words = [], len = bytes.length * 8, i, j, h = [], k = [];
    var isPrime = {}, c = 0;
    for (var cand = 2; c < 64; cand++) {
      if (!isPrime[cand]) {
        for (i = 0; i < 313; i += cand) isPrime[i] = cand;
        h[c] = (Math.pow(cand, 0.5) * 4294967296) | 0;
        k[c++] = (Math.pow(cand, 1 / 3) * 4294967296) | 0;
      }
    }
    h = h.slice(0, 8);
    bytes += '\x80';
    while (bytes.length % 64 - 56) bytes += '\x00';
    for (i = 0; i < bytes.length; i++) words[i >> 2] |= bytes.charCodeAt(i) << ((3 - i) % 4) * 8;
    words[words.length] = (len / 4294967296) | 0;
    words[words.length] = len;
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), old = h;
      h = h.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2], a = h[0], e = h[4];
        var t1 = h[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & h[5]) ^ (~e & h[6])) + k[i] +
          (w[i] = i < 16 ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & h[1]) ^ (a & h[2]) ^ (h[1] & h[2]));
        h = [(t1 + t2) | 0].concat(h);
        h[4] = (h[4] + t1) | 0;
      }
      for (i = 0; i < 8; i++) h[i] = (h[i] + old[i]) | 0;
    }
    var out = '';
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (h[i] >> (j * 8)) & 255; out += (b < 16 ? '0' : '') + b.toString(16); }
    return out;
  }
  function hash(pwd, salt) {
    var s = 'mbms:' + String(salt || '').toLowerCase() + ':' + pwd, d = s;
    for (var n = 0; n < 1000; n++) d = sha256(d + s);
    return 'sha256$' + d;
  }
  function check(user, pwd, salt) {
    if (!user || !user.password) return false;
    if (String(user.password).indexOf('sha256$') === 0) return user.password === hash(pwd, salt);
    return user.password === pwd; // legacy record: caller upgrades it
  }
  window.MBMS_pw = { hash: hash, check: check, sha256: sha256 };
})();
