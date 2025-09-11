function y(e){let t=atob(e),s=t.length,r=new Uint8Array(s);for(let n=0;n<s;n++)r[n]=t.charCodeAt(n);return r}function l(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let t="",s=e.byteLength;for(let r=0;r<s;r++)t+=String.fromCharCode(e[r]);return btoa(t)}var i=e=>{throw new Error("Not initialized yet")},h=typeof window>"u"&&typeof globalThis.WebSocketPair>"u";typeof Deno>"u"&&(self.Deno={args:[],build:{arch:"x86_64"},env:{get(){}}});var d=new Map,c=0;h&&(globalThis.syscall=async(e,...t)=>await new Promise((s,r)=>{c++,d.set(c,{resolve:s,reject:r}),i({type:"sys",id:c,name:e,args:t})}));function g(e,t,s){h&&(i=s,self.addEventListener("message",r=>{(async()=>{let n=r.data;switch(n.type){case"inv":{let a=e[n.name];if(!a)throw new Error(`Function not loaded: ${n.name}`);try{let o=await Promise.resolve(a(...n.args||[]));i({type:"invr",id:n.id,result:o})}catch(o){console.error("An exception was thrown as a result of invoking function",n.name,"error:",o.message),i({type:"invr",id:n.id,error:o.message})}}break;case"sysr":{let a=n.id,o=d.get(a);if(!o)throw Error("Invalid request id");d.delete(a),n.error?o.reject(new Error(n.error)):o.resolve(n.result)}break}})().catch(console.error)}),i({type:"manifest",manifest:t}))}async function m(e,t){if(typeof e!="string"){let s=new Uint8Array(await e.arrayBuffer()),r=s.length>0?l(s):void 0;t={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:r},e=e.url}return syscall("sandboxFetch.fetch",e,t)}globalThis.nativeFetch=globalThis.fetch;function b(){globalThis.fetch=async function(e,t){let s=t&&t.body?l(new Uint8Array(await new Response(t.body).arrayBuffer())):void 0,r=await m(e,t&&{method:t.method,headers:t.headers,base64Body:s});return new Response(r.base64Body?y(r.base64Body):null,{status:r.status,headers:r.headers})}}h&&b();var w=`
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Error Message</title>
    <link id="stylesheet" rel="stylesheet" href="/.client/main.css"/>
    <style>
    body {
        margin: 0;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--root-background-color);
        font-family: monospace;
    }
    h1 {
        font-size: 1rem;
        font-weight: normal;
        font-family: sans-serif;
        max-width: 500px;
        text-align: center;
    }
    </style>
</head>
<body>
    <h1>silverbullet-pdf has been updated and relocated. Please include the plug from the following path <br> <code>ghr:MrMugame/silverbullet-pdf</code> <br> <a target="_parent" href="https://github.com/MrMugame/silverbullet-pdf">More info</a></h1>
</body>
</html>
`;function u(){return{html:w}}var f={PDFViewer:u},p={name:"pdfviewer",functions:{PDFViewer:{path:"./viewer.js:viewer",editor:["pdf"]}},assets:{}},F={manifest:p,functionMapping:f};g(f,p,self.postMessage);export{F as plug};
