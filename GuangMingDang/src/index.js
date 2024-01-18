import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, onSnapshot, getDocs,orderBy,
  addDoc, doc, query, where, serverTimestamp
} from 'firebase/firestore'

import './output.css';

const firebaseConfig = {

  };
  
// Initialize Firebase
initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore();

document.addEventListener('DOMContentLoaded', function() {
  let collectionName;
  if (document.body.classList.contains('page-1')) {
    collectionName = 'users';
  } else if (document.body.classList.contains('page-2')) {
    collectionName = 'users_guan';
  } else if (document.body.classList.contains('page-3')) {
    collectionName = 'users_yuelao';
  }
// Collection reference for users
const usersColRef = collection(db, collectionName);


//const usersColRef = collection(db, 'users');

// Real-time listener for the users collection, ordered by 'createdAt'
const allUsersQuery = query(usersColRef, orderBy('createdAt', 'desc'));
onSnapshot(allUsersQuery, (snapshot) => {
    updateUsersTable(snapshot.docs);
});

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('menuToggle').addEventListener('click', function() {
    var navLinks = document.getElementById('navLinks');
    if (navLinks.classList.contains('hidden')) {
      navLinks.classList.remove('hidden');
    } else {
      navLinks.classList.add('hidden');
    }
  });
});
// Event listener for user input form
const userInputForm = document.querySelector('.user-input-form');
userInputForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  let birthday = document.getElementById('birthday').value;
  birthday = birthday.split('-').join('/'); // Format birthday
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;
  
  addDoc(usersColRef, {
    name: name,
    birthday: birthday,
    email: email,
    message: message,
    createdAt: serverTimestamp() // Add a server timestamp
  })
  .then(() => {
    userInputForm.reset();
  })
  .catch((error) => {
    console.error("Error adding document: ", error);
  });
});

// Event listener for searching users by name
const searchUserForm = document.querySelector('.search-user-form');
searchUserForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const searchName = document.getElementById('search-name').value.trim().toLowerCase();

  // Query Firestore for users with the matching name, ordered by 'createdAt' in descending order
  const q = query(usersColRef, where("name", "==", searchName), orderBy('createdAt', 'desc'));

  onSnapshot(q, (snapshot) => {
    updateUsersTable(snapshot.docs);
  });
});


// Function to update the users table
function updateUsersTable(docs) {
    const usersListTableBody = document.querySelector('#usersList tbody');
    usersListTableBody.innerHTML = ''; // Clear existing rows
  
    docs.forEach(doc => {
      const user = doc.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: center;"><img src="./assets/light-bulb.webp" alt="Animated gif of a candle" className="guangmingdeng-image" width="20" height="20"/></td>
        <td>${user.name}</td>
        <td>${user.message}</td>
        <td>${user.createdAt?.toDate().toLocaleString() || 'N/A'}</td>
      `;
      usersListTableBody.appendChild(tr);
    });
  }

  //index
  const recordsPerPage = 200;
  let totalDocs = [];
  
  // Function to update pagination buttons
  function updatePagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pageNumbers');
    paginationContainer.innerHTML = ''; // Clear existing pagination buttons
  
    // Calculate page range to display
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
  
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      if (i === currentPage) {
        pageButton.classList.add('active'); // Highlight current page
      }
      pageButton.addEventListener('click', () => {
        displayPage(i);
      });
      paginationContainer.appendChild(pageButton);
    }
  }
  
  // Function to display a specific page
  function displayPage(page) {
    const totalPages = Math.ceil(totalDocs.length / recordsPerPage);
    const startIndex = (page - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedItems = totalDocs.slice(startIndex, endIndex);
  
    updateUsersTable(paginatedItems);
    updatePagination(totalPages, page);
  }
  
  // Real-time listener for the users collection
  const allUsersQuery_index = query(usersColRef, orderBy('createdAt', 'desc'));
  onSnapshot(allUsersQuery_index, (snapshot) => {
    totalDocs = snapshot.docs;
    displayPage(1); // Start from the first page
  });

// Function to listen for real-time updates and display total number of documents
function displayTotalRowsRealTime() {
  const usersCollectionRef = collection(db, collectionName);

  onSnapshot(usersCollectionRef, (querySnapshot) => {
    const totalRows = querySnapshot.docs.length;
    document.getElementById('totalRows').textContent = totalRows;
  });
}

// Call the function to set up real-time updates
displayTotalRowsRealTime();

});
