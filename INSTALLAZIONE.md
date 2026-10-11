# Installare Padel IPTV — webOS e Tizen

Versione 0.6.2. Scaricare i file dalla [release ufficiale](https://github.com/spacecdr/PadelIPTV/releases/latest). Non è un'app degli store LG/Samsung: si installa in modalità sviluppatore.

## Prima di iniziare

| Requisito | LG webOS | Samsung Tizen |
|---|---|---|
| TV verificata | UM7390PLC, webOS 4.10.2-29 | UE55NU7400 (2018), Tizen 4.0, ARM/NaCl |
| Computer per installare | Windows, macOS o Linux con CLI webOS | Computer compatibile con Tizen Studio e Samsung TV SDK |
| Account | LG Developer | Samsung per creare i certificati TV |
| Strumenti | Node.js/npm e `@webos-tools/cli` | Tizen Studio, TV Extension, Samsung Certificate Extension, SDB |
| Pacchetto | IPK con app e servizio | WGT precompilato non firmato, da firmare per il proprio dispositivo |
| Durante l'uso | Solo TV e Internet; telefono/browser facoltativi | Solo TV e Internet; telefono/browser facoltativi |

Altri modelli non sono stati collaudati. Il WGT richiede **NaCl ARM**: non presumere che funzioni su tutte le versioni Tizen o sulle Samsung recenti. Per entrambi servono spazio libero per installazione, playlist e cache EPG, connessione Internet ai fornitori e rete locale senza isolamento tra TV e computer/telefono. Non è stata stabilita una soglia universale di spazio libero; la cache varia con la guida.

I comandi usano `IP_TV`, `PROFILO_SAMSUNG` e percorsi di esempio: sostituirli con i propri. Gli esempi shell sono per macOS/Linux; su Windows usare i percorsi Windows e gli eseguibili della CLI. Non serve root, né modificare il firmware.

## LG webOS

### 1. Account e TV

Creare/accedere al proprio account sul [portale LG Developer](https://webostv.developer.lge.com/). Sulla TV installare **Developer Mode** dallo store LG, accedere, attivare **Dev Mode Status** e riavviare quando richiesto. Tornare nell'app, attivare **Key Server** e annotare IP e passphrase. Le credenziali dell'account non sono la passphrase di collegamento.

### 2. CLI sul computer

Installare Node.js/npm compatibili con la [CLI ufficiale LG](https://webostv.developer.lge.com/develop/tools/cli-installation), poi:

```sh
npm install -g @webos-tools/cli
ares -V
ares-setup-device
```

Nella configurazione interattiva aggiungere un dispositivo chiamato `miaTV`: indirizzo IP della TV, porta **9922**, utente **prisoner**, trasporto SSH. Acquisire la chiave:

```sh
ares-novacom --device miaTV --getkey
```

Inserire la passphrase mostrata da Developer Mode. Vedere la [procedura LG](https://webostv.developer.lge.com/develop/getting-started/developer-mode-app) per i dettagli e il rinnovo della sessione.

### 3. Installare e avviare

Aprire il terminale nella cartella del file scaricato:

```sh
ares-install --device miaTV it.pepis.padel.tv_0.6.2_all.ipk
ares-launch --device miaTV it.pepis.padel.tv
```

Il file include già il servizio del telecomando. Non serve firmarlo con un certificato personale o ricompilarlo. Per aggiornare ripetere l'installazione del nuovo IPK mantenendo lo stesso ID, senza disinstallare prima.

**Sessione Developer Mode:** controllare il tempo residuo nell'app LG ed estenderlo prima della scadenza secondo la procedura LG. La disattivazione/scadenza può comportare la rimozione delle app di sviluppo e dei loro dati. Conservare separatamente il proprio URL M3U.

## Samsung Tizen

### 1. Preparare gli strumenti

Installare [Tizen Studio e Samsung TV SDK](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html), includendo **TV Extension** e **Samsung Certificate Extension** dal Package Manager. Servono Certificate Manager, Device Manager, `sdb` e `tizen`. Verificare i [requisiti del computer](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/prerequisites.html) per la versione SDK scelta.

Aggiungere al PATH le cartelle `tizen-studio/tools` e `tizen-studio/tools/ide/bin`, oppure usare il percorso completo degli eseguibili. Su Mac Apple Silicon i componenti Intel possono richiedere Rosetta 2. La build di riferimento è stata preparata con Tizen Studio 6.1, TV Extension Tools 10.0 e Samsung Certificate Extension 2.0.75. La versione dell'SDK non implica compatibilità con tutte le TV.

**Per installare la release non servono Node.js, Pepper SDK, compilatore C++ o VM Linux**: il modulo `remote_arm.nexe` è già nel WGT. Questi strumenti servono soltanto a ricostruire i sorgenti, come descritto in [tizen/README.md](tizen/README.md).

### 2. Abilitare Developer Mode e collegare la TV

Aprire **Apps** nello Smart Hub e digitare **12345** con il telecomando/tastierino numerico (su alcune interfacce entrare prima in App Settings). Attivare Developer Mode, inserire **l'IP del computer** che installerà l'app e riavviare la TV. Se si cambia Mac o rete, aggiornare questo IP. [Procedura Samsung](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html).

TV e computer devono comunicare sulla stessa rete. Aggiungere la TV in Device Manager → Remote Device Manager, porta **26101**, oppure:

```sh
sdb connect IP_TV:26101
sdb devices
```

La TV deve apparire con stato `device`.

### 3. Creare il certificato per la propria TV

In Certificate Manager creare un profilo di tipo **Samsung → TV**, per esempio `PadelIPTV`, seguendo la [guida ufficiale dei certificati](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html). Creare/importare il certificato Author, accedere con il proprio account Samsung e creare il Distributor con livello **Public**. Includere il **DUID della propria TV**, rilevabile con Device Manager quando è collegata. Impostare il profilo come attivo e custodire certificati e password: riutilizzare lo stesso Author per gli aggiornamenti.

Il DUID non è l'IP né il nome commerciale della TV. Il certificato di un'altra persona non abilita automaticamente il proprio dispositivo. La release pubblica non include firme, password o DUID personali.

### 4. Firmare il compilato scaricato

Scaricare `PadelIPTV-0.6.2-tizen-arm-unsigned.wgt`. È un archivio ZIP con app e server ARM pronti, **non installabile finché non è firmato**. Estrarlo con un gestore ZIP (su Windows si può copiare/rinominare il file in `.zip`), oppure:

```sh
mkdir -p "$HOME/PadelIPTV-install/app" "$HOME/PadelIPTV-install/signed"
unzip PadelIPTV-0.6.2-tizen-arm-unsigned.wgt -d "$HOME/PadelIPTV-install/app"
tizen build-web -- "$HOME/PadelIPTV-install/app"
tizen package -t wgt -s PROFILO_SAMSUNG -o "$HOME/PadelIPTV-install/signed" -- "$HOME/PadelIPTV-install/app/.buildResult"
```

`PROFILO_SAMSUNG` è il nome scelto nel Certificate Manager. Usare **percorsi assoluti** per evitare ambiguità della CLI. Il file risultante è `Padel IPTV.wgt`: rinominarlo in `PadelIPTV.wgt`, senza spazi. Questa fase assembla e firma l'app; non ricompila C++. La procedura segue il [repackaging Samsung](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/command-line-interface.html#repackaging-applications-with-a-new-certificate); nella nostra release i file firma sono già assenti.

### 5. Installare e avviare

```sh
mv "$HOME/PadelIPTV-install/signed/Padel IPTV.wgt" "$HOME/PadelIPTV-install/signed/PadelIPTV.wgt"
tizen install-permit -s IP_TV:26101
tizen install -n PadelIPTV.wgt -s IP_TV:26101 -- "$HOME/PadelIPTV-install/signed"
tizen run -p PadelIPTV1.PadelIPTV -s IP_TV:26101
```

In alternativa, Device Manager offre **Permit to install applications** sul dispositivo. Per aggiornare scaricare il nuovo WGT, estrarlo in una cartella pulita, firmarlo con lo stesso Author e installarlo sopra l'app esistente. Non disinstallare per un normale aggiornamento: rimuovere l'app può cancellare playlist, preferiti e abbinamenti. Se un certificato scade, rinnovarlo secondo Samsung conservando l'identità Author.

## Primo utilizzo, comune alle due TV

**Senza telefono o computer:** aprire IPTV e premere **Playlist** (oppure **Carica playlist sulla TV** se non ci sono canali). Inserire l’URL M3U con la tastiera a schermo, quindi **Salva e carica**. Per modificarlo, riaprire lo stesso pannello: l’indirizzo salvato è già compilato. Con le frecce verticali si passa dal campo ai pulsanti; Chiudi/Back torna al catalogo. Durante il download attendere l’esito; se la lista è vuota o non valida resta quella precedente. La lettura dell’URL salvato avviene nell’app, senza esporlo nelle API di stato del telecomando.

**Dal browser (facoltativo):** Aprire **Telecomando e playlist** nella Home. Visitare dal telefono/computer l'indirizzo mostrato dalla TV (`http://IP_TV:8768`), inserire il codice e caricare l'URL HTTP/HTTPS della propria M3U, anche senza estensione. Il codice e l'abbinamento vengono conservati; **Revoca dispositivi** li sostituisce. L'app deve restare aperta per usare il telecomando. Il computer può essere spento dopo l'installazione.

Nessun canale IPTV è precaricato. La [M3U di esempio](examples/digitale-terrestre.m3u) contiene URL non riproducibili. Le guide EPG vengono scaricate automaticamente; associazione e copertura dipendono dalla sorgente. I contenuti padel dipendono da Red Bull TV e dalla disponibilità territoriale. Per i tasti vedere [README](README.md#comandi).

## Problemi comuni

| Problema | Controllo |
|---|---|
| CLI non trovata | Verificare installazione e PATH; riaprire il terminale |
| TV non raggiungibile | IP attuale, stessa LAN, niente rete ospiti/isolamento client, firewall; Samsung: IP del computer nel Developer Mode |
| LG: chiave rifiutata | Key Server attivo, sessione valida, passphrase corrente e porta 9922 |
| Samsung: certificato/installazione rifiutati | Profilo Samsung TV, DUID incluso, firme valide, data/ora TV corretta e autorizzazione install-permit |
| Samsung: errore 118012 | Eseguire install-permit/Permit to install applications; controllare comunque certificati e collegamento |
| Samsung: file non installabile | Non usare direttamente l'unsigned WGT; firmare e rinominare senza spazi |
| Telecomando non raggiungibile | App aperta, indirizzo mostrato dalla TV, HTTP e porta 8768; su Tizen serve supporto NaCl ARM |
| Lista non salvata / errore spazio | Usare 0.6.2 (archivio nativo Samsung, senza la quota IndexedDB per i nuovi salvataggi), controllare spazio TV; non cancellare dati senza conservarne la configurazione |
| Canale senza video/EPG | Provare una sorgente compatibile e consultare lo stato EPG nel telecomando: il matching non garantisce programmi attuali |

Non aprire la porta 8768 su Internet: il telecomando HTTP è pensato per la rete locale. I pacchetti non sono aggiornati automaticamente; controllare le nuove release su GitHub.

## Verificare i download

Scaricare `SHA256SUMS` nella cartella dei due pacchetti. Su macOS: `shasum -a 256 -c SHA256SUMS`; Linux: `sha256sum -c SHA256SUMS`. Se si scarica un solo pacchetto l'altro risulterà mancante: verificare la riga del file effettivamente scaricato. Su PowerShell: `Get-FileHash .\NOME_FILE -Algorithm SHA256` e confrontare il valore con SHA256SUMS.
