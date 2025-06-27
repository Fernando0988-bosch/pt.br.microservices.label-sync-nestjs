import { Injectable } from '@nestjs/common';
@Injectable()
export class AuthHandler {
  handle(): { message: string } {
    return { message: 'Auth handler' };
  }
}
