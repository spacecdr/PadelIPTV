# Porting Samsung Tizen (in sviluppo)

Target: Samsung UE55NU7400, modello 2018 / Tizen 4.0 / Chromium 56.
Questo porting è separato dalla release webOS 0.6.0. Non è ancora verificato sulla TV e non costituisce una release installabile.

L'interfaccia, catalogo e logica IPTV/EPG sono riutilizzabili. AVPlay sostituisce il player webOS; il tasto Back Samsung (10009) viene normalizzato al comando interno (461). I servizi Luna e il servizio Node.js LG non esistono nell'app web Tizen: persistenza, download XMLTV e telecomando HTTP richiedono un adattamento separato, da verificare sul dispositivo.

Il manifest usa un identificatore Tizen distinto. I certificati Samsung e le configurazioni del dispositivo restano esterni al repository. Prima di distribuire un `.wgt` occorrono firma Samsung valida per il dispositivo, strumenti di installazione e test su TV.

Fonti:
- https://developer.samsung.com/smarttv/develop/specifications/tv-model-groups.html
- https://developer.samsung.com/smarttv/develop/specifications/web-engine-specifications.html
- https://developer.samsung.com/smarttv/develop/guides/multimedia/media-playback/using-avplay.html
- https://developer.samsung.com/smarttv/develop/guides/user-interaction/remote-control.html

Stato: adattatore AVPlay e mappatura tasti implementati e verificati con mock; servizio dati e installazione da completare. Nessuna modifica alla versione LG installata o alla release pubblica.

Preparazione della build diagnostica (non firmata):

```sh
node tools/build-tizen.cjs
node tests/tizen/avplay.test.cjs
node tests/tizen/browser.cjs
```

Output: `dist/tizen/`. Riutilizza il catalogo reale, menu e HUD; AVPlay viene adattato all’interfaccia del player condiviso. Il servizio IPTV/EPG/telecomando è esplicitamente segnalato come non ancora disponibile in questa build. Non distribuire come porting completo.

Telecomando web senza server esterno: valutare il modulo NaCl TCP server documentato da Samsung per i modelli 2018. Non assumere che le API socket WebAssembly dei modelli più recenti siano presenti su Tizen 4.0.
https://developer.samsung.com/smarttv/develop/extension-libraries/nacl/sample-based-tutorials/sockets-in-cplusplus.html

La CLI ufficiale Tizen ha completato `tizen build-web -- dist/tizen` con esito positivo. Questo verifica la preparazione del progetto web, non sostituisce firma e collaudo su TV. Collegamento SDB al dispositivo target verificato; nessuna app installata finora.
