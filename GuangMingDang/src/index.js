import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, limit, getDocs,orderBy,getDoc,
  addDoc, doc, query, where, serverTimestamp,startAfter 
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

let lastVisible;
const recordsPerPage = 20;
// Query for the users collection, ordered by 'createdAt'
const limitedUsersQuery = query(usersColRef, orderBy('createdAt', 'desc'), limit(recordsPerPage));

// Fetch the documents once using getDocs
  getDocs(limitedUsersQuery)
    .then((snapshot) => {
      updateUsersTable(snapshot.docs);
      lastVisible = snapshot.docs[snapshot.docs.length - 1];
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
    });

// Load More button event listener
document.getElementById('loadMore').addEventListener('click', loadMoreData);

function loadMoreData() {
  const nextQuery = query(usersColRef, orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(recordsPerPage));
  getDocs(nextQuery)
    .then((snapshot) => {
      updateUsersTable(snapshot.docs, true);
      lastVisible = snapshot.docs[snapshot.docs.length - 1];
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
    });
}

//menuToggle
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
    alert("您已成功點燈，請下滑查看。其他神明/隨喜功德，手機請點選右上角≡");
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
function updateUsersTable(docs, append = false) {
    const usersListTableBody = document.querySelector('#usersList tbody');
    if (!append) {
    usersListTableBody.innerHTML = ''; // Clear existing rows
    }
  
    docs.forEach(doc => {
      const user = doc.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: center;"><img src="https://i.ibb.co/9sj4RYy/light-bulb.webp" alt="Animated gif of a candle" className="guangmingdeng-image" width="20" height="20"/></td>
        <td>${user.name}</td>
        <td>${user.message}</td>
        <td>${user.createdAt?.toDate().toLocaleString() || 'N/A'}</td>
      `;
      usersListTableBody.appendChild(tr);
    });
  }

});