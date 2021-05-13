// Generated by CoffeeScript 2.4.1
(function() {
  var BigBlueButtonApi, filterCustomParameters, include, noChecksumMethods, root,
    indexOf = [].indexOf;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  BigBlueButtonApi = class BigBlueButtonApi {
    // `url`: The complete URL to the server's API, e.g. `http://server.com/bigbluebutton/api`
    // `salt`: The shared secret of your server.
    // `debug`: Turn on debug messages, printed to `console.log`.
    // `opts`: Additional options
    constructor(url, salt, debug = false, opts = {}) {
      var base;
      this.url = url;
      this.salt = salt;
      this.debug = debug;
      this.opts = opts;
      if ((base = this.opts).shaType == null) {
        base.shaType = 'sha1';
      }
    }

    // Returna a list with the name of all available API calls.
    availableApiCalls() {
      return ['/', 'create', 'join', 'isMeetingRunning', 'getMeetingInfo', 'end', 'getMeetings', 'getDefaultConfigXML', 'setConfigXML', 'enter', 'configXML', 'signOut', 'getRecordings', 'publishRecordings', 'deleteRecordings', 'updateRecordings', 'getRecordingTextTracks'];
    }

    // Returns a list of supported parameters in the URL for a given API method.
    // The return is an array of arrays composed by:
    //   [0] - RegEx or string with the parameter name
    //   [1] - true if the parameter is required, false otherwise
    urlParamsFor(param) {
      switch (param) {
        case "create":
          return [["meetingID", true], ["name", true], ["attendeePW", false], ["moderatorPW", false], ["welcome", false], ["dialNumber", false], ["voiceBridge", false], ["webVoice", false], ["logoutURL", false], ["maxParticipants", false], ["record", false], ["duration", false], ["moderatorOnlyMessage", false], ["autoStartRecording", false], ["allowStartStopRecording", false], [/meta_\w+/, false]];
        case "join":
          return [["fullName", true], ["meetingID", true], ["password", true], ["createTime", false], ["userID", false], ["webVoiceConf", false], ["configToken", false], ["avatarURL", false], ["redirect", false], ["clientURL", false]];
        case "isMeetingRunning":
          return [["meetingID", true]];
        case "end":
          return [["meetingID", true], ["password", true]];
        case "getMeetingInfo":
          return [["meetingID", true], ["password", true]];
        case "getRecordings":
          return [["meetingID", false], ["recordID", false], ["state", false], [/meta_\w+/, false]];
        case "publishRecordings":
          return [["recordID", true], ["publish", true]];
        case "deleteRecordings":
          return [["recordID", true]];
        case "updateRecordings":
          return [["recordID", true], [/meta_\w+/, false]];
        case "getRecordingTextTracks":
          return [["recordID", true]];
      }
    }

    // Filter `params` to allow only parameters that can be passed
    // to the method `method`.
    // To use custom parameters, name them `custom_parameterName`.
    // The `custom_` prefix will be removed when generating the urls.
    filterParams(params, method) {
      var filters, r;
      filters = this.urlParamsFor(method);
      if ((filters == null) || filters.length === 0) {
        ({});
      } else {
        r = include(params, function(key, value) {
          var filter, i, len;
          for (i = 0, len = filters.length; i < len; i++) {
            filter = filters[i];
            if (filter[0] instanceof RegExp) {
              if (key.match(filter[0]) || key.match(/^custom_/)) {
                return true;
              }
            } else {
              if (key.match(`^${filter[0]}$`) || key.match(/^custom_/)) {
                return true;
              }
            }
          }
          return false;
        });
      }
      return filterCustomParameters(r);
    }

    // Returns a url for any `method` available in the BigBlueButton API
    // using the parameters in `params`.
    // Parameters received:
    // * `method`: The name of the API method
    // * `params`: An object with pairs of `parameter`:`value`. The parameters will be used only in the
    //             API calls they should be used. If a parameter name starts with `custom_`, it will
    //             be used in all API calls, removing the `custom_` prefix.
    //             Parameters to be used as metadata should use the prefix `meta_`.
    // * `filter`: Whether the parameters in `params` should be filtered, so that the API
    //             calls will contain only the parameters they accept. If false, all parameters
    //             in `params` will be added to the API call.
    urlFor(method, params, filter = true) {
      var checksum, i, key, keys, len, param, paramList, property, query, sep, url;
      if (this.debug) {
        console.log("Generating URL for", method);
      }
      if (filter) {
        params = this.filterParams(params, method);
      } else {
        params = filterCustomParameters(params);
      }
      url = this.url;
      // mounts the string with the list of parameters
      paramList = [];
      if (params != null) {
        // add the parameters in alphabetical order to prevent checksum errors
        keys = [];
        for (property in params) {
          keys.push(property);
        }
        keys = keys.sort();
        for (i = 0, len = keys.length; i < len; i++) {
          key = keys[i];
          if (key != null) {
            param = params[key];
          }
          if (param != null) {
            paramList.push(`${this.encodeForUrl(key)}=${this.encodeForUrl(param)}`);
          }
        }
        if (paramList.length > 0) {
          query = paramList.join("&");
        }
      } else {
        query = '';
      }
      // calculate the checksum
      checksum = this.checksum(method, query);
      // add the missing elements in the query
      if (paramList.length > 0) {
        query = `${method}?${query}`;
        sep = '&';
      } else {
        if (method !== '/') {
          query = method;
        }
        sep = '?';
      }
      if (indexOf.call(noChecksumMethods(), method) < 0) {
        query = `${query}${sep}checksum=${checksum}`;
      }
      return `${url}/${query}`;
    }

    // Calculates the checksum for an API call `method` with
    // the params in `query`.
    checksum(method, query) {
      var c, shaObj, str;
      query || (query = "");
      if (this.debug) {
        console.log(`- Calculating the checksum using: '${method}', '${query}', '${this.salt}'`);
      }
      str = method + query + this.salt;
      if (this.opts.shaType === 'sha256') {
        shaObj = new jsSHA("SHA-256", "TEXT");
      } else {
        shaObj = new jsSHA("SHA-1", "TEXT");
      }
      shaObj.update(str);
      c = shaObj.getHash("HEX");
      if (this.debug) {
        console.log("- Checksum calculated:", c);
      }
      return c;
    }

    // Encodes a string to set it in the URL. Has to encode it exactly like BigBlueButton does!
    // Otherwise the validation of the checksum might fail at some point.
    encodeForUrl(value) {
      return encodeURIComponent(value).replace(/%20/g, '+').replace(/[!'()]/g, escape).replace(/\*/g, "%2A"); // use + instead of %20 for space to match what the Java tools do. // encodeURIComponent doesn't escape !'()* but browsers do, so manually escape them.
    }

    // Replaces the protocol for `bigbluebutton://`.
    setMobileProtocol(url) {
      return url.replace(/http[s]?\:\/\//, "bigbluebutton://");
    }

  };

  // Ruby-like include() method for Objects
  include = function(input, _function) {
    var _match, _obj, key, value;
    _obj = new Object;
    _match = null;
    for (key in input) {
      value = input[key];
      if (_function.call(input, key, value)) {
        _obj[key] = value;
      }
    }
    return _obj;
  };

  root.BigBlueButtonApi = BigBlueButtonApi;

  // creates keys without "custom_" and deletes the ones with it
  filterCustomParameters = function(params) {
    var key, v;
    for (key in params) {
      v = params[key];
      if (key.match(/^custom_/)) {
        params[key.replace(/^custom_/, "")] = v;
      }
    }
    for (key in params) {
      if (key.match(/^custom_/)) {
        delete params[key];
      }
    }
    return params;
  };

  noChecksumMethods = function() {
    return ['setConfigXML', '/', 'enter', 'configXML', 'signOut'];
  };

}).call(this);
