### **Project Title**  

**AI Health Bot + Medical NFTs on Aptos** -  *AI diagnoses symptoms and mints a private medical summary NFT stored securely on Aptos)*


**MedGuardAI** *(AI Health Bot + Medical NFTs on Aptos – AI diagnoses symptoms and mints a private medical summary NFT stored securely on Aptos)*

---

### **Selected Domain**  

**Artificial Intelligence/Machine Learning**


**Healthcare + Blockchain Technology**

---

### **Problem Statement / Use Case**  
Patients often struggle with fragmented health records, lack of data privacy, and the inability to control or securely share their medical data. Traditional healthcare systems are centralized, prone to data breaches, and fail to offer user-centric solutions. There is a need for a platform that combines AI for preliminary diagnosis and blockchain for secure, verifiable, and patient-owned medical records.

---

### **Abstract / Problem Description (Max 300 words)**  
**MedGuardAI** is a blockchain-secured, AI-powered health analysis platform that empowers users with control over their medical data. It uses multimodal AI (text, image, audio, and video) to analyze symptoms and generate structured health assessments. These assessments are then converted into private, tamper-proof NFTs on the Aptos blockchain and stored securely on IPFS.

In conventional systems, health records are scattered across providers and are vulnerable to data loss and unauthorized access. Patients often do not own or control their health information, creating challenges in record portability, especially in emergencies or across borders.

MedGuardAI addresses these pain points by:
- Offering AI-driven health assessments through multimodal input
- Generating health reports and storing them decentrally on IPFS
- Minting encrypted NFTs on the Aptos blockchain for record verification
- Enabling user-controlled access to medical data
- Integrating IoT health data for real-time wellness tracking

This ensures medical data is immutable, verifiable, and accessible only to the rightful owner. MedGuardAI redefines digital health management by putting the patient at the center—secured by blockchain and powered by AI.

---

### **Tech Stack Used**  
- **Frontend**: Next.js 14 (App Router), React, TypeScript  
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons  
- **AI Model**: Google Gemini API (for multimodal health analysis)  
- **Blockchain**: Aptos (for minting health NFTs)  
- **Storage**: IPFS via Pinata (for decentralized PDF storage)  
- **Database**: Supabase (PostgreSQL)  
- **Auth**: Supabase Auth  
- **PDF Generation**: jsPDF  

---

### **Project Explanation**

#### **1. AI Health Assistant**
- Users input symptoms via text, image, audio, or video.
- Gemini API provides structured feedback: probable diagnosis, causes, severity, and treatment advice.
- Results are converted into PDF reports for user records.

#### **2. Decentralized Secure Storage**
- AI reports are transformed into PDFs.
- PDFs are uploaded to IPFS via Pinata, returning unique hashes.
- Hashes are stored in the database and linked to NFTs.

#### **3. Blockchain NFT Minting (Aptos)**
- Each medical report can be minted as a private NFT on Aptos.
- This provides tamper-proof ownership and enables sharing only with consent.
- Ensures medical transparency and data permanence.

#### **4. IoT Integration**
- Syncs with devices like smartwatches or fitness bands.
- Aggregates vitals and daily activity to generate real-time wellness scores.

#### **5. User Dashboard**
- Visualizes wellness trends, NFT history, and past health records.
- Allows download/share of health reports.
- Controls access to medical NFTs for verified third-party use.

#### **6. Technical Architecture**
- Server Components manage health record processing and AI calls.
- Client Components ensure interactivity and real-time updates.
- Supabase handles user sessions, data encryption, and access control.
