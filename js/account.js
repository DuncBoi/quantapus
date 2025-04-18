const notyf = new Notyf();

window.initAccount = async function() {
  const user = window.currentUser;

  // if not signed in, send back to login
  if (!user) {
    const container = document.querySelector('.account-inner');
       container.innerHTML = `
          <h1>My Account</h1>
          <p style="margin-top:2rem; font-size:1.125rem; color:#e0e0e0;">
            You are not signed in.
          </p>
        `;
        return;
      }

  // DOM refs
  const avatarEl    = document.getElementById("userAvatar");
  const userNameEl   = document.getElementById("userName");
  const userEmailEl  = document.getElementById("userEmail");
  const resetBtn     = document.getElementById("resetProgressBtn");
  const deleteBtn    = document.getElementById("deleteAccountBtn");

  const updateToInitials = (u) => {
    const displayName = u.displayName || "User";
    const initials = displayName
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
    avatarEl.textContent = initials;
  };

  // populate UI
  updateToInitials(user);
  userNameEl.textContent  = user.displayName || "Name Not Found";
  userEmailEl.textContent = user.email       || "";

// Reset Progress
resetBtn.addEventListener("click", async () => {
    const { value: confirmReset } = await Swal.fire({
        title: 'Reset Progress?',
        text: 'The status of all completed problems will be cleared.',
        icon: 'question',
      
        background: '#24252A',         
        color:      '#e0e0e0',          
        backdrop:   'rgba(0,0,0,0.8)',  
      
        cancelButtonColor: '#61a9f1',
        confirmButtonColor:  '#e55353',
      
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText:  'No',
        reverseButtons: true
      });
    
      if (!confirmReset) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("https://api.quantapus.com/reset-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }});
      if (res.ok) {
        window.completedSet = new Set();
        notyf.success("Progress Reset");
      } else {
        notyf.error("Failed to reset progress");
      }
    } catch (err) {
      console.error("Reset failed:", err);
      notyf.error("Failed to reset progress");
    }
  });
  
  // Delete Account
  deleteBtn.addEventListener("click", async () => {
    const { value: confirmDelete } = await Swal.fire({
        title: 'Delete Account?',
        text: 'This will permanently remove all your data from our servers and cannot be undone.',
        icon: 'warning',
      
        background: '#24252A',         
        color:      '#e0e0e0',          
        backdrop:   'rgba(0,0,0,0.8)',  
      
        cancelButtonColor: '#61a9f1',
        confirmButtonColor:  '#e55353',
      
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText:  'No',
        reverseButtons: true
      });
    if (!confirmDelete) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("https://api.quantapus.com/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }      
        });
      if (res.ok) {
        window.triggerSignOut();
        notyf.success("Account Deleted");       
        window.handleNavigation("/");
      } else {
        const err = await res.json();
        console.error("Delete error:", err);
        notyf.error("Could Not Delete Account");       
      }
    } catch (err) {
      console.error("Delete failed:", err);
      notyf.error("Could Not Delete Account");       
    }
  });
  
}
