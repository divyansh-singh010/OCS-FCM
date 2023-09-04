'use strict';

// Initialize the app and set up event listeners.
function initApp() {
  const signInButton = document.getElementById('demo-sign-in-button');
  const signOutButton = document.getElementById('demo-sign-out-button');

  signInButton.addEventListener('click', signIn);
  signOutButton.addEventListener('click', signOut);

  firebase.auth().onAuthStateChanged(onAuthStateChanged);
  firebase.messaging().onMessage(onMessage);
}

// Handle authentication state changes.
function onAuthStateChanged(user) {
  const signedOutCard = document.getElementById('demo-signed-out-card');
  const signedInCard = document.getElementById('demo-signed-in-card');
  const usersCard = document.getElementById('demo-all-users-card');
  const nameContainer = document.getElementById('demo-name-container');

  if (user) {
    nameContainer.innerText = user.displayName;
    signedOutCard.style.display = 'none';
    signedInCard.style.display = 'block';
    usersCard.style.display = 'block';

    firebase.database().ref(`users/${user.uid}`).update({
      displayName: user.displayName,
      photoURL: user.photoURL
    });

    saveToken();
    displayAllUsers();
  } else {
    signedOutCard.style.display = 'block';
    signedInCard.style.display = 'none';
    usersCard.style.display = 'none';
    nameContainer.innerText = '';
  }
}

// Display a list of all users.
function displayAllUsers() {
  const usersContainer = document.getElementById('demo-all-users-list');
  const usersRef = firebase.database().ref('users');

  usersRef.on('child_added', snapshot => {
    const { photoURL, displayName } = snapshot.val();
    const uid = snapshot.key;

    const userElement = createUserElement(photoURL, displayName, uid);
    usersContainer.appendChild(userElement);
  });
}

// Create a user element.
function createUserElement(photoURL, displayName, uid) {
  const userElement = document.createElement('div');
  userElement.classList.add('demo-user-container');

  userElement.innerHTML = `
    <img class="demo-profile-pic" src="${photoURL}">
    <span class="demo-name">${displayName}</span>
    <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="demo-follow-switch-${uid}">
      <input type="checkbox" id="demo-follow-switch-${uid}" class="mdl-switch__input">
      <span class="mdl-switch__label">Follow</span>
    </label>
  `;

  return userElement;
}

// Sign in using Google authentication.
function signIn() {
  const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(googleAuthProvider);
}

// Sign out.
function signOut() {
  firebase.auth().signOut();
}

// Handle incoming notifications.
function onMessage(payload) {
  console.log('Notification received:', payload);

  if (payload.notification) {
    showBrowserNotification(payload.notification.title, payload.notification.body);
  }
}

// Show a browser notification.
function showBrowserNotification(title, body) {
  if (window.Notification instanceof Function) {
    new Notification(title, { body });
  }
}

// Save the FCM token to the database if available.
function saveToken() {
  firebase.messaging().getToken()
    .then(currentToken => {
      if (currentToken) {
        firebase.database().ref(`users/${firebase.auth().currentUser.uid}/notificationTokens/${currentToken}`).set(true);
      } else {
        requestPermission();
      }
    })
    .catch(error => {
      console.error('Unable to get messaging token:', error);
    });
}

// Request permission to send notifications.
function requestPermission() {
  console.log('Requesting permission...');
  firebase.messaging().requestPermission()
    .then(() => {
      console.log('Notification permission granted.');
      saveToken();
    })
    .catch(error => {
      console.error('Unable to get permission to notify:', error);
    });
}

// Initialize the app when the DOM is loaded.
document.addEventListener('DOMContentLoaded', initApp);
