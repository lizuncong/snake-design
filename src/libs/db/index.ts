import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';

const DB_NAME = 'snake-design-db';
const DB_VERSION = 1;

type SnakeDesignDB = DBSchema & {
  projects: {
    key: string;
    value: {
      id: string;
      title: string;
      requirement: string;
      createdAt: number;
      updatedAt: number;
      state: {
        messages: unknown[];
        files: unknown[];
        activeFile: string | null;
      };
    };
    indexes: {
      'by-createdAt': number;
      'by-updatedAt': number;
    };
  };
};

let dbInstance: IDBPDatabase<SnakeDesignDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<SnakeDesignDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<SnakeDesignDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        const store = db.createObjectStore('projects', { keyPath: 'id' });
        store.createIndex('by-createdAt', 'createdAt');
        store.createIndex('by-updatedAt', 'updatedAt');
      }
    },
  });

  return dbInstance;
}
