class AuthService {
    constructor() {
        this.API_KEY = 'AIzaSyD0luD987fI34zh3rSryzcyMMdp8vJSjzY';
        this.SPREADSHEET_ID = '1yNrnQXk6wlhTXhMDBOFSSPK0Swuwb5MPcqLLB3K7fE0';
        this.SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';
        this.CLIENT_ID = '1014678685453-d3ffs96fk3ncab2gdto4qhugmkh0jvr9.apps.googleusercontent.com';
    }

    async initializeGoogleAuth() {
        try {
            await gapi.client.init({
                apiKey: this.API_KEY,
                clientId: this.CLIENT_ID,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                scope: this.SCOPES
            });
            
            // Load the auth2 library
            await gapi.auth2.init({
                client_id: this.CLIENT_ID
            });
        } catch (error) {
            console.error('Error initializing Google API:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            // Get user data from the "user" sheet
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.SPREADSHEET_ID,
                range: 'user!A:E'  // Adjust range based on your sheet structure
            });

            const users = response.result.values;
            const user = users.find(row => row[1] === email);  // Assuming email is in column B

            if (!user) {
                throw new Error('User not found');
            }

            // Verify password (you'll need to implement proper password hashing)
            if (!this.verifyPassword(password, user[2])) {  // Assuming password is in column C
                throw new Error('Invalid password');
            }

            // Create session
            const session = {
                userId: user[0],
                email: user[1],
                role: user[3],
                token: this.generateToken()
            };

            // Store session in localStorage
            localStorage.setItem('session', JSON.stringify(session));
            
            return session;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    verifyPassword(inputPassword, storedPassword) {
        // Implement proper password verification here
        // For now, using simple comparison (NOT SECURE - implement proper hashing)
        return inputPassword === storedPassword;
    }

    generateToken() {
        return Math.random().toString(36).substr(2) + Date.now().toString(36);
    }

    logout() {
        localStorage.removeItem('session');
        window.location.href = '/index.html';
    }

    isAuthenticated() {
        const session = localStorage.getItem('session');
        return !!session;
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('session'));
    }

    async register(email, password, role) {
        try {
            // Check if email already exists
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.SPREADSHEET_ID,
                range: 'user!A:E'
            });

            const users = response.result.values;
            if (users.some(user => user[1] === email)) {
                throw new Error('Email already registered');
            }

            // Generate user ID
            const userId = Date.now().toString();
            
            // Create new user record
            const newUser = [
                userId,
                email,
                password, // Note: In production, this should be hashed
                role,
                new Date().toISOString() // registration date
            ];

            // Append new user to sheet
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.SPREADSHEET_ID,
                range: 'user!A:E',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [newUser]
                }
            });

            return true;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }
}

export const authService = new AuthService(); 