import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
const db = getFirestore();

// DOM elements
const burrowList = document.getElementById('burrow-list');
const modal = document.getElementById('editModal');
const closeBtn = document.querySelector('.close-btn');

// Show and close modal
closeBtn.addEventListener('click', () => {
  closeEditModal();
});

function openEditModal() {
  modal.style.display = 'flex';
  modal.classList.add('show');
}

function closeEditModal() {
  modal.style.display = 'none';
  modal.classList.remove('show');
}

// Background color logic
const getCardBackgroundColor = (returnBefore, returnedDate) => {
  const returnBeforeDate = new Date(returnBefore);
  const returned = returnedDate ? new Date(returnedDate) : null;

  if (!returnedDate && returnBeforeDate < new Date()) return "#FF0000";       // Overdue
  if (returned && returned > returnBeforeDate) return "#D8A7D9";              // Returned Late
  if (returned && returned <= returnBeforeDate) return "#90EE90";             // Returned On Time
  return "default";
};

// Fetch and display burrowers
const fetchBurrowers = async () => {
  try {
    const q = query(collection(db, "burrowers"));
    const querySnapshot = await getDocs(q);
    burrowList.innerHTML = '';

    querySnapshot.forEach((docData) => {
      const data = docData.data();
      const returnColor = getCardBackgroundColor(data.returnBefore, data.dateReturned);

      const card = document.createElement('div');
      card.classList.add('card');
      card.style.backgroundColor = returnColor;

      card.innerHTML = `
        <h3 class="name">${data.name}</h3>
        <p class="level">Level: ${data.level}</p>
        <p>Phone: ${data.phone}</p>
        <p>Department: ${data.department}</p>
        <p>Location: ${data.location}</p>
        <p>Books Borrowed: ${data.books.map(book => `${book.title} by ${book.author}`).join(', ')}</p>
        <p>Borrowed Date: ${data.dateBorrowed}</p>
        <p>Return Before: ${data.returnBefore}</p>
        <p>Returned Date: ${data.dateReturned || "Not Returned Yet"}</p>
      `;

      // Add data attributes
      card.setAttribute('data-return-before', data.returnBefore);
      card.setAttribute('data-returned-date', data.dateReturned || '');

      // Edit button
      const editButton = document.createElement('button');
      editButton.classList.add('edit-btn');
      editButton.textContent = 'Edit';
      editButton.setAttribute('data-id', docData.id);
      editButton.addEventListener('click', () => editBurrower(docData.id, data));
      card.appendChild(editButton);

      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.classList.add('delete-btn');
      deleteButton.textContent = 'Delete';
      deleteButton.setAttribute('data-id', docData.id);
      deleteButton.addEventListener('click', () => deleteBurrower(docData.id));
      card.appendChild(deleteButton);

      burrowList.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching burrowers:", error);
  }
};

// Delete burrower
const deleteBurrower = async (id) => {
  if (!confirm("Are you sure you want to permanently delete this burrower?")) return;

  try {
    await deleteDoc(doc(db, "burrowers", id));
    alert('Burrower deleted!');
    fetchBurrowers();
  } catch (error) {
    console.error("Error deleting burrower: ", error);
    alert('Failed to delete burrower');
  }
};

// Populate modal for editing
const editBurrower = (id, data) => {
  document.getElementById('editId').value = id;
  document.getElementById('editName').value = data.name;
  document.getElementById('editLevel').value = data.level;
  document.getElementById('editPhone').value = data.phone;
  document.getElementById('editDepartment').value = data.department;
  document.getElementById('editLocation').value = data.location;
  document.getElementById('editBooks').value = data.books.map(book => book.title).join(', ');
  document.getElementById('editReturnBefore').value = data.returnBefore;
  document.getElementById('editDateReturned').value = data.dateReturned || '';
  openEditModal();
};

// Handle edit form submission
document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  updateBurrower(id);
});

// Update burrower info
const updateBurrower = async (id) => {
  const name = document.getElementById('editName').value;
  const level = document.getElementById('editLevel').value;
  const phone = document.getElementById('editPhone').value;
  const department = document.getElementById('editDepartment').value;
  const location = document.getElementById('editLocation').value;
  const books = document.getElementById('editBooks').value.split(',').map(book => ({ title: book.trim(), author: '' }));
  const returnBefore = document.getElementById('editReturnBefore').value;
  const dateReturned = document.getElementById('editDateReturned').value || null;

  try {
    await updateDoc(doc(db, "burrowers", id), {
      name,
      level,
      phone,
      department,
      location,
      books,
      returnBefore,
      dateReturned
    });

    alert('Burrower updated!');
    closeEditModal();
    fetchBurrowers();
  } catch (error) {
    console.error("Error updating burrower: ", error);
    alert('Failed to update burrower');
  }
};

// INITIALIZE on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchBurrowers();  // Important!
});

// Input listeners
['search-name', 'search-level', 'filter-status', 'start-date', 'end-date'].forEach(id => {
  document.getElementById(id).addEventListener('input', filterBurrows);
});

// Clear all filters
document.getElementById('clear-all').addEventListener('click', () => {
  ['search-name', 'search-level', 'filter-status', 'start-date', 'end-date'].forEach(id => {
    document.getElementById(id).value = '';
  });
  filterBurrows();
});

// Initialize app
fetchBurrowers();

// Filter function
function filterBurrows() {
  const getVal = id => document.getElementById(id).value.toLowerCase();
  const nameVal = getVal('search-name');
  const levelVal = getVal('search-level');
  const statusVal = getVal('filter-status');
  const startDate = new Date(document.getElementById('start-date').value);
  const endDate = new Date(document.getElementById('end-date').value);

  document.querySelectorAll('.card').forEach(card => {
    const name = card.querySelector('.name')?.textContent.toLowerCase() || '';
    const level = card.querySelector('.level')?.textContent.toLowerCase() || '';
    const returnBefore = new Date(card.getAttribute('data-return-before'));
    const returnedDate = card.getAttribute('data-returned-date') ? new Date(card.getAttribute('data-returned-date')) : null;

    const borrowedDateMatch = card.querySelector('p:nth-of-type(6)')?.textContent.match(/\d{4}-\d{2}-\d{2}/);
    const borrowedDate = borrowedDateMatch ? new Date(borrowedDateMatch[0]) : null;

    let show =
      (!nameVal || name.includes(nameVal)) &&
      (!levelVal || level.includes(levelVal)) &&
      (!statusVal || (
        (statusVal === 'yet' && !returnedDate) ||
        (statusVal === 'early' && returnedDate && returnedDate <= returnBefore) ||
        (statusVal === 'late' && returnedDate && returnedDate > returnBefore)
      )) &&
      (isNaN(startDate) || !borrowedDate || borrowedDate >= startDate) &&
      (isNaN(endDate) || !borrowedDate || borrowedDate <= endDate);

    card.style.display = show ? 'block' : 'none';
  });
}
