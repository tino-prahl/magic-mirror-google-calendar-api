import { Controller, Get, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarEvent } from './calendar-event.interface';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly service: CalendarService) {}

  @Get('list')
  public list(
    @Query('maxResults') maxResults = '10',
  ): Promise<CalendarEvent[]> {
    return this.service.list(parseInt(maxResults, 10));
  }

  @Get('month')
  public month(
    @Query('monthOffset') monthOffset = '0',
  ): Promise<CalendarEvent[]> {
    return this.service.month(parseInt(monthOffset, 10));
  }
}
