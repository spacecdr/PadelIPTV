'use strict';
var http=require('http'),crypto=require('crypto'),fs=require('fs'),path=require('path');
module.exports=function(options){
 var credentials=options.credentials||require('./auth-store').create(),pin=credentials.pin,token=credentials.token;
 var attempts={},html=fs.readFileSync(path.join(__dirname,'remote.html')),revoking=false;
 var allowed=['up','down','left','right','ok','back','pause','audio','rewind','forward','favorite','channelUp','channelDown'];
 function send(res,code,obj){res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj));}
 var server=http.createServer(function(req,res){
  if(req.method==='GET'&&req.url==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Frame-Options':'DENY','X-Content-Type-Options':'nosniff'});res.end(html);return;}
  if(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host){send(res,403,{error:'Origine non consentita'});return;}
  if(req.url==='/api/pair'&&req.method==='POST'){
   var ip=req.socket.remoteAddress,now=Date.now(),rate=attempts[ip];if(!rate||now-rate.at>60000)rate=attempts[ip]={at:now,count:0};if(++rate.count>8){send(res,429,{error:'Attendi un minuto e riprova'});return;}
   body(req,res,function(d){if(d.pin!==pin){send(res,403,{error:'Codice errato'});return;}send(res,200,{token:token});});return;
  }
  if(req.headers['x-padel-token']!==token){send(res,401,{error:'Abbina il telefono con il codice sulla TV'});return;}
  if(req.url==='/api/state'&&req.method==='GET'){send(res,200,{connected:options.isActive(),state:options.state()});return;}
  if(req.url==='/api/command'&&req.method==='POST'){body(req,res,function(d){if(allowed.indexOf(d.command)<0){send(res,400,{error:'Comando non valido'});return;}if(!options.isActive()){send(res,409,{error:'Apri Padel IPTV sul televisore'});return;}try{options.command(d.command,d.repeat===true&&['up','down','left','right'].indexOf(d.command)>=0);send(res,200,{ok:true});}catch(e){send(res,503,{error:'TV non disponibile'});}});return;}
  if(options.youtube&&req.url==='/api/youtube'&&(req.method==='GET'||req.method==='POST')){function ytDone(e,d){send(res,e?400:200,e?{error:e.message}:d);}if(req.method==='GET')options.youtube.status(ytDone);else body(req,res,function(d){options.youtube.set(d.key,ytDone);});return;}
  if(options.iptv&&req.url==='/api/iptv'&&req.method==='GET'){send(res,200,options.iptv.meta());return;}
  if(options.iptv&&req.url==='/api/iptv'&&req.method==='POST'){body(req,res,function(d){options.iptv.update(d.url,function(e,data){send(res,e?400:200,e?{error:e.message}:data);});},8192);return;}
  if(options.iptv&&req.url==='/api/iptv'&&req.method==='DELETE'){options.iptv.remove(function(e,data){send(res,e?400:200,e?{error:e.message}:data);});return;}
  if(options.epg&&req.url==='/api/epg'&&(req.method==='GET'||req.method==='POST')){options.epg.refresh(req.method==='POST');send(res,200,options.epg.status());return;}
  send(res,404,{error:'Non trovato'});
 });
 function body(req,res,callback,limit){var text='',done=false;req.on('data',function(chunk){if(done)return;text+=chunk;if(text.length>(limit||1024)){done=true;send(res,413,{error:'Richiesta troppo grande'});}});req.on('end',function(){if(done)return;try{var data=JSON.parse(text);if(!data||typeof data!=='object')throw new Error();callback(data);}catch(e){send(res,400,{error:'Richiesta non valida'});}});}
 var api={server:server,revoke:function(cb){if(revoking){cb(new Error('Revoca già in corso'));return;}revoking=true;var next=require('./auth-store').create();(options.saveCredentials||function(d,done){done();})(next,function(e){revoking=false;if(e){cb(e);return;}pin=next.pin;token=next.token;attempts={};cb(null);});}};
 Object.defineProperty(api,'pin',{get:function(){return pin;}});
 return api;
};
