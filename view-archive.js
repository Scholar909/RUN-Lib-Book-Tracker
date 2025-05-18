if (!/Mobi|Android/i.test(navigator.userAgent)) {
  document.body.innerHTML = "<h2>This app is only available on mobile devices.</h2>";
} else {
  // Your other JS code and imports go below this line
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
const db = getFirestore(app);
getAuth();

// DOM Elements
const bookShelf = document.getElementById('bookShelf');
const categoryModal = document.getElementById('categoryModal');
const categoryList = document.getElementById('categoryList');
const closeCategoryModal = document.getElementById('closeCategoryModal');
const filterTitle = document.getElementById('filterTitle');
const filterAuthor = document.getElementById('filterAuthor');
const filterStatus = document.getElementById('filterStatus');
const filterCategory = document.getElementById('filterCategory');  // Added the category filter
const categoryFilterBtn = document.getElementById('categoryFilterBtn');
const totalBooks = document.getElementById('totalBooks');
const totalCategories = document.getElementById('totalCategories');
const icon = document.createElement('i');
icon.className = 'bx bx-copy';

let allBooks = [];

// Fetch books from Firestore
const fetchBooks = async () => {
  try {
    const snapshot = await getDocs(collection(db, "books"));
    allBooks = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

    // Update total books count
    totalBooks.textContent = allBooks.length;

    // Calculate unique categories and update totalCategories count
    const uniqueCategories = [...new Set(allBooks.map(book => book.category))];
    totalCategories.textContent = uniqueCategories.length;

    // Display books
    displayBooks(allBooks);
  } catch (error) {
    console.error("Error fetching books:", error);
  }
};

// Display books
// Display books
const displayBooks = (books) => {
  bookShelf.innerHTML = '';

  const filtered = books.filter(book =>
    book.title.toLowerCase().includes(filterTitle.value.toLowerCase()) &&
    book.author.toLowerCase().includes(filterAuthor.value.toLowerCase()) &&
    (filterStatus.value === 'both' || book.status.toLowerCase().includes(filterStatus.value.toLowerCase())) &&
    (filterCategory.value === '' || book.category === filterCategory.value)
  );

  console.log(filtered);  // Check the filtered books

  filtered.forEach(book => {
    const bookEl = document.createElement('div');
    bookEl.className = 'book-item';

    // Determine whether to show the Get Book link
    let getBookLink = '';
    if (book.status === 'Online' || book.status === 'Both') {
      getBookLink = `
        <div class="get-book">
          <a href="${book.docLink}" target="_blank">Get Book</a>
          <button class="copy-btn" data-link="${book.docLink}"><i class='bx bx-copy'></i></button>
        </div>
      `;
    }

    bookEl.innerHTML = `
      <div class="book-container">
        <div class="book-details">
          <h4>${book.title}</h4>
          <p>Author: ${book.author}</p>
          <p>Category: ${book.category}</p>
          <p>Status: ${book.status}</p>
          ${book.status === 'on shelf' ? '' : getBookLink}
          <button class="delete-btn" data-id="${book.id}">Delete Book</button>
        </div>
        <div class="book-image">
        ${book.imageURL ? `<img src="${book.imageURL}" alt="Book Image">` : ''}
        </div>
      </div>
    `;

    bookShelf.appendChild(bookEl);
  });
};

// Handle Category Filter
categoryFilterBtn.addEventListener('click', () => {
  categoryModal.style.display = 'block';
  categoryList.innerHTML = '';

  const categories = [...new Set(allBooks.map(book => book.category))].sort();
  categories.forEach(category => {
    const item = document.createElement('li');
    item.textContent = category;
    item.className = 'category-item';
    item.addEventListener('click', () => {
      filterCategory.value = category;  // Set the category filter value
      displayBooks(allBooks);  // Refresh the book display
      categoryModal.style.display = 'none';  // Close the modal
    });
    categoryList.appendChild(item);
  });
});

// Close modal
closeCategoryModal.addEventListener('click', () => {
  categoryModal.style.display = 'none';
});

// Copy link handler
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('copy-btn')) {
    const link = e.target.dataset.link;

    // Check if link exists
    if (link) {
      navigator.clipboard.writeText(link).then(() => {
        alert('Link copied to clipboard!');
      }).catch(err => {
        console.error('Error copying link:', err);
      });
    } else {
      console.error('No link found to copy!');
    }
  }
});

// Filter on input
[filterTitle, filterAuthor, filterStatus, filterCategory].forEach(input => {
  input.addEventListener('input', () => displayBooks(allBooks));
});

// Handle delete book
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const bookId = e.target.dataset.id;
    if (confirm("Are you sure you want to permanently delete this book?")) {
      try {
        await deleteDoc(doc(db, "books", bookId));
        alert("Book deleted successfully.");
        fetchBooks(); // Refresh the list
      } catch (error) {
        console.error("Error deleting book:", error);
      }
    }
  }
});

// Initial call
fetchBooks();