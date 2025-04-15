document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('borrowForm');
  const numBooksInput = document.getElementById('numBooks');
  const bookFieldsContainer = document.getElementById('bookFields');
  const dateBorrowed = document.getElementById('dateBorrowed');
  const returnBefore = document.getElementById('returnBefore');
  const exitBtn = document.getElementById('exitBtn');

  // Calculate return date: 7 days for each book
  function updateReturnDate() {
    const numBooks = parseInt(numBooksInput.value);
    const borrowedDate = new Date(dateBorrowed.value);
    if (!isNaN(numBooks) && dateBorrowed.value) {
      borrowedDate.setDate(borrowedDate.getDate() + (7 * numBooks));
      returnBefore.value = borrowedDate.toISOString().split('T')[0];
    }
  }

  // Dynamically add book title and author inputs
  function updateBookFields() {
    bookFieldsContainer.innerHTML = '';
    const numBooks = parseInt(numBooksInput.value);
    if (!isNaN(numBooks) && numBooks > 0) {
      for (let i = 1; i <= numBooks; i++) {
        const bookDiv = document.createElement('div');
        bookDiv.innerHTML = `
          <label>Book ${i} Title</label>
          <input type="text" name="bookTitle${i}" placeholder="Book ${i} Title" required>
          <label>Book ${i} Author</label>
          <input type="text" name="bookAuthor${i}" placeholder="Book ${i} Author" required>
        `;
        bookFieldsContainer.appendChild(bookDiv);
      }
    }
  }

  // Save form data to localStorage
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const record = {
      name: form.name.value,
      classLevel: form.classLevel.value,
      matric: form.matric.value,
      department: form.department.value,
      gender: form.gender.value,
      block: form.block.value,
      numBooks: numBooksInput.value,
      dateBorrowed: dateBorrowed.value,
      returnBefore: returnBefore.value,
      dateReturned: form.dateReturned.value,
      books: []
    };

    for (let i = 1; i <= parseInt(numBooksInput.value); i++) {
      const title = form[`bookTitle${i}`].value;
      const author = form[`bookAuthor${i}`].value;
      record.books.push({ title, author });
    }

    // Get existing records or initialize array
    const existing = JSON.parse(localStorage.getItem('borrowRecords')) || [];
    existing.push(record);
    localStorage.setItem('borrowRecords', JSON.stringify(existing));
    alert('Record saved successfully!');
    form.reset();
    bookFieldsContainer.innerHTML = '';
    returnBefore.value = '';
  });

  // Events
  numBooksInput.addEventListener('input', () => {
    updateBookFields();
    updateReturnDate();
  });

  dateBorrowed.addEventListener('input', updateReturnDate);

  // Exit button
  exitBtn.addEventListener('click', () => {
    window.close();
  });
});