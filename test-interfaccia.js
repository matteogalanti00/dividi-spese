// Test dell'interfaccia: apre index.html in un browser automatico (Playwright)
// a dimensione telefono e controlla che i messaggi d'errore compaiano e spariscano
// quando devono.
// Per eseguirlo serve Playwright:  npm install playwright && npx playwright install chromium
// Poi:  node test-interfaccia.js

let chromium;
try { ({ chromium } = require("playwright")); }
catch (e) { console.log("⏭️  Playwright non installato: test dell'interfaccia saltati."); process.exit(0); }

const path = require("path");
const url = "file://" + path.join(__dirname, "index.html");

let passed = 0, failed = 0;
function check(name, ok) {
  if (ok) { passed++; console.log("✅ " + name); }
  else { failed++; console.log("❌ " + name); }
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const jsErrors = [];
  page.on("pageerror", e => jsErrors.push(e.message));
  await page.goto(url);
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload();

  const personError = () => page.textContent("#personError");
  const expenseError = () => page.textContent("#expenseError");
  const addPerson = async name => { await page.fill("#personName", name); await page.click("#personForm button"); };
  const submitExpense = () => page.click("#expenseForm button[type=submit]");

  // Caso 1: "servono due partecipanti" sparisce dopo aver aggiunto le persone
  await submitExpense();
  check("Senza partecipanti compare l'errore", (await expenseError()).includes("almeno due"));
  await addPerson("Anna"); await addPerson("Bruno");
  check("Dopo aver aggiunto due persone l'errore sparisce", (await expenseError()) === "");

  // Caso 2: "importo non valido" sparisce appena si corregge il campo
  await page.fill("#amount", "abc"); await submitExpense();
  check("Con importo sbagliato compare l'errore", (await expenseError()).includes("Importo non valido"));
  await page.fill("#amount", "12,50");
  check("Correggendo l'importo l'errore sparisce", (await expenseError()) === "");
  await submitExpense();
  check("La spesa corretta viene aggiunta", (await page.locator("[data-del-expense]").count()) === 1);

  // Nome doppio: l'errore compare e sparisce quando si scrive di nuovo
  await addPerson("anna");
  check("Con un nome già presente compare l'errore", (await personError()).includes("già qualcuno"));
  await page.fill("#personName", "Carla");
  check("Scrivendo un altro nome l'errore sparisce", (await personError()) === "");
  await page.fill("#personName", "");

  // Caso 3: "compare in qualche spesa" sparisce dopo aver eliminato la spesa
  await page.click("[data-del-person]");
  check("Eliminando chi è in una spesa compare l'errore", (await personError()).includes("compare in qualche spesa"));
  await page.click("[data-del-expense]");
  check("Dopo aver eliminato la spesa l'errore sparisce", (await personError()) === "");

  // Caso 4: "Ricomincia" toglie ogni errore
  await page.fill("#amount", "5"); await submitExpense();   // aggiunge una spesa
  await page.click("[data-del-person]");                    // provoca di nuovo l'errore
  await page.click("#resetBtn"); await page.click("#confirmYes");
  check("Dopo 'Ricomincia' non resta nessun errore", (await personError()) === "" && (await expenseError()) === "");

  check("Nessun errore JavaScript nella pagina", jsErrors.length === 0);

  await browser.close();
  console.log(`\n${passed} test superati, ${failed} falliti`);
  process.exit(failed ? 1 : 0);
})();
