# Istruzioni per Claude — progetto "Dividi le spese"

## Chi è l'utente e come comunicare
- Matteo **non è uno sviluppatore**: sta imparando come funziona lo sviluppo software e il lavoro su GitHub.
- Rispondi **sempre in italiano**.
- **Spiega ogni passaggio** mentre lo fai: cosa stai facendo, perché, e come si chiama nel gergo (es. branch, commit, pull request, merge, test di regressione). Termini tecnici sì, ma sempre spiegati la prima volta.
- Segui il ciclo: requisiti → progettazione → sviluppo → test → rilascio → iterazione, e di' in quale fase siamo.

## Il progetto
App web di una sola pagina per dividere le spese di gruppo e calcolare chi deve quanto a chi.

- Pubblicata con **GitHub Pages** dal branch `main`, cartella root: https://matteogalanti00.github.io/dividi-spese/
- Ogni modifica che arriva su `main` aggiorna il sito automaticamente.

## Struttura dei file
- `index.html`: tutta l'app (HTML + CSS + JavaScript in un solo file, nessuna dipendenza esterna, nessun build).
  Il JavaScript è diviso in blocchi:
  - **LOGICA** (tra i commenti `// === LOGICA START ===` e `// === LOGICA END ===`): solo funzioni pure, senza accesso alla pagina (`parseEuro`, `splitCents`, `computeBalances`, `settle`, `formatEuro`, `summaryText`). Si testano da sole.
  - **Stato**: `state = { people, expenses }`, salvato in `localStorage` (con try/catch).
  - **Render**: `render()` ridisegna la pagina a partire dallo stato.
  - **Eventi**: gestori dei form e dei click (delegati su `document`).
- `test.js`: test automatici della LOGICA. Estrae il blocco LOGICA da `index.html` e lo esegue.
- `README.md`: presentazione del progetto.

## Regole tecniche
- **Soldi sempre in centesimi interi** (1250 = 12,50 €), mai numeri decimali.
- Ogni nuova funzione di calcolo va nel blocco LOGICA e deve avere un test in `test.js`.
- Prima di ogni commit: `node test.js` deve dare 0 test falliti.
- Per cambiamenti all'interfaccia, se possibile verificare anche in un browser headless (es. Playwright) a dimensione telefono (390×844) e controllare che non ci siano errori JavaScript.
- Testi dell'interfaccia in italiano, pensati per l'uso da telefono.
- Niente `alert`/`confirm`/`prompt`: usare messaggi e conferme dentro la pagina.

## Flusso di lavoro GitHub (da professionisti)
- **Non fare push diretto su `main`.**
- Per ogni modifica: crea un **branch** con un nome descrittivo (es. `feature/quote-diverse`, `fix/arrotondamenti`), fai commit piccoli con messaggi chiari in italiano, poi apri una **pull request** verso `main` con una descrizione di cosa cambia e come è stato testato.
- Matteo rivede la pull request su GitHub e fa lui il **merge**: spiegagli come farlo.
- Le impostazioni del repository (es. GitHub Pages) le cambia Matteo dall'interfaccia di GitHub: dagli istruzioni passo passo.

## Idee per i prossimi passi
- Spese divise in parti non uguali (es. una persona paga doppio)
- Più gruppi separati (es. "Viaggio", "Casa")
- Condividere lo stesso gruppo tra più telefoni (richiede un database/server)
- Esportare il riepilogo completo
