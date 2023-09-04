'use strict';

// Import necessary Firebase modules
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
admin.initializeApp();

// Define Firebase Function to send custom notifications
exports.sendCustomNotification = functions.https.onRequest(async (req, res) => {
    try {
        // Validate the request is coming from an authenticated admin
        const adminAuthToken = req.headers.authorization;
        if (!adminAuthToken || !adminAuthToken.startsWith('Bearer ')) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Replace 'YOUR_ADMIN_TOKEN' with the actual admin token
        const adminToken = 'YOUR_ADMIN_TOKEN';
        if (adminAuthToken !== `Bearer ${adminToken}`) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Get notification content from the admin portal
        const { title, content, userIds } = req.content;

        // Validate that required fields are provided
        if (!title || !content || !userIds) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Notification details
        const payload = {
            notification: {
                title,
                content,
            }
        };

        // Send notifications to the specified user IDs
        const response = await admin.messaging().sendToDevice(userIds, payload);

        // Return a response with details of the sent notifications
        return res.status(200).json({ message: 'Notifications sent successfully', response });
    } catch (error) {
        console.error('Error sending notifications:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});
