import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./module/auth/auth.module";
import { UsersModule } from "./module/users/users.module";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { RolesModule } from "./module/roles/roles.module";
import { CollectionModule } from "./module/collection/collection.module";
import { CategoryModule } from "./module/category/category.module";
import { SubCategoryModule } from "./module/sub-category/sub-category.module";
import { FileUploaderModule } from "./module/file-uploader/file-uploader.module";
import { BrandsModule } from "./module/brands/brands.module";
import { BannersModule } from "./module/banners/banners.module";
import { ProductsModule } from "./module/products/products.module";
import { PromocodeModule } from "./module/promocode/promocode.module";
import { OrdersModule } from "./module/orders/orders.module";
import { AnalysisModule } from "./module/analysis/analysis.module";
import { WinstonModule } from "nest-winston";
import { winstonConfig } from "./config/winston.config";
import { ContentsModule } from "./module/contents/contents.module";
import { ProductTypeEntityModule } from "./module/product-type-entity/product-type-entity.module";
import { DeliveryZonesModule } from "./module/delivery-zones/delivery-zones.module";
import { DigitalFilesModule } from "./module/digital-files/digital-files.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot(winstonConfig),
    PrismaModule,
    UsersModule,
    AuthModule,
    RolesModule,
    CollectionModule,
    CategoryModule,
    SubCategoryModule,
    FileUploaderModule,
    BrandsModule,
    BannersModule,
    ProductsModule,
    PromocodeModule,
    OrdersModule,
    AnalysisModule,
    ContentsModule,
    ProductTypeEntityModule,
    DeliveryZonesModule,
    DigitalFilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
