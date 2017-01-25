class Test {
  constructor() {
    this._bananas = [];
  }
  populate() {
    for(var i of [1,2,3,4,5]) {
      this._bananas.push(i);
    }
    console.log("Test populated");
  }
  get bananas() {
    return this._bananas.filter( banana => banana.isRipe );
  }
  set bananas(bananas) {
    if (bananas.length > 100) {
      throw `Wow ${bananas.length} is a lot of bananas!`;
    }
    this._bananas = bananas;
  }
}