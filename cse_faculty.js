// Import required Firebase functions from global scope
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

// DOM elements
const facultyForm = document.getElementById('facultyForm');
const facultyList = document.getElementById('facultyList');

// Firestore reference
const facultyRef = collection(window.db, "faculties");

// Editing state
let editMode = false;
let editDocId = null;

// Load all faculties on page load
async function loadFaculties() {
  facultyList.innerHTML = '';
  const snapshot = await getDocs(facultyRef);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    addFacultyCard(data, docSnap.id);
  });
}

// Add or update faculty card in DOM
function addFacultyCard(faculty, id) {
  const card = document.createElement('div');
  card.classList.add('faculty-card');

  const img = document.createElement('img');
  img.src = faculty.photoUrl;
  img.alt = `Office hour photo of ${faculty.name}`;

  const info = document.createElement('div');
  info.classList.add('faculty-info');
  info.innerHTML = `<strong>Name:</strong> ${faculty.name}<br><strong>Room:</strong> ${faculty.room}`;

  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.flexDirection = 'column';
  btnContainer.style.gap = '6px';

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.onclick = () => {
    document.getElementById('facultyName').value = faculty.name;
    document.getElementById('roomNumber').value = faculty.room;
    editMode = true;
    editDocId = id;
    facultyForm.querySelector('button[type="submit"]').textContent = 'Update Faculty';
  };

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.onclick = async () => {
    if (confirm('Are you sure you want to delete this faculty?')) {
      await deleteDoc(doc(window.db, "faculties", id));
      loadFaculties();
    }
  };

  // Download button
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = 'Download';
  downloadBtn.onclick = () => {
    const a = document.createElement('a');
    a.href = faculty.photoUrl;
    a.download = `${faculty.name.replace(/\s+/g, '_')}_office_hour.jpg`;
    a.click();
  };

  btnContainer.appendChild(editBtn);
  btnContainer.appendChild(deleteBtn);
  btnContainer.appendChild(downloadBtn);

  card.appendChild(img);
  card.appendChild(info);
  card.appendChild(btnContainer);

  facultyList.appendChild(card);
}

// Form submission
facultyForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('facultyName').value.trim();
  const room = document.getElementById('roomNumber').value.trim();
  const fileInput = document.getElementById('officeHourPhoto');
  const file = fileInput.files[0];

  if (!name || !room || (!file && !editMode)) {
    alert('Please fill in all fields (photo optional when updating)');
    return;
  }

  // If new photo uploaded
  let photoUrl = '';
  if (file) {
    const storageRef = ref(window.storage, `faculty_photos/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    photoUrl = await getDownloadURL(storageRef);
  }

  if (editMode && editDocId) {
    // Update existing faculty
    const updateData = { name, room };
    if (photoUrl) updateData.photoUrl = photoUrl;

    await updateDoc(doc(window.db, "faculties", editDocId), updateData);

    editMode = false;
    editDocId = null;
    facultyForm.querySelector('button[type="submit"]').textContent = 'Add Faculty';
  } else {
    // Add new faculty
    await addDoc(facultyRef, {
      name,
      room,
      photoUrl
    });
  }

  facultyForm.reset();
  loadFaculties();
});

// Initial load
loadFaculties();
