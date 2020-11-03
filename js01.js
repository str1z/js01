const js01 = (type) => {
  let t = js01.buildT(type);
  let c = {
    decode: new Function("bin", `"use strict"; let p = 0, len = 0, data, dv = new DataView(bin); ${t.read("data", 0)} return data`),
    encode: new Function("data", `"use strict"; let p = 0, len = 0, buf = new ArrayBuffer(${t.size("data", 0)}), dv = new DataView(buf); ${t.write("data", 0)} return buf`),
  };
  c.tryDecode = (bin) => {
    try {
      return c.decode(bin);
    } catch {
      return null;
    }
  };
  return c;
};
js01.buildT = (t) => {
  if (t === 8) return js01.T.u8;
  if (t === 16) return js01.T.u16;
  if (t === 32) return js01.T.u32;
  if (t === -8) return js01.T.i8;
  if (t === -16) return js01.T.i16;
  if (t === -32) return js01.T.i32;
  if (t === 0.32) return js01.T.f32;
  if (t === 0.64) return js01.T.f64;
  if (typeof t === "boolean") return js01.T.bool;
  if (typeof t === "string") {
    if (t.startsWith("len:")) {
      let args = t.substring(4).split(" ");
      return js01.T.fstr(+args.pop(), ...args.map((v) => js01.buildT(+v)));
    }
    return js01.T.str(...t.split(" ").map((v) => js01.buildT(+v)));
  }
  if (t.size && t.read && t.write) return t;
  if (t === Boolean) return js01.T.bool;
  if (t === Number) return js01.T.f32;
  if (t === String) return js01.T.str(js01.T.u16);
  if (t instanceof Array)
    if (t.length == 1) return js01.T.arr(js01.buildT(t[0]));
    else return js01.T.tup(...t.map((t) => js01.buildT(t)));
  if (t instanceof Object) {
    let obj = {};
    Object.keys(t).forEach((key) => (obj[key] = js01.buildT(t[key])));
    return js01.T.obj(obj);
  }
};
js01.T = {};
js01.T.bool = {
  size: () => "1",
  read: (loc) => `${loc} = Boolean(dv.getUint8(p++));`,
  write: (loc) => `dv.setUint8(p++, +${loc});`,
};
js01.T.u8 = {
  size: () => "1",
  read: (loc) => `${loc} = dv.getUint8(p++);`,
  write: (loc) => `dv.setUint8(p++, ${loc});`,
};
js01.T.u16 = {
  size: () => "2",
  read: (loc) => `${loc} = dv.getUint16(p); p+=2;`,
  write: (loc) => `dv.setUint16(p, ${loc}); p+=2;`,
};
js01.T.u32 = {
  size: () => "4",
  read: (loc) => `${loc} = dv.getUint32(p); p+=4;`,
  write: (loc) => `dv.setUint32(p, ${loc}); p+=4;`,
};
js01.T.i8 = {
  size: () => "1",
  read: (loc) => `${loc} = dv.getInt8(p++);`,
  write: (loc) => `dv.setInt8(p++, ${loc});`,
};
js01.T.i16 = {
  size: () => "2",
  read: (loc) => `${loc} = dv.getInt16(p); p+=2;`,
  write: (loc) => `dv.setInt16(p, ${loc}); p+=2;`,
};
js01.T.i32 = {
  size: () => "4",
  read: (loc) => `${loc} = dv.getInt32(p); p+=4;`,
  write: (loc) => `dv.setInt32(p, ${loc}); p+=4;`,
};
js01.T.f32 = {
  size: () => "4",
  read: (loc) => `${loc} = dv.getFloat32(p); p+=4;`,
  write: (loc) => `dv.setFloat32(p, ${loc}); p+=4;`,
};
js01.T.f64 = {
  size: () => "8",
  read: (loc) => `${loc} = dv.getFloat64(p); p+=8;`,
  write: (loc) => `dv.setFloat64(p, ${loc}); p+=8;`,
};
js01.T.fstr = (len, t = js01.T.u8) => ({
  size: () => `${len}`,
  read: (loc) => `${loc} = ""; for (let i = 0; i < ${len}; i++) { let ${t.read("temp")} ${loc} += String.fromCharCode(temp) };`,
  write: (loc) => `for(let i = 0; i < ${len}; i++) ${t.write(loc + ".charCodeAt(i)")}`,
});
js01.T.str = (t = js01.T.u8, h = js01.T.u8) => ({
  fluid: true,
  size: (loc) => `${h.size()} + ${loc}.length * ${t.size()}`,
  read: (loc) => `${h.read("len")} ${loc} = ""; for (let i = 0; i < len; i++) { let ${t.read("temp")} ${loc} += String.fromCharCode(temp) };`,
  write: (loc) => `len = ${loc}.length; ${h.write("len")} for(let i = 0; i < len; i++) ${t.write(loc + ".charCodeAt(i)")}`,
});
js01.T.tup = (...types) => {
  let tup = {
    size: (loc, n) => types.map((t, i) => t.size(loc + `[${i}]`, n + 1)).join(" + "),
    read: (loc, n) => `${loc} = [];` + types.map((t, i) => t.read(loc + `[${i}]`, n)).join(""),
    write: (loc, n) => types.map((t, i) => t.write(loc + `[${i}]`, n)).join(""),
  };
  for (let t of types) if (t.fluid) tup.fluid = true;
  return tup;
};
js01.T.obj = (schema) => {
  let keys = Object.keys(schema);
  let obj = {
    size: (loc, n) => keys.map((key) => schema[key].size(loc + `["${key}"]`, n + 1)).join(" + "),
    read: (loc, n) => `${loc} = {};` + keys.map((key) => schema[key].read(loc + `["${key}"]`, n + 1)).join(""),
    write: (loc, n) => keys.map((key) => schema[key].write(loc + `["${key}"]`, n + 1)).join(""),
  };
  for (let key in schema) if (schema[key].fluid) obj.fluid = true;
  return obj;
};
js01.T.arr = (t = js01.T.u8, h = js01.T.u8) => {
  let arr = {
    fluid: true,
    size: t.fluid ? (loc, n) => `${h.size()} + ${loc}.reduce((acc, v, i${n}) => acc + ${t.size(`${loc}[i${n}]`, n + 1)}, 0)` : (loc) => `${h.size()} + ${loc}.length * ${t.size()}`,
    read: (loc, n) => `${h.read("len", n + 1)} ${loc} = []; for (let i${n} = 0; i${n} < len; i${n}++) { let len = 0; ${t.read(`${loc}[i${n}]`, n + 1)} };`,
    write: (loc, n) => `len = ${loc}.length; ${h.write("len", n + 1)} for(let i${n} = 0; i${n} < len; i${n}++) { let len = 0; ${t.write(loc + `[i${n}]`, n + 1)} };`,
  };
  return arr;
};
if (typeof module !== "undefined") module.exports = js01;
