import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ timestamps: true })
export class Permission {
    @Prop()
    name: string;

    @Prop()
    apiPath: string;

    @Prop()
    method: string;

    @Prop()
    module: string;

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

export const PermissionSchema = SchemaFactory.createForClass(Permission);