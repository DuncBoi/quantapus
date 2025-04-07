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

const googleLogin = document.getElementById("signInButton");
const dropdownMenu = document.getElementById("dropdownMenu");
const signOutLink = document.getElementById("signOutLink");

// Persist Sign-In State on Page Refresh
auth.onAuthStateChanged(user => {
    window.currentUser = user;
    if (user) {
        notyf.success("Signed In");
        updateToInitials(user);
        window.dispatchEvent("userSignedIn");
        console.log("this should work now");
    }
    else{
        googleLogin.textContent = "Sign In";
    }
});

//update button to user's initials
const updateToInitials = (user) => {
    const displayName = user.displayName || "User";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase();

    googleLogin.textContent = initials;
};

// Handle Sign-In
googleLogin.addEventListener("click", async function(){
    if (auth.currentUser) {
        dropdownMenu.style.display = "block";
        return;
    } 
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("User signed in:", result.user);
        updateToInitials(result.user);

        const uid = result.user.uid;
        
        const response = await fetch('https://api.quantapus.com/log-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid }),
        });

        if (!response.ok) throw new Error('Failed to log user');
        
        console.log('User UID logged in backend');

        window.dispatchEvent(new Event("userSignedIn"));
    } catch (error) {
        console.error("Error during sign-in:", error);
    }
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
        window.dispatchEvent(new Event("userSignedOut"));
    }).catch(error => {
        console.error("Error signing out:", error);
    });
});


