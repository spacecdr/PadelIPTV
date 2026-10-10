# Continuità

Prima pubblicazione pubblica: versione 0.6.0, 10 ottobre 2026.
Questa copia è separata dall'ambiente personale del dispositivo. Non importare log o dati runtime.
Le funzioni dell'app corrispondono alla versione verificata su LG UM7390PLC; test e strumenti pubblici sono portabili e usano dati sintetici.
Vedere DEVELOPMENT.md per compatibilità legacy, EPG, build e pubblicazione; README.md per installazione e limiti.

Aggiornamento immagini: su richiesta dell’utente, Padel TV usa screenshot del catalogo pubblico reale Red Bull TV; solo IPTV usa fixture. `screenshots:padel` aggiorna torneo corrente e precedente senza accedere alla TV. Non sostituire queste immagini con un calendario sintetico.

Porting Samsung (sviluppato nel ramo `tizen-port`, ora incluso nella release congiunta): target UE55NU7400/Tizen 4.0. Vedere tizen/README.md per architettura/build. Implementati e installati AVPlay, Back, IPTV/EPG con IndexedDB e worker gzip/XMLTV, telecomando HTTP autonomo NaCl/PPAPI sulla TV (porta8768), abbinamento persistente e revoca. Test Tizen automatici passati; collaudo reale catalogo/live, playlist, EPG, zapping, overlay e browser cursori ripetuti. `app/` e `service/` webOS invariati. Certificati e configurazioni personali restano esterni. Build nativa richiede SDK Samsung Pepper56 Linux, binario dist/native/remote_arm.nexe; su Mac AppleSilicon compilato con Lima+Rosetta. Non richiede VM/PC accesi per l’uso. Test TV privati non fanno parte del repository.

Fix bouquet Samsung: la quota IndexedDB (~11 MB sul dispositivo) veniva raggiunta dai salvataggi ripetuti della playlist. Ora staging temporaneo in RAM, un commit atomico e compressione in storage-worker.js per record >=1KiB; lettura sia legacy testo che deflate. Manifest include unlimitedstorage. Test multipli bouquet, reload e rollback transazione fallita aggiunti; build installata.

Release congiunta 0.6.1: porting Tizen e fix bouquet promossi per pubblicazione su main; app/service webOS cambiano solo versione. INSTALLAZIONE.md documenta entrambe le piattaforme. Distribuire il WGT precompilato NON firmato, prodotto da tools/package-tizen-public.py; ogni utente firma con il proprio profilo Samsung/DUID. Non caricare dist/PadelIPTV.wgt personale. Conservate immagini UI condivisa e catalogo padel reale; nessun dato IPTV privato. Asset release: IPK 0.6.1, WGT ARM unsigned, SHA256SUMS. Versione 0.6.0 rimane disponibile nella release precedente.
