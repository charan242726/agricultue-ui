async function authSubmit(prefix,action){
 const form=document.getElementById(action==='register'?'signup-form':'signin-form');
 const extra=document.createElement('div');extra.innerHTML=`<div class="form-group"><label>Email</label><input class="form-input" type="email" name="email" autocomplete="email" required></div><div class="form-group"><label>Password</label><input class="form-input" type="password" name="password" minlength="10" maxlength="72" autocomplete="${action==='register'?'new-password':'current-password'}" required></div>`;
 form.insertBefore(extra,form.querySelector('button[type="submit"]'));
 form.noValidate=false;
 form.addEventListener('submit',async e=>{e.preventDefault();const button=form.querySelector('button[type="submit"]');button.disabled=true;try{const r=await fetch('/api/auth/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:document.getElementById('su-name').value,email:form.elements.email.value,password:form.elements.password.value})});const user=await r.json();if(!r.ok)throw new Error(user.error||'Sign in failed');localStorage.setItem('farmerName',user.name);localStorage.setItem('farmerVillage',document.getElementById(prefix+'-village').value);location.href='/dashboard.html';}catch(e){UI.toast(e.message,'error');}finally{button.disabled=false;}});
}
authSubmit('su','register');authSubmit('si','login');
