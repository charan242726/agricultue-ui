import React, {useEffect, useState} from 'react';
import parse from 'html-react-parser';
import login from 'virtual:original-login';
import dashboard from 'virtual:original-dashboard';
import landing from 'virtual:original-index';
import authLayout from './auth-layout.css?inline';

function script(src) {return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Could not load '+src));document.body.appendChild(s);});}
export default function OriginalPages(){
  const page=location.pathname.includes('dashboard')?'dashboard':location.pathname.includes('login')?'login':'landing';
  const source={login,dashboard,landing}[page];
  const [error,setError]=useState('');
  const body=source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)[1].replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
  const styles=[...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>m[1]).join('\n')+(page==='login'?'\n'+authLayout:'');
  useEffect(()=>{(async()=>{
    await script('/js/ui.js');
    if(page==='dashboard'){await script('https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js');await script('/original-runtime.js');}
    if(page==='login')await script('/original-login.js');
    if(page==='landing'){document.getElementById('loading-screen')?.classList.add('hidden');document.querySelectorAll('[data-aos]').forEach(e=>e.removeAttribute('data-aos'));await script('/js/script.js');}
  })().catch(e=>setError(e.message));},[]);
  return <><link rel="stylesheet" href="/css/styles.css"/><link rel="stylesheet" href="/css/ui.css"/><style>{styles+'\n#root{width:100%} body:has(.auth-container) #root{display:flex;justify-content:center;align-items:center;min-height:100vh}'}</style>{error&&<p role="alert">{error}</p>}{parse(body,{replace(node){if(node.type==='tag'&&node.attribs){for(const key of Object.keys(node.attribs))if(/^on/i.test(key))delete node.attribs[key];}}})}</>;
}
