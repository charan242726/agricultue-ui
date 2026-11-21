import { readFile } from 'node:fs/promises';
import { Router } from 'express';
export function csv(text) {
  const rows = []; let row = [], cell = '', quote = false;
  for (let i=0;i<text.length;i++) { const c=text[i]; if(c==='"'){if(quote && text[i+1]==='"'){cell+='"';i++;}else quote=!quote;}else if(c===','&&!quote){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quote){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}else cell+=c; }
  if(cell||row.length){row.push(cell);rows.push(row);} const headers=rows.shift(); return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]||''])));
}
const cache = new Map();
async function data(file) { if(!cache.has(file)) cache.set(file,csv(await readFile(new URL('../dataset/'+file,import.meta.url),'utf8'))); return cache.get(file); }
export const advisory = Router();
advisory.get('/weather-detail',async(req,res)=>{
 if(!process.env.WEATHER_API_KEY)return res.status(503).json({error:'Weather is not configured'});
 const params=new URLSearchParams({appid:process.env.WEATHER_API_KEY,units:'metric'});
 if(req.query.city)params.set('q',String(req.query.city).slice(0,100));else{const lat=Number(req.query.lat),lon=Number(req.query.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return res.status(400).json({error:'Invalid coordinates'});params.set('lat',lat);params.set('lon',lon);}
 try{const results=await Promise.all(['weather','forecast'].map(async type=>{const r=await fetch('https://api.openweathermap.org/data/2.5/'+type+'?'+params,{signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error();return r.json();}));res.json({current:results[0],forecast:results[1]});}catch{res.status(502).json({error:'Weather unavailable for this location'});}
});
advisory.get('/market', async (req,res) => {
  const rows=await data('India Mandi Wholesale Prices dataset/commodity_price.csv');
  const q=String(req.query.q||'').toLowerCase();
  res.json(rows.filter(r=>[r.Commodity,r.Market,r.State,r.District].some(v=>v.toLowerCase().includes(q))).slice(0,100));
});
advisory.get('/pests',async(req,res)=> {
  const rows=await data('agricultural pest or disease dataset/tamil_agri_qa.csv');
  // Show source questions and context; unverified chemical doses are not prescriptions.
  res.json(rows.map(r=>({id:r.id,crop:r.crop,disease:r.pest_or_disease,severity:r.severity,district:r.district,season:r.season,question:r.question_english})));
});
advisory.post('/crops',async(req,res)=> {
  const keys=['N','P','K','ph','temperature','humidity','rainfall'], scales=[140,145,205,14,60,100,300];
  if(keys.some(k=>typeof req.body[k]!=='number'||!Number.isFinite(req.body[k])||req.body[k]<0) || req.body.ph>14 || req.body.humidity>100) return res.status(400).json({error:'Enter valid nonnegative soil and climate values (pH ≤14, humidity ≤100).'});
  const rows=await data('crop-recommendation dataset/Crop_recommendation.csv'); const groups=new Map();
  for(const row of rows){const d=keys.reduce((s,k,i)=>s+((req.body[k]-Number(row[k]))/scales[i])**2,0);const old=groups.get(row.label);if(old===undefined||d<old)groups.set(row.label,d);}
  res.json([...groups].sort((a,b)=>a[1]-b[1]).slice(0,3).map(([crop,distance])=>({crop,distance})));
});
advisory.get('/fertilizers',async(req,res)=> {
  const rows=await data('fertilizers dataset/train.csv');
  const soils=[...new Set(rows.map(r=>r['Soil Type']))], crops=[...new Set(rows.map(r=>r['Crop Type']))];
  const counts={};
  for(const r of rows)if(r['Soil Type']===req.query.soil && r['Crop Type']===req.query.crop)counts[r['Fertilizer Name']]=(counts[r['Fertilizer Name']]||0)+1;
  res.json({soils,crops,matches:Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count}))});
});
advisory.get('/weather',async(req,res)=> {
  if(!process.env.WEATHER_API_KEY)return res.status(503).json({error:'Weather API key is not configured on the server.'});
  const city=String(req.query.city||'').trim();if(!city||city.length>100)return res.status(400).json({error:'Enter a city.'});
  try {const params=new URLSearchParams({q:city,appid:process.env.WEATHER_API_KEY,units:'metric'});const result=await fetch('https://api.openweathermap.org/data/2.5/weather?'+params,{signal:AbortSignal.timeout(10000)});if(!result.ok)return res.status(502).json({error:'Weather provider could not return this city. Check the city and API configuration.'});const d=await result.json();res.json({city:d.name,temperature:d.main.temp,humidity:d.main.humidity,wind:d.wind.speed,description:d.weather[0].description,date:d.dt});}catch{return res.status(502).json({error:'Weather service unavailable. Try again.'});}
});
