class DatabaseService {
    constructor() {
        this.SPREADSHEET_ID = '1yNrnQXk6wlhTXhMDBOFSSPK0Swuwb5MPcqLLB3K7fE0';
    }

    async getRecords(sheetName, range) {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.SPREADSHEET_ID,
                range: `${sheetName}!${range}`
            });
            return response.result.values;
        } catch (error) {
            console.error(`Error fetching ${sheetName} records:`, error);
            throw error;
        }
    }

    async addRecord(sheetName, values) {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.SPREADSHEET_ID,
                range: `${sheetName}!A:A`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [values]
                }
            });
            return response.result;
        } catch (error) {
            console.error(`Error adding record to ${sheetName}:`, error);
            throw error;
        }
    }

    async updateRecord(sheetName, range, values) {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.SPREADSHEET_ID,
                range: `${sheetName}!${range}`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [values]
                }
            });
            return response.result;
        } catch (error) {
            console.error(`Error updating record in ${sheetName}:`, error);
            throw error;
        }
    }

    async logActivity(userId, action, details) {
        const timestamp = new Date().toISOString();
        const logEntry = [timestamp, userId, action, details];
        await this.addRecord('logs', logEntry);
    }
}

export const dbService = new DatabaseService(); 