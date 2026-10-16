# YouTube Premier Padel

La sezione Padel apre **Red Bull TV** per impostazione predefinita. La seconda scheda, **YouTube Premier Padel Official**, usa esclusivamente il [canale ufficiale](https://www.youtube.com/@PremierPadelOfficial), con gli ultimi 20 video pubblicati e una sezione per dirette/eventi imminenti. Le miniature e i titoli provengono dalle API ufficiali; non vengono estratti flussi video YouTube.

## Configurazione personale

Ogni installazione richiede una propria chiave **YouTube Data API v3**. La distribuzione non ne contiene una.

1. Aprire [Google Cloud Console](https://console.cloud.google.com/) e creare o selezionare un progetto.
2. In **API e servizi → Libreria**, cercare e abilitare **YouTube Data API v3**.
3. In **Credenziali → Crea credenziali → Chiave API**, creare una chiave e limitarla a **YouTube Data API v3**.
4. Inserirla in **Padel → YouTube → Impostazioni YouTube**, oppure nel telecomando web già abbinato, sezione **YouTube Premier Padel → Salva chiave**.

Il pannello senza chiave contiene questi passaggi. È possibile sostituire o rimuovere la chiave da entrambe le interfacce. La pagina web mostra soltanto lo stato configurato/non configurato, mai il valore salvato. Il campo viene svuotato dopo il salvataggio.

Le richieste del catalogo partono dalla TV, non dal browser usato per il telecomando: una restrizione per il referrer di quel browser non è adatta. Per la configurazione iniziale selezionare **Nessuna** nelle restrizioni dell’applicazione e mantenere la restrizione alla sola API YouTube. Un’eventuale restrizione per indirizzo IP deve riferirsi all’IP pubblico della rete della TV e restare aggiornata. Non è richiesto OAuth né l’accesso all’account YouTube dell’utente.

La chiave è salvata nei dati locali privati dell’installazione e non viene inviata al progetto Padel IPTV o inclusa nei pacchetti pubblici. Su webOS il servizio conserva il file con permessi0600; su Tizen viene usato lo storage locale dell’app. Il telecomando usa HTTP sulla rete locale: inserire la chiave solo da una rete fidata e dal dispositivo abbinato. La chiave viene trasmessa a Google viaHTTPS per le chiamate DataAPI.

## Dirette, coda e ripresa

- Un evento imminente si accoda con OK; un secondo OK lo rimuove. **Svuota coda** annulla tutti gli eventi accodati.
- Lo stato degli eventi noti viene controllato ogni minuto quando necessario. La ricerca di nuovi eventi è mantenuta in cache per un’ora per contenere il consumo della quota; il catalogo aperto si aggiorna ogni10minuti e con **Aggiorna**.
- La coda apre l’app YouTube installata quando l’API segnala davvero la diretta, mentre Padel IPTV è visibile nella sezione Padel e nessun altro video/dialogo è aperto. Non accende la TV e non interrompe IPTV o un altro video. Può esserci un ritardo dovuto all’aggiornamento dell’API.
- La coda è locale alla TV e gli elementi scadono dopo30giorni. L’apertura accettata dalla TV toglie l’evento dalla coda. Se un evento termina mentre l’app è chiusa, il replay resta avviabile manualmente.
- I contenuti **Red Bull TV** già iniziati offrono **Riprendi da…** e **Dall’inizio**. Se il contenuto è live compare anche **Vai al LIVE**; la ripresa è limitata alla finestra DVR resa disponibile dal fornitore. I punti di ripresa sono locali (massimo50 contenuti, validità30giorni), senza URL dei flussi. Non si possono recuperare le posizioni guardate prima di questa funzione.
- YouTube viene riprodotto esclusivamente nella sua app installata sulla TV. Ripresa, account, lingua, pubblicità e comandi sono gestiti da YouTube; Padel IPTV non legge né salva la posizione di questi video.
- Se l’apertura automatica fallisce, la coda resta salvata e non ritenta continuamente nella stessa sessione. Selezionare manualmente il video per riprovare.

## Riproduzione e diritti

Selezionando un video o una diretta si apre il contenuto nell’app YouTube installata sulla TV. Non esiste un player YouTube interno né un ripiego nel browser. Se l’app manca o la TV rifiuta il collegamento, viene mostrato un messaggio. La compatibilità del collegamento al singolo video dipende dalla versione dell’app YouTube e dalla piattaforma; l’apertura accettata dal sistema non garantisce che il video sia riproducibile nel proprio paese.

**Fonti e diritti**, accessibile da entrambe le schede, chiarisce la proprietà dei contenuti, l’assenza di affiliazione e i limiti d’uso. La disponibilità tecnica di un flusso non è una licenza e nessuna informativa esclude possibili contestazioni. L’integrazione non offre download/redistribuzione e non aggira restrizioni. La sezione YouTube comunica con Google per le API del catalogo: si applicano i [Termini YouTube](https://www.youtube.com/t/terms) e la [Privacy Google](https://policies.google.com/privacy).

Riferimenti tecnici: [YouTube Data API](https://developers.google.com/youtube/v3/getting-started), [Samsung Application API](https://developer.samsung.com/smarttv/develop/api-references/tizen-web-device-api-references/application-api.html). Quota, policy e compatibilità possono cambiare.
