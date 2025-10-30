import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

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
  const saveBtn = document.getElementById('saveBtn');
  const loadingText = document.getElementById('loadingText');

  bookImageInput.addEventListener('change', () => {
    const file = bookImageInput.files[0];
    if (file) {
      bookImagePreview.src = URL.createObjectURL(file);
    }
  });

  document.getElementById('archiveForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const bookTitle = document.getElementById('bookTitle').value.trim();
    const bookAuthor = document.getElementById('bookAuthor').value.trim();
    const bookCategory = document.getElementById('bookCategory').value.trim();
    const statusCheckboxes = document.querySelectorAll('input[name="status"]:checked');
    const status = Array.from(statusCheckboxes).map(cb => cb.value).join(', ');
    const docLink = document.getElementById('docLink').value.trim();
    const bookImage = document.getElementById('bookImage').files[0];

    if (bookTitle && bookAuthor && bookCategory && status) {
      try {
        saveBtn.disabled = true;
        loadingText.textContent = "Saving, please wait...";

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
            return;
          }
        }

        await saveBookToFirestore(bookTitle, bookAuthor, bookCategory, status, docLink, imageURL);

        // Clear form + image preview
        document.getElementById('archiveForm').reset();
        bookImagePreview.src = ""; // ✅ Clears the preview
        loadingText.textContent = "";
        saveBtn.disabled = false;
        alert('Book added to archive successfully!');
        toggleLinkField();

      } catch (err) {
        console.error(err);
        alert("Failed to add book. Please check your connection and try again.");
        loadingText.textContent = "";
        saveBtn.disabled = false;
      }
    } else {
      alert('Please fill out all required fields!');
    }
  });
});

function saveBookToFirestore(title, author, category, status, docLink, imageURL) {
  const bookRef = collection(db, 'books');
  return addDoc(bookRef, {
    title,
    author,
    category,
    status,
    docLink: status.includes('Online') || status.includes('Both') ? docLink : null,
    imageURL
  });
}

// Toggle link field
function toggleLinkField() {
  const onlineCheckbox = document.querySelector('input[name="status"][value="Online"]');
  const bothCheckbox = document.querySelector('input[name="status"][value="Both"]');
  const onlineLinkField = document.getElementById('onlineLinkField');

  if (onlineCheckbox.checked || bothCheckbox.checked) {
    onlineLinkField.style.display = 'block';
  } else {
    onlineLinkField.style.display = 'none';
  }
}
