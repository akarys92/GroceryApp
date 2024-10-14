// app/storage/DataStore.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Item {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface Session {
    id: string;
    date: string;
    location: string;
    items: Item[];
}

class DataStore {
    private static instance: DataStore;

    private constructor() { }

    static getInstance() {
        if (!DataStore.instance) {
            DataStore.instance = new DataStore();
        }
        return DataStore.instance;
    }

    async saveCurrentSession(session: Session): Promise<void> {
        await AsyncStorage.setItem('currentSession', JSON.stringify(session));
    }

    async getCurrentSession(): Promise<Session | null> {
        const sessionString = await AsyncStorage.getItem('currentSession');
        if (sessionString) {
            try {
                const session = JSON.parse(sessionString);
                return session;
            } catch (error) {
                console.error('Error parsing current session:', error);
                return null;
            }
        }
        return null;
    }

    async clearCurrentSession(): Promise<void> {
        await AsyncStorage.removeItem('currentSession');
    }

    async saveSession(session: Session): Promise<void> {
        let sessions = await this.getSessions();
        if (!Array.isArray(sessions)) {
            sessions = [];
        }

        // Check if the session already exists
        const index = sessions.findIndex((s) => s.id === session.id);
        if (index !== -1) {
            // Update existing session
            sessions[index] = session;
        } else {
            // Add new session
            sessions.push(session);
        }

        await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
    }

    async getSessions(): Promise<Session[]> {
        const sessionsString = await AsyncStorage.getItem('sessions');
        if (sessionsString) {
            try {
                const sessions = JSON.parse(sessionsString);
                return Array.isArray(sessions) ? sessions : [];
            } catch (error) {
                console.error('Error parsing sessions:', error);
                return [];
            }
        }
        return [];
    }

    async deleteSession(sessionId: string): Promise<void> {
        let sessions = await this.getSessions();
        sessions = sessions.filter((session) => session.id !== sessionId);
        await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
    }

    async updateSession(updatedSession: Session): Promise<void> {
        let sessions = await this.getSessions();
        const index = sessions.findIndex((s) => s.id === updatedSession.id);
        if (index !== -1) {
            sessions[index] = updatedSession;
            await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
        } else {
            // If session not found, add it
            sessions.push(updatedSession);
            await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
        }
    }
}

export default DataStore.getInstance();
