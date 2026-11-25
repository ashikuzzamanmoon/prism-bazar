import { Injectable, Inject } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SpacesServiceLib, IUploadedMulterFile } from '.';

@Injectable()
export class BucketService {
    constructor(@Inject(SpacesServiceLib) private readonly s3: S3Client) { }

    async upload(file: IUploadedMulterFile, location?: string): Promise<string> {
        const extension = extname(file.originalname);
        const uniqueName = `${location || ''}${uuidv4()}${extension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME!,
            Key: uniqueName,
            Body: file.buffer,
            ACL: 'public-read',
            ContentType: file.mimetype,
        });

        await this.s3.send(command);

        const baseUrl = process.env.FILE_URL?.endsWith('/')
            ? process.env.FILE_URL
            : `${process.env.FILE_URL}/`;
        return `${baseUrl}${uniqueName}`;
    }

    async uploadDirecFile(file: string, location?: string): Promise<string> {
        const buf = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const key = `${location || ''}${uuidv4()}.png`; // safe name

        const command = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME!,
            Key: key,
            Body: buf,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: 'image/png',
        });

        await this.s3.send(command);

        const baseUrl = process.env.FILE_URL?.endsWith('/')
            ? process.env.FILE_URL
            : `${process.env.FILE_URL}/`;
        return `${baseUrl}${key}`;
    }
}
