const WebSocket = require('websocket').w3cwebsocket;
import uuidv1 from 'uuid/v1';
import Connected from './utils/connected';

export default Connected(class Communicator{
  constructor(options, onMessage){
    this._requests = new Map();
    this.connection = new WebSocket(options.url);

    this._connect();
  }
  _connect(){
    this._waitUntil(() => {
      this.connection.onopen = (evt) => {
        this._loaded();
      }
      this.connection.onclose = (evt) => {
      }
      this.connection.onmessage = this._parseMessage.bind(this);
    });
  }
  _parseMessage(response){
    let d = JSON.parse(response.data);
    if(d.k){
      const promise = this._requests.get(d.k);
      if(promise){
        promise.resolve(d);
        this._requests.delete(d.k);
      }
    }
  }
  request(type, request = {}){
    request.t = type;
    if(!request.k) request.k = uuidv1();
    return new Promise((resolve, reject) => {
      console.log(JSON.stringify(request));
      this._requests.set(request.k, {resolve, reject});
      this.send(request);
    });
  }
  send(data){
    this.connection.send(JSON.stringify(data));
  }
  close(){
    this.connection.close();
  }
});
