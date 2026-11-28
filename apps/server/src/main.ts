import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  app.enableCors({
    origin: [
      "https://portal.prismbazar.com",
      "https://prismbazar.com",
      "http://localhost:3001",
      "http://localhost:3000",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix("api", {
    exclude: ["/"],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });

  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Prism Bazar Server")
      .setDescription("Prism Bazar E-commerce Server API is running")
      .setVersion("1.0")
      .addServer("http://localhost:9001", "Local Development")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        "access-token",
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT || 9001;
  await app.listen(port, "0.0.0.0");
  const appUrl = await app.getUrl();
  logger.log(`Server is running on ${appUrl}`, "Bootstrap");
}

bootstrap();
