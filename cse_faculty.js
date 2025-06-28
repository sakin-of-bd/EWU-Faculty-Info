const facultyForm = document.getElementById('facultyForm');
const facultyList = document.getElementById('facultyList');

let faculties = []; // Stores all faculty data
let editIndex = -1; // Index of faculty being edited (-1 means adding new)

// Load saved faculties from localStorage on page load
window.addEventListener('load', () => {
  faculties = JSON.parse(localStorage.getItem('faculties') || '[]');
  faculties.forEach((faculty, index) => {
    addFacultyCard(faculty, index);
  });
});

// Helper: add a faculty card to the page
function addFacultyCard(faculty, index) {
  const card = document.createElement('div');
  card.classList.add('faculty-card');
  card.dataset.index = index;

  const img = document.createElement('img');
  img.src = faculty.photoDataUrl;
  img.alt = `Office hour photo of ${faculty.name}`;

  const info = document.createElement('div');
  info.classList.add('faculty-info');
  info.innerHTML = `<strong>Name:</strong> ${faculty.name}<br><strong>Room:</strong> ${faculty.room}`;

  // Buttons container
  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.flexDirection = 'column';
  btnContainer.style.gap = '6px';

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.style.cursor = 'pointer';
  editBtn.addEventListener('click', () => {
    loadFacultyIntoForm(index);
  });

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.style.cursor = 'pointer';
  deleteBtn.addEventListener('click', () => {
    deleteFaculty(index);
  });

  // Download button
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = 'Download';
  downloadBtn.style.cursor = 'pointer';
  downloadBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = faculty.photoDataUrl;
    a.download = `${faculty.name.replace(/\s+/g, '_')}_office_hour.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  btnContainer.appendChild(editBtn);
  btnContainer.appendChild(deleteBtn);
  btnContainer.appendChild(downloadBtn);

  card.appendChild(img);
  card.appendChild(info);
  card.appendChild(btnContainer);

  facultyList.appendChild(card);
}

// Refresh the displayed list and reset form
function refreshFacultyList() {
  facultyList.innerHTML = '';
  faculties.forEach((faculty, index) => {
    addFacultyCard(faculty, index);
  });
  editIndex = -1;
  facultyForm.reset();
  facultyForm.querySelector('button[type="submit"]').textContent = 'Add Faculty';
}

// Load faculty data into form for editing
function loadFacultyIntoForm(index) {
  const faculty = faculties[index];
  document.getElementById('facultyName').value = faculty.name;
  document.getElementById('roomNumber').value = faculty.room;
  // Photo input stays empty; user can upload new photo or leave it blank to keep old
  editIndex = index;
  facultyForm.querySelector('button[type="submit"]').textContent = 'Update Faculty';
}

// Delete a faculty entry after confirmation
function deleteFaculty(index) {
  if (confirm('Are you sure you want to delete this faculty?')) {
    faculties.splice(index, 1);
    localStorage.setItem('faculties', JSON.stringify(faculties));
    refreshFacultyList();
  }
}

// Handle form submit: add or update faculty
facultyForm.addEventListener('submit', function(event) {
  event.preventDefault();

  const name = document.getElementById('facultyName').value.trim();
  const room = document.getElementById('roomNumber').value.trim();
  const photoInput = document.getElementById('officeHourPhoto');
  const file = photoInput.files[0];

  if (!name || !room) {
    alert('Please fill in name and room number.');
    return;
  }

  if (editIndex === -1) {
    // Adding new faculty — photo required
    if (!file) {
      alert('Please select a photo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      faculties.push({
        name,
        room,
        photoDataUrl: e.target.result
      });
      localStorage.setItem('faculties', JSON.stringify(faculties));
      refreshFacultyList();
    };
    reader.readAsDataURL(file);
  } else {
    // Updating existing faculty
    if (file) {
      // New photo uploaded
      const reader = new FileReader();
      reader.onload = function(e) {
        faculties[editIndex] = {
          name,
          room,
          photoDataUrl: e.target.result
        };
        localStorage.setItem('faculties', JSON.stringify(faculties));
        refreshFacultyList();
      };
      reader.readAsDataURL(file);
    } else {
      // Keep old photo
      faculties[editIndex].name = name;
      faculties[editIndex].room = room;
      localStorage.setItem('faculties', JSON.stringify(faculties));
      refreshFacultyList();
    }
  }
});
