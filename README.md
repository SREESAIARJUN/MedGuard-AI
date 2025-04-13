# 🧠💊 **MedGuardAI**  
### *AI Health Bot + Medical NFTs on Aptos*  
> *AI diagnoses symptoms and mints a private medical summary NFT stored securely on the Aptos blockchain.*

---

### 🌐 **Live Demo**  
🔗 [https://medguardai.vercel.app/](https://medguardai.vercel.app/)

---

### 🧩 **Selected Domain**  
**Artificial Intelligence / Machine Learning + Blockchain Technology**

---

### 🩺 **Problem Statement / Use Case**  
Patients today face:
- Fragmented and inaccessible medical records  
- No control over sharing or data ownership  
- Vulnerability to security breaches in centralized systems  

💡 **There’s a need for a decentralized, AI-driven platform that empowers patients to securely manage and own their health records.**

---

### 📄 **Abstract / Problem Description**  
**MedGuardAI** is an innovative platform that combines the intelligence of AI with the security of blockchain. It allows users to:
- Input symptoms via **text, image, audio, or video**
- Receive structured health assessments via **Google Gemini**
- Generate a **PDF health report**
- Mint that report as a **private NFT on Aptos**
- Securely store it on **IPFS**, ensuring **ownership, privacy, and portability**

🔐 Users stay in complete control of their medical data, share it only with consent, and enjoy seamless access—even during emergencies or across borders.

🎯 **Key Benefits:**
- AI-powered, multimodal health analysis
- Decentralized IPFS storage
- Blockchain-secured NFTs for medical records
- Real-time health monitoring with IoT device support
- Patient-first design with full data sovereignty

---

### ⚙️ **Tech Stack Used**  
| Layer | Tools & Technologies |
|-------|----------------------|
| **Frontend** | Next.js 14 (App Router), React, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons |
| **AI Integration** | Google Gemini API (Multimodal Analysis) |
| **Blockchain** | Aptos (NFT minting for medical records) |
| **Storage** | IPFS via Pinata (Decentralized PDF Storage) |
| **Backend** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **PDF Generation** | jsPDF |

---

### 🚀 **Core Features & Workflow**

#### ✅ 1. **AI Health Assistant**
- Accepts inputs via **text**, **image**, **audio**, or **video**.
- Analyzes symptoms via **Fine-tuned Gemini 2.5 Latest AI Models**.
- Generates structured reports including:
  - Probable diagnosis
  - Severity level
  - Likely causes
  - Suggested treatments
- Exports a **PDF health report** for permanent recordkeeping.

---

#### 🔐 2. **Decentralized Secure Storage**
- AI reports are saved as PDFs.
- Uploaded to **IPFS** via **Pinata**.
- Unique **IPFS hash** is stored in the database and mapped to the NFT.

---

#### 🎟️ 3. **Private NFT Minting on Aptos**
- Medical reports are minted as **private NFTs** on Aptos.
- NFTs contain encrypted links to IPFS reports.
- Ensures **data integrity**, **transparency**, and **access control**.

---

#### 📲 4. **IoT Device Integration**
- Connects with wearables like fitness bands or smartwatches.
- Tracks vitals and aggregates real-time health metrics.
- Computes personalized **Wellness Scores** from continuous inputs.

---

#### 👤 5. **User Authentication & Profiling**  
> 🔐 Built with **Supabase Auth** and **Role-based Access Control**

- **Secure Sign-up/Login** using email/password or OAuth.
- Every user has a **dedicated profile** with:
  - Personal info (age, blood group, conditions)
  - Linked IoT devices
  - NFT medical history
- Profiles are stored securely in **PostgreSQL** and **encrypted at rest**.
- Only verified users can:
  - Mint/view NFTs
  - Access or share medical reports
  - Modify profile data or device settings

---

#### 📊 6. **User Dashboard**
- Shows wellness history, AI insights, and NFT collections.
- Visual trends from AI reports and IoT vitals.
- Share/download reports with consent-based access.
- Grant third-party (doctor/hospital) permission to view specific NFTs.

---

#### 🏗️ 7. **Technical Architecture**
- **Server Components** handle AI calls, IPFS uploads, and NFT minting.
- **Client Components** power real-time dashboard UI.
- **Supabase** manages:
  - Auth, sessions & JWTs
  - Data encryption & user-specific storage
  - Fine-grained access control

---


### 🌟 **Vision**
> *Redefining healthcare with AI-powered diagnostics and decentralized medical ownership—**because your health data should belong to you**.*_

---

### **Demonstration**



![Screenshot (3)](https://github.com/user-attachments/assets/6cfcf783-2ee8-4383-8bf6-e4ca6e3a9421)
![Screenshot (4)](https://github.com/user-attachments/assets/c59780b3-16ec-414c-b566-4940a627e53f)
![Screenshot (100)](https://github.com/user-attachments/assets/276647ca-2e57-4f46-a0f1-3d4081f90043)
![Screenshot (127)](https://github.com/user-attachments/assets/fcc8ff34-8d43-42c9-8a80-20ae5b847592)
![Screenshot (128)](https://github.com/user-attachments/assets/aff2a7eb-9fab-4d31-a5b6-318a20167303)
![Screenshot (129)](https://github.com/user-attachments/assets/5a03465d-4a85-4199-b8d0-b60708b12c83)
![Screenshot (130)](https://github.com/user-attachments/assets/0e24b5ad-53ed-4f28-9ab4-d55715e21b97)


