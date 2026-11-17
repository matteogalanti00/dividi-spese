// Test automatici: estrae la parte "LOGICA" dalla pagina e la mette alla prova.
const fs = require("fs");
const html = fs.readFileSync(__dirname + "/index.html", "utf8");
const code = html.split("// === LOGICA START ===")[1].split("// === LOGICA END ===")[0];
const { parseEuro, splitCents, computeBalances, settle } =
  new Function(code + "; return { parseEuro, splitCents, computeBalances, settle };")();

let ok = 0, fail = 0;
function check(name, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  pass ? ok++ : fail++;
  console.log(`${pass ? "✅" : "❌"} ${name}${pass ? "" : `\n    atteso: ${JSON.stringify(expected)}\n    ottenuto: ${JSON.stringify(got)}`}`);
}

// 1. Lettura degli importi
check("'12,50' diventa 1250 centesimi", parseEuro("12,50"), 1250);
check("'12.5' diventa 1250", parseEuro("12.5"), 1250);
check("'1.234,56' diventa 123456", parseEuro("1.234,56"), 123456);
check("'€ 7' diventa 700", parseEuro("€ 7"), 700);
check("'0,1' + '0,2' fa esattamente 30 centesimi", parseEuro("0,1") + parseEuro("0,2"), 30);
check("'abc' è rifiutato", parseEuro("abc"), null);
check("'-5' è rifiutato", parseEuro("-5"), null);
check("'0' è rifiutato", parseEuro("0"), null);
check("'3,999' (troppi decimali) è rifiutato", parseEuro("3,999"), null);

// 2. Divisione con centesimi che avanzano
check("10 € tra 3 = 3,34 + 3,33 + 3,33", splitCents(1000, 3), [334, 333, 333]);
check("La somma delle quote è sempre il totale", splitCents(1001, 7).reduce((a, b) => a + b), 1001);

// 3. Saldi e rimborsi
const P = ["A", "B", "C"].map(id => ({ id, name: id }));
let bal = computeBalances(P, [{ cents: 9000, payerId: "A", among: ["A", "B", "C"] }]);
check("A paga 90 € per tre: A +60, B -30, C -30",
  [bal.A.balance, bal.B.balance, bal.C.balance], [6000, -3000, -3000]);
check("...quindi B e C danno 30 € ciascuno ad A", settle(bal),
  [{ from: "B", to: "A", cents: 3000 }, { from: "C", to: "A", cents: 3000 }]);

bal = computeBalances(P, [
  { cents: 3000, payerId: "A", among: ["A", "B", "C"] },
  { cents: 3000, payerId: "B", among: ["A", "B", "C"] },
  { cents: 3000, payerId: "C", among: ["A", "B", "C"] },
]);
check("Tutti pagano uguale: nessun rimborso", settle(bal), []);

bal = computeBalances(P, [{ cents: 2000, payerId: "C", among: ["A", "B"] }]);
check("C paga per A e B ma non partecipa: A e B danno 10 € a C",
  settle(bal).map(t => t.cents), [1000, 1000]);

// 4. Prova "a tappeto": 500 gruppi casuali, i conti devono sempre tornare
let allGood = true;
for (let k = 0; k < 500; k++) {
  const n = 2 + Math.floor(Math.random() * 6);
  const people = Array.from({ length: n }, (_, i) => ({ id: "p" + i, name: "p" + i }));
  const expenses = Array.from({ length: 1 + Math.floor(Math.random() * 10) }, () => {
    const among = people.filter(() => Math.random() < 0.7).map(p => p.id);
    return { cents: 1 + Math.floor(Math.random() * 50000),
             payerId: people[Math.floor(Math.random() * n)].id,
             among: among.length ? among : [people[0].id] };
  });
  const b = computeBalances(people, expenses);
  const sum = Object.values(b).reduce((s, x) => s + x.balance, 0);
  const after = Object.fromEntries(Object.entries(b).map(([id, x]) => [id, x.balance]));
  const tr = settle(b);
  tr.forEach(t => { after[t.from] += t.cents; after[t.to] -= t.cents; });
  if (sum !== 0 || Object.values(after).some(v => v !== 0) || tr.length > n - 1) allGood = false;
}
check("500 gruppi casuali: dopo i rimborsi tutti a zero, al massimo (persone - 1) bonifici", allGood, true);

console.log(`\n${ok} test superati, ${fail} falliti`);
process.exit(fail ? 1 : 0);
