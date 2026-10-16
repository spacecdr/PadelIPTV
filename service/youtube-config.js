'use strict';
module.exports=function(file,changed){var fs=require('fs'),key='',loaded=false,loading=false,waiters=[],saving=false;
function read(cb){if(loaded){cb(null,{key:key,configured:!!key});return;}waiters.push(cb);if(loading)return;loading=true;fs.readFile(file,'utf8',function(e,s){loading=false;if(e&&e.code!=='ENOENT'){finish(new Error('Configurazione YouTube non leggibile'));return;}try{key=e?'':JSON.parse(s).key||'';loaded=true;finish(null);}catch(ignore){finish(new Error('Configurazione YouTube non valida'));}});}
function finish(e){var list=waiters;waiters=[];list.forEach(function(cb){cb(e,e?null:{key:key,configured:!!key});});}
function set(value,cb){if(typeof value!=='string'||(value&&!/^[A-Za-z0-9_-]{20,200}$/.test(value))){cb(new Error('Chiave API non valida'));return;}if(saving){cb(new Error('Salvataggio in corso'));return;}saving=true;read(function(e){if(e){saving=false;cb(e);return;}fs.writeFile(file+'.tmp',JSON.stringify({key:value}),{mode:384},function(err){if(err){saving=false;cb(new Error('Salvataggio YouTube non riuscito'));return;}fs.rename(file+'.tmp',file,function(err){saving=false;if(err){cb(new Error('Salvataggio YouTube non riuscito'));return;}key=value;cb(null,{configured:!!key});if(changed)changed();});});});}
return {get:read,set:set,status:function(cb){read(function(e,d){cb(e,d?{configured:d.configured}:null);});}};
};
