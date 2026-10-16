const assert=require('node:assert/strict');const C=require('../app/catalog.js');
const now=Date.parse('2026-10-10T11:30:00Z');
const data=Array.from({length:14},(_,i)=>({id:String(i),first:new Date(now-i*86400000).toISOString()}));data.reverse();data.push({id:'future',first:'2026-10-15T10:00:00Z'});
assert.deepEqual(C.recent(data,now).map(x=>x.id),Array.from({length:10},(_,i)=>String(i)));
assert.equal(C.status({badges:[{type:'upcoming'}],start_time:'2020-01-01',playable:false}).kind,'upcoming');
assert.equal(C.status({badges:[{type:'live'}],playable:true}).kind,'live');
assert.equal(C.status({badges:[{type:'replay_available'}],playable:true}).kind,'replay');
assert.equal(C.status({playable:false}).kind,'unavailable');
assert.match(C.date('2026-10-10T12:00:00Z',true),/14:00/);
assert.match(C.date('2026-12-10T12:00:00Z',true),/13:00/);
assert.equal(C.unique([{id:'a'},{id:'a'},{id:'b'}]).length,2);
console.log('PASS: limite 10, ordine, futuro escluso, stati ufficiali, ora italiana estate/inverno, deduplica');

// A future tournament may be advertised before its live_programs is published.
(async()=>{const originalXHR=global.XMLHttpRequest,originalNow=Date.now;let failedStatus=404;
Date.now=()=>now;
global.XMLHttpRequest=class {open(method,url){this.url=decodeURIComponent(url);}send(){let status=200,data={cards:[]};if(this.url.includes('/products/'))data={collections:[{id:'tournaments'}]};else if(this.url.endsWith('/tournaments'))data={cards:dataCards};else if(this.url.endsWith('/future:live_programs')||this.url.endsWith('/future:extras'))status=failedStatus;else if(this.url.endsWith(':live_programs'))data={cards:[{id:'video',type:'video',start_time:'2026-10-09T10:00:00Z'}]};this.status=status;this.responseText=JSON.stringify(data);queueMicrotask(()=>this.onload());}};
const dataCards=[{id:'current',content_type:'stop',start_time:'2026-10-09T00:00:00Z'},{id:'future',content_type:'stop',start_time:'2026-11-09T00:00:00Z'}];
try{const tournaments=await C.load();assert.deepEqual(tournaments.map(t=>t.id),['current']);assert.equal((await C.videos(tournaments[0])).length,1);assert.deepEqual(await C.videos({id:'future'}),[]);failedStatus=503;await assert.rejects(C.load(),e=>e.status===503);await assert.rejects(C.videos({id:'future'}),e=>e.status===503);console.log('PASS unpublished future tournament 404 cannot hide current tournaments; missing sections empty; service errors preserved');}finally{global.XMLHttpRequest=originalXHR;Date.now=originalNow;}})().catch(e=>{console.error(e);process.exitCode=1;});
