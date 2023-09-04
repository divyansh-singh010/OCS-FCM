'use strict';

const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendFollowerNotification = functions.database
  .ref('/followers/{followedUid}/{followerUid}')
  .onWrite(async (change, context) => {
    const { followerUid, followedUid } = context.params;
    const followedUserRef = admin.database().ref(`/users/${followedUid}`);
    const followerProfile = await admin.auth().getUser(followerUid);

    if (!change.after.val()) {
      return functions.logger.log('User', followerUid, 'un-followed user', followedUid);
    }

    functions.logger.log('New follower UID:', followerUid, 'for user:', followedUid);

    const tokensSnapshot = await followedUserRef.child('notificationTokens').once('value');
    const tokens = Object.keys(tokensSnapshot.val() || {});

    if (tokens.length === 0) {
      return functions.logger.log('There are no notification tokens to send to.');
    }

    functions.logger.log('Tokens to send notifications to:', tokens.length);
    functions.logger.log('Fetched follower profile:', followerProfile.displayName);

    const payload = {
      notification: {
        title: 'You have a new follower!',
        body: `${followerProfile.displayName} is now following you.`,
       
