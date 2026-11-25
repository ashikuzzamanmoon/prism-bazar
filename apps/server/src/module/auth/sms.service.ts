import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);

    private apiKey = '6vI4HabIPduVr3c1d8pv';
    private senderId = 'PRISMBZR';
    private apiUrl = 'http://bulksmsbd.net/api/smsapi';
    async sendOtpMessage(phone: string, code: string) {
        if (!URL) {
            throw new Error('SMS URL is missing.');
        }
        const message = `Prism Bazar Verification: Your OTP is ${code}. It is valid for 2 minutes. Please do not share this code with anyone. Thank you for choosing Prism Bazar!`;
        try {

            const formData = new URLSearchParams();
            formData.append('api_key', this.apiKey);
            formData.append('type', 'text');
            formData.append('number', phone);
            formData.append('senderid', this.senderId);
            formData.append('message', message);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            const data = await response.text();
            if (!response.ok) {
                throw new HttpException(data, HttpStatus.BAD_REQUEST);
            }

            this.logger.log('OTP SMS sent successfully', {
                phone,
                providerResponse: data,
            });
        } catch (error) {
            this.logger.error('Failed to send OTP via SMS', error instanceof Error ? error.stack : undefined, {
                phone,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new Error('Failed to send OTP via SMS');
        }
    }

}
