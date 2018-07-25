import {REQUEST_LOADALL, REQUEST_CLIENTCHANGE, REQUEST_SERVERCHANGE} from './constants';
import {merger} from '../../js-transaction-object';
import Connected from './utils/connected';
import uuidv1 from 'uuid/v1';

export default Connected(class DataClient{
  constructor(conf = {}){
    let {client, datastruct, name, internal} = conf;
    this.uuid = uuidv1();
    this.struct_uuid = name;

    this.client = client;
    this.datastruct = datastruct;

    this._requests = {
      [REQUEST_SERVERCHANGE] : this.requestServerDatachange.bind(this)
    };

    this._waitUntil(() => {
      let action = () => {
        this.request(REQUEST_LOADALL, {s:this.struct_uuid}).then(d=>{
          console.log("LOADED DATA FROM REQUEST");
          console.log(d);
//        this.datastruct.subscribe(this.dataChange.REQUEST_LOADALL, {s:this.struct_uuid}).then(d=>{
          this.datastruct.fromJS(d);
          this._loaded();
        });

        this.client.registerListener(this.uuid, this.dataListener.bind(this));
      };
      internal ? action() : this.client.connected(action);
    });
  }
  request(type, data = undefined){
    return this.client.request(type, {s: this.struct_uuid, d:data});
  }
  dataListener(data){
    if(this._requests[data.t])
      this._requests[data.t](data.d);
  }
  dataChange(uuid,diff){
    /**** TODO: rewrite this to not use a callback for better performance ****/
    this.client.request(REQUEST_CLIENTCHANGE,{
      diff,
      uuid,
      tm: this.client.ntpservice.getTime()
    });
  }
  requestServerDatachange(d){
    console.log("SERVER sent datachange");
    console.log(d);
    merger(this.datastruct, d.d);
  }
});
