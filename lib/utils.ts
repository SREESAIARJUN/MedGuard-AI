import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// AES Encryption/Decryption utils
export const generateEncryptionKey = () => {
  // Generate a random 32-byte key (256 bits)
  const array = new Uint8Array(32)
  window.crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
}

// For demo purposes - in a real app this would use the Web Crypto API
export const encryptData = (data: any, key: string): string => {
  // In a real app, this would use the Web Crypto API for proper encryption
  // This is a placeholder that simulates encryption
  const dataString = JSON.stringify(data)
  return btoa(encodeURIComponent(dataString)) + key.substring(0, 8)
}

export const decryptData = (encrypted: string, key: string): any => {
  // In a real app, this would use the Web Crypto API for proper decryption
  // This is a placeholder that simulates decryption
  try {
    const actualData = encrypted.substring(0, encrypted.length - 8)
    return JSON.parse(decodeURIComponent(atob(actualData)))
  } catch (e) {
    throw new Error("Invalid decryption key or corrupted data")
  }
}

// IPFS Utils (simulated)
export const uploadToIPFS = async (data: string): Promise<string> => {
  // Simulate IPFS upload delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a fake IPFS hash
      const hash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      resolve(hash)
    }, 2000)
  })
}

// Aptos Blockchain Utils (simulated)
export const mintNFT = async (ipfsHash: string, title: string): Promise<{ txHash: string }> => {
  // Simulate blockchain transaction delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a fake transaction hash
      const txHash = `0x${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`
      resolve({ txHash })
    }, 3000)
  })
}
