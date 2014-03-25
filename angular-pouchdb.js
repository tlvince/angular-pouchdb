angular.module('pouchdb', [])
  .factory('pouchdb', function($q, $rootScope, $window) {
    var qify = function(fn) {
      return function() {
        var args, callback, deferred;
        deferred = $q.defer();
        callback = function(err, res) {
          return $rootScope.$apply(function() {
            if (err) {
              return deferred.reject(err);
            } else {
              return deferred.resolve(res);
            }
          });
        };
        args = arguments !== null ? slice.call(arguments) : [];
        args.push(callback);
        fn.apply(this, args);
        return deferred.promise;
      };
    };

    return {
      create: function(name, options) {
        var db;
        db = new $window.PouchDB(name, options);
        return {
          id: db.id,
          put: qify(db.put.bind(db)),
          post: qify(db.post.bind(db)),
          get: qify(db.get.bind(db)),
          remove: qify(db.remove.bind(db)),
          bulkDocs: qify(db.bulkDocs.bind(db)),
          allDocs: qify(db.allDocs.bind(db)),
          changes: function(options) {
            var clone;
            clone = angular.copy(options);
            clone.onChange = function(change) {
              return $rootScope.$apply(function() {
                return options.onChange(change);
              });
            };
            return db.changes(clone);
          },
          putAttachment: qify(db.putAttachment.bind(db)),
          getAttachment: qify(db.getAttachment.bind(db)),
          removeAttachment: qify(db.removeAttachment.bind(db)),
          query: qify(db.query.bind(db)),
          info: qify(db.info.bind(db)),
          compact: qify(db.compact.bind(db)),
          revsDiff: qify(db.revsDiff.bind(db)),
          replicate: {
            to: function(remote, options) {
              return db.replicate.to(remote, options);
            },
            from: function(remote, options) {
              return db.replicate.from(remote, options);
            },
            sync: function(remote, options) {
              return db.replicate.sync(remote, options);
            }
          },
          destroy: qify(db.destroy.bind(db))
        };
      }
    };
  });
