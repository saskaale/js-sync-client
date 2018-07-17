import DataStruct from '../js-transaction-object';
import Client from './src/client';
import DataClient from './src/dataclient';

let obj = new DataStruct();
let data = obj.data;

let client = new Client({
  CommunicatorOptions: {
    url: 'ws://localhost:8081'
  }
})

let start = new Date();

console.log("START dataclient");

new DataClient(client, obj)
.connected(() => {
  console.log("object from data is");
  setInterval(() => {
    process.stdout.clearLine();  // clear current text
    process.stdout.cursorTo(0);
    process.stdout.write(JSON.stringify(obj.immutable.toJSON()));
  }, 500);
//  console.log(new Date().getTime() - start.getTime());
/*  delete data.a.a2;

  data.a.a2 = {c:1};

  for(let i = 0; i < 5; i++){
    data.a.a1++;
  }*/
});

/*
let t = new Date().getTime();
for(let i = 0; i < 100*1000; i++){
  data.a.a1 = i;
}
console.log(new Date().getTime() - t);
*/
