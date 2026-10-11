/* HTTP routing independent of the native transport, tested in the browser. */
(function(root){'use strict';
root.CreateTizenRemote=function(options){
var credentials=null,attempts=Object.create(null),revoking=false;
function create(){var bytes=new Uint8Array(28);crypto.getRandomValues(bytes);var pin=String(((bytes[0]*16777216+bytes[1]*65536+bytes[2]*256+bytes[3])%1000000));while(pin.length<6)pin='0'+pin;return {version:1,pin:pin,token:Array.prototype.map.call(bytes.subarray(4),function(n){return ('0'+n.toString(16)).slice(-2);}).join('')};}
function valid(d){return d&&d.version===1&&/^\d{6}$/.test(d.pin)&&/^[a-f0-9]{48}$/.test(d.token);}
function save(d){return new Promise(function(resolve,reject){TizenFS.writeFile('remote.json.tmp',JSON.stringify(d),{},function(e){if(e){reject(e);return;}TizenFS.rename('remote.json.tmp','remote.json',function(err){if(err)reject(err);else {credentials=d;resolve();}});});});}
var ready=new Promise(function(resolve,reject){TizenFS.readFile('remote.json','utf8',function(e,s){if(e&&e.code==='ENOENT'){save(create()).then(resolve,reject);return;}if(e){reject(e);return;}try{var d=JSON.parse(s);if(!valid(d))throw Error('Abbinamento salvato non leggibile');credentials=d;resolve();}catch(err){reject(err);}});});
function response(code,data,html){return {code:code,type:html?'text/html; charset=utf-8':'application/json; charset=utf-8',body:html?data:JSON.stringify(data)};}
function error(code,message){return response(code,{error:message});}
function equal(a,b){if(typeof a!=='string'||a.length!==b.length)return false;var n=0;for(var i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;}
function route(req){return ready.then(function(){
var h=req.headers||{},host=options.host();if(!host||h.host!==host)return error(403,'Indirizzo non consentito');if(h.origin&&h.origin!=='http://'+host)return error(403,'Origine non consentita');
if(req.method==='GET'&&req.path==='/')return response(200,options.html,true);
var data={};if(req.body){if(req.body.length>8192)return error(413,'Richiesta troppo grande');try{data=JSON.parse(req.body);if(!data||typeof data!=='object'||Array.isArray(data))throw Error();}catch(e){return error(400,'Richiesta non valida');}}
if(req.path==='/api/pair'&&req.method==='POST'){var now=Date.now(),key=req.ip||'unknown';if(Object.keys(attempts).length>256)key='overflow';var rate=attempts[key];if(!rate||now-rate.at>60000)rate=attempts[key]={at:now,count:0};if(++rate.count>8)return error(429,'Attendi un minuto e riprova');return equal(data.pin,credentials.pin)?response(200,{token:credentials.token}):error(403,'Codice errato');}
if(!equal(h['x-padel-token'],credentials.token))return error(401,'Abbina il telefono con il codice sulla TV');
if(req.path==='/api/state'&&req.method==='GET')return response(200,{connected:!document.hidden,state:options.state()});
if(req.path==='/api/command'&&req.method==='POST'){if(['up','down','left','right','ok','back','pause','audio','rewind','forward','favorite','channelUp','channelDown'].indexOf(data.command)<0)return error(400,'Comando non valido');if(document.hidden)return error(409,'Apri Padel IPTV sul televisore');options.command(data.command,data.repeat===true&&['up','down','left','right'].indexOf(data.command)>=0);return response(200,{ok:true});}
var task;if(req.path==='/api/iptv'){if(req.method==='GET')task=TVService('meta');else if(req.method==='POST')task=TVService('update',{url:data.url});else if(req.method==='DELETE')task=TVService('remove');}
else if(req.path==='/api/epg'&&(req.method==='GET'||req.method==='POST'))task=TVService(req.method==='POST'?'epgRefresh':'epgStatus');
if(task)return task.then(function(d){return response(200,d);},function(e){return error(400,e.message);});return error(404,'Non trovato');
}).catch(function(){return error(503,'Telecomando non disponibile');});}
return {ready:ready,route:route,pin:function(){return credentials?credentials.pin:'';},revoke:function(){if(revoking)return Promise.reject(Error('Revoca in corso'));revoking=true;return ready.then(function(){return save(create());}).then(function(){attempts=Object.create(null);revoking=false;},function(e){revoking=false;throw e;});}};
};
root.ParseTizenRequest=function(raw,ip){var at=raw.indexOf('\r\n\r\n');if(at<0||at>8192)throw Error('Richiesta non valida');var lines=raw.slice(0,at).split('\r\n'),first=/^(GET|POST|DELETE) (\/[^ ]*) HTTP\/1\.[01]$/.exec(lines.shift()),headers=Object.create(null);if(!first)throw Error('Metodo non valido');lines.forEach(function(line){var m=/^([A-Za-z0-9-]+):[ \t]*([^\r\n]*)$/.exec(line);if(!m)throw Error('Header non valido');var k=m[1].toLowerCase();if(headers[k]!==undefined)throw Error('Header duplicato');headers[k]=m[2].trim();});return {method:first[1],path:first[2],headers:headers,body:raw.slice(at+4),ip:ip};};
root.TizenHTTPResponse=function(r){var body=r.body,length=new TextEncoder().encode(body).length;return 'HTTP/1.1 '+r.code+' '+(r.code===200?'OK':'Error')+'\r\nContent-Type: '+r.type+'\r\nContent-Length: '+length+'\r\nConnection: close\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nX-Frame-Options: DENY\r\n\r\n'+body;};
}(this));
