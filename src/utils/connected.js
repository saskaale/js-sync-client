export default (Parent) => {
  return class extends Parent{
    _waitUntil(f){
      this.INIT_STEPS = this.INIT_STEPS || 0;
      this.INIT_STEPS++;
      f();
    }
    connected(f){
      this._ready = this._ready || [];
      this._initStatus = this._initStatus || 0;
      this.loaded = {};
      this.INIT_STEPS = 1;
      if(this._initStatus < this.INIT_STEPS){
        this._ready.push(f);
      }else{
        f();
      }
    }
    _loaded(k = ""){
      if(!this.loaded[k]){
        this._initStatus++;
      }
      if(this._initStatus >= this.INIT_STEPS){
        this._ready.forEach(f=>f());
        this._ready = [];
      }
    }
  }
}
