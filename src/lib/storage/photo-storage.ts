const DB_NAME = "chamois-photo-db";
const STORE_NAME = "photos";
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error ?? new Error("Impossible d’ouvrir IndexedDB."));
    };
  });
}

function createId() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

export async function savePhoto(dataUrl: string): Promise<string> {
  const db = await openDatabase();
  const photoId = createId();

  if (dataUrl.length > 500000) {
    throw new Error(
      `Photo encore trop lourde après compression (${Math.round(dataUrl.length / 1024)} Ko texte).`
    );
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(dataUrl, photoId);

    transaction.onabort = () => {
      reject(
        transaction.error ??
          new Error("Transaction IndexedDB annulée pendant l’enregistrement.")
      );
    };

    transaction.onerror = () => {
      reject(
        transaction.error ??
          new Error("Erreur IndexedDB pendant l’enregistrement de la photo.")
      );
    };

    request.onsuccess = () => resolve(photoId);

    request.onerror = () => {
      reject(
        request.error ??
          new Error("Impossible d’écrire la photo dans IndexedDB.")
      );
    };
  });
}

export async function getPhoto(photoId: string): Promise<string | undefined> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(photoId);

    request.onsuccess = () => {
      const result = request.result;

      if (!result) {
        resolve(undefined);
        return;
      }

      if (typeof result === "string") {
        resolve(result);
        return;
      }

      if (result instanceof Blob) {
        resolve(URL.createObjectURL(result));
        return;
      }

      resolve(undefined);
    };

    request.onerror = () => {
      reject(request.error ?? new Error("Impossible de lire la photo."));
    };
  });
}

export async function getManyPhotos(photoIds: string[]): Promise<string[]> {
  const results = await Promise.all(photoIds.map((photoId) => getPhoto(photoId)));
  return results.filter((url): url is string => Boolean(url));
}

export async function deletePhoto(photoId: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(photoId);

    request.onsuccess = () => resolve();

    request.onerror = () => {
      reject(request.error ?? new Error("Impossible de supprimer la photo."));
    };
  });
}

export async function deleteManyPhotos(photoIds: string[]): Promise<void> {
  await Promise.all(photoIds.map((photoId) => deletePhoto(photoId)));
}