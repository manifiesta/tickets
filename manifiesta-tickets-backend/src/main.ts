
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as hbs from 'hbs';
import { mockingData } from './mocking-data';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.enableCors();

  // app.useStaticAssets(join(__dirname, '../src/rendering', 'public'));
  // app.setBaseViewsDir(join(__dirname, '../src/rendering', 'views'));
  // hbs.registerPartials(__dirname + '../src/rendering/views/partials');

  // hbs.registerHelper('loud', message => {
  //   return message.toUpperCase()
  // });

  // app.setViewEngine('hbs');

  await app.listen(3000);

  console.log('environement 1', process.env.NODE_ENV);

  if (process.env.NODE_ENV == 'dev' || process.env.NODE_ENV == 'test') {
    await mockingData();
    console.log('DB op');
  }

}
bootstrap();
