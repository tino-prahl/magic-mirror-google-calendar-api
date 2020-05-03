import { Module } from '@nestjs/common';
import { CalendarModule } from './calendar/calendar.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [CalendarModule, AuthModule],
})
export class AppModule {}
