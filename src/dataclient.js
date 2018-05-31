import {REQUEST_LOADALL, REQUEST_DATACHANGE} from './constants';
import Connected from './utils/connected';

export default Connected(class DataClient{
  constructor(client, datastruct){
    this.client = client;
    this.datastruct = datastruct;

    this._waitUntil(() => {
      this.client.connected(() => {
        this.datastruct.subscribe(this.dataChange.bind(this));
        this.client.request(REQUEST_LOADALL).then(e=>{
          this._loaded();
        });
      });
    });
  }
  dataChange(uuid,diff){
    console.log('datachange')
    /**** TODO: rewrite this to not use a callback for better performance ****/
    this.client.request(REQUEST_DATACHANGE,{
      change: diff,
      uuid,
      tm: this.client.ntpservice.getTime()
    });
  }
});
