import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyADxQ63yGYl0X4hlbpmuE9r4HPan2rJPGY",
  authDomain: "book-tracker-run.firebaseapp.com",
  projectId: "book-tracker-run",
  storageBucket: "book-tracker-run.appspot.com",
  messagingSenderId: "87649407725",
  appId: "1:87649407725:web:34071fed2135c593d332e4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const salesRef = collection(db, "sales");

const modal = document.getElementById("add-book-modal");
const bookList = document.getElementById("books-list");

// Show modal
document.getElementById("add-book-btn").onclick = () => {
  modal.style.display = "block";
};

// Close modal
window.closeModal = () => {
  modal.style.display = "none";
  clearModalInputs();
};

// Clear modal inputs
function clearModalInputs() {
  document.getElementById("book-title").value = "";
  document.getElementById("book-author").value = "";
  document.getElementById("book-price").value = "";
}

// Save book
window.saveBook = async () => {
  const title = document.getElementById("book-title").value.trim();
  const author = document.getElementById("book-author").value.trim();
  const price = parseFloat(document.getElementById("book-price").value);

  if (!title || !author || isNaN(price)) {
    alert("All fields are required!");
    return;
  }

  await addDoc(salesRef, { title, author, price });
  alert("Book added successfully!");
  closeModal();
  loadBooks();
};

// Load books into the table
async function loadBooks() {
  const snapshot = await getDocs(salesRef);
  bookList.innerHTML = "";
  snapshot.forEach(docSnap => {
    const book = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.price}</td>
      <td>
        <button onclick="editBook('${docSnap.id}', '${book.title}', '${book.author}', ${book.price})">Edit</button>
        <button onclick="deleteBook('${docSnap.id}')">Delete</button>
      </td>
    `;
    bookList.appendChild(row);
  });
}

// Delete a book
window.deleteBook = async (id) => {
  if (confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
    await deleteDoc(doc(db, "sales", id));
    alert("Book deleted.");
    loadBooks();
  }
};

// Edit a book
window.editBook = (id, oldTitle, oldAuthor, oldPrice) => {
  document.getElementById("book-title").value = oldTitle;
  document.getElementById("book-author").value = oldAuthor;
  document.getElementById("book-price").value = oldPrice;
  modal.style.display = "block";

  const saveBtn = document.querySelector("#add-book-modal button[onclick='saveBook()']");
  saveBtn.textContent = "Update";

  saveBtn.onclick = async () => {
    const newTitle = document.getElementById("book-title").value.trim();
    const newAuthor = document.getElementById("book-author").value.trim();
    const newPrice = parseFloat(document.getElementById("book-price").value);

    if (!newTitle || !newAuthor || isNaN(newPrice)) {
      alert("All fields are required!");
      return;
    }

    await updateDoc(doc(db, "sales", id), {
      title: newTitle,
      author: newAuthor,
      price: newPrice
    });

    alert("Book updated.");
    closeModal();
    saveBtn.textContent = "Save";
    saveBtn.setAttribute("onclick", "saveBook()");
    loadBooks();
  };
};

// Live filter by title and author
document.getElementById("search-title").addEventListener("input", liveFilter);
document.getElementById("search-author").addEventListener("input", liveFilter);

async function liveFilter() {
  const titleFilter = document.getElementById("search-title").value.toLowerCase();
  const authorFilter = document.getElementById("search-author").value.toLowerCase();

  const snapshot = await getDocs(salesRef);
  bookList.innerHTML = "";

  snapshot.forEach(docSnap => {
    const book = docSnap.data();
    if (
      book.title.toLowerCase().includes(titleFilter) &&
      book.author.toLowerCase().includes(authorFilter)
    ) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.price}</td>
        <td>
          <button onclick="editBook('${docSnap.id}', '${book.title}', '${book.author}', ${book.price})">Edit</button>
          <button onclick="deleteBook('${docSnap.id}')">Delete</button>
        </td>
      `;
      bookList.appendChild(row);
    }
  });

  // If no filters, load all
  if (!titleFilter && !authorFilter) loadBooks();
}

// Filter books by price only
window.filterBooks = async () => {
  const min = parseFloat(document.getElementById("min-price").value) || 0;
  const max = parseFloat(document.getElementById("max-price").value) || Infinity;

  const snapshot = await getDocs(salesRef);
  bookList.innerHTML = "";

  snapshot.forEach(docSnap => {
    const book = docSnap.data();
    if (book.price >= min && book.price <= max) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.price}</td>
        <td>
          <button onclick="editBook('${docSnap.id}', '${book.title}', '${book.author}', ${book.price})">Edit</button>
          <button onclick="deleteBook('${docSnap.id}')">Delete</button>
        </td>
      `;
      bookList.appendChild(row);
    }
  });
};

// Clear search inputs
window.clearAllBooks = () => {
  document.getElementById("search-title").value = "";
  document.getElementById("search-author").value = "";
  document.getElementById("min-price").value = "";
  document.getElementById("max-price").value = "";
  loadBooks();
};

loadBooks();
