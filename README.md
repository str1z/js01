# js01

Fast and simple protocol buffers in Javascript.

## Usage

```js
const myUserSchema = js01({
  name: "8", // for utf8 encoding
  someOtherName: "16", // for utf16 encoding
  age: 8, // for uint8,
  number: 0.64, // for float64
  isAdult: true, // boolean value for boolean type
  object: {
    os: "8"
    // more stuff here
  },
  array: [8], // array of uint8, max length 255
  range: -8, // int8, negative sign for signed integers
  // use js01.T for more types and customizibilty
});

let someUser = {
    name: "Bob",
    someOtherName: "你好"，
    age: 40,
    number: 123.456,
    isAdult: true,
    object: {
        os: "linux"
    },
    array: [1,2,3,4,5,6],
    range: -100
}

let arrayBuffer = myUserSchema.encode(someUser)
let decoded = myUserSchema.decode(arrayBuffer)
```

## Types

All the types are under js01.T

| name   | type           | shorthand                |
| ------ | -------------- | ------------------------ |
| T.bool | `bool`         | `true` or `false`        |
| T.u8   | `uint8`        | `8`                      |
| T.u16  | `uint16`       | `16`                     |
| T.u32  | `uint32`       | `32`                     |
| T.i8   | `int8`         | `-8`                     |
| T.i16  | `int16`        | `-16`                    |
| T.i32  | `int32`        | `-32`                    |
| T.f32  | `float32`      | `0.32`                   |
| T.f64  | `float64`      | `0.64`                   |
| T.fstr | `fixed string` | `"len:LENGTH ?ENCODING"` |
| T.str  | `string`       | `"?ENCODING ?HEADER"`    |
| T.tup  | `tuple`        | `[TYPES...]`             |
| T.obj  | `object`       | `{SCHEMA...}`            |
| T.arr  | `array`        | `[TYPE]`                 |
