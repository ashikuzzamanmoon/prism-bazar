import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PaymentController } from './payment.controller';
import { SslService } from './order.payment.service';
import { OrdersHelperService } from './order.helper.service';

@Module({
  controllers: [OrdersController, PaymentController],
  providers: [OrdersService, SslService, OrdersHelperService],
})
export class OrdersModule { }
