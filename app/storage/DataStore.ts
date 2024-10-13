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
    location: string | String;
    items: Item[];
}

class DataStore {
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
        const sessions = await AsyncStorage.getItem('sessions');
        return sessions ? JSON.parse(sessions) : [];
    }

    async saveCurrentSession(session: Session): Promise<void> {
        await AsyncStorage.setItem('currentSession', JSON.stringify(session));
    }

    async getCurrentSession(): Promise<Session | null> {
        const session = await AsyncStorage.getItem('currentSession');
        return session ? JSON.parse(session) : null;
    }

    async clearCurrentSession(): Promise<void> {
        await AsyncStorage.removeItem('currentSession');
    }

    async deleteSession(sessionId: string): Promise<void> {
        let sessions = await this.getSessions();
        sessions = sessions.filter((session) => session.id !== sessionId);
        await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
    }
}

export default new DataStore();
