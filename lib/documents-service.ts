import { 
  ref, 
  set, 
  get, 
  remove, 
  onValue, 
  off,
  DataSnapshot 
} from "firebase/database";
import { database } from "./firebase";

// Database paths
const DOCUMENTS_PATH = "documents";

export interface DocumentMetadata {
  id: string
  name: string
  type: "scoping" | "dodd"
  fileName: string
  fileSize: number
  uploadDate: string
  contentType: string
  downloadUrl?: string
}

// Helper function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Convert File to base64 for storage
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

// Convert base64 back to File
const base64ToFile = (base64: string, fileName: string, contentType: string): File => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], fileName, { type: contentType });
};

export const documentsService = {
  // Get all documents
  async getAll(): Promise<DocumentMetadata[]> {
    try {
      const snapshot = await get(ref(database, DOCUMENTS_PATH));
      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      }
      return [];
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  },

  // Get document by type
  async getByType(type: "scoping" | "dodd"): Promise<DocumentMetadata | null> {
    try {
      const documents = await this.getAll();
      return documents.find(doc => doc.type === type) || null;
    } catch (error) {
      console.error("Error fetching document by type:", error);
      throw error;
    }
  },

  // Upload document
  async uploadDocument(file: File, type: "scoping" | "dodd"): Promise<DocumentMetadata> {
    try {
      const id = generateId();
      const base64Data = await fileToBase64(file);
      
      const document: DocumentMetadata = {
        id,
        name: type === "scoping" ? "Scoping Agreement" : "DODD 7045.20 Capability Portfolio Management",
        type,
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        contentType: file.type,
        downloadUrl: base64Data
      };

      await set(ref(database, `${DOCUMENTS_PATH}/${id}`), document);
      return document;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  },

  // Update document
  async updateDocument(id: string, updates: Partial<DocumentMetadata>): Promise<void> {
    try {
      await set(ref(database, `${DOCUMENTS_PATH}/${id}`), updates);
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  },

  // Delete document
  async deleteDocument(id: string): Promise<void> {
    try {
      await remove(ref(database, `${DOCUMENTS_PATH}/${id}`));
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },

  // Download document as File
  async downloadDocument(id: string): Promise<File | null> {
    try {
      const snapshot = await get(ref(database, `${DOCUMENTS_PATH}/${id}`));
      if (snapshot.exists()) {
        const document = snapshot.val() as DocumentMetadata;
        if (document.downloadUrl) {
          return base64ToFile(document.downloadUrl, document.fileName, document.contentType);
        }
      }
      return null;
    } catch (error) {
      console.error("Error downloading document:", error);
      throw error;
    }
  },

  // Listen to document changes
  subscribe(callback: (documents: DocumentMetadata[]) => void): () => void {
    const documentsRef = ref(database, DOCUMENTS_PATH);
    
    const handleSnapshot = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const documents = Object.values(snapshot.val()) as DocumentMetadata[];
        callback(documents);
      } else {
        callback([]);
      }
    };

    onValue(documentsRef, handleSnapshot);
    
    return () => off(documentsRef, 'value', handleSnapshot);
  }
}; 