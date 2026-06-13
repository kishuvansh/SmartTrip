import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Check if app is already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            project_id: process.env.FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        } as admin.ServiceAccount),
    });
}

export default admin;
