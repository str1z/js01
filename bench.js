const js01 = require("./js01");

const user01 = js01({
  user: "8",
  pass: "8",
  age: 8,
});

const data = {
  user: "Bobby",
  pass: "Some password",
  age: 50,
  gender: "male",
};
// for (let i = 0; i < 30; i++)
//   data.push({
//     user: "Bobby",
//     pass: "Some password",
//     age: 50,
//     gender: "male",
//   });

let elapsed;
const ops = 2e6;
let start;

function testJS01() {
  //JS01
  start = Date.now();
  //   for (let i = 0; i < ops; i++) user01.tryDecode(user01.encode(data));
  //   for (let i = 0; i < ops; i++) user01.tryDecode(user01.encode(data));
  for (let i = 0; i < ops; i++) user01.encode(data);

  elapsed = Date.now() - start;
  console.log(`JS01: ${elapsed}ms, ${ops / elapsed} ops/ms`);
}

function testJSON() {
  //JSON
  start = Date.now();
  //   for (let i = 0; i < ops; i++) JSON.parse(JSON.stringify(data));
  //   for (let i = 0; i < ops; i++) JSON.parse(JSON.stringify(data));
  for (let i = 0; i < ops; i++) JSON.stringify(data);

  elapsed = Date.now() - start;
  console.log(`JSON: ${elapsed}ms, ${ops / elapsed} ops/ms`);
}

testJS01();
testJSON();
testJS01();
testJSON();
testJS01();
testJSON();
testJS01();
testJSON();
