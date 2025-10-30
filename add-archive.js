import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

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
window.addEventListener("DOMContentLoaded", () => {
  const bookImageInput = document.getElementById('bookImage');
  const bookImagePreview = document.getElementById('bookImagePreview');

  bookImageInput.addEventListener('change', () => {
    const file = bookImageInput.files[0];
    if (file) {
      bookImagePreview.src = URL.createObjectURL(file);
    }
  });

  // ✅ Add "Saving..." overlay element dynamically
  const overlay = document.createElement('div');
  overlay.id = 'savingOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.display = 'none';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.background = 'rgba(255, 255, 255, 0.6)';
  overlay.style.backdropFilter = 'blur(6px)';
  overlay.style.zIndex = '9999';
  overlay.innerHTML = `<div style="font-size: 1.5rem; font-weight: bold; color: #333;">Saving...</div>`;
  document.body.appendChild(overlay);
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
document.getElementById('archiveForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent form refresh

  const addButton = document.querySelector('button[type="submit"]');
  const overlay = document.getElementById('savingOverlay');
  addButton.disabled = true; // Disable button to prevent double submission
  overlay.style.display = 'flex'; // ✅ Show saving overlay

  // Get form values
  const bookTitle = document.getElementById('bookTitle').value.trim();
  const bookAuthor = document.getElementById('bookAuthor').value.trim();
  const bookCategory = document.getElementById('bookCategory').value.trim();
  const statusCheckboxes = document.querySelectorAll('input[name="status"]:checked');
  const status = Array.from(statusCheckboxes).map(cb => cb.value).join(', ');
  const docLink = document.getElementById('docLink').value.trim();
  const bookImage = document.getElementById('bookImage').files[0];
  const bookImagePreview = document.getElementById('bookImagePreview');

  if (bookTitle && bookAuthor && bookCategory && status) {
    try {
      let imageURL = null;

      if (bookImage) {
        const formData = new FormData();
        formData.append("image", bookImage);

        const res = await fetch(`https://api.imgbb.com/1/upload?key=27ab1b13f2070f19b9739869326c775c`, {
          method: "POST",
          body: formData
        });
        const result = await res.json();

        if (result.success) {
          imageURL = result.data.url;
        } else {
          alert("Image upload failed. Please try again.");
          addButton.disabled = false;
          overlay.style.display = 'none'; // Hide overlay if upload fails
          return;
        }
      }

      // Save the book (whether image uploaded or not)
      await saveBookToFirestore(bookTitle, bookAuthor, bookCategory, status, docLink, imageURL);

      // ✅ Clear preview after save
      bookImagePreview.src = "";
      document.getElementById('archiveForm').reset();
      toggleLinkField(); // Hide doc link if needed

    } catch (err) {
      console.error(err);
      alert("Failed to add book. Please check your connection and try again.");
    } finally {
      addButton.disabled = false;
      overlay.style.display = 'none'; // ✅ Hide overlay after process completes
    }
  } else {
    alert('Please fill out all required fields!');
    addButton.disabled = false;
    overlay.style.display = 'none'; // Hide overlay if validation fails
  }
});

// Function to save book data to Firestore
function saveBookToFirestore(title, author, category, status, docLink, imageURL) {
  const bookRef = collection(db, 'books');

  return addDoc(bookRef, {
    title: title,
    author: author,
    category: category,
    status: status,
    docLink: status.includes('Online') || status.includes('Both') ? docLink : null,
    imageURL: imageURL // Will be null if no image is uploaded
  }).then(() => {
    alert('Book added to archive successfully!');
  }).catch(error => {
    alert('Error adding book: ' + error.message);
  });
}