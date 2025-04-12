// Real crypto utilities for client-side encryption/decryption using Web Crypto API
export type EncryptResult = {
  encrypted: string
  success: boolean
}

export type DecryptResult = {
  decrypted: any
  success: boolean
}

export const cryptoUtils = {
  // Generate a random encryption key
  generateKey: async (): Promise<string> => {
    try {
      // Generate a random 256-bit key (32 bytes)
      const key = await window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true, // extractable
        ["encrypt", "decrypt"],
      )

      // Export the key to raw format
      const exportedKey = await window.crypto.subtle.exportKey("raw", key)

      // Convert to base64 string for storage
      return btoa(String.fromCharCode(...new Uint8Array(exportedKey)))
    } catch (error) {
      console.error("Error generating encryption key:", error)
      throw new Error("Failed to generate encryption key")
    }
  },

  // Import a key from base64 string
  importKey: async (keyString: string): Promise<CryptoKey> => {
    try {
      // Convert base64 string to ArrayBuffer
      const keyData = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0))

      // Import the key
      return await window.crypto.subtle.importKey(
        "raw",
        keyData,
        {
          name: "AES-GCM",
          length: 256,
        },
        false, // not extractable
        ["encrypt", "decrypt"],
      )
    } catch (error) {
      console.error("Error importing key:", error)
      throw new Error("Failed to import encryption key")
    }
  },

  // Encrypt data using AES-GCM
  encrypt: async (data: any, keyString: string): Promise<EncryptResult> => {
    try {
      // Convert data to string
      const dataString = JSON.stringify(data)

      // Import the key
      const key = await cryptoUtils.importKey(keyString)

      // Generate a random IV (Initialization Vector)
      const iv = window.crypto.getRandomValues(new Uint8Array(12))

      // Encrypt the data
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv,
        },
        key,
        new TextEncoder().encode(dataString),
      )

      // Combine IV and encrypted data
      const encryptedArray = new Uint8Array(iv.length + encryptedData.byteLength)
      encryptedArray.set(iv)
      encryptedArray.set(new Uint8Array(encryptedData), iv.length)

      // Convert to base64 string
      const encrypted = btoa(String.fromCharCode(...encryptedArray))

      return {
        encrypted,
        success: true,
      }
    } catch (error) {
      console.error("Encryption error:", error)
      return {
        encrypted: "",
        success: false,
      }
    }
  },

  // Decrypt data using AES-GCM
  decrypt: async (encryptedString: string, keyString: string): Promise<DecryptResult> => {
    try {
      // Convert base64 string to ArrayBuffer
      const encryptedData = Uint8Array.from(atob(encryptedString), (c) => c.charCodeAt(0))

      // Extract IV (first 12 bytes)
      const iv = encryptedData.slice(0, 12)

      // Extract encrypted data (remaining bytes)
      const data = encryptedData.slice(12)

      // Import the key
      const key = await cryptoUtils.importKey(keyString)

      // Decrypt the data
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv,
        },
        key,
        data,
      )

      // Convert to string and parse JSON
      const decrypted = JSON.parse(new TextDecoder().decode(decryptedData))

      return {
        decrypted,
        success: true,
      }
    } catch (error) {
      console.error("Decryption error:", error)
      return {
        decrypted: null,
        success: false,
      }
    }
  },
}
