var assert = require('assert');

var IdGenerator = require('../lib/IdGenerator');

var EXPECTED_ID_PATTERN = /^(?:[a-zA-Z0-9\:\;]+(?:\.+[a-z0-9\#]*)\.*?)(?:\/[a-zA-Z0-9\:\;]+(?:\.+[a-z0-9\#]*)?\.*)*\/$/;
var TEST_ITERATIONS = 100;
var ID_LENGTH = 4;

describe('IdGenerator', function() {
  var min = IdGenerator.getMin(ID_LENGTH);
  var max = IdGenerator.getMax(ID_LENGTH);

  it("should return valid min and max", function() {
    assert.equal(IdGenerator.stringify(min), '0000/');
    assert.equal(IdGenerator.stringify(max), 'zzzz/');
  });

  it("should convert between number and string", function() {
    for (var i = 0; i < TEST_ITERATIONS; i++) {
      var num = Math.floor(Math.random() * (Math.pow(64, ID_LENGTH) - 1))
      var numAsString = IdGenerator.numberToString(num, ID_LENGTH);
      assert.equal(IdGenerator.stringToNumber(numAsString), num);
    }
  });

  it("should generate id of length", function() {
    var siteDisambiguator = 'siteA';
    var id = IdGenerator.generate(siteDisambiguator, ID_LENGTH);
    var expectedLength = siteDisambiguator.length +
      1 + /* Disambiguator delimiter */
      1 + /* Trailing slash */
      ID_LENGTH;
    assert.equal(IdGenerator.stringify(id).length, expectedLength, IdGenerator.stringify(id) + " should have length of " + expectedLength);
  });

  it("should generate ids between undefined and undefined", function() {
    for (var i = 0; i < TEST_ITERATIONS; i++) {
      var id = IdGenerator.generate('siteA', ID_LENGTH);
      assert.equal(IdGenerator.compare(min, id), -1);
      assert.equal(IdGenerator.compare(max, id), 1);
    }
  });

  it("should generate ids between undefined and id", function() {
    var maxId = IdGenerator.generate('siteA', ID_LENGTH);
    for (var i = 0; i < TEST_ITERATIONS; i++) {
      var id = IdGenerator.generate('siteA', ID_LENGTH, null, maxId);
      assert.equal(IdGenerator.compare(min, id), -1);
      assert.equal(IdGenerator.compare(maxId, id), 1);
    }
  });

  it("should not generate ids between undefined and min", function() {
    var maxId = IdGenerator.getMin(ID_LENGTH);
    try {
      var id = IdGenerator.generate('siteA', ID_LENGTH, null, maxId);
      assert(false);
    } catch (e) {}
  });

  it("should not generate ids between max and undefined", function() {
    var maxId = IdGenerator.getMax(ID_LENGTH);
    try {
      var id = IdGenerator.generate('siteA', ID_LENGTH, maxId, null);
      assert(false);
    } catch (e) {}
  });

  it("should not generate ids between identical keys", function() {
    var maxId = IdGenerator.generate('siteA', ID_LENGTH);
    try {
      var id = IdGenerator.generate('siteA', ID_LENGTH, maxId, minId);
      assert(false);
    } catch (e) {}
  });

  it("should generate ids between id and undefined", function() {
    var minId = IdGenerator.generate('siteA', ID_LENGTH);
    for (var i = 0; i < TEST_ITERATIONS; i++) {
      var id = IdGenerator.generate('siteA', ID_LENGTH, minId, null);
      assert.equal(IdGenerator.compare(minId, id), -1);
      assert.equal(IdGenerator.compare(max, id), 1);
    }
  });

  it("should generate ids between id and id", function() {
    var minId = IdGenerator.generate('siteA', ID_LENGTH);
    var maxId = IdGenerator.generate('siteA', ID_LENGTH, minId, null);
    for (var i = 0; i < TEST_ITERATIONS; i++) {
      var id = IdGenerator.generate('siteA', ID_LENGTH, minId, maxId);
      assert.equal(IdGenerator.compare(minId, id), -1);
      assert.equal(IdGenerator.compare(maxId, id), 1);
    }
  });

  it("should generate ids between id,siteA and id,siteB", function() {
    var minId = IdGenerator.generate('siteA', ID_LENGTH);
    var maxId = [minId[0], 'siteB'];
    for (var i = 0; i < TEST_ITERATIONS; i++) {
      var id = IdGenerator.generate('siteA', ID_LENGTH, minId, maxId);
      assert.equal(IdGenerator.compare(minId, id), -1, IdGenerator.stringify(minId) + ' < ' + IdGenerator.stringify(id));
      assert.equal(IdGenerator.compare(maxId, id), 1, IdGenerator.stringify(id) + ' < ' + IdGenerator.stringify(maxId));
    }
  });

  it("should generate ids between id-siteA/aaaa and id-siteB/aaaa", function() {
    var minId = IdGenerator.generate('siteA', ID_LENGTH);
    var maxId = [].concat(minId);
    minId[0] += '.siteA/aaaa';
    maxId[0] += '.siteB/aaaa';
    for (var i = 0; i < TEST_ITERATIONS; i++) {
      var id = IdGenerator.generate('siteA', ID_LENGTH, minId, maxId);
      assert.equal(IdGenerator.compare(minId, id), -1, IdGenerator.stringify(minId) + ' < ' + IdGenerator.stringify(id));
      assert.equal(IdGenerator.compare(maxId, id), 1), IdGenerator.stringify(id) + ' < ' + IdGenerator.stringify(maxId);
    }
  });

  it("should generate ids between id and id!siteB/aaaa", function() {
    var minId = IdGenerator.generate('siteA', ID_LENGTH);
    var maxId = [minId[0] + '.siteB/aaaa', 'siteB'];
    for (var i = 0; i < TEST_ITERATIONS; i++) {
      var id = IdGenerator.generate('siteA', ID_LENGTH, minId, maxId);
      assert.equal(IdGenerator.compare(minId, id), -1, IdGenerator.stringify(minId) + ' < ' + IdGenerator.stringify(id));
      assert.equal(IdGenerator.compare(maxId, id), 1, IdGenerator.stringify(id) + ' < ' + IdGenerator.stringify(maxId));
    }
  });

  it("should generate ids between id/aaaa and id", function() {
    var minId = IdGenerator.generate('siteA', ID_LENGTH);
    minId[0] += '/aaaa';
    var maxId = IdGenerator.generate('siteA', ID_LENGTH, minId, null);
    for (var i = 0; i < TEST_ITERATIONS; i++) {
      var id = IdGenerator.generate('siteA', ID_LENGTH, minId, maxId);
      assert.equal(IdGenerator.compare(minId, id), -1, IdGenerator.stringify(minId) + ' < ' + IdGenerator.stringify(id));
      assert.equal(IdGenerator.compare(maxId, id), 1, IdGenerator.stringify(id) + ' < ' + IdGenerator.stringify(maxId));
    }
  });

  it("should generate ids between id and id!siteA/bbbb", function() {
    var minId = IdGenerator.generate('siteA', ID_LENGTH);
    var maxId = IdGenerator.generate('siteA', ID_LENGTH, minId, null);
    maxId[0] += '.siteA/bbbb';
    for (var i = 0; i < TEST_ITERATIONS; i++) {
      var id = IdGenerator.generate('siteA', ID_LENGTH, minId, maxId);
      assert.equal(IdGenerator.compare(minId, id), -1, IdGenerator.stringify(minId) + ' < ' + IdGenerator.stringify(id));
      assert.equal(IdGenerator.compare(maxId, id), 1, IdGenerator.stringify(id) + ' < ' + IdGenerator.stringify(maxId));
    }
  });

  it("should generate ids between id!siteA/aaaa and id!siteB/ffff", function() {
    var minId = IdGenerator.generate('siteA', ID_LENGTH);
    var maxId = [].concat(minId);
    minId[0] += '.siteA/aaaa';
    maxId[0] += '.siteB/ffff';
    for (var i = 0; i < TEST_ITERATIONS; i++) {
      var id = IdGenerator.generate('siteA', ID_LENGTH, minId, maxId);
      assert.equal(IdGenerator.compare(minId, id), -1, IdGenerator.stringify(minId) + ' < ' + IdGenerator.stringify(id));
      assert.equal(IdGenerator.compare(maxId, id), 1, IdGenerator.stringify(id) + ' < ' + IdGenerator.stringify(maxId));
    }
  });

  it("should generate ids between id/subId and id/subId", function() {
    var minId = IdGenerator.generate('siteA', ID_LENGTH);
    var maxId = [].concat(minId);
    minId[0] += '.siteA/aaaa';
    maxId[0] += '.siteA/ffff';
    for (var i = 0; i < TEST_ITERATIONS; i++) {
      var id = IdGenerator.generate('siteA', ID_LENGTH, minId, maxId);
      assert.equal(IdGenerator.compare(minId, id), -1, IdGenerator.stringify(minId) + ' < ' + IdGenerator.stringify(id));
      assert.equal(IdGenerator.compare(maxId, id), 1, IdGenerator.stringify(id) + ' < ' + IdGenerator.stringify(maxId));
    }
  });

  it("should insert a bunch of 1-character ids without a problem", function() {
    var sites = ['s0', 's1', 's2', 's3'];
    var ids = [
      IdGenerator.generate(sites[Math.floor(Math.random() * sites.length)], 1),
      IdGenerator.generate(sites[Math.floor(Math.random() * sites.length)], 1)
    ];
    var comparator = IdGenerator.compare.bind(IdGenerator);

    for (var i = 0; i < 20000; i++) {
      var id1 = ids[Math.floor(Math.random() * ids.length)];
      var id1String = IdGenerator.stringify(id1);
      var id2 = ids[Math.floor(Math.random() * ids.length)];
      var id2String = IdGenerator.stringify(id2);
      var compareVal = IdGenerator.compare(id1, id2);
      if (id1String === id2String) {
        i--;
      } else {
        var randomSite = sites[Math.floor(Math.random() * sites.length)];
        var minId = compareVal === -1 ? id1 : id2;
        var maxId = compareVal === -1 ? id2 : id1;
        var newId = IdGenerator.generate(randomSite, 1, minId, maxId);
        var newIdString = IdGenerator.stringify(newId);
        assert.equal(Array.isArray(newIdString.match(EXPECTED_ID_PATTERN)), true, newIdString + "should match the id pattern");
        assert.equal(IdGenerator.compare(id1, newId), compareVal, newIdString + " should be between " + IdGenerator.stringify(minId) + " and " + IdGenerator.stringify(maxId));
        assert.equal(IdGenerator.compare(newId, id2), compareVal, newIdString + " should be between " + IdGenerator.stringify(minId) + " and " + IdGenerator.stringify(maxId));
        ids.push(newId);
      }
    }
  });

  it("should insert a bunch of 4-character ids without a problem", function() {
    var sites = ['s0', 's1', 's2', 's3'];
    var ids = [
      IdGenerator.generate(sites[Math.floor(Math.random() * sites.length)], 4),
      IdGenerator.generate(sites[Math.floor(Math.random() * sites.length)], 4)
    ];
    var comparator = IdGenerator.compare.bind(IdGenerator);

    for (var i = 0; i < 20000; i++) {
      var id1 = ids[Math.floor(Math.random() * ids.length)];
      var id1String = IdGenerator.stringify(id1);
      var id2 = ids[Math.floor(Math.random() * ids.length)];
      var id2String = IdGenerator.stringify(id2);
      var compareVal = IdGenerator.compare(id1, id2);
      if (id1String === id2String) {
        i--;
      } else {
        var randomSite = sites[Math.floor(Math.random() * sites.length)];
        var minId = compareVal === -1 ? id1 : id2;
        var maxId = compareVal === -1 ? id2 : id1;
        var newId = IdGenerator.generate(randomSite, 4, minId, maxId);
        var newIdString = IdGenerator.stringify(newId);
        assert.equal(Array.isArray(newIdString.match(EXPECTED_ID_PATTERN)), true, newIdString + "should match the id pattern");
        assert.equal(IdGenerator.compare(id1, newId), compareVal, newIdString + " should be between " + IdGenerator.stringify(minId) + " and " + IdGenerator.stringify(maxId));
        assert.equal(IdGenerator.compare(newId, id2), compareVal, newIdString + " should be between " + IdGenerator.stringify(minId) + " and " + IdGenerator.stringify(maxId));
        ids.push(newId);
      }
    }
  });

});
