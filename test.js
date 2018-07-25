import DataStruct from '../js-transaction-object';
import Client from './src/client';
import DataClient from './src/dataclient';

//let obj = new DataStruct();
//let data = obj.data;

let client = new Client({
  CommunicatorOptions: {
    url: 'ws://localhost:8081'
  }
})

let start = new Date();

console.log("START dataclient");
/*
let t = new Date().getTime();
for(let i = 0; i < 100*1000; i++){
  data.a.a1 = i;
}
console.log(new Date().getTime() - t);
*/
