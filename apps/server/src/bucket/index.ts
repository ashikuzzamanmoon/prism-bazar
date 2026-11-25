import { Provider } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';

export const SpacesServiceLib = 'lib:do-spaces-service';

export const s3Client = new S3Client({
    endpoint: `https://${process.env.END_POINT}`,
    region: 'sfo1',
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
});

export const SpacesProvider: Provider<S3Client> = {
    provide: SpacesServiceLib,
    useValue: s3Client,
};

export interface IUploadedMulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
