exports.processCollection = function(collection, processor, complete) {
    var coll = collection.slice(0);
    (function processOne() {
        var item = coll.splice(0, 1)[0];
        try {
            processor(item,function(err) {
                if(err) {
                    return complete(err);
                }
                if (coll.length > 0) setTimeout(processOne,0);
                else return complete();
            });
        } catch (exception) {
            return complete(exception);
        }
  })();
};

exports.decodeBase64Image = function(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
};

// module.exports = db;