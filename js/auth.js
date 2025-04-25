import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

const notyf = new Notyf();

const firebaseConfig = {
    apiKey: "AIzaSyAOSxXEAlWwuvWqWbNCVDBSjvFepVgn8jc",
    authDomain: "auth.quantapus.com",
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
    hideDropdown();
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
    if (window.location.pathname === '/account') {
        window.handleNavigation('/account');
    }
});


//update button to user's initials
const updateToInitials = (user) => {
    const displayName = user.displayName || "User";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase();

    googleLogin.textContent = initials;
};

// Handle Sign-In
googleLogin.addEventListener("click", async () => {
  if (auth.currentUser) {
    dropdownMenu.style.display = "block";
    return;
  }

  await Swal.fire({
    title: 'Before you sign in…',
    html: `
      <div class="tos-content">
        <p>Please review our 
          <a href="#"
             onclick="window.open(window.location.origin + '/terms','_blank');return false;"
             style="color:#61a9f1;text-decoration:underline;"
          >Terms of Service</a>
          &amp;
          <a href="#"
             onclick="window.open(window.location.origin + '/privacy','_blank');return false;"
             style="color:#61a9f1;text-decoration:underline;"
          >Privacy Policy</a>.
        </p>
        <button id="swal-google-signin" class="swal2-styled">
          <i class="fab fa-google" style="font-size:30px;margin-right:8px;"></i>
          Sign in with Google
        </button>
      </div>
    `,
    showConfirmButton: false,
    showCancelButton: false,
    background: '#24252A',
    color:      '#e0e0e0',
    backdrop:   'rgba(0,0,0,0.8)',
    icon: 'info',

    didOpen: () => {
      const popup = Swal.getPopup();
      const btn   = popup.querySelector('#swal-google-signin');

      btn.addEventListener('click', async () => {
        Swal.close();
        try {
          const result = await signInWithPopup(auth, provider);
          updateToInitials(result.user);

          const uid   = result.user.uid;
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
    hideDropdown();
});

window.triggerSignOut = () => {
    signOutLink.click();
};
  


