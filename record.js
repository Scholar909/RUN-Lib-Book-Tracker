document.addEventListener('DOMContentLoaded', () => {
  const recordList = document.getElementById('recordList');
  const nameSearch = document.getElementById('nameSearch');
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  const printBtn = document.getElementById('printBtn');
  const wordBtn = document.getElementById('wordBtn');
  const imageBtn = document.getElementById('imageBtn');
  const pdfBtn = document.getElementById('pdfBtn'); // Added for PDF
  const exitBtn = document.getElementById('exitBtn');

  let allRecords = JSON.parse(localStorage.getItem('borrowRecords')) || [];
  allRecords.sort((a, b) => a.name.localeCompare(b.name));

  function getStatusColor(record) {
    if (!record.dateReturned) return 'gray';
    return new Date(record.dateReturned) <= new Date(record.returnBefore) ? 'green' : 'red';
  }

  function getStatusText(record) {
    const statusColor = getStatusColor(record);
    return !record.dateReturned ? 'Not returned yet' :
      statusColor === 'green' ? 'Returned on time' : 'Returned late';
  }

  function createCard(record, index) {
    const card = document.createElement('div');
    card.classList.add('record-card');

    const statusColor = getStatusColor(record);
    const statusText = getStatusText(record);

    const booksHTML = record.books.map(
      (b, i) => `<div class="book-info">
                    <label for="book${i}_title">Book ${i + 1} Title:</label>
                    <input id="book${i}_title" value="${b.title}" data-type="title" data-index="${i}" disabled />
                    <label for="book${i}_author">Author:</label>
                    <input id="book${i}_author" value="${b.author}" data-type="author" data-index="${i}" disabled />
                 </div>`
    ).join('');

    card.innerHTML = `
      <div class="status-dot" data-status-color="${statusColor}"></div>
      <div class="form-group">
        <label for="name">Name:</label>
        <input id="name" value="${record.name}" class="editable" data-key="name" disabled />
      </div>
      <div class="form-group">
        <label for="matric">Matric No:</label>
        <input id="matric" value="${record.matric}" class="editable" data-key="matric" disabled />
      </div>
      <div class="form-group">
        <label for="classLevel">Class Level:</label>
        <input id="classLevel" value="${record.classLevel}" class="editable" data-key="classLevel" disabled />
      </div>
      <div class="form-group">
        <label for="gender">Gender:</label>
        <input id="gender" value="${record.gender}" class="editable" data-key="gender" disabled />
      </div>
      <div class="form-group">
        <label for="department">Department:</label>
        <input id="department" value="${record.department}" class="editable" data-key="department" disabled />
      </div>
      <div class="form-group">
        <label for="block">Block:</label>
        <input id="block" value="${record.block}" class="editable" data-key="block" disabled />
      </div>
      <div class="form-group">
        <label for="numBooks">Number of Books:</label>
        <input id="numBooks" value="${record.numBooks}" class="editable" data-key="numBooks" disabled />
      </div>
      <div class="form-group">
        <label for="dateBorrowed">Date Borrowed:</label>
        <input id="dateBorrowed" type="date" value="${record.dateBorrowed}" class="editable" data-key="dateBorrowed" disabled />
      </div>
      <div class="form-group">
        <label for="returnBefore">Return Before:</label>
        <input id="returnBefore" type="date" value="${record.returnBefore}" class="editable" data-key="returnBefore" disabled />
      </div>
      <div class="form-group">
        <label for="dateReturned">Date Returned:</label>
        <input id="dateReturned" type="date" value="${record.dateReturned || ''}" class="editable" data-key="dateReturned" disabled />
      </div>
      ${booksHTML}
      <p class="status-text"><strong>Status:</strong> ${statusText}</p>
      <div class="btn-group">
        <button class="edit-btn">Edit</button>
        <button class="save-btn" style="display:none;">Save</button>
        <button class="cancel-btn" style="display:none;">Cancel</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

    const editBtn = card.querySelector('.edit-btn');
    const saveBtn = card.querySelector('.save-btn');
    const cancelBtn = card.querySelector('.cancel-btn');
    const deleteBtn = card.querySelector('.delete-btn');

    const inputs = card.querySelectorAll('input');

    editBtn.addEventListener('click', () => {
      inputs.forEach(input => input.disabled = false);
      editBtn.style.display = 'none';
      saveBtn.style.display = 'inline';
      cancelBtn.style.display = 'inline';
    });

    cancelBtn.addEventListener('click', () => {
      filterAndDisplayRecords();
    });

    saveBtn.addEventListener('click', () => {
      inputs.forEach(input => {
        const key = input.dataset.key;
        const type = input.dataset.type;
        const idx = input.dataset.index;

        if (key) record[key] = input.value;
        if (type && idx != null) record.books[idx][type] = input.value;
      });

      allRecords[index] = record;
      localStorage.setItem('borrowRecords', JSON.stringify(allRecords));
      filterAndDisplayRecords();
    });

    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this record? This cannot be undone.')) {
        allRecords.splice(index, 1);
        localStorage.setItem('borrowRecords', JSON.stringify(allRecords));
        filterAndDisplayRecords();
      }
    });

    return card;
  }

  function filterAndDisplayRecords() {
    const filtered = allRecords.filter(r => {
      const matchName = r.name.toLowerCase().includes(nameSearch.value.toLowerCase());
      const borrowedDate = new Date(r.dateBorrowed);
      const start = startDate.value ? new Date(startDate.value) : null;
      const end = endDate.value ? new Date(endDate.value) : null;

      const inRange = (!start || borrowedDate >= start) && (!end || borrowedDate <= end);
      return matchName && inRange;
    });

    recordList.innerHTML = '';
    filtered.forEach((record, index) => {
      recordList.appendChild(createCard(record, index));
    });
  }

  // Event listeners
  nameSearch.addEventListener('input', filterAndDisplayRecords);
  startDate.addEventListener('change', filterAndDisplayRecords);
  endDate.addEventListener('change', filterAndDisplayRecords);
  document.querySelector('.search-area button').addEventListener('click', filterAndDisplayRecords);

  // Export as image
  imageBtn.addEventListener('click', () => {
    html2canvas(recordList).then(canvas => {
      const link = document.createElement('a');
      link.download = 'borrow-records.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  });

  // Export as Word
wordBtn.addEventListener('click', () => {
  const doc = new window.docx.Document();
  const sections = [];

  allRecords.forEach(record => {
    const status = getStatusText(record);

    sections.push(
      new window.docx.Paragraph({
        children: [
          new window.docx.TextRun({ text: `Name: ${record.name}`, bold: true }),
        ],
      }),
      new window.docx.Paragraph({ text: `Matric No: ${record.matric}` }),
      new window.docx.Paragraph({ text: `Class Level: ${record.classLevel}` }),
      new window.docx.Paragraph({ text: `Gender: ${record.gender}` }),
      new window.docx.Paragraph({ text: `Department: ${record.department}` }),
      new window.docx.Paragraph({ text: `Block: ${record.block}` }),
      new window.docx.Paragraph({ text: `Date Borrowed: ${record.dateBorrowed}` }),
      new window.docx.Paragraph({ text: `Return Before: ${record.returnBefore}` }),
      new window.docx.Paragraph({ text: `Date Returned: ${record.dateReturned || '---'}` }),
      new window.docx.Paragraph({ text: `Status: ${status}` }),
      ...record.books.map((book, i) => new window.docx.Paragraph({ text: `Book ${i + 1}: ${book.title} by ${book.author}` })),
      new window.docx.Paragraph(''),
      new window.docx.Paragraph({ text: '---------------------------------------', alignment: window.docx.AlignmentType.CENTER })
    );
  });

  doc.addSection({ children: sections });

  window.docx.Packer.toBlob(doc).then(blob => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'borrow-records.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});

  // Export as PDF
  pdfBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;

    allRecords.forEach((record, idx) => {
      const status = getStatusText(record);

      doc.text(`Name: ${record.name}`, 10, y); y += 7;
      doc.text(`Matric No: ${record.matric}`, 10, y); y += 7;
      doc.text(`Class Level: ${record.classLevel}`, 10, y); y += 7;
      doc.text(`Gender: ${record.gender}`, 10, y); y += 7;
      doc.text(`Department: ${record.department}`, 10, y); y += 7;
      doc.text(`Block: ${record.block}`, 10, y); y += 7;
      doc.text(`Date Borrowed: ${record.dateBorrowed}`, 10, y); y += 7;
      doc.text(`Return Before: ${record.returnBefore}`, 10, y); y += 7;
      doc.text(`Date Returned: ${record.dateReturned || '---'}`, 10, y); y += 7;
      doc.text(`Status: ${status}`, 10, y); y += 7;

      record.books.forEach((book, i) => {
        doc.text(`Book ${i + 1}: ${book.title} by ${book.author}`, 10, y); y += 7;
      });

      y += 5;
      doc.line(10, y, 200, y); y += 10;

      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    });

    doc.save('borrow-records.pdf');
  });

  // Exit
  exitBtn.addEventListener('click', () => {
    window.close();
  });

  filterAndDisplayRecords();
});