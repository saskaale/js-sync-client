import Communicator from './communicator';
import NTPprotocol from './ntp';
import Connected from './utils/connected';
import DataClient from './dataClient';
import DataStruct from '../../js-transaction-object';

const defaultConf = {
  Communicator,
  CommunicatorOptions: {
    VERBOSE: 1
  }
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

        //dataClient for the info object
        new DataClient({client: this, datastruct: this.config, name: null, internal: true})
        .connected(() => {
          this.ntpservice.connected(this._loaded.bind(this));

          console.log("object from data is");
          setInterval(() => {
            process.stdout.clearLine();  // clear current text
            process.stdout.cursorTo(0);
            process.stdout.write(JSON.stringify(this.config.immutable.toJSON()));
          }, 500);
        });

      });
      this.request = this.communicator.request.bind(this.communicator);
    });

    this.config = new DataStruct();

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
