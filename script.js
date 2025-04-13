document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('borrowForm');
  const recordList = document.getElementById('recordList');
  const nameSearch = document.getElementById('nameSearch');
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  const printBtn = document.getElementById('printBtn');

  const bookContainer = document.getElementById('bookFields');
  const numBooksInput = document.getElementById('numBooks');
  const dateBorrowedInput = document.getElementById('dateBorrowed');

  let records = JSON.parse(localStorage.getItem('borrowedBooks')) || [];

  function saveRecords() {
    localStorage.setItem('borrowedBooks', JSON.stringify(records));
  }

  function generateReturnDate(date, weeks) {
    const d = new Date(date);
    d.setDate(d.getDate() + (weeks * 7));
    return d.toISOString().split('T')[0];
  }

  function renderBookFields() {
    const count = parseInt(numBooksInput.value) || 0;
    bookContainer.innerHTML = '';
    const date = dateBorrowedInput.value;
    let returnWeeks = count === 1 ? 2 : count === 2 ? 3 : count === 3 ? 4 : count;

    for (let i = 0; i < count; i++) {
      const div = document.createElement('div');
      div.innerHTML = `
        <input type="text" name="bookTitle${i}" placeholder="Book Title #${i + 1}" required>
        <input type="text" name="bookAuthor${i}" placeholder="Book Author #${i + 1}" required>
      `;
      bookContainer.appendChild(div);
    }

    if (date) {
      document.getElementById('returnBefore').value = generateReturnDate(date, returnWeeks);
    }
  }

  function renderRecords(filter = '') {
    recordList.innerHTML = '';
    const filtered = records.filter(r => {
      const matchName = r.name.toLowerCase().includes(filter.toLowerCase());
      const matchDate =
        (!startDate.value || new Date(r.dateBorrowed) >= new Date(startDate.value)) &&
        (!endDate.value || new Date(r.dateBorrowed) <= new Date(endDate.value));
      return matchName && matchDate;
    });

    filtered.sort((a, b) => a.name.localeCompare(b.name));

    filtered.forEach((r, i) => {
      const card = document.createElement('div');
      card.className = 'record-card';
      card.innerHTML = `
        <h3>${r.name} (${r.matric})</h3>
        <p>Class Level: ${r.class}</p>
        <p>Department: ${r.department}</p>
        <p>Gender: ${r.gender}</p>
        <p>Block/Room: ${r.block}</p>
        <p>Date Borrowed: ${r.dateBorrowed}</p>
        <p>Return Before: ${r.returnBefore}</p>
        <p>Date Returned: ${r.dateReturned || 'Not returned yet'}</p>
        <p>Books:</p>
        <ul>${r.books.map(b => `<li>${b.title} by ${b.author}</li>`).join('')}</ul>
        <div class="record-actions">
          <button class="edit-btn" onclick="editRecord(${i})">Edit</button>
          <button class="delete-btn" onclick="deleteRecord(${i})">Delete</button>
        </div>
      `;
      recordList.appendChild(card);
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(form);
    const books = [];
    for (let i = 0; i < parseInt(formData.get('numBooks')); i++) {
      books.push({
        title: formData.get(`bookTitle${i}`),
        author: formData.get(`bookAuthor${i}`)
      });
    }

    const data = {
      name: formData.get('name'),
      class: formData.get('class'),
      matric: formData.get('matric'),
      department: formData.get('department'),
      gender: formData.get('gender'),
      block: formData.get('block'),
      numBooks: formData.get('numBooks'),
      books,
      dateBorrowed: formData.get('dateBorrowed'),
      returnBefore: formData.get('returnBefore'),
      dateReturned: formData.get('dateReturned')
    };

    records.push(data);
    saveRecords();
    form.reset();
    bookContainer.innerHTML = '';
    renderRecords();
  });

  window.editRecord = index => {
    const r = records[index];
    if (confirm('Load record for editing?')) {
      document.getElementById('name').value = r.name;
      document.getElementById('class').value = r.class;
      document.getElementById('matric').value = r.matric;
      document.getElementById('department').value = r.department;
      document.getElementById('gender').value = r.gender;
      document.getElementById('block').value = r.block;
      document.getElementById('numBooks').value = r.numBooks;
      document.getElementById('dateBorrowed').value = r.dateBorrowed;
      document.getElementById('returnBefore').value = r.returnBefore;
      document.getElementById('dateReturned').value = r.dateReturned;

      renderBookFields();

      r.books.forEach((b, i) => {
        document.querySelector(`[name=bookTitle${i}]`).value = b.title;
        document.querySelector(`[name=bookAuthor${i}]`).value = b.author;
      });

      records.splice(index, 1); // remove to avoid duplication
      saveRecords();
      renderRecords();
    }
  };

  window.deleteRecord = index => {
    if (confirm('Are you sure you want to delete this record? This action is irreversible.')) {
      records.splice(index, 1);
      saveRecords();
      renderRecords();
    }
  };

  nameSearch.addEventListener('input', () => renderRecords(nameSearch.value));
  startDate.addEventListener('change', () => renderRecords(nameSearch.value));
  endDate.addEventListener('change', () => renderRecords(nameSearch.value));

  // Download as PDF, Word, or Image
  printBtn.addEventListener('click', () => {
    const filtered = records.filter(r => {
      const matchDate =
        (!startDate.value || new Date(r.dateBorrowed) >= new Date(startDate.value)) &&
        (!endDate.value || new Date(r.dateBorrowed) <= new Date(endDate.value));
      return matchDate;
    });

    const content = generatePrintableContent(filtered);

    // Prompt the user for download type
    const format = prompt('Download format? (pdf, word, image)').toLowerCase();

    if (format === 'pdf') {
      const blob = new Blob([content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      downloadFile(url, 'borrowed-records.pdf');
    } else if (format === 'word') {
      const wordBlob = new Blob([content], {
        type: 'application/msword'
      });
      const wordUrl = URL.createObjectURL(wordBlob);
      downloadFile(wordUrl, 'borrowed-records.doc');
    } else if (format === 'image') {
      const container = document.createElement('div');
      container.innerHTML = content;
      document.body.appendChild(container);
      html2canvas(container).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'borrowed-records.png';
        link.click();
        document.body.removeChild(container);
      });
    } else {
      alert('Invalid format. Please choose either pdf, word, or image.');
    }
  });

  function generatePrintableContent(recordsToPrint) {
    let content = `<h2>Borrowed Books Records</h2>`;
    recordsToPrint.forEach(r => {
      content += `
        <div class="record-card">
          <h3>${r.name} (${r.matric})</h3>
          <p>Class Level: ${r.class}</p>
          <p>Department: ${r.department}</p>
          <p>Gender: ${r.gender}</p>
          <p>Block/Room: ${r.block}</p>
          <p>Date Borrowed: ${r.dateBorrowed}</p>
          <p>Return Before: ${r.returnBefore}</p>
          <p>Date Returned: ${r.dateReturned || 'Not returned yet'}</p>
          <p>Books:</p>
          <ul>${r.books.map(b => `<li>${b.title} by ${b.author}</li>`).join('')}</ul>
        </div>
      `;
    });
    return content;
  }

  function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  numBooksInput.addEventListener('input', renderBookFields);
  dateBorrowedInput.addEventListener('input', renderBookFields);

  renderRecords();
});