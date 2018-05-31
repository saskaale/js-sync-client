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

    this._waitUntil(() =>{
      this.communicator =
            new options.Communicator(
              options.CommunicatorOptions,
              this.onMessage);
      this.communicator.connected(()=>{
        this.ntpservice = new NTPprotocol(this.communicator);
        this.ntpservice.connected(this._loaded.bind(this));
      });
      this.request = this.communicator.request.bind(this.communicator);
    });
  }
});
