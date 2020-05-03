/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import { calendar_v3 } from 'googleapis';
import * as moment from 'moment';
import * as fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import { CalendarEvent } from './calendar-event.interface';
import Calendar = calendar_v3.Calendar;
import Params$Resource$Events$List = calendar_v3.Params$Resource$Events$List;

@Injectable()
export class CalendarService {
  private readonly calendar: Calendar;
  private readonly calendarConfig: {
    calendarIds: { month: string[]; list: string[] };
  };

  constructor(oAuth2Client: OAuth2Client) {
    this.calendar = new Calendar({ auth: oAuth2Client });
    this.calendarConfig = JSON.parse(
      fs.readFileSync('./config/calendar.config.json', 'utf8'),
    );
  }

  public async list(maxResults: number): Promise<CalendarEvent[]> {
    const params = {
      maxResults,
      orderBy: 'startTime',
      singleEvents: true,
      timeMin: new Date().toISOString(),
    };

    const result = await this.listEventsSorted(
      this.calendarConfig.calendarIds.list,
      params,
    );
    return result.slice(0, maxResults);
  }

  public async month(monthOffset: number): Promise<CalendarEvent[]> {
    const today = new Date();

    // Example: Tue Jan 01 2019 00:00:00 GMT+0100
    const timeMin = new Date(
      today.getFullYear(),
      today.getMonth() + monthOffset,
    ).toISOString();

    // Example: Thu Jan 31 2019 23:59:59 GMT+0100
    const timeMax = new Date(
      today.getFullYear(),
      today.getMonth() + monthOffset + 1,
      1,
      0,
      0,
      0,
      -1,
    ).toISOString();

    const params = {
      orderBy: 'startTime',
      singleEvents: true,
      timeMax,
      timeMin,
    };

    return this.listEventsSorted(this.calendarConfig.calendarIds.month, params);
  }

  private async listEventsSorted(
    calendarIds: string[],
    params: Params$Resource$Events$List,
  ) {
    const allItems = await Promise.all(
      calendarIds.map(async (calendarId) => {
        const events = await this.calendar.events.list({
          calendarId,
          ...params,
        });
        return events.data.items;
      }),
    );

    const flatItems = ([] as CalendarEvent[][]).concat.apply([], allItems);

    return flatItems.sort((a, b) => {
      const dateA = moment(a.start.date || a.start.dateTime);
      const dateB = moment(b.start.date || b.start.dateTime);
      return dateA.diff(dateB);
    });
  }
}
