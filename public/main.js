'use strict';

// Initialize Firebase
firebase.initializeApp();

// DOM elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signInButton = document.getElementById('demo-sign-in-button');
const signOutButton = document.getElementById('demo-sign-out-button');
const usersContainer = document.getElementById('demo-all-users-list');
const nameContainer = document.getElementById('demo-name-container');

// Event listeners
signInButton.addEventListener('click', signInWithEmail);
signOutButton.addEventListener('click', signOut);

// Firebase authentication state change listener
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    // User is signed in
    nameContainer.innerText = user.displayName;
    usersContainer.style.display = 'block';
    fetchAllUsers();
  } else {
    // User is signed out
    nameContainer.innerText = '';
    usersContainer.style.display = 'none';
  }
});

// Sign in with email and password
function signInWithEmail() {
  const email = emailInput.value;
  const password = passwordInput.value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      // Sign-in successful
    })
    .catch(error => {
      // Handle sign-in error
      console.error('Sign-in error:', error);
    });
}

// Sign out
function signOut() {
  firebase.auth().signOut();
}

// Fetch and display all users
function fetchAllUsers() {
  const usersRef = firebase.database().ref('users');
  usersRef.on('child_added', snapshot => {
    const {displayName } = snapshot.val();
    const uid = snapshot.key;
    const userElement = createUserElement(displayName, uid);
    usersContainer.appendChild(userElement);
  });
}

// Create a user element
function createUserElement(displayName, uid) {
  const userElement = document.createElement('div');
  userElement.classList.add('demo-user-container');
  userElement.innerHTML = `
    <span class="demo-name">${displayName}</span>
  `;
  return userElement;
}
