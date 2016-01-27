/**
 * Common functions
 */
(window['JSON'] && window['JSON']['stringify']) || (function() {
  window['JSON'] || (window['JSON'] = {});

  function toJSON(key) {
    try {
      return this.valueOf()
    } catch (e) {
      return null
    }
  }

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    gap,
    indent,
    meta = {
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"': '\\"',
      '\\': '\\\\'
    },
    rep;

  function quote(string) {
    escapable.lastIndex = 0;
    return escapable.test(string) ?
      '"' + string.replace(escapable, function(a) {
        var c = meta[a];
        return typeof c === 'string' ? c :
          '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"' :
      '"' + string + '"';
  }

  function str(key, holder) {
    var i,
      k,
      v,
      length,
      partial,
      mind = gap,
      value = holder[key];

    if (value && typeof value === 'object') {
      value = toJSON.call(value, key);
    }

    if (typeof rep === 'function') {
      value = rep.call(holder, key, value);
    }

    switch (typeof value) {
      case 'string':
        return quote(value);

      case 'number':
        return isFinite(value) ? String(value) : 'null';

      case 'boolean':
      case 'null':
        return String(value);

      case 'object':

        if (!value) {
          return 'null';
        }

        gap += indent;
        partial = [];

        if (Object.prototype.toString.apply(value) === '[object Array]') {

          length = value.length;
          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || 'null';
          }

          v = partial.length === 0 ? '[]' :
            gap ? '[\n' + gap +
            partial.join(',\n' + gap) + '\n' +
            mind + ']' :
            '[' + partial.join(',') + ']';
          gap = mind;
          return v;
        }
        if (rep && typeof rep === 'object') {
          length = rep.length;
          for (i = 0; i < length; i += 1) {
            k = rep[i];
            if (typeof k === 'string') {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        } else {
          for (k in value) {
            if (Object.hasOwnProperty.call(value, k)) {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        }

        v = partial.length === 0 ? '{}' :
          gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
          mind + '}' : '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
  }

  if (typeof JSON['stringify'] !== 'function') {
    JSON['stringify'] = function(value, replacer, space) {
      var i;
      gap = '';
      indent = '';

      if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
          indent += ' ';
        }
      } else if (typeof space === 'string') {
        indent = space;
      }
      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
        (typeof replacer !== 'object' ||
          typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
      }
      return str('', {
        '': value
      });
    };
  }

  if (typeof JSON['parse'] !== 'function') {

    JSON['parse'] = function(text) {
      return eval('(' + text + ')')
    };
  }
}());

/**
 * Config
 */
var NOW = 1,
  READY = false,
  READY_BUFFER = [],
  SECOND = 1000 // A THOUSAND MILLISECONDS.
  ,
  URLBIT = '/',
  PARAMSBIT = '&',
  REPL = /{([\w\-]+)}/g;

/**
 * UTILITIES
 */
function unique() {
  return 'x' + ++NOW + '' + (+new Date)
} // Return unique: "x" + (sequence number) + unix time
function rnow() {
  return +new Date
} // Return unix time

/**
 * isArray
 * ====
 * isArray( [1,2,3] )
 */
function isArray(arg) {
  return !!arg && (Array.isArray && Array.isArray(arg) || typeof(arg.length) === "number")
}

/**
 * EACH
 * ====
 * each( [1,2,3], function(item) { } )
 */
function each(o, f) {
  if (!o || !f) return;

  if (isArray(o))
    for (var i = 0, l = o.length; i < l;)
      f.call(o[i], o[i], i++);
  else
    for (var i in o)
      o.hasOwnProperty &&
      o.hasOwnProperty(i) &&
      f.call(o[i], i, o[i]);
}

/**
 * @todo: unique request
 * NEXTORIGIN
 * ==========
 * var next_origin = nextorigin();
 */
var nextorigin = (function() {
  var max = 20, // @todo: re-try times?
    ori = Math.floor(Math.random() * max);
  return function(origin, failover) {
    return origin.indexOf('pubsub.') > 0 && origin.replace(
      'pubsub', 'ps' + (
        failover ? uuid().split('-')[0] :
        (++ori < max ? ori : ori = 1)
      )) || origin;
  }
})();

/**
 * Build Url
 * =======
 * var url = build_url(["https://bla.konexy.com","uri"],{"param1":"text", "param2":20})
 */
function build_url(url_components, url_params) {
  var url = url_components.join(URLBIT),
    params = [];

  if (!url_params) return url;

  each(url_params, function(key, value) {
    var value_str = (typeof value == 'object') ? JSON['stringify'](value) : value;
    (typeof value != 'undefined' &&
      value != null && encode(value_str).length > 0
    ) && params.push(key + "=" + encode(value_str));
  });

  url += "?" + params.join(PARAMSBIT);
  return url;
}

/**
 * UPDATER
 * =======
 * var timestamp = unique();
 */
function updater(fun, rate) {
  var timeout, last = 0,
    runnit = function() {
      if (last + rate > rnow()) {
        clearTimeout(timeout);
        timeout = setTimeout(runnit, rate);
      } else {
        last = rnow();
        fun();
      }
    };

  return runnit;
}

/**
 * GREP
 * return a list of member follows an rule defined on fun.
 * ====
 * var list = grep( [1,2,3], function(item) { return item % 2 } )
 */
function grep(list, fun) {
  var fin = [];
  each(list || [], function(l) {
    fun(l) && fin.push(l)
  });
  return fin
}

/**
 * SUPPLANT
 * replace on input string to put value: replace {param} => value... Value defined on values object {param : value, param2: value2,...}
 * ========
 * var text = supplant( 'Hello {name}!', { name : 'John' } )
 */
function supplant(str, values) {
  return str.replace(REPL, function(_, match) {
    return values[match] || _
  });
}

/**
 * timeout
 * =======
 * timeout( function(){}, 100 );
 */
function timeout(fun, wait) {
  return setTimeout(fun, wait);
}

/*
 * $Id: base64.js,v 2.15 2014/04/05 12:58:57 dankogai Exp dankogai $
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */

(function(global) {
  'use strict';

  var _Base64 = global.Base64;
  var version = "2.1.9";

  var buffer;
  if (typeof module !== 'undefined' && module.exports) {
    try {
      buffer = require('buffer').Buffer;
    } catch (err) {}
  }

  var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var b64tab = function(bin) {
    var t = {};
    for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
    return t;
  }(b64chars);
  var fromCharCode = String.fromCharCode;

  var cb_utob = function(c) {
    if (c.length < 2) {
      var cc = c.charCodeAt(0);
      return cc < 0x80 ? c : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6)) + fromCharCode(0x80 | (cc & 0x3f))) : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f)) + fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) + fromCharCode(0x80 | (cc & 0x3f)));
    } else {
      var cc = 0x10000 + (c.charCodeAt(0) - 0xD800) * 0x400 + (c.charCodeAt(1) - 0xDC00);
      return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07)) + fromCharCode(0x80 | ((cc >>> 12) & 0x3f)) + fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) + fromCharCode(0x80 | (cc & 0x3f)));
    }
  };
  var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
  var utob = function(u) {
    return u.replace(re_utob, cb_utob);
  };
  var cb_encode = function(ccc) {
    var padlen = [0, 2, 1][ccc.length % 3],
      ord = ccc.charCodeAt(0) << 16 | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8) | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
      chars = [
        b64chars.charAt(ord >>> 18),
        b64chars.charAt((ord >>> 12) & 63),
        padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
        padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
      ];
    return chars.join('');
  };
  var btoa = global.btoa ? function(b) {
    return global.btoa(b);
  } : function(b) {
    return b.replace(/[\s\S]{1,3}/g, cb_encode);
  };
  var _encode = buffer ? function(u) {
    return (u.constructor === buffer.constructor ? u : new buffer(u))
      .toString('base64')
  } : function(u) {
    return btoa(utob(u))
  };
  var encode = function(u, urisafe) {
    return !urisafe ? _encode(String(u)) : _encode(String(u)).replace(/[+\/]/g, function(m0) {
      return m0 == '+' ? '-' : '_';
    }).replace(/=/g, '');
  };
  var encodeURI = function(u) {
    return encode(u, true)
  };

  var re_btou = new RegExp([
    '[\xC0-\xDF][\x80-\xBF]',
    '[\xE0-\xEF][\x80-\xBF]{2}',
    '[\xF0-\xF7][\x80-\xBF]{3}'
  ].join('|'), 'g');
  var cb_btou = function(cccc) {
    switch (cccc.length) {
      case 4:
        var cp = ((0x07 & cccc.charCodeAt(0)) << 18) | ((0x3f & cccc.charCodeAt(1)) << 12) | ((0x3f & cccc.charCodeAt(2)) << 6) | (0x3f & cccc.charCodeAt(3)),
          offset = cp - 0x10000;
        return (fromCharCode((offset >>> 10) + 0xD800) + fromCharCode((offset & 0x3FF) + 0xDC00));
      case 3:
        return fromCharCode(
          ((0x0f & cccc.charCodeAt(0)) << 12) | ((0x3f & cccc.charCodeAt(1)) << 6) | (0x3f & cccc.charCodeAt(2))
        );
      default:
        return fromCharCode(
          ((0x1f & cccc.charCodeAt(0)) << 6) | (0x3f & cccc.charCodeAt(1))
        );
    }
  };
  var btou = function(b) {
    return b.replace(re_btou, cb_btou);
  };
  var cb_decode = function(cccc) {
    var len = cccc.length,
      padlen = len % 4,
      n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0) | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0) | (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0) | (len > 3 ? b64tab[cccc.charAt(3)] : 0),
      chars = [
        fromCharCode(n >>> 16),
        fromCharCode((n >>> 8) & 0xff),
        fromCharCode(n & 0xff)
      ];
    chars.length -= [0, 0, 2, 1][padlen];
    return chars.join('');
  };
  var atob = global.atob ? function(a) {
    return global.atob(a);
  } : function(a) {
    return a.replace(/[\s\S]{1,4}/g, cb_decode);
  };
  var _decode = buffer ? function(a) {
    return (a.constructor === buffer.constructor ? a : new buffer(a, 'base64')).toString();
  } : function(a) {
    return btou(atob(a))
  };
  var decode = function(a) {
    return _decode(
      String(a).replace(/[-_]/g, function(m0) {
        return m0 == '-' ? '+' : '/'
      })
      .replace(/[^A-Za-z0-9\+\/]/g, '')
    );
  };
  var noConflict = function() {
    var Base64 = global.Base64;
    global.Base64 = _Base64;
    return Base64;
  };

  global.Base64 = {
    VERSION: version,
    atob: atob,
    btoa: btoa,
    fromBase64: decode,
    toBase64: encode,
    utob: utob,
    encode: encode,
    encodeURI: encodeURI,
    btou: btou,
    decode: decode,
    noConflict: noConflict
  };

  if (typeof Object.defineProperty === 'function') {
    var noEnum = function(v) {
      return {
        value: v,
        enumerable: false,
        writable: true,
        configurable: true
      };
    };
    global.Base64.extendString = function() {
      Object.defineProperty(
        String.prototype, 'fromBase64', noEnum(function() {
          return decode(this)
        }));
      Object.defineProperty(
        String.prototype, 'toBase64', noEnum(function(urisafe) {
          return encode(this, urisafe)
        }));
      Object.defineProperty(
        String.prototype, 'toBase64URI', noEnum(function() {
          return encode(this, true)
        }));
    };
  }

  if (global['Meteor']) {
    Base64 = global.Base64;
  }
})(this);

/**
 * Make auth string
 * ====
 * make_base_auth("username", "password")
 */
function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}

function KONEXYAPI(setting) {
  if (!setting)
    setting = _initSetting();

  var SSL = (typeof(setting['ssl']) != "undefined" && setting['ssl']) ? 's' : '',
    ORIGIN = 'http' + SSL + '://' + (setting['url'] || 'iot.konexy.com'),
    URI_THING_LIST = (typeof(setting['uri_thing_list']) != "undefined") ? setting['uri_thing_list'] : 'rest/api/thing/list',
    URI_THING = (typeof(setting['uri_thing']) != "undefined") ? setting['uri_thing'] : 'rest/api/thing/{thingId}',
    URI_THING_STATUS = (typeof(setting['uri_thing_status']) != "undefined") ? setting['uri_thing_status'] : 'rest/api/thing/{thingId}/status',
    URI_THING_LOG = (typeof(setting['uri_thing_log']) != "undefined") ? setting['uri_thing_log'] : 'rest/api/log/{thingId}/0',
    URI_TREE_LIST = (typeof(setting['uri_tree_list']) != "undefined") ? setting['uri_tree_list'] : 'rest/api/tree/list',
    URI_TREE = (typeof(setting['uri_tree']) != "undefined") ? setting['uri_tree'] : 'rest/api/tree/{treePath}',
    URI_TREE_STATUS = (typeof(setting['uri_tree_status']) != "undefined") ? setting['uri_tree_status'] : 'rest/api/log/tree/{treePath}/status',
    URI_TREE_LOG = (typeof(setting['uri_tree_log']) != "undefined") ? setting['uri_tree_log'] : 'rest/api/log/tree/{treePath}/0',
    THING = (typeof(setting['thingId']) != "undefined") ? setting['thingId'] : 'demo',
    TREEPATH = (typeof(setting['tree']) != "undefined") ? setting['tree'] : 'demo',
    USERNAME = (typeof(setting['username']) != "undefined") ? setting['username'] : '',
    PWD = (typeof(setting['password']) != "undefined") ? setting['password'] : '',
    APIKEY = (typeof(setting['apiKey']) != "undefined") ? setting['apiKey'] : '',
    OAUTH = (typeof(setting['oauth']) != "undefined") ? setting['oauth'] : '';

  function _initSetting() {
    return {};
  }
  return {
    "urlThingList": function() {
      return build_url([ORIGIN, URI_THING_LIST]);
    },
    "urlThing": function() {
      return build_url([ORIGIN, supplant(URI_THING, {
        thingId: THING
      })]);
    },
    "urlThingLog": function() {
      return build_url([ORIGIN, supplant(URI_THING_LOG, {
        thingId: THING
      })]);
    },
    "urlThingStatus": function() {
      return build_url([ORIGIN, supplant(URI_THING_STATUS, {
        thingId: THING
      })]);
    },
    "urlTreeList": function() {
      return build_url([ORIGIN, URI_TREE_LIST]);
    },
    "urlTree": function(uri) {
      if (uri)
        return build_url([ORIGIN, supplant(URI_TREE, {
          treePath: TREEPATH + uri
        })]);
      return build_url([ORIGIN, supplant(URI_TREE, {
        treePath: TREEPATH
      })]);
    },
    "urlTreeLog": function(uri) {
      if (uri)
        return build_url([ORIGIN, supplant(URI_TREE_LOG, {
          treePath: TREEPATH + uri
        })]);
      return build_url([ORIGIN, supplant(URI_TREE_LOG, {
        treePath: TREEPATH
      })]);
    },
    "urlTreeStatus": function(uri) {
      if (uri)
        return build_url([ORIGIN, supplant(URI_TREE_STATUS, {
          treePath: TREEPATH + uri
        })]);
      return build_url([ORIGIN, supplant(URI_TREE_STATUS, {
        treePath: TREEPATH
      })]);
    },
    "authenticationByUsername": function() {
      return make_base_auth(USERNAME, PWD);
    },
    "authenticationByAPIKEY": function() {
      return make_base_auth("#" + APIKEY, OAUTH);
    }
  }
}

function randomString(length) {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

function validateUrl(str) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(str);
}