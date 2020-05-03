import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { program } from 'commander';

program.option('-p, --port <type>', 'defines port', '3000');

program.parse(process.argv);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(program.port);
}

bootstrap();
