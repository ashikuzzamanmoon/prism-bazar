import { Global, Module } from "@nestjs/common";
import { SpacesProvider } from ".";
import { BucketService } from "./bucket.service";

@Global()
@Module({
    providers: [SpacesProvider, BucketService],
    exports: [BucketService],
})
export class BucketModule { }
