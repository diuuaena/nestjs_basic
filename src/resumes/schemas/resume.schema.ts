import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Company } from 'src/companies/schemas/company.schema';
import { Job } from 'src/jobs/schemas/job.schema';

export type ResumeDocument = HydratedDocument<Resume>;

@Schema({ timestamps: true })
export class Resume {
    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    userId: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true })
    url: string;

    @Prop()
    status: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: Company.name})
    companyId: mongoose.Schema.Types.ObjectId;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: Job.name})
    jobId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: Array })
    history: {
        status: string,
        updatedAt: Date,
        updatedBy: { _id, email }
    }[]

    @Prop()
    createdAt: Date;

    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }

    @Prop()
    updatedAt: Date;

    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }

    @Prop()
    deletedAt: Date;

    @Prop({ type: Object })
    deletedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }

    @Prop()
    isDeleted: boolean;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);