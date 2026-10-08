import re

with open('certix-v2.html', 'r') as f:
    content = f.read()

# Modify loginAs
login_js_old = """  window.loginAs = (role, bypassAuth = false) => {
    if(!bypassAuth) {
      const pass = prompt(`Enter password for ${role} (Hint: use 'certix'):`);
      if(pass !== 'certix') {
        alert("Incorrect credentials!");
        return;
      }
      localStorage.setItem('certix_auth_role', role);
    }"""

login_js_new = """  window.loginAs = (role, bypassAuth = false) => {
    if(!bypassAuth) {
      if(role === 'student') {
        const reg = prompt(`Enter your Student Registration Number (e.g. 22BCE1234):`);
        if(!reg) {
          alert("Registration number is required to access your wallet.");
          return;
        }
        localStorage.setItem('certix_student_reg', reg);
      } else {
        const pass = prompt(`Enter password for ${role} (Hint: use 'certix'):`);
        if(pass !== 'certix') {
          alert("Incorrect credentials!");
          return;
        }
      }
      localStorage.setItem('certix_auth_role', role);
    }"""
content = content.replace(login_js_old, login_js_new)

# Modify renderWallet
render_wallet_old = """  function renderWallet() {
    const list = document.getElementById('walletList');
    list.innerHTML = '';
    
    STATE.wallet.forEach(w => {"""

render_wallet_new = """  function renderWallet() {
    const list = document.getElementById('walletList');
    list.innerHTML = '';
    
    const myReg = localStorage.getItem('certix_student_reg');
    const myCerts = STATE.wallet.filter(w => !myReg || w.record.reg === myReg);
    
    if(myCerts.length === 0) {
      list.innerHTML = `<div class="p-8 text-center text-gray-500 border border-dashed border-gray-700 rounded-xl">Your wallet is empty. No credentials found for ${myReg || 'you'}.</div>`;
      return;
    }
    
    myCerts.forEach(w => {"""
content = content.replace(render_wallet_old, render_wallet_new)


with open('certix-v2.html', 'w') as f:
    f.write(content)
