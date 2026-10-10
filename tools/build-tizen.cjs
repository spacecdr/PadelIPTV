// Assemble the Samsung app. Signing/installing requires Samsung tools.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dest=path.join(root,'dist/tizen');
fs.rmSync(dest,{recursive:true,force:true});
fs.mkdirSync(dest,{recursive:true});
fs.cpSync(path.join(root,'app'),dest,{recursive:true});
fs.cpSync(path.join(root,'tizen/licenses'),path.join(dest,'licenses'),{recursive:true});
for(const name of ['config.xml','avplay-media.js','platform.js','diagnostics.js','storage.js','download.js','epg-worker.js','service.js','remote-server.js','remote-ui.js'])fs.copyFileSync(path.join(root,'tizen',name),path.join(dest,name));
let html=fs.readFileSync(path.join(dest,'index.html'),'utf8');
html=html.replace('<video id="video" playsinline></video>','<object id="av-player" type="application/avplayer" style="position:absolute;top:0;left:0;width:1920px;height:1080px"></object><video id="video" playsinline style="display:none"></video>');
html=html.replace('<script src="vendor/hls.min.js"></script>','<script src="$WEBAPIS/webapis/webapis.js"></script><script src="avplay-media.js"></script><script src="platform.js"></script><script src="diagnostics.js"></script>');
// Replace Luna with local Tizen services and the native HTTP transport.
html=html.replace('<script src="remote.js"></script>','<script src="storage.js"></script><script src="download.js"></script><script src="vendor/sha1.min.js"></script><script src="vendor/sax.js"></script><script src="shared-services.js"></script><script src="service.js"></script><script src="remote-page.js"></script><script src="remote-server.js"></script><script src="remote-ui.js"></script>');
fs.writeFileSync(path.join(dest,'index.html'),html);
let player=fs.readFileSync(path.join(dest,'app.js'),'utf8').replace("var video=document.getElementById('video')","var video=window.TizenVideo||document.getElementById('video')").replace('active=false,mode=0','active=false,mode=1');
const start=player.indexOf('modeButton.onclick=');const end=player.indexOf('\n',start);
player=player.slice(0,start)+"modeButton.textContent='Player: Samsung AVPlay';modeButton.disabled=true;"+player.slice(end);
fs.writeFileSync(path.join(dest,'app.js'),player);
fs.writeFileSync(path.join(dest,'shell.js'),fs.readFileSync(path.join(dest,'shell.js'),'utf8').replace('else window.close();','else TizenPlatform.exit();'));
fs.appendFileSync(path.join(dest,'style.css'),'\nhtml,body{background:transparent}\n');
fs.writeFileSync(path.join(dest,'remote-page.js'),'window.TizenRemotePage='+JSON.stringify(fs.readFileSync(path.join(root,'service/remote.html'),'utf8'))+';');
fs.copyFileSync(path.join(root,'tizen/native/remote.nmf'),path.join(dest,'remote.nmf'));
fs.copyFileSync(path.join(root,'dist/native/remote_arm.nexe'),path.join(dest,'remote_arm.nexe'));
for(const name of ['appinfo.json','remote.js'])fs.unlinkSync(path.join(dest,name));
require('./bundle-tizen.cjs')(root,dest);
console.log('Tizen sources: dist/tizen (unsigned)');
