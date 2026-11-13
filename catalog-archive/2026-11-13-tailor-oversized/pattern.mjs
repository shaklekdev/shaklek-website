// Pattern diagram: wrong (fitted) vs right (oversized). Proportions only, no cm printed.
export function patternSvg(W, H) {
  const u = 7.4; // px per cm
  const P = (pts, ox, oy) => pts.map(([x, y]) => `${(ox + x * u).toFixed(1)},${(oy + y * u).toFixed(1)}`);
  const dot = (n, x, y, c) => `<circle cx="${x}" cy="${y}" r="26" fill="${c}" stroke="white" stroke-width="4"/><text x="${x}" y="${y + 11}" font-family="Helvetica" font-weight="bold" font-size="32" fill="white" text-anchor="middle">${n}</text>`;
  const lbl = (t, x, y, c, s = 30) => `<text x="${x}" y="${y}" font-family="Helvetica" font-weight="bold" font-size="${s}" fill="${c}" text-anchor="middle">${t}</text>`;
  const body = (ox, oy, ok) => {
    const x = (v) => ox + v * u, y = (v) => oy + v * u;
    if (ok) return `<path d="M ${x(0)} ${y(8)} Q ${x(7)} ${y(7)} ${x(8)} ${y(0)} L ${x(26)} ${y(3)} L ${x(26.5)} ${y(26)} Q ${x(27)} ${y(30)} ${x(31)} ${y(30)} L ${x(31)} ${y(72)} L ${x(0)} ${y(72)} Z" fill="#eef7f0" stroke="#111" stroke-width="3"/>
      <line x1="${x(19)}" y1="${y(0)}" x2="${x(19)}" y2="${y(10)}" stroke="#999" stroke-width="2" stroke-dasharray="6 5"/>`;
    return `<path d="M ${x(0)} ${y(8)} Q ${x(7)} ${y(7)} ${x(8)} ${y(0)} L ${x(19)} ${y(4)} Q ${x(17)} ${y(16)} ${x(18)} ${y(19)} Q ${x(20)} ${y(22)} ${x(24)} ${y(22)} Q ${x(20.5)} ${y(32)} ${x(21)} ${y(40)} Q ${x(22)} ${y(55)} ${x(24)} ${y(72)} L ${x(0)} ${y(72)} Z" fill="#fbeeee" stroke="#111" stroke-width="3"/>`;
  };
  const sleeve = (cx, oy, ok) => {
    const x = (v) => cx + v * u, y = (v) => oy + v * u;
    if (ok) return `<path d="M ${x(-23)} ${y(7)} Q ${x(-12)} ${y(0)} ${x(0)} ${y(0)} Q ${x(12)} ${y(0)} ${x(23)} ${y(7)} L ${x(17)} ${y(55)} L ${x(-17)} ${y(55)} Z" fill="#eef7f0" stroke="#111" stroke-width="3"/>`;
    return `<path d="M ${x(-16)} ${y(15)} Q ${x(-8)} ${y(0)} ${x(0)} ${y(0)} Q ${x(8)} ${y(0)} ${x(16)} ${y(15)} L ${x(11)} ${y(58)} L ${x(-11)} ${y(58)} Z" fill="#fbeeee" stroke="#111" stroke-width="3"/>`;
  };
  const half = W / 2, oy = 175, R = "#c0392b", G = "#1e8449";
  let s = `<svg width="${W}" height="${H}"><rect width="100%" height="100%" fill="white"/>`;
  s += `<rect x="0" y="0" width="${half - 15}" height="80" fill="${R}"/>` + lbl("✗  CUT LIKE THIS — NO", (half - 15) / 2, 56, "white", 42);
  s += `<rect x="${half + 15}" y="0" width="${half - 15}" height="80" fill="${G}"/>` + lbl("✓  CUT LIKE THIS — YES", half + 15 + (half - 15) / 2, 56, "white", 42);
  s += `<line x1="${half}" y1="0" x2="${half}" y2="${H}" stroke="#ccc" stroke-width="3"/>`;
  // WRONG
  const bx = 90, sx = bx + 31 * u + 260;
  s += body(bx, oy, false) + sleeve(sx, oy, false);
  s += lbl("FRONT BODY", bx + 12 * u, oy + 72 * u + 50, "#555") + lbl("SLEEVE", sx, oy + 72 * u + 50, "#555");
  s += lbl("HIGH CAP", sx, oy - 18, R) + lbl("NARROW", sx + 170, oy + 35 * u, R, 26);
  s += lbl("SHOULDER TOO SHORT", bx + 12 * u, oy - 22, R, 26);
  s += lbl("WAIST ✗", bx + 21 * u + 85, oy + 40 * u + 10, R, 26);
  // RIGHT
  const rbx = half + 90, rsx = rbx + 31 * u + 300;
  s += body(rbx, oy, true) + sleeve(rsx, oy, true);
  s += lbl("FRONT BODY", rbx + 15 * u, oy + 72 * u + 50, "#555") + lbl("SLEEVE", rsx, oy + 72 * u + 50, "#555");
  s += dot(1, rbx + 26 * u + 22, oy + 3 * u - 22, G);
  s += dot(3, rbx + 31 * u + 32, oy + 30 * u, G) + lbl("DEEP", rbx + 31 * u + 32, oy + 30 * u + 60, G, 24);
  s += dot(2, rbx + 31 * u + 32, oy + 55 * u, G) + lbl("STRAIGHT", rbx + 31 * u + 32, oy + 55 * u + 60, G, 22);
  s += lbl("LOW FLAT CAP", rsx, oy - 18, G) + dot(4, rsx + 23 * u + 34, oy + 25 * u, G) + lbl("WIDE", rsx + 23 * u + 34, oy + 25 * u + 60, G, 24);
  return s + `</svg>`;
}
