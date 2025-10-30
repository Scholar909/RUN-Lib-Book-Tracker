// Import Firebase packages
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const bookCountSelect = document.getElementById('bookCount');
const bookDetailsDiv = document.getElementById('bookDetails');
const dateBorrowedInput = document.getElementById('dateBorrowed');
const returnBeforeInput = document.getElementById('returnBefore');
const form = document.getElementById('burrowForm');

// Show book title & author fields based on book count
bookCountSelect.addEventListener('change', () => {
  const count = parseInt(bookCountSelect.value);
  bookDetailsDiv.innerHTML = ''; // Clear previous inputs

  if (!count || isNaN(count)) return;

  // Create title and author fields dynamically based on book count
  for (let i = 1; i <= count; i++) {
    const titleInput = document.createElement('input');
    titleInput.placeholder = `Book ${i} Title`;
    titleInput.required = true;
    titleInput.classList.add('book-title');

    const authorInput = document.createElement('input');
    authorInput.placeholder = `Book ${i} Author`;
    authorInput.required = true;
    authorInput.classList.add('book-author');

    bookDetailsDiv.appendChild(titleInput);
    bookDetailsDiv.appendChild(authorInput);
  }

  // Recalculate return date when book count changes
  updateReturnBefore();
});

// Function to calculate and update returnBefore date
function updateReturnBefore() {
  const count = parseInt(bookCountSelect.value);
  const dateValue = dateBorrowedInput.value;

  if (!count || !dateValue) {
    returnBeforeInput.value = '';
    return;
  }

  const borrowDate = new Date(dateValue);
  let daysToAdd = 0;

  // Adjust return date based on number of books
  if (count === 1) daysToAdd = 14;  // Return in 2 weeks for 1 book
  else if (count === 2) daysToAdd = 21;  // Return in 3 weeks for 2 books
  else if (count >= 3) daysToAdd = 28;  // Return in 4 weeks for 3+ books

  borrowDate.setDate(borrowDate.getDate() + daysToAdd);
  returnBeforeInput.value = borrowDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
}

// Recalculate return date when borrow date changes
dateBorrowedInput.addEventListener('change', updateReturnBefore);

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const bookTitles = [...document.querySelectorAll('.book-title')].map(input => input.value.trim());
  const bookAuthors = [...document.querySelectorAll('.book-author')].map(input => input.value.trim());

  const burrowerData = {
    name: document.getElementById('name').value.trim(),
    level: parseInt(document.getElementById('level').value),
    phone: document.getElementById('phone').value.trim(),
    department: document.getElementById('department').value.trim(),
    location: document.getElementById('location').value.trim(),
    numberOfBooks: parseInt(bookCountSelect.value),
    books: bookTitles.map((title, i) => ({
      title,
      author: bookAuthors[i]
    })),
    dateBorrowed: document.getElementById('dateBorrowed').value,
    returnBefore: returnBeforeInput.value,
    dateReturned: document.getElementById('dateReturned').value || null,
    timestamp: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "burrowers"), burrowerData);
    alert('Burrower data added successfully!');
    form.reset();
    bookDetailsDiv.innerHTML = '';  // Clear the dynamically generated book fields
    returnBeforeInput.value = '';  // Reset return date
  } catch (error) {
    console.error('Error adding burrower:', error);
    alert('Failed to add burrower.');
  }
});
