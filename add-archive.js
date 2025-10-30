import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

if (!/Mobi|Android/i.test(navigator.userAgent)) {
  document.body.innerHTML = "<h2>This app is only available on mobile devices.</h2>";
} else {
// Firebase Configuration

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyADxQ63yGYl0X4hlbpmuE9r4HPan2rJPGY",
  authDomain: "book-tracker-run.firebaseapp.com",
  projectId: "book-tracker-run",
  storageBucket: "book-tracker-run.appspot.com",
  messagingSenderId: "87649407725",
  appId: "1:87649407725:web:34071fed2135c593d332e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage(app);

// ===== Book Image Preview and Upload =====
const bookImageInput = document.getElementById('bookImage');
const bookImagePreview = document.getElementById('bookImagePreview');

bookImagePreview.addEventListener('click', () => bookImageInput.click());

bookImageInput.addEventListener('change', () => {
  const file = bookImageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      bookImagePreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Handle the display of document link field based on checkbox selection
document.querySelectorAll('input[name="status"]').forEach(checkbox => {
  checkbox.addEventListener('change', toggleLinkField);
});

function toggleLinkField() {
  const onlineCheckbox = document.querySelector('input[name="status"][value="Online"]');
  const bothCheckbox = document.querySelector('input[name="status"][value="Both"]');
  const onlineLinkField = document.getElementById('onlineLinkField');
  
  if (onlineCheckbox.checked || bothCheckbox.checked) {
    onlineLinkField.style.display = 'block'; // Show the document link field
  } else {
    onlineLinkField.style.display = 'none'; // Hide the document link field
  }
}

// Handle form submission and save data to Firebase Firestore
document.getElementById('archiveForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the form from refreshing the page
  
  // Get form values
  const bookTitle = document.getElementById('bookTitle').value;
  const bookAuthor = document.getElementById('bookAuthor').value;
  const bookCategory = document.getElementById('bookCategory').value;
  const statusCheckboxes = document.querySelectorAll('input[name="status"]:checked');
  const status = Array.from(statusCheckboxes).map(checkbox => checkbox.value).join(', ');
  const docLink = document.getElementById('docLink').value;
  const bookImage = document.getElementById('bookImage').files[0];

  if (bookTitle && bookAuthor && bookCategory && status) {
    // Create a reference for Firebase Storage (for image upload)
    let imageURL = null;

    if (bookImage) {
      const formData = new FormData();
      formData.append('image', bookImage);
    
      const imgbbApiKey = '27ab1b13f2070f19b9739869326c775c'; // Replace with your actual ImgBB API key
      const imgbbURL = `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`;
    
      fetch(imgbbURL, {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const uploadedImageURL = data.data.url;
          saveBookToFirestore(bookTitle, bookAuthor, bookCategory, status, docLink, uploadedImageURL);
        } else {
          alert('Image upload failed.');
        }
      })
      .catch(error => {
        alert('Error uploading image: ' + error.message);
      });
    } else {
      // No image selected, proceed without uploading an image
      saveBookToFirestore(bookTitle, bookAuthor, bookCategory, status, docLink, null);
    }
  } else {
    alert('Please fill out all required fields!');
  }
});

// Function to save book data to Firestore
function saveBookToFirestore(title, author, category, status, docLink, imageURL) {
  const bookRef = collection(db, 'books');

  addDoc(bookRef, {
    title: title,
    author: author,
    category: category,
    status: status,
    docLink: status.includes('Online') || status.includes('Both') ? docLink : null,
    imageURL: imageURL // Will be null if no image is uploaded
  }).then(() => {
    alert('Book added to archive successfully!');
    document.getElementById('archiveForm').reset();
    toggleLinkField(); // Hide the document link input if status changes
  }).catch(error => {
    alert('Error adding book: ' + error.message);
  });
}
}