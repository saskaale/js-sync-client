import uuidv1 from 'uuid/v1';
import Connected from './utils/connected';
import {serialize, deserialize} from './utils/serializer';
import EventEmitter from 'wolfy87-eventemitter';

const defaultOptions = {VERBOSE: 1};

export default Connected(class Communicator extends EventEmitter{
  constructor(options, listener){
    super();

    this._requests = new Map();
    this._options = {...defaultOptions, ...options};

    if(this._options.VERBOSE)
      console.log('created ws client class');

    this._listener = listener;
    this._closed = false;

    this._connect();
  }
  _connect(){
    let reconnect = (after) => {
      console.log("reconnect");
      if(this._closed){
        return;
      }

      this.connection = new this._options.WebSocket(this._options.url);
      this.connection.onopen = (evt) => {
        
        console.log("onpen");

        if(this._options.VERBOSE)
          console.log('ws client connected');

        this.emitEvent('open');
        if(after)
          after();
      }
      this.connection.onclose = (evt) => {
        this.emitEvent('close');
        reconnect(() => {
          this.emitEvent('reconnect');
        });
      }
      this.connection.onmessage = this._parseMessage.bind(this);
    };
    
    this._waitUntil(()=>{
      reconnect(this._loaded.bind(this))
    });
  }
  _parseMessage(response){
    if(this._options.VERBOSE)
      console.log('received msg >>>'+response.data+'<<<');
    let d = deserialize(response.data);
    if(d.k){
      const promise = this._requests.get(d.k);
      if(promise){
        if(d.err)
          promise.reject(d);
        else
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
      try{
        this.send(request);
      }catch(e){
        this._requests.delete(request.k);
        reject();
      }
    });
  }
  send(data){
    if(this._options.VERBOSE)
      console.log('send to server >>>'+JSON.stringify(data)+'<<<');
    this.connection.send(serialize(data));
  }
  close(){
    console.log("MANUAL CLOSE");
    if(this._options.VERBOSE)
      console.log('ws client closed');
    this._closed = true;
    this.connection.close();
  }
});
