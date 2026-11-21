async function cloud(url,method='GET',body){const r=await fetch('/api'+url,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Request failed');return d;}
let cloudFarm={};
let cloudSchedule={tasks:[],events:{}};
loadTasksFromStorage=()=>{AppData.scheduledTasks=cloudSchedule.tasks||[];scheduledEvents=cloudSchedule.events||{};setTimeout(renderScheduledTasks,100);};
saveTasksToStorage=async()=>{try{await cloud('/schedule','PUT',{tasks:AppData.scheduledTasks,events:scheduledEvents});}catch(e){UI.toast('Schedule was not saved: '+e.message,'error');}};
document.addEventListener('click',e=>{const cell=e.target.closest('[data-date]');if(cell)showDayDetail(cell.dataset.date,Number(cell.dataset.date.slice(-2)));});
getFarmProfile=()=>Object.fromEntries(['land','crops','yield','revenue'].map(k=>[k,cloudFarm[k]??'']));
setupFarmProfile=()=>{
 const form=document.getElementById('farm-profile-form');
 for(const k of ['land','crops','yield','revenue'])document.getElementById('farm-'+k).value=cloudFarm[k]??'';
 form.addEventListener('submit',async e=>{e.preventDefault();const b=form.querySelector('button');b.disabled=true;try{const values=Object.fromEntries(['land','crops','yield','revenue'].map(k=>[k,Number(document.getElementById('farm-'+k).value)]));cloudFarm=await cloud('/farm','PUT',values);loadDashboardStats();UI.toast('Farm profile saved');}catch(e){UI.toast(e.message,'error');}finally{b.disabled=false;}});
};
setupLogout=()=>document.getElementById('logout-btn').addEventListener('click',async()=>{try{await cloud('/logout','POST');location.href='/login.html';}catch(e){UI.toast(e.message,'error');}});
async function weather(params){showWeatherLoading(true);try{const d=await cloud('/weather-detail?'+new URLSearchParams(params));renderLiveWeather(d.current,d.forecast);}catch(e){showWeatherError(e.message);}}
fetchWeatherByCity=city=>weather({city});
fetchWeatherByCoords=(lat,lon)=>weather({lat,lon});
(async()=>{let user;try{user=await cloud('/me');}catch{location.href='/login.html';return;}try{[cloudFarm,cloudSchedule]=await Promise.all([cloud('/farm'),cloud('/schedule')]);localStorage.setItem('farmerName',user.name);initDashboard();document.getElementById('loading-screen')?.classList.add('hidden');}catch(e){document.getElementById('loading-screen')?.classList.add('hidden');UI.toast('Dashboard could not load: '+e.message,'error');}})();
