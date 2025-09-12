import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class OptionalParseIntPipe implements PipeTransform {
  constructor(private readonly defaultValue: number) {}

  transform(value: any) {
    if (value === undefined || value === null || value === '') {
      return this.defaultValue;
    }
    const valueParse = parseInt(value, 10);
    if (isNaN(valueParse)) {
      throw new Error('Validation failed (numeric string is expected)');
    }
    return valueParse;
  }
}
