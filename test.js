import DataStruct from '../js-transaction-object';
import Client from './src/client';
import DataClient from './src/dataclient';

let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
let data = obj.data;

let client = new Client({
  CommunicatorOptions: {
    url: 'ws://localhost:40510'
  }
})

new DataClient(client, obj)
.connected(() => {
  delete data.a.a2;

  data.a.a2 = {c:1};

  for(let i = 0; i < 5; i++){
    data.a.a1++;
  }
});

/*
let t = new Date().getTime();
for(let i = 0; i < 100*1000; i++){
  data.a.a1 = i;
}
console.log(new Date().getTime() - t);
*/
