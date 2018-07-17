import {REQUEST_LOADALL, REQUEST_DATACHANGE, REQUEST_APPLYCHANGE} from './constants';
import Connected from './utils/connected';
import uuidv1 from 'uuid/v1';

export default Connected(class DataClient{
  constructor(client, datastruct){
    this.uuid = uuidv1();

    this.client = client;
    this.datastruct = datastruct;

    this._requests = {
      [REQUEST_APPLYCHANGE] : this.requestServerDatachange.bind(this)
    };

    this._waitUntil(() => {
      this.client.connected(() => {
        this.datastruct.subscribe(this.dataChange.bind(this));
        this.client.request(REQUEST_LOADALL).then(d=>{
          this.datastruct.fromJS(d);
          this._loaded();
        });

        this.client.registerListener(this.uuid, this.dataListener.bind(this));
      });
    });
  }
  dataListener(data){
    if(this._requests[data.t])
      this._requests[data.t](data.d);
  }
  dataChange(uuid,diff){
    /**** TODO: rewrite this to not use a callback for better performance ****/
    this.client.request(REQUEST_DATACHANGE,{
      diff,
      uuid,
      tm: this.client.ntpservice.getTime()
    });
  }
  requestServerDatachange(d){
    console.log("SERVER sent datachange");
    console.log(d);
  }
});
