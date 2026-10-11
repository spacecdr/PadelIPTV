(function(){'use strict';
var iptv=TizenRequire('./iptv')('playlist.json',changed),epg=TizenRequire('./epg')('guide.json',function(){return iptv.allChannels();},function(){if(window.TVGuide)TVGuide.updated();});
function changed(){epg.invalidate();if(window.iptvUI)iptvUI.changed();}
window.TVService=function(method,p){p=p||{};return new Promise(function(resolve,reject){function done(e,d){if(e)reject(e);else resolve(d);}try{var c;
if(method==='playlistConfig')resolve(iptv.playlistConfig());
else if(method==='meta')resolve(iptv.meta());
else if(method==='groups')resolve(iptv.groups(p.offset));
else if(method==='list')resolve(iptv.query(p));
else if(method==='channel'){c=iptv.channel(p.id);if(!c)throw Error('Canale non trovato');resolve(c);}
else if(method==='adjacent'){c=iptv.adjacent(p);if(!c)throw Error('Nessun canale nella selezione');resolve(c);}
else if(method==='preference'){if(['favorite','groupFavorite','last'].indexOf(p.type)<0)throw Error('Preferenza non valida');iptv.preference(p.type,p.id,done);}
else if(method==='refresh'||method==='update')iptv.update(method==='update'?p.url:'',done);
else if(method==='remove')iptv.remove(done);
else if(method==='epgStatus'||method==='epgRefresh'){epg.refresh(method==='epgRefresh');resolve(epg.status());}
else if(method==='epg'){c=iptv.channel(p.id);if(!c)throw Error('Canale non trovato');epg.refresh(false);resolve(epg.get(c));}
else throw Error('Comando non disponibile');
}catch(e){reject(e);}});};
}());
