// indexedDBHelper.js
import { openDB } from 'idb';

const DB_NAME = 'BookDB';
const DB_VERSION = 1;
const STORE_NAME = 'epubFiles';

// Initialize IndexedDB
export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

// Save file in IndexedDB
export const saveFileToIndexedDB = async (key, value) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.put(value, key);
  await tx.done;
};

// Retrieve file from IndexedDB
export const getFileFromIndexedDB = async (key) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const file = await store.get(key);
  await tx.done;
  return file;
};

// Delete file from IndexedDB
export const deleteFileFromIndexedDB = async (key) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.delete(key);
  await tx.done;
};
