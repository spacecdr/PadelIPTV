# Sviluppo

## Build

Richiede Node.js moderno per i test, la CLI LG webOS TV sul PATH (pacchetto verificato con CLI 3.2.6) e Chrome per i test browser. Non cambiare la compatibilità ES5 del codice distribuito: il servizio deve funzionare anche su Node 0.12.2.

```sh
npm ci
npm test
npm run test:remote
npm run build
```

Il risultato è `dist/it.pepis.padel.tv_0.6.0_all.ipk`. Il comando sottostante è `ares-package app service --outdir dist`: includere sempre entrambe le directory. Node/npm non sono necessari sulla TV per installare l'IPK.

Per verificare l'interfaccia IPTV con dati sintetici, in un terminale eseguire `python3 -m http.server 8769 --bind 127.0.0.1 --directory app`, poi `node tests/iptv-browser.cjs`. Il test non contatta una TV. I test unitari coprono parser M3U, persistenza, gruppi/preferiti/zapping, matcher XMLTV, gzip, fallback/cache e sicurezza del telecomando. `npm run screenshots` avvia un proprio server temporaneo e genera le immagini demo in `docs/assets`; usa solo fixture.

## Struttura

- `app/`: Home, catalogo padel, player, IPTV, loghi/EPG, client Luna e telecomando.
- `service/`: HTTP locale, autenticazione, archivio M3U, download TLS, parser e cache XMLTV.
- `tests/`: verifiche locali, senza indirizzi o configurazioni di dispositivi personali.
- `examples/`: formato M3U non riproducibile.
- `docs/`: sito statico GitHub Pages e schermate riproducibili.

La TV ospita il server del telecomando: il computer serve per sviluppo/installazione, non per l'uso quotidiano. Il servizio Luna limita i chiamanti all'app. L'HTTP autentica le API e controlla origine, dimensione delle richieste e comandi consentiti.

## EPG e vecchio runtime

Gli indici esatti/normalizzati/nomi sono costruiti una volta per guida. Un'ambiguità sull'ID normalizzato interrompe il matching; i candidati dei due nomi sono uniti prima di verificarne l'unicità. Numeri e segni `+` sono significativi. Una risposta ritardata della guida non deve sovrascrivere il canale corrente.

Non collegare direttamente il socket HTTP a gunzip su Node 0.12: la backpressure ha causato `aborted` anche con risposta completa. Il download raccoglie prima il corpo compresso (limite 32 MB), poi usa PassThrough → gunzip → SAX (XML fino a 128 MB). Il parser limita anche canali/programmi e rifiuta dichiarazioni di entità interne. Il bundle CA deve essere passato come array di PEM separati su questo runtime; mantenere verifica TLS e hostname.

La guida usa una sorgente per volta, conserva la cache precedente se il rinnovo fallisce e non considera attuale un programma scaduto. Il pannello EPG non deve riapparire solo per effetto di un aggiornamento in background.

## Pubblicazione

Aggiornare insieme `app/appinfo.json`, `service/package.json` e `package.json`. Eseguire test/build, verificare l'archivio IPK, creare tag e release con IPK e `SHA256SUMS`. GitHub Pages pubblica `docs/` dal branch `main`.

Non importare playlist, credenziali, cache, configurazioni CLI, schermate con dati personali o log della TV. Le immagini demo contengono canali campione e programmi inventati, esplicitamente segnalati. Gli ID dell'app restano storici per non separare i dati degli aggiornamenti.
