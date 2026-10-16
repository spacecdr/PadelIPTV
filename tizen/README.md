# Padel IPTV per Samsung Tizen

Porting installato e verificato su **Samsung UE55NU7400 (2018), Tizen 4.0 / Chromium 56**, il 10 ottobre 2026. Disponibile nella release **0.6.8** insieme al pacchetto webOS. Per installare il WGT precompilato, seguire [INSTALLAZIONE.md](../INSTALLAZIONE.md#samsung-tizen): non serve ricompilare il modulo nativo.

## Funzioni

Home IPTV/Padel, catalogo pubblico degli ultimi 10 tornei, AVPlay per video e tracce audio, playlist M3U, gruppi/bouquet e preferiti, zapping CH+/CH−, lista trasparente con Su, loghi, EPG attuale/successivo e telecomando web sulla porta **8768**. Tutti i servizi vengono eseguiti sulla TV: non serve un Mac o server esterno acceso. Il telecomando è disponibile mentre l'app rimane aperta.

La playlist parte vuota. Si può inserire o modificare direttamente da **IPTV → Playlist**, con tastiera a schermo e Salva e carica. Per usare il browser, aprire **Telecomando** sulla Home e visitare dal telefono/computer l'indirizzo mostrato, sulla stessa rete. Il codice di abbinamento e i token sono persistenti; Revoca dispositivi li sostituisce. Il browser accetta frecce, Invio e Backspace/Esc, con ripetizione nelle liste. Inserire l'URL M3U nel telecomando; link HTTP/HTTPS senza estensione sono accettati. Una lista vuota o errata non sostituisce quella salvata.

## Architettura

- Interfaccia e regole dei servizi condivise con webOS; `app/` e `service/` restano invariati.
- `avplay-media.js`: adattatore AVPlay; `platform.js`: Back Samsung 10009, registrazione tasti e screensaver.
- `storage-native.js`: dalla versione 0.6.2, archivio nativo `wgt-private` con due record alternati e verifica della scrittura; recupera la copia precedente se un salvataggio viene interrotto. Migra automaticamente da IndexedDB senza cancellarlo, preservando playlist, preferiti e abbinamenti. Richiede privilegi filesystem.read/write.
- `storage.js` e `storage-worker.js`: lettura del precedente archivio IndexedDB compresso e backend per i test browser; nella release 0.6.1 erano il backend principale.
- `bundle-tizen.cjs`: include parser M3U, servizio playlist, matcher XMLTV e cache EPG originali, adattando filesystem, URL, hash e download.
- `epg-worker.js`: download gzip/XMLTV, decompressione pako e SAX fuori dal thread UI. Limiti 32 MiB compressi / 128 MiB XML; cache 6 ore e fallback come webOS.
- `native/remote.cc`: trasporto HTTP via Pepper TCPSocket, ARM NaCl. Massimo 8 connessioni, limiti header/body, scadenze, scritture parziali e chiusura dopo risposta. Nessuna esecuzione di comandi di sistema.
- `remote-server.js`: autenticazione, controllo Host/Origin, limite tentativi, revoca e lista di comandi ammessi. `remote-ui.js` collega rete, interfaccia e modulo nativo. La pagina browser è quella webOS.

NaCl è una dipendenza dei modelli Samsung meno recenti. Questo binario ARM non va dichiarato compatibile con le TV recenti: altri modelli/versioni non sono stati collaudati. Non include DRM, registrazione o header IPTV personalizzati.

## Build

Servono Node.js, Chrome per i test, Tizen Studio con Samsung Certificate Extension, certificato Samsung TV con DUID del dispositivo e **Samsung NaCl SDK Pepper 56** per compilare il trasporto ARM. Il pacchetto Samsung Pepper 56 fornisce toolchain Linux x86-64. Su Apple Silicon si può usare una VM Linux con Rosetta; la VM serve solo alla compilazione e può essere spenta dopo.

Nel sistema Linux, con accesso ai sorgenti:

```sh
NACL_SDK_ROOT=/percorso/pepper_56 sh tools/build-tizen-native.sh
```

Questo crea `dist/native/remote_arm.nexe`. Per sorgenti montati in sola lettura, impostare `NACL_OUTPUT_DIR` a una cartella scrivibile e poi copiare il binario in `dist/native/` sul Mac.

```sh
npm ci
npm run build:tizen
npm run test:tizen
tizen build-web -- /percorso/PadelIPTV/dist/tizen
tizen package -t wgt -s PROFILO_SAMSUNG -o /percorso/PadelIPTV/dist -- /percorso/PadelIPTV/dist/tizen/.buildResult
```

Usare percorsi assoluti con la CLI. Rinominare `Padel IPTV.wgt` in `PadelIPTV.wgt` prima di installare: gli spazi nel nome hanno impedito l'installazione sulla TV di prova.

```sh
tizen install-permit -s IP_TV:26101
tizen install -n PadelIPTV.wgt -s IP_TV:26101 -- /percorso/PadelIPTV/dist
tizen run -p PadelIPTV1.PadelIPTV -s IP_TV:26101
```

ID app: `PadelIPTV1.PadelIPTV`. Il WGT firmato per sviluppo è legato ai dispositivi presenti nel certificato. Certificati, password e dati della TV restano fuori dal repository. Non disinstallare per un normale aggiornamento: i dati locali devono essere conservati.

## Collaudo

Test automatici: AVPlay con callback obsolete, pausa/riprendi e seek; UI condivisa e Back; persistenza IndexedDB; lista errata che conserva quella precedente; preferiti/bouquet; paginazione/zapping; Worker gzip/XMLTV e matching; autenticazione, persistenza/revoca, Host/Origin, rate limit e lunghezza UTF-8 delle risposte HTTP.

TV reale: catalogo 10 tornei, live padel e pausa/riprendi; playlist via HTTPS con redirect, loghi, cache EPG e programmi ora/dopo; canale IPTV e zapping; lista sovrapposta e scomparsa HUD; server HTTP nativo e navigazione browser con ripetizione cursori. Non è stata verificata la riproducibilità di ogni canale della playlist.

`TizenDiagnostics.storage()` legge capacità/spazio libero dello storage utente: esclude lo spazio riservato al sistema e non suddivide cache/dati per applicazione. I risultati personali restano negli appunti privati.

## Riferimenti

- [Modelli Samsung](https://developer.samsung.com/smarttv/develop/specifications/tv-model-groups.html)
- [AVPlay](https://developer.samsung.com/smarttv/develop/guides/multimedia/media-playback/using-avplay.html)
- [NaCl SDK](https://developer.samsung.com/smarttv/develop/extension-libraries/nacl/download.html)
- [Socket TCP in C++](https://developer.samsung.com/smarttv/develop/extension-libraries/nacl/sample-based-tutorials/sockets-in-cplusplus.html)
- [Certificati Samsung](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html)

Correzione bouquet (10 ottobre 2026): eliminata la doppia scrittura della playlist nei salvataggi temporanei, aggiunto il privilegio Tizen unlimitedstorage e compressione dei record grandi in Worker. Il dispositivo aveva restituito QuotaExceededError. Verificati più bouquet contemporanei e persistenza alla riapertura; test automatico verifica che un commit fallito conservi il dato precedente.

Su Tizen 4 il campo Width/Height del video corrente può restare quello iniziale durante HLS adattivo. Il badge usa il Bit_rate corrente per trovare una corrispondenza esatta e univoca tra le risoluzioni di getTotalTrackInfo; nessuna stima della risoluzione dal bitrate. Si aggiorna anche agli [eventi AVPlay di cambio bitrate/risoluzione](https://developer.samsung.com/smarttv/develop/api-references/samsung-product-api-references/avplay-api.html).

Il monitoraggio della qualità esegue al massimo una query AVPlay al secondo, differita fuori dai callback nativi. Le varianti vengono indicizzate una volta per riproduzione; chiusura e cambio video cancellano i timer pendenti.
