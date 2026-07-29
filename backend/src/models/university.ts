import mongoose, { Document, Schema } from 'mongoose';

export interface IUniversity extends Document {
    name: string;
    slug: string;
    description: string;
    website: string;
    location: {
        city: string;
        region: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    established?: number;
    type?: 'Public' | 'Private';
    contactEmail?: string;
    phone?: string;
    address?: string;
    admissionsEmail?: string;
    admissionsPhone?: string;
    studentPortal?: string;
    applicationUrl?: string;
    mapUrl?: string;
    academicOverview?: string;
    mission?: string;
    vision?: string;
    accreditation?: string;
    admissionOverview?: string;
    tuitionOverview?: string;
    admissionRequirements?: string[];
    scholarships?: string[];
    applicationDeadlines?: string[];
    studyModes?: string[];
    studentPopulation?: string;
    facultyCount?: string;
    faculties?: string[];
    campuses?: string[];
    colleges?: Array<{
        name: string;
        description?: string;
        website?: string;
        departments?: Array<{
            name: string;
            duration?: string;
            description?: string;
            head?: string;
            contactEmail?: string;
            website?: string;
            researchAreas?: string[];
            facilities?: string[];
            learningOutcomes?: string[];
            careerPaths?: string[];
            programs?: Array<{
                name: string;
                level?: string;
                duration?: string;
                description?: string;
                requirements?: string[];
                applicationUrl?: string;
                tuitionAmount?: string;
                tuitionCurrency?: string;
                tuitionPeriod?: string;
                registrationFee?: string;
                studyMode?: string;
                intake?: string;
                scholarships?: string[];
            }>;
        }>;
    }>;
    galleryImages?: string[];
    videos?: Array<{ title: string; url: string; description?: string }>;
    importantLinks?: Array<{ label: string; url: string; description?: string }>;
    facilities?: string[];
    coordinates?: {
        lat: number;
        lng: number;
    };
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UniversitySchema = new Schema<IUniversity>(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
        description: { type: String, required: true },
        website: { type: String, required: true },
        location: {
            type: {
                city: { type: String, required: true },
                region: { type: String, required: true },
                coordinates: {
                    lat: Number,
                    lng: Number,
                },
            },
            required: true,
        },
        established: Number,
        type: { type: String, enum: ['Public', 'Private'], default: 'Public' },
        contactEmail: String,
        phone: String,
        address: String,
        admissionsEmail: String,
        admissionsPhone: String,
        studentPortal: String,
        applicationUrl: String,
        mapUrl: String,
        academicOverview: String,
        mission: String,
        vision: String,
        accreditation: String,
        admissionOverview: String,
        tuitionOverview: String,
        admissionRequirements: [String],
        scholarships: [String],
        applicationDeadlines: [String],
        studyModes: [String],
        studentPopulation: String,
        facultyCount: String,
        faculties: [String],
        campuses: [String],
        colleges: [
            {
                name: String,
                description: String,
                website: String,
                departments: [
                    {
                        name: String,
                        duration: String,
                        description: String,
                        head: String,
                        contactEmail: String,
                        website: String,
                        researchAreas: [String],
                        facilities: [String],
                        learningOutcomes: [String],
                        careerPaths: [String],
                        programs: [
                            {
                                name: String,
                                level: String,
                                duration: String,
                                description: String,
                                requirements: [String],
                                applicationUrl: String,
                                tuitionAmount: String,
                                tuitionCurrency: String,
                                tuitionPeriod: String,
                                registrationFee: String,
                                studyMode: String,
                                intake: String,
                                scholarships: [String],
                            },
                        ],
                    },
                ],
            },
        ],
        galleryImages: [String],
        videos: [
            {
                title: String,
                url: String,
                description: String,
            },
        ],
        importantLinks: [
            {
                label: String,
                url: String,
                description: String,
            },
        ],
        facilities: [String],
        coordinates: {
            lat: Number,
            lng: Number,
        },
        image: String,
    },
    { timestamps: true }
);

export const University = mongoose.model<IUniversity>('University', UniversitySchema);
