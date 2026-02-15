# Database Schema Documentation

## Collections

### 1. Users Collection

Stores information about doctors/physicians using the system.

```javascript
{
  _id: ObjectId,
  name: String,              // Doctor's full name
  email: String,             // Unique email (used for login)
  password: String,          // Hashed password (bcrypt)
  specialty: String,         // Medical specialty
  licenseNumber: String,     // Unique medical license number
  hospital: String,          // Hospital/clinic name (optional)
  isActive: Boolean,         // Account status
  lastLogin: Date,           // Last login timestamp
  createdAt: Date,           // Account creation date
  updatedAt: Date            // Last update date
}
```

**Indexes:**
- `email`: Unique index for login
- `licenseNumber`: Unique index for verification

**Validation:**
- Email must be valid format
- Password: minimum 8 characters, includes uppercase, lowercase, and number
- Specialty must be from predefined list

---

### 2. Cases Collection

Stores patient cases and AI analysis results.

```javascript
{
  _id: ObjectId,
  doctor: ObjectId,          // Reference to Users collection
  
  patientInfo: {
    age: Number,             // Patient age (0-150)
    gender: String,          // "Male", "Female", or "Other"
    patientId: String        // Unique patient identifier
  },
  
  clinicalData: {
    chiefComplaint: String,  // Main presenting complaint
    
    historyOfPresentingIllness: String,  // Detailed HPI
    
    pastMedicalHistory: String,          // Previous medical conditions
    
    pastSurgicalHistory: String,         // Previous surgeries
    
    currentMedications: [String],        // Array of current medications
    
    allergies: [String],                 // Array of known allergies
    
    familyHistory: String,               // Family medical history
    
    socialHistory: String,               // Social factors (smoking, alcohol, etc.)
    
    examinationFindings: {
      vitals: {
        temperature: String,
        bloodPressure: String,
        heartRate: String,
        respiratoryRate: String,
        oxygenSaturation: String
      },
      generalExamination: String,
      systemicExamination: String
    },
    
    investigationResults: String         // Lab/imaging results
  },
  
  aiAnalysis: {
    clinicalAssessment: String,          // Overall assessment summary
    
    differentialDiagnosis: [{
      diagnosis: String,                 // Diagnosis name
      probability: String,               // "High", "Moderate", or "Low"
      supportingFeatures: [String],      // Supporting evidence
      investigationsNeeded: [String]     // Required investigations
    }],
    
    recommendedInvestigations: {
      essential: [String],               // Must-do investigations
      additional: [String]               // Optional investigations
    },
    
    treatmentPlan: {
      immediateManagement: String,       // Urgent actions needed
      pharmacological: [String],         // Medication recommendations
      nonPharmacological: [String],      // Non-drug interventions
      monitoring: [String]               // Follow-up and monitoring
    },
    
    patientCounseling: [String],         // Patient education points
    
    redFlags: [String],                  // Warning signs
    
    fullResponse: String                 // Complete AI response (for reference)
  },
  
  status: String,            // "draft", "analyzed", "reviewed", or "archived"
  
  notes: String,             // Doctor's notes (optional)
  
  tags: [String],            // Custom tags for organization
  
  createdAt: Date,           // Case creation timestamp
  
  updatedAt: Date            // Last update timestamp
}
```

**Indexes:**
- `doctor`: Index for querying by doctor
- `createdAt`: Index for sorting by date
- `status`: Index for filtering by status
- `patientInfo.patientId`: Index for patient lookup
- Compound index: `(doctor, createdAt)` for efficient queries

**Validation:**
- Age must be between 0 and 150
- Gender must be "Male", "Female", or "Other"
- Chief Complaint and History of Presenting Illness are required
- Status must be one of the four allowed values

---

## Relationships

```
Users (1) -----> (Many) Cases
```

Each case belongs to one doctor (user), but each doctor can have many cases.

---

## Sample Data

### Sample User
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "Dr. Sarah Johnson",
  email: "sarah.johnson@hospital.com",
  password: "$2a$12$...",  // Hashed
  specialty: "Internal Medicine",
  licenseNumber: "MED123456",
  hospital: "City General Hospital",
  isActive: true,
  lastLogin: ISODate("2024-02-14T10:30:00Z"),
  createdAt: ISODate("2024-01-01T08:00:00Z"),
  updatedAt: ISODate("2024-02-14T10:30:00Z")
}
```

### Sample Case
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  doctor: ObjectId("507f1f77bcf86cd799439011"),
  
  patientInfo: {
    age: 45,
    gender: "Male",
    patientId: "PT-2024-001"
  },
  
  clinicalData: {
    chiefComplaint: "Chest pain for 2 hours",
    historyOfPresentingIllness: "Patient presents with sudden onset central chest pain...",
    pastMedicalHistory: "Hypertension for 5 years",
    currentMedications: ["Amlodipine 5mg OD"],
    allergies: ["Penicillin"],
    examinationFindings: {
      vitals: {
        bloodPressure: "160/95",
        heartRate: "88 bpm"
      },
      generalExamination: "Anxious, diaphoretic",
      systemicExamination: "CVS: S1 S2 normal, no murmurs"
    }
  },
  
  aiAnalysis: {
    clinicalAssessment: "45-year-old male with acute chest pain...",
    differentialDiagnosis: [
      {
        diagnosis: "Acute Coronary Syndrome",
        probability: "High",
        supportingFeatures: ["Central chest pain", "Known hypertension"],
        investigationsNeeded: ["ECG", "Troponin levels"]
      }
    ],
    // ... rest of analysis
  },
  
  status: "analyzed",
  createdAt: ISODate("2024-02-14T10:30:00Z"),
  updatedAt: ISODate("2024-02-14T10:30:00Z")
}
```

---

## Data Migration Notes

If you need to migrate from an older version:

1. Backup your database first
2. Run migration scripts in order
3. Verify data integrity after migration

---

## Performance Optimization

### Recommended Indexes

```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ licenseNumber: 1 }, { unique: true });

// Cases collection
db.cases.createIndex({ doctor: 1, createdAt: -1 });
db.cases.createIndex({ "patientInfo.patientId": 1 });
db.cases.createIndex({ status: 1 });
```

### Query Optimization Tips

1. Always include doctor ID in case queries
2. Use projection to exclude large fields when not needed
3. Paginate case lists
4. Create compound indexes for frequently used query patterns

---

## Security Considerations

1. **Password Security**
   - Passwords are hashed using bcrypt with 12 salt rounds
   - Never store plain text passwords
   - Implement password strength requirements

2. **Data Privacy**
   - Patient IDs should be anonymized/pseudonymized
   - Consider encryption for sensitive fields in production
   - Implement proper access controls

3. **Audit Trail**
   - Keep timestamps for all records
   - Consider adding a separate audit log collection
   - Track all case modifications

---

## Backup Strategy

1. **Daily Backups**
   ```bash
   mongodump --uri="mongodb://localhost:27017/medical-ai" --out=/backup/$(date +%Y%m%d)
   ```

2. **Retention Policy**
   - Keep daily backups for 7 days
   - Weekly backups for 1 month
   - Monthly backups for 1 year

3. **Disaster Recovery**
   - Store backups in multiple locations
   - Test restore procedures regularly
   - Document recovery steps
