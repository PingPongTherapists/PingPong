import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, onSnapshot, getDocs,orderBy,
  addDoc, doc, query, where, serverTimestamp
} from 'firebase/firestore'

import './output.css';

const firebaseConfig = {
    apiKey: "AIzaSyBUcqA-oIPTZrokCseZhKbvMy4nIzDXabk",
    authDomain: "pingpong-8000b.firebaseapp.com",
    projectId: "pingpong-8000b",
    storageBucket: "pingpong-8000b.appspot.com",
    messagingSenderId: "9688763335",
    appId: "1:9688763335:web:3970d1feadbc544675a7e2",
    measurementId: "G-971G7JW2JY"
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

// Query for the users collection, ordered by 'createdAt'
const allUsersQuery = query(usersColRef, orderBy('createdAt', 'desc'));

// Fetch the documents once using getDocs
getDocs(allUsersQuery)
    .then(snapshot => {
        updateUsersTable(snapshot.docs);
    })
    .catch(error => {
        console.error("Error getting documents: ", error);
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
    window.location.reload();
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

  // Fetch the documents once using getDocs
  getDocs(q)
    .then(snapshot => {
      updateUsersTable(snapshot.docs);
    })
    .catch(error => {
      console.error("Error getting documents: ", error);
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
  
function getTotalPages(totalDocs, recordsPerPage) {
    return Math.ceil(totalDocs.length / recordsPerPage);
}

function displayPage(pageNumber) {
    const startIndex = (pageNumber - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageDocs = totalDocs.slice(startIndex, endIndex);
    
    updateUsersTable(pageDocs); // Use your existing function
    updatePagination(getTotalPages(totalDocs, recordsPerPage), pageNumber);
}

// Keep your existing updatePagination function here

// Fetch the users collection once, ordered by 'createdAt'
const allUsersQuery_index = query(usersColRef, orderBy('createdAt', 'desc'));
getDocs(allUsersQuery_index)
  .then(snapshot => {
    totalDocs = snapshot.docs;
    displayPage(1); // Start from the first page
    updatePagination(getTotalPages(totalDocs, recordsPerPage), 1); // Initialize pagination
  })
  .catch(error => {
    console.error("Error getting documents: ", error);
  });


// Function to fetch and display total number of documents once
function displayTotalRows() {
  const usersCollectionRef = collection(db, collectionName);

  getDocs(usersCollectionRef)
    .then(querySnapshot => {
      const totalRows = querySnapshot.docs.length;
      document.getElementById('totalRows').textContent = totalRows;
    })
    .catch(error => {
      console.error("Error getting documents: ", error);
    });
}

// Call the function to fetch and display total number of documents
displayTotalRows();

});
