import { Controller, Post, Body, Res, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { API_VERSION } from 'src/utils/api-verstion';
import { Response } from 'express';

@Controller({
  path: 'payment',
  version: API_VERSION.V1,
})
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly ordersService: OrdersService) { }

  @Post('success')
  async paymentSuccess(@Body() body: any, @Res() res: Response) {
    const val_id = body.val_id;
    const tran_id = body.tran_id;
    this.logger.log('Payment success callback received', { tranId: tran_id });


    try {
      await this.ordersService.handleSuccess(val_id, tran_id);
      const successUrl = `${process.env.SUCCESS_URL}?trxId=${tran_id}`;
      return res.redirect(successUrl);
    } catch (error) {
      this.logger.error('Error processing payment success callback', error instanceof Error ? error.stack : undefined, {
        tranId: tran_id,
        error: error instanceof Error ? error.message : String(error),
      });
      const failUrl = `${process.env.FAIL_URL}?trxId=${tran_id}`;
      return res.redirect(failUrl);
    }
  }

  @Post('fail')
  async paymentFail(@Body() body: any, @Res() res: Response) {
    const tran_id = body.tran_id;

    // console.log('❌ Payment Failed - tran_id:', tran_id);
    // console.log('📋 Full response:', body);

    await this.ordersService.handleFail(tran_id);
    const failUrl = `${process.env.FAIL_URL}?trxId=${tran_id}`;
    return res.redirect(failUrl);
  }

  @Post('cancel')
  async paymentCancel(@Body() body: any, @Res() res: Response) {
    const tran_id = body.tran_id;

    // console.log('⚠️ Payment Cancelled - tran_id:', tran_id);
    // console.log('📋 Full response:', body);

    await this.ordersService.handleFail(tran_id);
    const cancelUrl = `${process.env.CANCEL_URL}?trxId=${tran_id}`;
    return res.redirect(cancelUrl);
  }

  @Post('ipn')
  async ipnHandler(@Body() body: any) {
    // console.log('🔔 IPN Webhook Received:', {
    //   status: body.status,
    //   tran_id: body.tran_id,
    //   amount: body.amount,
    //   timestamp: new Date().toISOString(),
    // });
    // console.log('📋 Full IPN Data:', body);
    return await this.ordersService.handleIpn(body);
  }
}
