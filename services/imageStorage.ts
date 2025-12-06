/**
 * Image Storage Service using IndexedDB
 * LocalStorage has 5-10MB limit, making it unsuitable for image storage.
 * IndexedDB can store hundreds of megabytes, perfect for Base64 images.
 */

const DB_NAME = 'CookingGeniusImages';
const DB_VERSION = 1;
const STORE_NAME = 'images';

let db: IDBDatabase | null = null;

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Failed to open IndexedDB:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

// Save an image
export const saveImage = async (id: string, base64Data: string): Promise<void> => {
    try {
        const database = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put({ id, data: base64Data, timestamp: Date.now() });

            request.onsuccess = () => resolve();
            request.onerror = () => {
                console.error('Failed to save image:', request.error);
                reject(request.error);
            };
        });
    } catch (e) {
        console.error('IndexedDB save error:', e);
    }
};

// Get an image
export const getImage = async (id: string): Promise<string | null> => {
    try {
        const database = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.data : null);
            };
            request.onerror = () => {
                console.error('Failed to get image:', request.error);
                reject(request.error);
            };
        });
    } catch (e) {
        console.error('IndexedDB get error:', e);
        return null;
    }
};

// Delete an image
export const deleteImage = async (id: string): Promise<void> => {
    try {
        const database = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => {
                console.error('Failed to delete image:', request.error);
                reject(request.error);
            };
        });
    } catch (e) {
        console.error('IndexedDB delete error:', e);
    }
};

// Clear all images (for debugging/reset)
export const clearAllImages = async (): Promise<void> => {
    try {
        const database = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error('IndexedDB clear error:', e);
    }
};

// Generate a unique ID for an image based on dish content
export const generateImageId = (dishName: string, timestamp?: number): string => {
    const ts = timestamp || Date.now();
    // Create a simple hash-like ID
    return `img_${dishName.slice(0, 20).replace(/\s/g, '_')}_${ts}`;
};

export const imageStorage = {
    saveImage,
    getImage,
    deleteImage,
    clearAllImages,
    generateImageId,
};
