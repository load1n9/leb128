# leb128

simple leb128 implementation for deno

```typescript
import { Leb128 } from "https://deno.land/x/leb128/mod.ts";
let encoded = leb128.unsigned.encode("9019283812387");

let decoded = leb128.unsigned.decode(encoded);
console.log(decoded);
// 9019283812387

encoded = leb128.signed.encode("-9019283812387");

decoded = leb128.signed.decode(encoded);
console.log(decoded);
// '-9019283812387'
```

### references

[node leb128](https://gitlab.com/mjbecze/leb128/-/tree/master/)
