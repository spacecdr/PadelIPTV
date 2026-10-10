# Componenti e attribuzioni

- **HLS.js 1.6.16**, Dailymotion e contributori: Apache-2.0. Codice e avvisi in `app/vendor/hls.min.js` e `app/vendor/hls.LICENSE`.
- **sax-js 1.2.4**, Isaac Z. Schlueter e contributori: ISC, con avvisi inclusi in `service/vendor/sax-LICENSE`.
- **MacIPTV**, spacecdr: GPL-3.0; riferimento per regole e implementazione dell'associazione EPG portata in JavaScript. https://github.com/spacecdr/MacIPTV
- **Certificati CA Mozilla distribuiti con Node.js**: bundle di certificati pubblici, provenienza e rigenerazione in `service/ca-roots-NOTICE.txt`. Nessuna chiave privata inclusa.
- **Playwright Core**: Apache-2.0; dipendenza di sviluppo, non distribuita nell'IPK.

Il progetto usa le API Red Bull TV e scarica guide XMLTV dai fornitori indicati nel README. Video, guide e loghi delle emittenti non diventano parte del codice con licenza GPL e mantengono i rispettivi diritti. I nomi dei canali nelle demo IPTV sono descrittivi; i relativi programmi sono inventati. Le schermate Padel TV mostrano invece il catalogo reale Red Bull TV: miniature, titoli e marchi restano dei rispettivi titolari e non sono concessi sotto la licenza GPL del progetto. Le immagini dimostrative del campo e le tessere dei canali sono generate dal progetto e non contengono fotogrammi televisivi o loghi ufficiali.

Componenti aggiuntivi del porting Tizen:

- **pako 2.1.0**, MIT, decompressione gzip nel Web Worker; **js-sha1 0.7.0**, MIT, identificatori stabili dei canali (non autenticazione). Avvisi in `tizen/licenses/`.
- **Pepper 56 / PPAPI**, Chromium Authors, BSD: librerie del modulo nativo ARM per il server TCP. Avviso in `tizen/licenses/pepper-BSD.txt`. SDK ottenuto dalla pagina ufficiale Samsung; il toolchain non viene incluso nel progetto.
- La build Tizen include gli avvisi in `licenses/` nel WGT.
