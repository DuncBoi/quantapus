import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

const notyf = new Notyf();

const firebaseConfig = {
    apiKey: "AIzaSyAOSxXEAlWwuvWqWbNCVDBSjvFepVgn8jc",
    authDomain: "qp-auth-d9e52.firebaseapp.com",
    projectId: "qp-auth-d9e52",
    storageBucket: "qp-auth-d9e52.firebasestorage.app",
    messagingSenderId: "119036334637",
    appId: "1:119036334637:web:ad2532ca5aeca8009d5ea4",
    measurementId: "G-B1BHF415SR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();
window.currentUser = null;

//timeout reference for dropdown
let hideTimeout;

const accountLink    = document.getElementById("accountLink");
const googleLogin = document.getElementById("signInButton");
const dropdownMenu = document.getElementById("dropdownMenu");
const signOutLink = document.getElementById("signOutLink");

accountLink.addEventListener("click", function(e) {
    e.preventDefault();
    window.handleNavigation('/account');
  });

// Persist Sign-In State on Page Refresh
auth.onAuthStateChanged(async user => {
    window.currentUser = user;
    if (user) {
        notyf.success("Signed In");
        updateToInitials(user);
        await window.loadCompletion();
        
        window.dispatchEvent(new Event("userSignedIn"));
    } else {
        googleLogin.textContent = "Sign In";
        window.completedSet = new Set();
        window.completedSetPopulated = false;

        document.querySelectorAll('.checkmark').forEach(checkmark => {
            checkmark.classList.remove('completed');
        });

        const refreshEvent = new CustomEvent("refreshProgressInReactFlow");
        window.dispatchEvent(refreshEvent);
    }
});


//update button to user's initials
const updateToInitials = (user) => {
    const displayName = user.displayName || "User";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase();

    googleLogin.textContent = initials;
};

// Handle Sign-In
googleLogin.addEventListener("click", async function() {
    if (auth.currentUser) {
      dropdownMenu.style.display = "block";
      return;
    }
  
    const { value: agreed } = await Swal.fire({
      title: 'Before you sign in…',
      html:
        'Please read and agree to our ' +
        '<a href="#" onclick="handleNavigation(\'/terms\'); return false;">Terms of Service</a> and ' +
        '<a href="#" onclick="handleNavigation(\'/privacy\'); return false;">Privacy Policy</a>.',
      icon: 'info',
  
      input: 'checkbox',
      inputPlaceholder: 'I agree to Terms of Service & Privacy Policy',
      inputValidator: v => !v && 'You must agree before continuing',
  
      showConfirmButton: false,
      showCancelButton: false,
  
      footer:
        '<button id="swal-google-signin" class="swal2-styled" ' +
        'style="background:#fff;color:#444;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;">' +
        '<img src="https://developers.google.com/identity/images/g-logo.png" ' +
             'alt="Google logo" ' +
             'style="width:18px;height:18px;margin-right:8px;"/>' +
        'Sign in with Google' +
      '</button>',
  
      background: '#24252A',
      color:      '#e0e0e0',
      backdrop:   'rgba(0,0,0,0.8)',
  
      didOpen: () => {
        const checkbox = Swal.getPopup().querySelector('input[type="checkbox"]');
        const btn      = Swal.getPopup().querySelector('#swal-google-signin');
  
        // disable until they check
        btn.disabled = true;
        btn.style.opacity = '0.5';
  
        checkbox.addEventListener('change', () => {
          btn.disabled = !checkbox.checked;
          btn.style.opacity = checkbox.checked ? '1' : '0.5';
        });
  
        btn.addEventListener('click', async () => {
          Swal.close();
  
          try {
            const result = await signInWithPopup(auth, provider);
            console.log("User signed in:", result.user);
            updateToInitials(result.user);
  
            const uid = result.user.uid;
            const token = await result.user.getIdToken();
  
            const response = await fetch('https://api.quantapus.com/log-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ uid }),
            });
  
            if (response.status === 429) {
              notyf.error('API Rate Limit Hit.');
              return;
            }
            if (response.ok) console.log('User UID logged in backend');
  
          } catch (error) {
            console.error("Error during sign-in:", error);
          }
        });
      }
    });
});  

googleLogin.addEventListener("mouseenter", function () {
    if (auth.currentUser) {
        dropdownMenu.style.display = "block";
    }
    clearTimeout(hideTimeout);
});

dropdownMenu.addEventListener("mouseenter", function () {
    clearTimeout(hideTimeout);
});

function hideDropdown() {
    hideTimeout = setTimeout(() => {
        dropdownMenu.style.display = "none"; 
    }, 200); 
}

signInButton.addEventListener("mouseleave", hideDropdown);
dropdownMenu.addEventListener("mouseleave", hideDropdown);

signOutLink.addEventListener("click", function(event) {
    event.preventDefault(); 
    auth.signOut().then(() => {
        window.currentUser = null;
        dropdownMenu.style.display = "none";
        signInButton.textContent = "Sign In"; 
        notyf.success("Signed Out");
    }).catch(error => {
        console.error("Error signing out:", error);
    });
});

window.triggerSignOut = () => {
    signOutLink.click();
};
  


