import Communicator from './communicator';
import NTPprotocol from './ntp';
import Connected from './utils/connected';

const defaultConf = {
  Communicator,
  CommunicatorOptions: {}
};

export default Connected(class Client{
  constructor(/*datastruct, */options = {}){
    this.options = options = {...defaultConf, ...options};

    this._listeners = {};

    this._waitUntil(() =>{
      this.communicator =
            new options.Communicator(
              options.CommunicatorOptions,
              this.listenData.bind(this));
      this.communicator.connected(()=>{
        this.ntpservice = new NTPprotocol(this.communicator);
        this.ntpservice.connected(this._loaded.bind(this));
      });
      this.request = this.communicator.request.bind(this.communicator);
    });
  }
  registerListener(uuid, cbk){
    this._listeners[uuid] = cbk;
  }
  listenData(data){
    if(data.uuid){
      if(this._listeners[data.uuid])
        this._listeners[data.uuid](data.d);
    }
  }
});
