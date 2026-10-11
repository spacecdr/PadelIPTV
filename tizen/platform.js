(function(){'use strict';
var backHeld=false;
// Capture before the shared app listeners; dispatch on the active element so
// overlay handlers retain priority over the player, as on webOS.
['keydown','keyup'].forEach(function(type){document.addEventListener(type,function(e){if(e.keyCode!==10009)return;e.preventDefault();e.stopImmediatePropagation();if(type==='keydown'&&backHeld)return;backHeld=type==='keydown';var mapped=document.createEvent('Event');mapped.initEvent(type,true,true);Object.defineProperty(mapped,'keyCode',{value:461});Object.defineProperty(mapped,'repeat',{value:!!e.repeat});(document.activeElement||document.body).dispatchEvent(mapped);},true);});
window.addEventListener('blur',function(){backHeld=false;});
if(window.tizen&&tizen.tvinputdevice){['ChannelUp','ChannelDown','MediaPlay','MediaPause','MediaPlayPause','MediaStop','MediaRewind','MediaFastForward','ColorF0Red','ColorF1Green','ColorF2Yellow','ColorF3Blue'].forEach(function(k){try{tizen.tvinputdevice.registerKey(k);}catch(ignore){}});}
window.TizenPlatform={exit:function(){if(window.tizen&&tizen.application)tizen.application.getCurrentApplication().exit();else window.close();}};
if(window.webapis&&webapis.avplay){var node=document.getElementById('video');window.TizenVideo=createAVPlayMedia(webapis.avplay,function(name){if(name==='audiochange'&&TizenVideo.onAudioChange)TizenVideo.onAudioChange();var e=document.createEvent('Event');e.initEvent(name,false,false);node.dispatchEvent(e);});TizenVideo.addEventListener=function(name,fn){node.addEventListener(name,fn);};function saver(on){try{webapis.appcommon.setScreenSaver(on?webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_ON:webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF);}catch(ignore){}}
node.addEventListener('playing',function(){saver(false);});['pause','ended','error'].forEach(function(name){node.addEventListener(name,function(){saver(true);});});document.addEventListener('visibilitychange',function(){if(document.hidden)saver(true);});window.addEventListener('unload',function(){saver(true);TizenVideo.close();});}
}());
