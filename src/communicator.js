const WebSocket = require('websocket').w3cwebsocket;
import uuidv1 from 'uuid/v1';
import Connected from './utils/connected';
import {serialize, deserialize} from './utils/serializer';

export default Connected(class Communicator{
  constructor(options, listener){
    this._requests = new Map();
    this._options = options;

    if(this._options.VERBOSE)
      console.log('created ws client class');

    this.connection = new WebSocket(options.url);
    this._listener = listener

    this._connect();
  }
  _connect(){
    this._waitUntil(() => {
      this.connection.onopen = (evt) => {
          if(this._options.VERBOSE)
            console.log('ws client connected');
  
          this._loaded();
      }
      this.connection.onclose = (evt) => {
      }
      this.connection.onmessage = this._parseMessage.bind(this);
    });
  }
  _parseMessage(response){
    if(this._options.VERBOSE)
      console.log('received msg >>>'+response.data+'<<<');
    let d = deserialize(response.data);
    if(d.k){
      const promise = this._requests.get(d.k);
      if(promise){
        promise.resolve(d.d);
        this._requests.delete(d.k);
        return;
      }
    }
    this._listener(d);
  }
  request(type, request = {}){
    if(this._options.VERBOSE)
      console.log('do request '+type+' >>>'+JSON.stringify(request)+'<<<');
    request.t = type;
    if(!request.k) request.k = uuidv1();
    return new Promise((resolve, reject) => {
      this._requests.set(request.k, {resolve, reject});
      this.send(request);
    });
  }
  send(data){
    if(this._options.VERBOSE)
      console.log('send to server >>>'+data+'<<<');
    this.connection.send(serialize(data));
  }
  close(){
    if(this._options.VERBOSE)
      console.log('ws client closed');
    this.connection.close();
  }
});
