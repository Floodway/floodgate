var processObject;

processObject = require("./utils").processObject;

module.exports = function(params) {
  var callback, doValidation, failed, item, key, options, path, ref, shortenedObject, toValidate, validate, value;
  options = params.options, callback = params.callback, item = params.item, path = params.path, validate = params.validate;
  doValidation = function(validateItem, children, useKeys, callback) {
    var error;
    error = null;
    return processObject(validateItem, function(key, value, done) {
      var childOptions;
      childOptions = useKeys ? children[key] : children;
      return validate(value, childOptions, path + "." + key, function(err, validatedItem) {
        if (err != null) {
          error = err;
        }
        return done(validatedItem);
      });
    }, function(finalObject) {
      if (error != null) {
        return callback(error, null);
      } else {
        return callback(null, finalObject);
      }
    });
  };
  switch (options.mode) {
    case "partial":
      toValidate = {};
      for (key in item) {
        value = item[key];
        if (options.children[key] != null) {
          toValidate[key] = value;
        }
      }
      return doValidation(toValidate, options.children, true, callback);
    case "ensure":
      toValidate = {};
      for (key in item) {
        value = item[key];
        if (options.children[key] != null) {
          toValidate[key] = value;
        }
      }
      return doValidation(toValidate, options.children, true, function(err, validated) {
        if (err != null) {
          return callback(err);
        } else {
          for (key in item) {
            value = item[key];
            if (validated[key] != null) {
              item[key] = validated[key];
            }
          }
          return callback(null, item);
        }
      });
    case "loose":
      return doValidation(item, options.children, false, callback);
    case "shorten":
      shortenedObject = {};
      failed = false;
      ref = options.children;
      for (key in ref) {
        value = ref[key];
        if (item[key] != null) {
          shortenedObject[key] = item[key];
        } else {
          if (value.optional) {
            if (value["default"] != null) {
              shortenedObject[key] = value["default"];
            } else {
              shortenedObject[key] = null;
            }
          } else {
            callback({
              error: "missingProp",
              path: path + "." + key
            });
            failed = true;
            break;
          }
        }
      }
      if (failed) {
        return;
      } else {
        doValidation(shortenedObject, options.children, true, callback);
      }
      break;
    default:
      return callback({
        error: "invalidMode",
        path: path
      });
  }
};
