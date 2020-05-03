import { Global, Module } from '@nestjs/common';
import { authProvider } from './auth.provider';

@Global()
@Module({
  providers: [authProvider],
  exports: [authProvider],
})
export class AuthModule {}
