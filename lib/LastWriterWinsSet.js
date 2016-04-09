var LastWriterWinsSet = function(ident) {
  this._ident = ident;

  this._valuesMap = {};
  this._values = [];
};

LastWriterWinsSet.prototype.getState = function () {
  var state = [];
  var valuesMap = this._valuesMap;
  for (var key in valuesMap) {
    var item = valuesMap[key];
    state.push({
      val: item.val,
      flag: item.flag,
      timestamp: item.timestamp,
      ident: item.ident
    });
  }

  return state;
};

LastWriterWinsSet.prototype.merge = function (state) {
  for (var i = 0; i < state.length; i++) {
    var item = state[i];
    var currentItem = this._valuesMap[item.val];
    if (typeof currentItem === 'undefined' ||
        currentItem.timestamp < item.timestamp ||
        (currentItem.ident > item.ident && currentItem.timestamp === item.timestamp)) {
      this._valuesMap[item.val] = {
        val: item.val,
        flag: item.flag,
        timestamp: item.timestamp,
        ident: item.ident
      };
    }
  }
  this._values = undefined;
};

LastWriterWinsSet.prototype.getValue = function () {
  if (typeof this._values === 'undefined') {
    this._values = [];
    for (var key in this._valuesMap) {
      var item = this._valuesMap[key];
      if (item.flag === true) {
        this._values.push(item.val);
      }
    }
  }
  return this._values;
};

LastWriterWinsSet.prototype.add = function (val) {
  this._valuesMap[val] = {
    val: val,
    flag: true,
    timestamp: Date.now(),
    ident: this._ident
  };
  this._values = undefined;
};

LastWriterWinsSet.prototype.remove = function (val) {
  this._valuesMap[val] = {
    val: val,
    flag: false,
    timestamp: Date.now(),
    ident: this._ident
  };
  this._values = undefined;
};

module.exports = LastWriterWinsSet;