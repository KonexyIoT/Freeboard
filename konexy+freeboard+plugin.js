(function() {
  var FREEBOARD_CONTAINER = "#setting-value-container-",
    FREEBOARD_SETTING_BLOCK = "#setting-row-",
    FREEBOARD_INPUT_FIELD = '<div id="setting-row-{field_name}" class="form-row">' +
    '<div class="form-label">' +
    '<label class="control-label">{display_name}</label>' +
    '</div>' +
    '<div id="setting-value-container-{field_name}" class="form-value">' +
    '<input type="{type}">' +
    '</div>' +
    '</div>',
    FREEBOARD_TYPE_OPTION = "#setting-value-container-plugin-types",
    FREEBOARD_MODAL = "#modal_overlay";

  var _DEFAULT_CONTROL_STREAM = "/control",
    _DEFAULT_ALERT_STREAM = "/alert";

  var MAX_RETRY_TIMES = 3,
    DATA_OBJECT_THING = "thing",
    DATA_OBJECT_LIST_THING = "list",
    DATA_OBJECT_TREE = "tree",
    AUTH_METHOD_USERNAME = "username",
    AUTH_METHOD_APIKEY = "apiKey";

  var TYPE_CMD = 'cmd',
    TYPE_TOGGLE_BUTTON = "togglebutton",
    TYPE_TOGGLE_BUZZER = "togglebuzzer",
    TYPE_BOARD = "board",
    SOURCE_OBJECT_AUTO = "auto",
    SOURCE_OBJECT_NONE = "none",
    CONTROL_METHOD_COMMON = "common",
    CONTROL_METHOD_SPECIAL = "special",
    AUTH_METHOD_DEFAULT = "none";
  var plugin7b4b5457ab0e8cb8f8a6f3e6ca957031rest = function(settings, updateCallback) {
    var self = this;
    var updateTimer = null;
    var currentSettings = settings;
    var lockErrorStage = false;
    var errorStage = 0;

    function updateRefresh(refreshTime) {
      if (updateTimer) {
        clearInterval(updateTimer);
      }
      updateTimer = setInterval(function() {
        self.updateNow();
      }, refreshTime);
    }

    updateRefresh(currentSettings.refresh * 1000);

    this.updateNow = function() {

      if (errorStage >= MAX_RETRY_TIMES) {
        return;
      }
      var connection = KONEXYAPI(currentSettings);
      var urlRequest;
      switch (currentSettings.dataObject) {
        case DATA_OBJECT_THING:
          urlRequest = connection.urlThingStatus();
          break;
        case DATA_OBJECT_LIST_THING:
          urlRequest = connection.urlThingList();
          break;
        case DATA_OBJECT_TREE:
          urlRequest = connection.urlTreeStatus();
          break;
        default:

      }

      var authorizationStr = makeAuthorizationStr(currentSettings);
      if (!urlRequest) {
        alert("Can't build url request");
        return;
      }
      if (!authorizationStr) {
        alert("Can't build Authorization info");
        return;
      }

      $.ajax({
        url: urlRequest,
        dataType: "JSON",
        type: "GET",
        beforeSend: function(xhr) {
          try {

            xhr.setRequestHeader("Authorization", authorizationStr)
          } catch (e) {}
        },
        success: function(data) {

          lockErrorStage = true;
          updateCallback(data);
        },
        error: function(xhr, status, error) {

          if (!lockErrorStage) {

            errorStage++;
            self.updateNow();
          }
        },
        complete: function(xhr, status) {

        }
      });
    }

    this.onDispose = function() {
      clearInterval(updateTimer);
      updateTimer = null;
    }

    this.onSettingsChanged = function(newSettings) {
      lockErrorStage = false;
      errorStage = 0;
      currentSettings = newSettings;
      updateRefresh(currentSettings.refresh * 1000);
      self.updateNow();
    }
  }
  freeboard.loadDatasourcePlugin({
    "type_name": "plugin7b4b5457ab0e8cb8f8a6f3e6ca957031",
    "display_name": "Konexy",

    "settings": [{
      "name": "ssl",
      "display_name": "Enable ssl",
      "description": '',
      "type": "boolean",
      "default_value": true
    }, {
      "name": "refresh",
      "display_name": "Refresh Every",
      "type": "number",
      "suffix": "seconds",
      "default_value": 5
    }, {
      "name": "dataObject",
      "display_name": "Data object",
      "type": "option",
      "options": [{
        "name": "Thing",
        "value": DATA_OBJECT_THING
      }, {
        "name": "List",
        "value": DATA_OBJECT_LIST_THING
      }, {
        "name": "Tree",
        "value": DATA_OBJECT_TREE
      }]
    }, {
      "name": "thingId",
      "display_name": "Thing",
      "description": '',
      "type": "text"
    }, {
      "name": "tree",
      "display_name": "Thing path",
      "description": '',
      "type": "text"
    }, {
      "name": "authMethod",
      "display_name": "Authentication method",
      "type": "option",
      "options": [{
        "name": "Username",
        "value": AUTH_METHOD_USERNAME
      }, {
        "name": "APIKey",
        "value": AUTH_METHOD_APIKEY
      }]
    }, {
      "name": "username",
      "display_name": "Username",
      "description": '',
      "type": "text"
    }, {
      "name": "password",
      "display_name": "Password",
      "description": '',
      "type": "password"
    }, {
      "name": "apiKey",
      "display_name": "API Key",
      "description": '',
      "type": "text"
    }, {
      "name": "oauth",
      "display_name": "Oauth",
      "description": '',
      "type": "text"
    }],
    "newInstance": function(settings, newInstanceCallback, updateCallback) {
      newInstanceCallback(new plugin7b4b5457ab0e8cb8f8a6f3e6ca957031rest(settings, updateCallback));
    }
  });
  $("#add-datasource").on("click", function() {

    load7b4b5457ab0e8cb8f8a6f3e6ca957031();
  });
  $("#datasources").on("click", ".datasource-name", function(e) {

    var selectedPlugin = $(FREEBOARD_TYPE_OPTION + " select").val();
    if (selectedPlugin == 'plugin7b4b5457ab0e8cb8f8a6f3e6ca957031') {
      hiddenPassword();
      loadDatasource();
      registerTriggers();
    } else {
      load7b4b5457ab0e8cb8f8a6f3e6ca957031();
    }
  });
  var dataObjectElement = FREEBOARD_CONTAINER + "dataObject select";
  var authMethodElement = FREEBOARD_CONTAINER + "authMethod select";
  /**
   * Plugin load
   */
  function load7b4b5457ab0e8cb8f8a6f3e6ca957031() {
    $(FREEBOARD_TYPE_OPTION + " select").change(function() {
      var selectedPlugin = $(FREEBOARD_TYPE_OPTION + " select").val();
      if (selectedPlugin == 'plugin7b4b5457ab0e8cb8f8a6f3e6ca957031') {
        hiddenPassword();

        datasourceDefaultUI();
        registerTriggers();
      }
    });
  }
  /**
   * Custom event triggers
   */
  function registerTriggers() {

    $(dataObjectElement).change(function(e) {
      var selected = $(dataObjectElement).val();
      switch (selected) {
        case DATA_OBJECT_THING:

          disableDataObjectElement();
          displayThingSetting();
          break;
        case DATA_OBJECT_LIST_THING:

          disableDataObjectElement();
          displayListSetting();
          break;
        case DATA_OBJECT_TREE:

          disableDataObjectElement();
          displayTreeSetting();
          break;
        default:
          disableDataObjectElement();
          displayThingSetting();
      }
    });
    $(authMethodElement).change(function(e) {
      var selected = $(authMethodElement).val();
      switch (selected) {
        case AUTH_METHOD_USERNAME:

          disableAuthMethodElement();
          displayAuthenticationByUsername();
          break;
        case AUTH_METHOD_APIKEY:

          disableAuthMethodElement();
          displayAuthenticationByKey();
          break;
        default:
          disableAuthMethodElement();
          displayAuthenticationByUsername();
      }
    });
  }
  /**
   * Functions
   */
  function datasourceDefaultUI() {

    disableSpecialSetting(["tree", "apiKey", "oauth"]);
  }

  function loadDatasource() {
    var dataObjectSelected = $(dataObjectElement).val();
    switch (dataObjectSelected) {
      case DATA_OBJECT_THING:

        disableDataObjectElement();
        displayThingSetting();
        break;
      case DATA_OBJECT_LIST_THING:

        disableDataObjectElement();
        displayListSetting();
        break;
      case DATA_OBJECT_TREE:

        disableDataObjectElement();
        displayTreeSetting();
        break;
      default:
        disableDataObjectElement();
        displayThingSetting();
    }
    var selectedAuthMethod = $(authMethodElement).val();
    switch (selectedAuthMethod) {
      case AUTH_METHOD_USERNAME:

        disableAuthMethodElement();
        displayAuthenticationByUsername();
        break;
      case AUTH_METHOD_APIKEY:

        disableAuthMethodElement();
        displayAuthenticationByKey();
        break;
      default:
        disableAuthMethodElement();
        displayAuthenticationByUsername();
    }
  }

  function disableAll() {
    var settings = ["thingId", "tree", "username", "password", "apiKey", "oauth"];
    disableSpecialSetting(settings);
  }

  function disableDataObjectElement() {
    var settings = ["thingId", "tree"];
    disableSpecialSetting(settings);
  }

  function disableAuthMethodElement() {
    var settings = ["username", "password", "apiKey", "oauth"];
    disableSpecialSetting(settings);
  }

  function disableSpecialSetting(listItem) {

    each(listItem || [], function(item) {
      var disableId = FREEBOARD_SETTING_BLOCK + item;

      $(disableId).attr("style", "display: none");
    })
  }

  function enableSpecialSetting(listItem) {
    each(listItem || [], function(item) {
      var enableId = FREEBOARD_SETTING_BLOCK + item;
      $(enableId).removeAttr("style");
    })
  }

  function displayThingSetting() {
    var settings = ["thingId"];
    enableSpecialSetting(settings);
  }

  function displayListSetting() {

  }

  function displayTreeSetting() {
    var settings = ["tree"];
    enableSpecialSetting(settings);
  }

  function displayAuthenticationByUsername() {
    var settings = ["username", "password"];
    enableSpecialSetting(settings);
  }

  function displayAuthenticationByKey() {
    var settings = ["apiKey", "oauth"];
    enableSpecialSetting(settings);
  }
  /**
   * WIDGET
   */
  var DATASOURCE_PARTTEN = /\[\"([\w\-\s]+)\"\]/g;
  var _TEMPLATE_WIDGET_CMD = '<div id="{id}" class="form-control">' +
    '<div class="row">' +
    '<textarea class=""></textarea>' +
    '<ul class="board-toolbar form-control-suffix">' +
    '<li><label class="cmd-submit">SEND</label></li>' +
    '</ul>' +
    '</div>' +
    '</div>',
    _TEMPLATE_WIDGET_TOGGLE_BUTTON = '<div id="{id}" class="toggle-button-indicator-light">' +
    '<div class="indicator-light"></div>' +
    '<div class="onoffswitch">' +
    '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="{id}-onoff">' +
    '<label class="onoffswitch-label" for="{id}-onoff">' +
    '<div class="onoffswitch-inner">' +
    '<span class="on">YES</span>' +
    '<span class="off">NO</span>' +
    '</div>' +
    '<div class="onoffswitch-switch"></div>' +
    '</label>' +
    '</div>' +
    '</div>',
    _TEMPLATE_WIDGET_TOGGLE_BUZZER = '<div id="{id}" class="toggle-buzzer">' +
    '<button class="buzzer-button">' +
    '<img src="https://raw.githubusercontent.com/bugvish/sandbox/master/redbutton.png">' +
    '</button>' +
    '</div>',
    _TEMPLATE_WIDGET_BOARD = '<div id="{id}" class="board">' +
    '</div>';
  freeboard.addStyle('.form-control', "padding: 10px 5px 0px 0px;");
  freeboard.addStyle('.row', "clear: both;height: 30px;");
  freeboard.addStyle('.form-control textarea', "position: absolute;height: 20px;resize: none;white-space: nowrap;overflow: auto;display: inline-block;height: 20px;padding: 4px 6px;font-size: 14px;line-height: 20px;");
  freeboard.addStyle('.form-control-suffix', "margin-left: 215px!important;");
  freeboard.addStyle('.board-toolbar li label', "font-size: 14px!important;");

  freeboard.addStyle('.toggle-button-indicator-light .onoffswitch', "float: right;");
  freeboard.addStyle('.toggle-buzzer', "margin-left:90px;");
  freeboard.addStyle('.buzzer-button', "border:none; background-color:transparent");
  var plugin7b4b5457ab0e8cb8f8a6f3e6ca957031widget = function(settings) {
    var self = this;
    var currentSettings = settings;

    var titleElement = $('<h2 class="section-title"></h2>');
    var elementId;
    var lightOn = false;
    var displayElement;
    var actionFreezer = false;
    /*
    function updateValueSizing()
    {
    	if(!_.isUndefined(currentSettings.units) && currentSettings.units != "")
    	{
    		valueElement.css("max-width", (displayElement.innerWidth() - unitsElement.outerWidth(true)) + "px");
    	}
    	else
    	{
    		valueElement.css("max-width", "100%");
    	}
    }
    */
    function msgSend(url, requestType, data, headers) {

      if (!url || !validateUrl(url) || !requestType || !data)
        return false;

      $.ajax({
        'url': url,
        "dataType": "JSON",
        "type": requestType,
        "contentType": "application/json",
        "data": data,
        "beforeSend": function(xhr) {
          try {

            each(headers, function(key, value) {
              if (typeof value != 'undefined' && value != null) {
                xhr.setRequestHeader(key, value);
              }
            });
          } catch (e) {}
        },
        "success": function(data) {

        },
        "error": function(xhr, status, error) {

        },
        "complete": function(xhr, status) {}
      });
    }

    this.updateUI = function() {}
    this.registerSubmitEvents = function(displayElement) {

      displayElement.find(".cmd-submit").click(function() {

        var dataSend = displayElement.find("textarea").val();
        if (!dataSend) {
          alert("Please input content before first!");
          return;
        }
        if (currentSettings.uri) {
          var submitURL = widgetMakeUrlFromUri(currentSettings.uri);
          if (submitURL != null && submitURL != "") {
            var authorizationStr;
            if (currentSettings.authMethod != AUTH_METHOD_DEFAULT) {
              authorizationStr = makeAuthorizationStr(currentSettings);
            }
            if (!authorizationStr) {

              var datasourceObjectName;
              var strArr;
              if (currentSettings.uri) {
                strArr = currentSettings.uri.split(_URI_DATASOURCE_PARTTEN);
                datasourceObjectName = strArr[1];
              }
              if (!datasourceObjectName) {
                alert("Data source object is incorrect");
                return;
              }
              var dataObjectSetting = freeboard.getDatasourceSettings(datasourceObjectName);
              if (dataObjectSetting) {
                authorizationStr = makeAuthorizationStr(dataObjectSetting);
              } else {
                alert("Can't build Authorization info");
                return;
              }
            }
            var headers = {
              "Authorization": authorizationStr
            };
            msgSend(submitURL, "POST", dataSend, headers);
          } else {
            alert("Url is incorrect");
          }
        }
      });

      displayElement.find(".onoffswitch input").change(function() {

        actionFreezer = true;
        var state = this.checked;
        var dataSend;
        var submitURL;

        if (state)
          dataSend = currentSettings.msg_on;
        else
          dataSend = currentSettings.msg_off;
        switch (currentSettings.control) {
          case SOURCE_OBJECT_AUTO:

            submitURL = widgetMakeUrlFromUri("/", currentSettings.value);
            if (!submitURL) {
              alert("Can't build url request");
              return;
            }
            break;
          case SOURCE_OBJECT_NONE:
            submitURL = widgetMakeUrlFromUri(currentSettings.uri, currentSettings.value);
            if (!submitURL) {
              alert("Can't build url request");
              return;
            }
            break;
          default:
        }
        var authorizationStr;
        if (currentSettings.authMethod != AUTH_METHOD_DEFAULT) {
          authorizationStr = makeAuthorizationStr(currentSettings);
        }
        if (!authorizationStr) {

          var datasourceObjectName;
          var strArr;
          if (currentSettings.value) {
            strArr = currentSettings.value.split(DATASOURCE_PARTTEN);
            datasourceObjectName = strArr[1];
          }
          if (!datasourceObjectName)
            return;
          var dataObjectSetting = freeboard.getDatasourceSettings(datasourceObjectName);
          if (dataObjectSetting) {
            authorizationStr = makeAuthorizationStr(dataObjectSetting);
          } else {
            alert("Can't build Authorization info");
            return;
          }
        }
        var headers = {
          "Authorization": authorizationStr
        };
        msgSend(submitURL, "POST", dataSend, headers);
      });

      displayElement.find(".buzzer-button").click(function() {

        var dataSend = currentSettings.msg_buzz;
        var authorizationStr;
        var submitURL = widgetMakeUrlFromUri(currentSettings.uri, currentSettings.value);
        if (!submitURL) {
          alert("Can't build url request");
          return;
        }
        var authorizationStr;
        if (currentSettings && currentSettings.authMethod != AUTH_METHOD_DEFAULT) {
          authorizationStr = makeAuthorizationStr(currentSettings);
        }
        if (!authorizationStr) {

          var datasourceObjectName;
          var strArr;
          if (currentSettings.uri) {
            strArr = currentSettings.uri.split(_URI_DATASOURCE_PARTTEN);
            datasourceObjectName = strArr[1];
          }
          if (!datasourceObjectName) {
            alert("Data source object is incorrect");
            return;
          }
          var dataObjectSetting = freeboard.getDatasourceSettings(datasourceObjectName);
          if (dataObjectSetting) {
            authorizationStr = makeAuthorizationStr(dataObjectSetting);
          } else {
            alert("Can't build Authorization info");
            return;
          }
        }
        var headers = {
          "Authorization": authorizationStr
        };
        msgSend(submitURL, "POST", dataSend, headers);
      });
    }

    this.render = function(element) {

      $(element).empty();
      elementId = randomString(15);
      switch (currentSettings.type) {
        case TYPE_CMD:

          displayElement = $(supplant(_TEMPLATE_WIDGET_CMD, {
            id: elementId
          }));
          break;
        case TYPE_TOGGLE_BUTTON:

          displayElement = $(supplant(_TEMPLATE_WIDGET_TOGGLE_BUTTON, {
            id: elementId
          }));
          break;
        case TYPE_TOGGLE_BUZZER:
          console.log("do display TYPE_TOGGLE_BUZZER widget");
          displayElement = $(supplant(_TEMPLATE_WIDGET_TOGGLE_BUZZER, {
            id: elementId
          }));
          break;
        case TYPE_BOARD:

          displayElement = $(supplant(_TEMPLATE_WIDGET_BOARD, {
            id: elementId
          }));
          break;
        default:
      }
      $(element).append(titleElement).append(displayElement);

      this.registerSubmitEvents(displayElement);

    }
    this.onSettingsChanged = function(newSettings) {

      currentSettings = newSettings;
      titleElement.html((_.isUndefined(newSettings.title) ? "" : newSettings.title));
      this.updateUI();
    }

    function updateIndicatorLightState() {
      displayElement.find(".indicator-light").toggleClass("on", lightOn);

      if (actionFreezer == false)
        displayElement.find(".onoffswitch input").prop("checked", lightOn);
      else if (actionFreezer && lightOn == displayElement.find(".onoffswitch input")[0].checked)
        actionFreezer = false;
    }

    this.onCalculatedValueChanged = function(settingName, newValue) {

      switch (currentSettings.type) {
        case TYPE_CMD:
          break;
        case TYPE_TOGGLE_BUTTON:
          if (settingName == "value") {
            lightOn = Boolean(newValue);
          }
          updateIndicatorLightState();
          break;
        case TYPE_TOGGLE_BUZZER:
          break;
        case TYPE_BOARD:
          break;
        default:
      }
    }
    this.onDispose = function() {

    }
    this.getHeight = function() {
      switch (currentSettings.type) {
        case TYPE_CMD:
          return 1.5;
        case TYPE_TOGGLE_BUTTON:
          return 1;
        case TYPE_TOGGLE_BUZZER:
          return 2;
          /* @todo
          case TYPE_BOARD:
          	return Number();
          */
        default:
          return 1;
      }
    }
    this.onSettingsChanged(settings);
  };
  freeboard.loadWidgetPlugin({
    type_name: "widget7b4b5457ab0e8cb8f8a6f3e6ca957031",
    display_name: "Konexy",
    settings: [{
      name: "title",
      display_name: "Title",
      type: "text"
    }, {
      name: "type",
      display_name: "Konexy Widget Type",
      type: "option",
      options: [{
          name: "Command",
          value: TYPE_CMD
        }, {
          name: "Toggle Button",
          value: TYPE_TOGGLE_BUTTON
        }, {
          name: "Toggle Buzzer",
          value: TYPE_TOGGLE_BUZZER
        }
        /* @todo: temp
        ,{
        	name: "Board",
        	value: TYPE_BOARD
        }
        */
      ]
    }, {
      name: "value",
      display_name: "Value",
      type: "calculated"
    }, {
      name: "control",
      display_name: "Control Stream",
      description: 'Chọn "' + SOURCE_OBJECT_AUTO + '", lệnh điều khiển sẽ được gửi vào stream log của thiết bị. Nếu không, hãy chọn "manual".',
      type: "option",
      options: [{
        name: "Auto",
        value: SOURCE_OBJECT_AUTO
      }, {
        name: "Manual",
        value: SOURCE_OBJECT_NONE
      }]
    }, {
      name: "uri",
      display_name: 'Uri',
      description: 'Nhập vào stream uri, hoặc {data source name} + uri , hoặc full url của control stream',
      type: "text"
    }, {
      name: "dimension",
      display_name: 'Dimension',
      type: "text"
    }, {
      name: "mapping",
      display_name: "Object mapping",
      type: "array",
      settings: [{
        name: "seq_number",
        display_name: "Sequence-number",
        type: "text"
      }, {
        name: "object",
        display_name: "Object",
        description: "Có thể được định nghĩa ngắn gọn theo cấu trúc {data source name} + uri",
        type: "calculated"
      }]
    }, {
      name: "control_method",
      display_name: 'Control method',
      description: 'Chọn "Common" nếu các đối tượng trong board có chung API(lệnh) điều khiển. Nếu không, hãy chọn "Special" để định nghĩa lệnh điều khiển cho từng phần tử.',
      type: "option",
      options: [{
        name: "Common",
        value: CONTROL_METHOD_COMMON
      }, {
        name: "Special",
        value: CONTROL_METHOD_SPECIAL
      }]
    }, {
      name: "msg_on",
      display_name: '"On" message',
      type: "text"
    }, {
      name: "msg_off",
      display_name: '"Off" message',
      type: "text"
    }, {
      name: "msg_buzz",
      display_name: 'Buzz message',
      type: "text"
    }, {
      name: "control_method_mapping",
      display_name: "Control Method Mapping",
      type: "array",
      settings: [{
        name: "Seq_number",
        display_name: "Sequence-number",
        type: "text"
      }, {
        name: "multi_msg_on",
        display_name: '"On" message',
        type: "text"
      }, {
        name: "multi_msg_off",
        display_name: '"Off" message',
        type: "text"
      }]
    }, {
      "name": "authMethod",
      "display_name": "Authentication method",
      "type": "option",
      "options": [{
        "name": "Default",
        "description": "Thông tin authentication sẽ được lấy từ đối tượng data source tương ứng",
        "value": AUTH_METHOD_DEFAULT
      }, {
        "name": "Username",
        "value": AUTH_METHOD_USERNAME
      }, {
        "name": "APIKey",
        "value": AUTH_METHOD_APIKEY
      }]
    }, {
      "name": "username",
      "display_name": "Username",
      "description": '',
      "type": "text"
    }, {
      "name": "password",
      "display_name": "Password",
      "description": '',
      "type": "password"
    }, {
      "name": "apiKey",
      "display_name": "API Key",
      "description": '',
      "type": "text"
    }, {
      "name": "oauth",
      "display_name": "Oauth",
      "description": '',
      "type": "text"
    }],
    newInstance: function(settings, newInstanceCallback) {
      newInstanceCallback(new plugin7b4b5457ab0e8cb8f8a6f3e6ca957031widget(settings));
    }
  });

  $("#board-content").on("click", ".add-widget-action", function() {
    loadwidget7b4b5457ab0e8cb8f8a6f3e6ca957031();
  });

  $("#board-content").on("click", "section li", function() {

    var selectedWidget = $(FREEBOARD_TYPE_OPTION + " select").val();

    if (selectedWidget == 'widget7b4b5457ab0e8cb8f8a6f3e6ca957031') {
      hiddenPassword();
      loadWidget();
      registerWidgetTriggers();
    } else {
      loadwidget7b4b5457ab0e8cb8f8a6f3e6ca957031();
    }
  });
  /**
   * Widget on load
   */
  var konexyWidgetType = FREEBOARD_CONTAINER + "type select";
  var konexyControlStream = FREEBOARD_CONTAINER + "control select";
  var konexyWidgetControlMethod = FREEBOARD_CONTAINER + "control_method select";

  function loadwidget7b4b5457ab0e8cb8f8a6f3e6ca957031() {
    $(FREEBOARD_TYPE_OPTION + " select").change(function() {
      var selectedPlugin = $(FREEBOARD_TYPE_OPTION + " select").val();
      if (selectedPlugin == 'widget7b4b5457ab0e8cb8f8a6f3e6ca957031') {

        hiddenPassword();
        widgetDefaultUI();
        registerWidgetTriggers();
      }
    });
  }
  /**
   * Custom event triggers
   */
  function registerWidgetTriggers() {

    $(FREEBOARD_MODAL).on("change", konexyWidgetType, function(e) {

      var selected = $(konexyWidgetType).val();
      switch (selected) {
        case TYPE_CMD:

          disableWidgetTypeElement();
          displayCMDSetting();
          break;
        case TYPE_TOGGLE_BUTTON:

          disableWidgetTypeElement();
          displayToggleButtonSetting();
          break;
        case TYPE_TOGGLE_BUZZER:

          disableWidgetTypeElement();
          displayToggleBuzzerSetting();
          break;
        case TYPE_BOARD:

          disableWidgetTypeElement();
          displayBoardSetting();
          break;
        default:
          disableWidgetTypeElement();
          displayCMDSetting();
      }
    });

    $(FREEBOARD_MODAL).on("change", konexyControlStream, function(e) {

      var selected = $(konexyControlStream).val();
      switch (selected) {
        case SOURCE_OBJECT_AUTO:

          disableSourceObjectElement();
          displayDataSourceObject();
          break;
        case SOURCE_OBJECT_NONE:

          disableSourceObjectElement();
          displayManualSourceObject();
          break;
        default:
          disableSourceObjectElement();
          displayDataSourceObject();
      }
    });

    $(FREEBOARD_MODAL).on("change", konexyWidgetControlMethod, function(e) {

      var selected = $(konexyWidgetControlMethod).val();
      switch (selected) {
        case CONTROL_METHOD_COMMON:

          disableControlMethodElement();
          displayControlMethodCommon();
          break;
        case CONTROL_METHOD_SPECIAL:

          disableControlMethodElement();
          displayControlMethodSpecial();
          break;
        default:
          disableControlMethodElement();
          displayControlMethodCommon();
      }
    });
    $(FREEBOARD_MODAL).on("change", authMethodElement, function(e) {
      var selected = $(authMethodElement).val();
      switch (selected) {
        case AUTH_METHOD_DEFAULT:

          disableAuthMethodElement();
          break;
        case AUTH_METHOD_USERNAME:

          disableAuthMethodElement();
          displayAuthenticationByUsername();
          break;
        case AUTH_METHOD_APIKEY:

          disableAuthMethodElement();
          displayAuthenticationByKey();
          break;
        default:
          disableAuthMethodElement();
      }
    });
  }
  /**
   * Functions
   */
  function widgetDefaultUI() {

    disableSpecialSetting(["value", "control", "dimension", "mapping", "control_method", "msg_on", "msg_off", "msg_buzz", "control_method_mapping", "username", "password", "apiKey", "oauth"]);
  }

  function loadWidget() {

    var selected = $(konexyWidgetType).val();
    switch (selected) {
      case TYPE_CMD:

        disableWidgetTypeElement();
        displayCMDSetting();
        break;
      case TYPE_TOGGLE_BUTTON:

        disableWidgetTypeElement();
        displayToggleButtonSetting();
        var selectedControlStream = $(konexyControlStream).val();
        switch (selectedControlStream) {
          case SOURCE_OBJECT_AUTO:

            disableSourceObjectElement();
            displayDataSourceObject();
            break;
          case SOURCE_OBJECT_NONE:

            disableSourceObjectElement();
            displayManualSourceObject();
            break;
          default:
            disableSourceObjectElement();

        }
        break;
      case TYPE_TOGGLE_BUZZER:

        disableWidgetTypeElement();
        displayToggleBuzzerSetting();
        break;
      case TYPE_BOARD:

        disableWidgetTypeElement();
        displayBoardSetting();
        var selectedWidgetControlMethod = $(konexyWidgetControlMethod).val();
        switch (selectedWidgetControlMethod) {
          case CONTROL_METHOD_COMMON:

            disableControlMethodElement();
            displayControlMethodCommon();
            break;
          case CONTROL_METHOD_SPECIAL:

            disableControlMethodElement();
            displayControlMethodSpecial();
            break;
          default:
            disableControlMethodElement();

        }
        break;
      default:
        disableWidgetTypeElement();
        displayCMDSetting();
    }
    var selectedAuthMethod = $(authMethodElement).val();
    switch (selectedAuthMethod) {
      case AUTH_METHOD_DEFAULT:

        disableAuthMethodElement();
        break;
      case AUTH_METHOD_USERNAME:

        disableAuthMethodElement();
        displayAuthenticationByUsername();
        break;
      case AUTH_METHOD_APIKEY:

        disableAuthMethodElement();
        displayAuthenticationByKey();
        break;
      default:
        disableAuthMethodElement();

    }
  }

  function widgetDisableAll() {
    var settings = ["value", "control", "uri", "dimension", "mapping", "control_method", "msg_on", "msg_off", "msg_buzz", "control_method_mapping", "authMethod", "username", "password", "apiKey", "oauth"];
    disableSpecialSetting(settings);
  }

  function disableWidgetTypeElement() {
    var settings = ["value", "control", "uri", "dimension", "mapping", "control_method", "msg_on", "msg_off", "msg_buzz", "control_method_mapping", "authMethod", "username", "password", "apiKey", "oauth"];
    disableSpecialSetting(settings);
  }

  function disableSourceObjectElement() {
    var settings = ["uri"];
    disableSpecialSetting(settings);
  }

  function disableControlMethodElement() {
    var settings = ["msg_on", "msg_off", "control_method_mapping"];
    disableSpecialSetting(settings);
  }

  function displayCMDSetting() {
    var settings = ["uri", "authMethod"];
    enableSpecialSetting(settings);
  }

  function displayToggleButtonSetting() {
    var settings = ["value", "control", "msg_on", "msg_off", "authMethod"];
    enableSpecialSetting(settings);
  }

  function displayToggleBuzzerSetting() {
    var settings = ["uri", "msg_buzz", "authMethod"];
    enableSpecialSetting(settings);
  }

  function displayBoardSetting() {
    var settings = ["dimension", "mapping", "control_method", "msg_on", "msg_off", "authMethod"];
    enableSpecialSetting(settings);
  }

  function displayDataSourceObject() {

  }

  function displayManualSourceObject() {
    var settings = ["uri"];
    enableSpecialSetting(settings);
  }

  function displayControlMethodCommon() {

    var settings = ["msg_on", "msg_off"];
    enableSpecialSetting(settings);
  }

  function displayControlMethodSpecial() {
    var settings = ["control_method_mapping"];
    enableSpecialSetting(settings);
  }

  function buildUrlfromUri(setting) {
    var url;
    return url;
  }
  /**
   * Common trigger events
   */
  $(document).on("change", authMethodElement, function() {
    $(FREEBOARD_CONTAINER + "password input").attr("type", "password")
  });
  /**
   * Common function
   */
  function hiddenPassword() {
    $(FREEBOARD_CONTAINER + "password input").attr("type", "password");
  }
  var _URI_DATASOURCE_PARTTEN = /{([\w\-\s]+)}/g;

  function widgetMakeUrlFromUri(uri, datasourceValue) {

    if (validateUrl(uri))
      return uri;
    var datasourceObjectName;

    if (uri.indexOf("/") == 0) {
      if (!datasourceValue)
        return;
      var strArr = datasourceValue.split(DATASOURCE_PARTTEN);
      datasourceObjectName = strArr[1];
    }

    if (uri.search(_URI_DATASOURCE_PARTTEN) == 0) {
      var strArr = uri.split(_URI_DATASOURCE_PARTTEN);
      datasourceObjectName = strArr[1];
      uri = strArr[2];
    }
    if (!datasourceObjectName)
      return;

    var dataObjectSetting = freeboard.getDatasourceSettings(datasourceObjectName);

    if (!dataObjectSetting) {
      alert("Config object link to datasource is incorrect");
      return;
    }
    var konexyAPI = KONEXYAPI(dataObjectSetting);
    switch (dataObjectSetting.dataObject) {
      case DATA_OBJECT_THING:
        tempUrl = konexyAPI.urlThingLog(uri);
        break;
      case DATA_OBJECT_LIST_THING:
        alert("The datasource object is not a thing");
        return;

      case DATA_OBJECT_TREE:
        tempUrl = konexyAPI.urlTreeLog(uri);
        break;
      default:

        return;
    }

    return tempUrl;
  }

  function makeAuthorizationStr(setting) {
    var konexyAPI = KONEXYAPI(setting);
    var authorizationStr = "";
    switch (setting.authMethod) {
      case AUTH_METHOD_USERNAME:
        authorizationStr = konexyAPI.authenticationByUsername();
        break;
      case AUTH_METHOD_APIKEY:
        authorizationStr = konexyAPI.authenticationByAPIKEY();
        break;
      default:

    }

    return authorizationStr;
  }
}());