import re

with open('certix-v2.html', 'r') as f:
    content = f.read()

# 1. Add logout button to header
header_old = """      System Operational
    </div>
  </div>
</header>"""
header_new = """      System Operational
    </div>
    <button onclick="logout()" class="text-xs text-gray-400 hover:text-white ml-2 flex items-center gap-1"><i data-lucide="log-out" class="w-4 h-4"></i> Logout</button>
  </div>
</header>"""
content = content.replace(header_old, header_new)

# 2. Modify loginAs to include a prompt and localStorage
login_js_old = """  window.loginAs = (role) => {
    document.getElementById('loginOverlay').style.display = 'none';"""

login_js_new = """  window.logout = () => {
    localStorage.removeItem('certix_auth_role');
    location.reload();
  };

  window.loginAs = (role, bypassAuth = false) => {
    if(!bypassAuth) {
      const pass = prompt(`Enter password for ${role} (Hint: use 'certix'):`);
      if(pass !== 'certix') {
        alert("Incorrect credentials!");
        return;
      }
      localStorage.setItem('certix_auth_role', role);
    }
    
    document.getElementById('loginOverlay').style.display = 'none';"""
content = content.replace(login_js_old, login_js_new)

# 3. Add boot logic for localStorage
boot_old = """  initCrypto();
} catch (e) {"""
boot_new = """  initCrypto();
  
  // Check localStorage for persisted login
  const savedRole = localStorage.getItem('certix_auth_role');
  if(savedRole) {
    loginAs(savedRole, true);
  }

} catch (e) {"""
content = content.replace(boot_old, boot_new)

with open('certix-v2.html', 'w') as f:
    f.write(content)
