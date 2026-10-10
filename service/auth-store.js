'use strict';
var fs=require('fs'),crypto=require('crypto');
function create(){var pin=String(crypto.randomBytes(4).readUInt32BE(0)%1000000);while(pin.length<6)pin='0'+pin;return {version:1,pin:pin,token:crypto.randomBytes(24).toString('hex')};}
function valid(d){return d&&d.version===1&&/^\d{6}$/.test(d.pin)&&/^[a-f0-9]{48}$/.test(d.token);}
module.exports=function(file){
 function save(data,cb){if(!valid(data)){cb(new Error('Invalid credentials'));return;}var temp=file+'.tmp';fs.writeFile(temp,JSON.stringify(data),{mode:384},function(e){if(e){cb(e);return;}fs.rename(temp,file,cb);});}
 return {save:save,load:function(cb){fs.readFile(file,'utf8',function(e,s){if(e&&e.code==='ENOENT'){var d=create();save(d,function(err){cb(err,d);});return;}if(e){cb(e);return;}try{var d=JSON.parse(s);if(!valid(d))throw new Error('Invalid stored credentials');cb(null,d);}catch(err){cb(err);}});}};
};
module.exports.create=create;
