/* ===== Moteur de dés ===== */
window.Dice = (function () {
  function rollDie(sides) { return Math.floor(Math.random() * sides) + 1; }

  // Lance n dés à f faces, renvoie {rolls, sum}
  function roll(n, sides) {
    const rolls = [];
    for (let i = 0; i < n; i++) rolls.push(rollDie(sides));
    return { rolls, sum: rolls.reduce((a, b) => a + b, 0) };
  }

  // d20 avec modificateur + avantage/désavantage
  // mode: 'normal' | 'adv' | 'dis'
  function d20(mod = 0, mode = 'normal') {
    const a = rollDie(20), b = rollDie(20);
    let kept = a, other = null;
    if (mode === 'adv')  { kept = Math.max(a, b); other = Math.min(a, b); }
    if (mode === 'dis')  { kept = Math.min(a, b); other = Math.max(a, b); }
    return {
      natural: kept, other, mod,
      total: kept + mod,
      crit: kept === 20, fail: kept === 1, mode
    };
  }

  // parse une expression type "2d6+3", "d20", "1d8-1", "4d4"
  function parse(expr) {
    const m = String(expr).replace(/\s+/g, '').toLowerCase()
      .match(/^(\d*)d(\d+)([+-]\d+)?$/);
    if (!m) return null;
    const n = m[1] ? parseInt(m[1], 10) : 1;
    const sides = parseInt(m[2], 10);
    const mod = m[3] ? parseInt(m[3], 10) : 0;
    if (n < 1 || n > 100 || sides < 2 || sides > 1000) return null;
    return { n, sides, mod };
  }

  function rollExpr(expr) {
    const p = parse(expr);
    if (!p) return null;
    const r = roll(p.n, p.sides);
    return { ...p, rolls: r.rolls, total: r.sum + p.mod, expr };
  }

  return { roll, d20, rollExpr, parse, rollDie };
})();
