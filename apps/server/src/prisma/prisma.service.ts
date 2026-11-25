// // prisma.service.ts
// import { Injectable } from '@nestjs/common';
// import { PrismaClient } from 'generated/prisma/client';

// @Injectable()
// export class PrismaService extends PrismaClient {
//   constructor() {
//     super({});
//   }

//   /**
//    * Reusable transaction helper
//    * @param fn function receiving the transaction client
//    */
//   async runInTransaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
//     // $transaction automatically provides a transaction client
//     return this.$transaction(async (tx) => {
//       return await fn(tx);
//     });
//   }
// }
