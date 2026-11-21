import React,{useState} from 'react';
export default function Tools({api}) {
  const [tab,setTab]=useState('Weather'),[result,setResult]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const tabs=['Weather','Soil & crops','Fertilizer','Pest advisory','Market','Profit'];
  async function submit(e){e.preventDefault();setBusy(true);setError('');setResult(null);const v=Object.fromEntries(new FormData(e.currentTarget));try{
    if(tab==='Weather')setResult(await api('/weather?city='+encodeURIComponent(v.city)));
    if(tab==='Soil & crops')setResult(await api('/crops','POST',Object.fromEntries(Object.entries(v).map(([k,x])=>[k,Number(x)]))));
    if(tab==='Fertilizer')setResult(await api('/fertilizers?'+new URLSearchParams(v)));
    if(tab==='Pest advisory')setResult((await api('/pests')).filter(r=>r.question.toLowerCase().includes(v.q.toLowerCase())||r.disease.toLowerCase().includes(v.q.toLowerCase())));
    if(tab==='Market')setResult(await api('/market?q='+encodeURIComponent(v.q)));
    if(tab==='Profit'){const revenue=Number(v.quantity)*Number(v.price),cost=Number(v.cost);setResult({revenue,cost,profit:revenue-cost});}
  }catch(e){setError(e.message);}finally{setBusy(false);}}
  const input=(name,label,type='number')=><label key={name}>{label}<input name={name} required type={type} min="0" step="any" max={name==='ph'?14:name==='humidity'?100:undefined}/></label>;
  return <section><h2>Farm decision tools</h2><nav aria-label="Farm tools">{tabs.map(t=><button className={t===tab?'':'secondary'} aria-pressed={t===tab} key={t} onClick={()=>{setTab(t);setResult(null);setError('');}} disabled={busy}>{t}</button>)}</nav><h3>{tab}</h3>
    <form key={tab} onSubmit={submit}><div className="grid">
      {tab==='Weather'&&input('city','City','text')}
      {tab==='Soil & crops'&&[['N','Nitrogen (dataset scale)'],['P','Phosphorus (dataset scale)'],['K','Potassium (dataset scale)'],['ph','Measured soil pH'],['temperature','Temperature (°C)'],['humidity','Humidity (%)'],['rainfall','Rainfall (mm)']].map(([k,l])=>input(k,l))}
      {tab==='Fertilizer'&&<><label>Soil<select name="soil">{['Black','Clayey','Loamy','Red','Sandy'].map(s=><option key={s}>{s}</option>)}</select></label><label>Crop<select name="crop">{['Paddy','Cotton','Wheat','Maize','Barley','Ground Nuts','Millets','Oil seeds','Pulses','Sugarcane','Tobacco'].map(s=><option key={s}>{s}</option>)}</select></label></>}
      {(tab==='Market'||tab==='Pest advisory')&&<label>Search (leave blank for all)<input name="q" placeholder={tab==='Market'?'Crop, market, district or state':'Disease or symptom'}/></label>}
      {tab==='Profit'&&[['quantity','Harvest quantity (quintals)'],['price','Sale price (₹/quintal)'],['cost','Total costs (₹)']].map(([k,l])=>input(k,l))}
    </div><button disabled={busy}>{busy?'Loading…':'View results'}</button></form><p role="status">{error}</p>
    {tab==='Soil & crops'&&<p>Exploratory similarity lookup using the supplied dataset. Nutrient units were not documented in the CSV; confirm compatibility with your soil report. Results are not validated crop or fertilizer prescriptions.</p>}
    {tab==='Fertilizer'&&<p>Fertilizer labels observed for this crop and soil in the training dataset. Frequency does not establish suitability or dose. A local soil-test recommendation is required before application.</p>}
    {tab==='Pest advisory'&&<p>The supplied file covers five rice-blast questions from Thanjavur. These are reference examples, not a diagnosis. Chemical doses are withheld because registration, pre-harvest intervals and source validation are missing. Confirm the pest and treatment with an agricultural officer.</p>}
    {result&&tab==='Weather'&&<article><h3>{result.city}: {result.temperature}°C</h3><p>{result.description} · Humidity {result.humidity}% · Wind {result.wind} m/s</p><small>Observation: {new Date(result.date*1000).toLocaleString()}</small></article>}
    {result&&tab==='Soil & crops'&&result.map(r=><article key={r.crop}><strong>{r.crop}</strong></article>)}
    {result&&tab==='Fertilizer'&&result.matches.map(r=><article key={r.name}>{r.name} — {r.count.toLocaleString()} records</article>)}
    {result&&tab==='Pest advisory'&&result.map(r=><article key={r.id}><strong>{r.question}</strong><p>{r.crop} · {r.disease} · {r.severity} · {r.district} · {r.season}</p></article>)}
    {result&&tab==='Market'&&<><p>Historical dataset snapshot; up to 100 matching records. Prices are not live.</p><div className="table-wrap"><table><thead><tr>{['Commodity','Market','State','Date','Modal price'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{result.map((r,i)=><tr key={i}><td>{r.Commodity} ({r.Variety})</td><td>{r.Market}</td><td>{r.State}</td><td>{r.Arrival_Date}</td><td>₹{r.Modal_x0020_Price}</td></tr>)}</tbody></table></div></>}
    {result&&tab==='Profit'&&<article><p>Revenue: ₹{result.revenue.toLocaleString('en-IN')}</p><p>Costs: ₹{result.cost.toLocaleString('en-IN')}</p><h3>Estimated profit: ₹{result.profit.toLocaleString('en-IN')}</h3></article>}
    {Array.isArray(result)&&!result.length&&<p>No matching records.</p>}
  </section>;
}
