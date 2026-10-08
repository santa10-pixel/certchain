import re

with open('certix-v2.html', 'r') as f:
    content = f.read()

# 1. Add Login Overlay at the top of the body
login_overlay = """
<!-- Login Overlay -->
<div id="loginOverlay" class="fixed inset-0 bg-[var(--bg)] z-[100] flex flex-col items-center justify-center p-4">
  <div class="glass-card max-w-md w-full rounded-2xl p-8 space-y-6 text-center shadow-2xl border border-indigo-500/30">
    <div class="w-16 h-16 rounded-2xl bg-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/50">
      <i data-lucide="shield-check" class="text-white w-8 h-8"></i>
    </div>
    <div>
      <h2 class="text-2xl font-bold">Welcome to CertiX</h2>
      <p class="text-gray-400 mt-2 text-sm">Select your role to continue into the decentralized portal.</p>
    </div>
    <div class="grid gap-3">
      <button onclick="loginAs('inst')" class="w-full text-left px-4 py-3 bg-gray-900 hover:bg-indigo-600 border border-gray-800 rounded-xl transition flex items-center gap-3 group">
        <i data-lucide="building-2" class="text-indigo-400 group-hover:text-white"></i>
        <div><div class="font-bold text-gray-200 group-hover:text-white">Institution</div><div class="text-xs text-gray-500 group-hover:text-indigo-200">Issue credentials & manage batches</div></div>
      </button>
      <button onclick="loginAs('student')" class="w-full text-left px-4 py-3 bg-gray-900 hover:bg-green-600 border border-gray-800 rounded-xl transition flex items-center gap-3 group">
        <i data-lucide="wallet" class="text-green-400 group-hover:text-white"></i>
        <div><div class="font-bold text-gray-200 group-hover:text-white">Student</div><div class="text-xs text-gray-500 group-hover:text-green-200">View wallet & share claims</div></div>
      </button>
      <button onclick="loginAs('verifier')" class="w-full text-left px-4 py-3 bg-gray-900 hover:bg-orange-600 border border-gray-800 rounded-xl transition flex items-center gap-3 group">
        <i data-lucide="check-circle" class="text-orange-400 group-hover:text-white"></i>
        <div><div class="font-bold text-gray-200 group-hover:text-white">Verifier (Employer)</div><div class="text-xs text-gray-500 group-hover:text-orange-200">Verify candidate authenticity</div></div>
      </button>
      <button onclick="loginAs('admin')" class="w-full text-left px-4 py-3 bg-gray-900 hover:bg-red-600 border border-gray-800 rounded-xl transition flex items-center gap-3 group">
        <i data-lucide="shield-alert" class="text-red-400 group-hover:text-white"></i>
        <div><div class="font-bold text-gray-200 group-hover:text-white">Security Admin</div><div class="text-xs text-gray-500 group-hover:text-red-200">Threat monitor & lab</div></div>
      </button>
    </div>
  </div>
</div>
"""
content = content.replace('<body class="dark h-screen flex flex-col overflow-hidden">', '<body class="dark h-screen flex flex-col overflow-hidden">' + login_overlay)

# Add loginAs function
login_js = """
  window.loginAs = (role) => {
    document.getElementById('loginOverlay').style.display = 'none';
    const nav = document.getElementById('mainNav');
    // Hide all nav buttons first
    Array.from(nav.children).forEach(b => { b.style.display = 'none'; b.classList.remove('active', 'text-white', 'bg-indigo-600'); });
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    
    // Show only the selected role's tab + Research Dash for everyone
    let target = '';
    if(role === 'inst') { nav.children[0].style.display = 'block'; target = 'dash-inst'; }
    if(role === 'student') { nav.children[1].style.display = 'block'; target = 'dash-student'; }
    if(role === 'verifier') { nav.children[2].style.display = 'block'; target = 'dash-verifier'; }
    if(role === 'admin') { nav.children[3].style.display = 'block'; target = 'dash-security'; }
    nav.children[4].style.display = 'block'; // Research dash always visible
    
    // Activate target
    const btn = document.querySelector(`[data-target="${target}"]`);
    btn.classList.add('active', 'text-white', 'bg-indigo-600');
    document.getElementById(target).classList.add('active');
  };
"""
content = content.replace('// --- CRYPTOGRAPHY & CORE ENGINE ---', login_js + '\n  // --- CRYPTOGRAPHY & CORE ENGINE ---')

# 2. Fix Unique Registration Number
issue_start = """
      const record = {
        name: document.getElementById('i_name').value || 'Student',
        reg: document.getElementById('i_reg').value || 'ID123',
        prog: document.getElementById('i_prog').value || 'B.Tech',
        cgpa: document.getElementById('i_cgpa').value || '9.0',
        skills: document.getElementById('i_skills').value || 'None'
      };
"""
issue_replacement = issue_start + """
      if(STATE.wallet.some(w => w.record.reg === record.reg)) {
        alert("A credential with this Registration Number already exists!");
        return;
      }
"""
content = content.replace(issue_start, issue_replacement)

# 3. Fix Tampered Bug (Root Hash Order)
hash_root_old = """      // Root hash (Merkle root approximation)
      const rootHash = await hashData(Object.values(hashes).join(''));"""
hash_root_new = """      // Root hash (Ordered keys)
      const orderedKeys = ['name', 'reg', 'prog', 'cgpa', 'skills'];
      const rootHash = await hashData(orderedKeys.map(k => hashes[k]).join(''));"""
content = content.replace(hash_root_old, hash_root_new)


verify_old = """    // 5. Cryptographic Integrity (Reconstruct Root Hash)
    let reconstructedHashes = [];
    for(const [k, v] of Object.entries(p.claims)) reconstructedHashes.push(await hashData(v.val + v.salt));
    for(const [k, h] of Object.entries(p.hidden)) reconstructedHashes.push(h);
    
    const testRoot = await hashData(reconstructedHashes.join(''));"""
    
verify_new = """    // 5. Cryptographic Integrity (Reconstruct Root Hash)
    const orderedKeys = ['name', 'reg', 'prog', 'cgpa', 'skills'];
    let reconstructedHashes = [];
    for(const k of orderedKeys) {
      if(p.claims[k]) reconstructedHashes.push(await hashData(p.claims[k].val + p.claims[k].salt));
      else if (p.hidden[k]) reconstructedHashes.push(p.hidden[k]);
    }
    const testRoot = await hashData(reconstructedHashes.join(''));"""
content = content.replace(verify_old, verify_new)


with open('certix-v2.html', 'w') as f:
    f.write(content)
