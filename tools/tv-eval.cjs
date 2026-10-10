const [url,expression]=process.argv.slice(2);
const ws=new WebSocket(url);const timer=setTimeout(()=>{console.error('Timeout');process.exit(1)},15000);
ws.addEventListener('open',()=>ws.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression,returnByValue:true}})));
ws.addEventListener('message',event=>{const r=JSON.parse(event.data);if(r.id===1){console.log(JSON.stringify(r,null,2));clearTimeout(timer);ws.close();process.exit(0);}});
