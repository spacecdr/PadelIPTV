/* Read-only diagnostics. Storage excludes system-reserved flash, per Tizen API. */
(function(){'use strict';
window.TizenDiagnostics={storage:function(){return new Promise(function(resolve,reject){if(!window.tizen||!tizen.systeminfo){reject(new Error('SystemInfo disponibile solo nella app sulla TV'));return;}tizen.systeminfo.getPropertyValue('STORAGE',function(info){resolve({measuredAt:new Date().toISOString(),scope:'User storage; system-reserved space excluded',units:info.units.map(function(u){return {type:u.type,capacityBytes:u.capacity,availableBytes:u.availableCapacity,usedBytes:u.capacity-u.availableCapacity,removable:u.isRemovable};})});},function(e){reject(new Error(e.message||e.name||'Storage non disponibile'));});});}};
}());
