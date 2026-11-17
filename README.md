# 💸 Dividi le spese

Una piccola app web per dividere le spese di gruppo (viaggi, cene, coinquilini) e scoprire chi deve quanto a chi, con pochi bonifici.

## Cosa fa
- Aggiungi i partecipanti
- Inserisci le spese: chi ha pagato, quanto, tra chi dividere
- Vedi i saldi di ognuno
- Ottieni l'elenco dei rimborsi da fare

I dati restano salvati nel browser di chi usa l'app.

## Com'è fatta
- `index.html`: tutta l'app in un solo file (HTML per la struttura, CSS per l'aspetto, JavaScript per i calcoli)
- `test.js`: test automatici dei calcoli. Per eseguirli: `node test.js`
- `test-interfaccia.js`: test automatici dell'interfaccia in un browser (es. i messaggi d'errore). Richiede Playwright; per eseguirli: `node test-interfaccia.js`

## Dettagli tecnici
- Gli importi sono gestiti in centesimi interi, per evitare errori di arrotondamento.
- I centesimi che avanzano in una divisione (es. 10 € tra 3) vengono assegnati ai primi partecipanti.
