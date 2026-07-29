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
    faculties?: string[];
    campuses?: string[];
    colleges?: Array<{
        name: string;
        departments?: Array<{
            name: string;
            duration: string;
            description?: string;
        }>;
    }>;
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
        faculties: [String],
        campuses: [String],
        colleges: [
            {
                name: String,
                departments: [
                    {
                        name: String,
                        duration: String,
                        description: String,
                    },
                ],
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
