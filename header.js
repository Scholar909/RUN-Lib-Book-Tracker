if (!/Mobi|Android/i.test(navigator.userAgent)) {
  document.body.innerHTML = "<h2>This app is only available on mobile devices.</h2>";
} else {
  // Your other JS code and imports go below this line
}

// Firebase configuration (replace with your actual Firebase project settings)
const firebaseConfig = {
  apiKey: "AIzaSyADxQ63yGYl0X4hlbpmuE9r4HPan2rJPGY",
  authDomain: "book-tracker-run.firebaseapp.com",
  projectId: "book-tracker-run",
  storageBucket: "book-tracker-run.appspot.com",
  messagingSenderId: "87649407725",
  appId: "1:87649407725:web:34071fed2135c593d332e4"
};

// Initialize Firebase
import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js").then(({ initializeApp }) => {
  initializeApp(firebaseConfig);
});

function toggleDrawer() {
  document.getElementById('drawer').classList.toggle('open');
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const icon = document.getElementById("theme-icon");
  icon.classList.toggle("bx-sun");
  icon.classList.toggle("bx-moon");
}

function logout() {
  import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js").then(({ getAuth, signOut }) => {
    const auth = getAuth();
    signOut(auth).then(() => {
      localStorage.clear(); // Clear session data
      sessionStorage.clear();
      window.location.replace("index.html");
    }).catch((error) => {
      alert("Logout failed: " + error.message);
    });
  });
}
