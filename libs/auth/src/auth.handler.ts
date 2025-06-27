import { Injectable } from '@nestjs/common'; @Injectable() export class AuthHandler { async handle() { return { message: 'Auth handler' }; } }
