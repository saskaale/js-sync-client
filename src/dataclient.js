import {REQUEST_LOADALL, REQUEST_CLIENTCHANGE, REQUEST_SERVERCHANGE} from './constants';
import {merger, MERGER_STRATEGIES} from '../../js-transaction-object';
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

    this._subscriber = (d) => {
      const {srcuuid} = d;
      this.request(REQUEST_CLIENTCHANGE, d)
          .then(({applied})=>{
            if(!applied){
                this.datastruct.rollback(srcuuid);
            }
          }).catch(d=>{
//            console.log('REQUEST catch');
          });
    };

    console.log("DATACLIENT "+name);


    this._waitUntil(() => {
      let action = () => {
        console.log("SUBSCRIBE TO "+name);
        this.loadAll().then( () => {
          console.log("AFTER CONNECTED SUBSCRIBE TO "+name);
          this._unsubscribe = this.datastruct.subscribe(this._subscriber);
          this._loaded();
        } );
      };
      internal ? action() : this.client.connected(action);
    });
  }
  async loadAll(){
    let d = await this.request(REQUEST_LOADALL);
    this.datastruct.fromJS(d);
    return d;
  }
  async reset(){
    await this.loadAll();
  }
  request(type, data = undefined){
    return this.client.request(type, {s: this.struct_uuid, d:data});
  }
  doRequest(data){
    if(this._requests[data.t])
      return this._requests[data.t](data.d);
    return {"status": "success"};
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
    return merger(
      this.datastruct,
      d,
      {
        skipSubscribers : new Set([this._subscriber]),
        strategy        : MERGER_STRATEGIES.REMOTE
      }
    );
  }
});
