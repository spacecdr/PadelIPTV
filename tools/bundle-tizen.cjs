const fs=require('node:fs'),path=require('node:path');
module.exports=function(root,dest){
const modules=['m3u','iptv','epg-core','epg'];
let output="(function(root){'use strict';var definitions={},cache={};\n";
for(const name of modules)output+="definitions['./"+name+"']=function(require,module,exports){\n"+fs.readFileSync(path.join(root,'service',name+'.js'),'utf8')+'\n};\n';
output+=`var builtins={fs:root.TizenFS,url:{resolve:function(base,s){return new URL(s,base).href;},parse:function(s){return new URL(s);}},crypto:{createHash:function(){var text='';return {update:function(s){text+=s;return this;},digest:function(){return root.sha1(text);}};}},'./vendor/sax':root.sax,'./download':function(url,cb){root.TizenDownload(url,false,15*1024*1024,cb);},'./epg-download':function(url,cb){var w=new Worker('epg-worker.js'),finished=false,timer=setTimeout(function(){end(Error('Tempo massimo guida superato'));},90000);function end(e,g){if(finished)return;finished=true;clearTimeout(timer);w.terminate();cb(e,g);}w.onerror=function(){end(Error('Elaborazione guida non riuscita'));};w.onmessage=function(e){end(e.data.error?Error(e.data.error):null,e.data.guide);};w.postMessage({id:1,url:url});}};
root.TizenRequire=function require(name){if(Object.prototype.hasOwnProperty.call(builtins,name))return builtins[name];if(cache[name])return cache[name].exports;if(!definitions[name])throw Error('Modulo non disponibile: '+name);var m=cache[name]={exports:{}};definitions[name](require,m,m.exports);return m.exports;};
}(this));`;
fs.writeFileSync(path.join(dest,'shared-services.js'),output);
for(const [from,to] of [['node_modules/pako/dist/pako.min.js','vendor/pako.min.js'],['node_modules/js-sha1/build/sha1.min.js','vendor/sha1.min.js'],['service/vendor/sax.js','vendor/sax.js']])fs.copyFileSync(path.join(root,from),path.join(dest,to));
};
