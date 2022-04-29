import { Buffer } from "https://deno.land/std@0.137.0/node/buffer.ts";
import { BN as Bn } from "./bn.js";

export class MockStream {
  #bytesRead = 0;
  constructor(public buffer = Buffer.from([])) {}

  read(size: number) {
    const data = this.buffer.slice(0, size);
    this.buffer = this.buffer.slice(size);
    this.#bytesRead += size;
    return data;
  }

  // deno-lint-ignore no-explicit-any
  write(buf: any) {
    buf = Buffer.from(buf);
    this.buffer = Buffer.concat([this.buffer, buf]);
  }
}

export class Unsigned {
  static read(stream: MockStream) {
    return Unsigned.readBn(stream).toString();
  }
  static readBn(stream: MockStream) {
    const num = new Bn(0);
    let shift = 0;
    let byt;
    while (true) {
      byt = stream.read(1)[0];
      num.ior(new Bn(byt & 0x7f).shln(shift));
      if (byt >> 7 === 0) {
        break;
      } else {
        shift += 7;
      }
    }
    return num;
  }
  static write(number: number | string, stream: MockStream) {
    const num = new Bn(number);
    while (true) {
      const i = num.maskn(7).toNumber();
      num.ishrn(7);
      if (num.isZero()) {
        stream.write([i]);
        break;
      } else {
        stream.write([i | 0x80]);
      }
    }
  }
  static encode(num: string | number): Buffer {
    const stream = new MockStream();
    Unsigned.write(num, stream);
    return stream.buffer;
  }
  static decode(buffer: Buffer): string {
    return Unsigned.read(new MockStream(buffer))!;
  }
}

export class Signed {
  static read(stream: MockStream) {
    return Signed.readBn(stream).toString();
  }
  static readBn(stream: MockStream) {
    const num = new Bn(0);
    let shift = 0;
    let byt;
    while (true) {
      byt = stream.read(1)[0];
      num.ior(new Bn(byt & 0x7f).shln(shift));
      shift += 7;
      if (byt >> 7 === 0) {
        break;
      }
    }
    if (byt & 0x40) {
      num.setn(shift);
    }
    return num.fromTwos(shift);
  }
  static write(number: number | string, stream: MockStream) {
    const isNegOne = (num: Bn) => isNeg && num.toString(2)!.indexOf("0") < 0;

    let num = new Bn(number);
    const isNeg = num.isNeg();
    if (isNeg) {
      num = num.toTwos(num.bitLength() + 8);
    }
    while (true) {
      const i = num.maskn(7).toNumber();
      num.ishrn(7);
      if (
        (isNegOne(num) && (i & 0x40) !== 0) ||
        (num.isZero() && (i & 0x40) === 0)
      ) {
        stream.write([i]);
        break;
      } else {
        stream.write([i | 0x80]);
      }
    }
  }
  static encode(num: string | number): Buffer {
    const stream = new MockStream();
    Signed.write(num, stream);
    return stream.buffer;
  }
  static decode(buffer: Buffer): string {
    return Signed.read(new MockStream(buffer));
  }
}
export class Leb128 {
  static unsigned = Unsigned;
  static signed = Signed;
}
