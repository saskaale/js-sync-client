import {REQUEST_NTP} from './constants';

export default class NTP{
  constructor(communicator){
    this._ready = [];
    this.loaded = false;

    this.refresh = () => {
      /*
       Implementation of the NTP protocol
       */
//      console.log(Constants);
      communicator.request(REQUEST_NTP,
        {
          ct:new Date().getTime()
        }).then((data) => {
          const nowTimeStamp = new Date().getTime();
          const serverClientRequestDiffTime = data.diff;
          const serverTimestamp = data.serverTimestamp;
          const serverClientResponseDiffTime = nowTimeStamp - serverTimestamp;
          const responseTime = (
              serverClientRequestDiffTime
              - nowTimeStamp
              + serverTimestamp
              - serverClientResponseDiffTime
            )/2;

          const syncedServerTime = nowTimeStamp + serverClientResponseDiffTime - responseTime;
          this.servClientdiff = syncedServerTime - new Date().getTime();

          this._onLoad();
      });
    }
    this.refresh();
  }
  _onLoad(){
    if(!this.loaded){
      this.loaded = true;
      this._ready.forEach(f=>f());
    }
  }
  connected(f){
    if(this.loaded){
      f();
    }else{
      this._ready.push(f);
    }
  }
  getTime(){
    return new Date().getTime() + this.servClientdiff;
  }
}
