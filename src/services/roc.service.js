"use strict";

function tentukanRanking(bobotAHP) {
  const indexed = bobotAHP.map((val, idx) => ({ idx, val }));

  // sort descending berdasarkan bobot
  indexed.sort((a, b) => b.val - a.val);

  // assign rank (1-based) kembali ke posisi original
  const rankings = new Array(bobotAHP.length);
  indexed.forEach((item, urutan) => {
    rankings[item.idx] = urutan + 1;
  });

  return rankings;
}

function hitungBobotROC(n, rankings) {
  return rankings.map((rank) => {
    let sum = 0;
    for (let i = rank; i <= n; i++) {
      sum += 1 / i;
    }
    return (1 / n) * sum;
  });
}

module.exports = { tentukanRanking, hitungBobotROC };
