import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';

@Injectable()
export class SslService {
    private readonly logger = new Logger(SslService.name);

    async createSession(order: any) {
        this.logger.debug('Creating SSL payment session', {
            traxId: order.traxId,
            orderId: order.id,
            amount: order.totalAmount,
        });
        const payload = {
            store_id: process.env.SSL_STORE_ID,
            store_passwd: process.env.SSL_STORE_PASSWORD,
            total_amount: order.totalAmount.toString(),
            currency: 'BDT',
            tran_id: order.traxId,

            success_url: `${process.env.BACKEND_URL}/payment/success`,
            fail_url: `${process.env.BACKEND_URL}/payment/fail`,
            cancel_url: `${process.env.BACKEND_URL}/payment/cancel`,
            ipn_url: `${process.env.BACKEND_URL}/payment/ipn`,

            product_name: 'Ecommerce Order',
            product_category: 'Ecommerce',
            product_profile: 'general',

            cus_name: order.name,
            cus_email: order.email || 'test@gmail.com',
            cus_add1: order.address,
            cus_phone: order.phoneNumber,
        };

        const response = await axios.post(
            `${process.env.SSL_BASE_URL}/gwprocess/v4/api.php`,
            qs.stringify(payload),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        this.logger.log('SSL payment session created', {
            traxId: order.traxId,
            status: response.data?.status,
        });

        return response.data;
    }

    async validatePayment(val_id: string) {
        const response = await axios.get(
            `${process.env.SSL_BASE_URL}/validator/api/validationserverAPI.php`,
            {
                params: {
                    val_id,
                    store_id: process.env.SSL_STORE_ID,
                    store_passwd: process.env.SSL_STORE_PASSWORD,
                    format: 'json',
                },
            }
        );

        this.logger.debug('SSL payment validated', {
            valId: val_id,
            status: response.data?.status,
        });

        return response.data;
    }

    
}