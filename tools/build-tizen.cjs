// Assemble an unsigned diagnostic app. Signing/installing requires Samsung tools.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dest=path.join(root,'dist/tizen');
fs.mkdirSync(dest,{recursive:true});
fs.cpSync(path.join(root,'app'),dest,{recursive:true});
for(const name of ['config.xml','avplay-media.js','platform.js'])fs.copyFileSync(path.join(root,'tizen',name),path.join(dest,name));
let html=fs.readFileSync(path.join(dest,'index.html'),'utf8');
html=html.replace('<video id="video" playsinline></video>','<object id="av-player" type="application/avplayer" style="position:absolute;top:0;left:0;width:1920px;height:1080px"></object><video id="video" playsinline style="display:none"></video>');
html=html.replace('<script src="vendor/hls.min.js"></script>','<script src="$WEBAPIS/webapis/webapis.js"></script><script src="avplay-media.js"></script><script src="platform.js"></script>');
// No Luna calls on Samsung. Expose missing services explicitly until their port lands.
html=html.replace('<script src="remote.js"></script>','<script src="service-pending.js"></script>');
fs.writeFileSync(path.join(dest,'index.html'),html);
let player=fs.readFileSync(path.join(dest,'app.js'),'utf8').replace("var video=document.getElementById('video')","var video=window.TizenVideo||document.getElementById('video')").replace('active=false,mode=0','active=false,mode=1');
const start=player.indexOf('modeButton.onclick=');const end=player.indexOf('\n',start);
player=player.slice(0,start)+"modeButton.textContent='Player: Samsung AVPlay';modeButton.disabled=true;"+player.slice(end);
fs.writeFileSync(path.join(dest,'app.js'),player);
fs.writeFileSync(path.join(dest,'shell.js'),fs.readFileSync(path.join(dest,'shell.js'),'utf8').replace('else window.close();','else TizenPlatform.exit();'));
fs.appendFileSync(path.join(dest,'style.css'),'\nhtml,body{background:transparent}\n');
fs.writeFileSync(path.join(dest,'service-pending.js'),`(function(){'use strict';
window.TVService=function(){return Promise.reject(new Error('Porting Tizen: servizio IPTV/EPG in preparazione.'));};
var panel=document.getElementById('remote-panel'),open=document.getElementById('remote-open'),close=document.getElementById('remote-close');
window.padelRemote={open:function(){panel.style.display='block';close.focus();}};open.onclick=padelRemote.open;close.onclick=function(){panel.style.display='none';open.focus();};
document.getElementById('remote-state').textContent='Build di sviluppo Tizen: telecomando web e gestione playlist ancora da integrare.';
document.getElementById('remote-address').textContent='';document.getElementById('remote-pin').textContent='';document.getElementById('remote-revoke').style.display='none';
Array.prototype.forEach.call(panel.querySelectorAll('p'),function(p){if(p.id!=='remote-state'&&p.id!=='remote-address')p.style.display='none';});
document.addEventListener('keydown',function(e){if(panel.style.display==='block'&&(e.keyCode===461||e.keyCode===27||e.keyCode===13)){e.preventDefault();e.stopImmediatePropagation();close.onclick();}},true);
}());\n`);
for(const name of ['appinfo.json','remote.js'])fs.unlinkSync(path.join(dest,name));
console.log('Tizen diagnostic sources: dist/tizen (unsigned; IPTV/EPG/remote service pending)');
