var app = angular.module('trialsReportApp');

app.service('util', [

  function () {
    return new function () {
      var urlRegex = /{(\w+)}/;

      //this.buildApiUrl = function (endpoint, tokens, params) {
      //  return this.buildUrl(config.api + '/' + endpoint, tokens) + this.encodeQueryParams(params);
      //};

      this.encodeQueryParams = function(params) {
        var queryParams = '';

        if (params) {
          queryParams = '?';
          for (var prop in params) {
            queryParams += encodeURIComponent(prop) + '=' + encodeURIComponent(params[prop]) + '&';
          }
          queryParams = queryParams.substring(0, queryParams.length - 1);
        }

        return queryParams;
      };

      this.buildUrl = function (url, tokens) {
        var match;

        while (match = urlRegex.exec(url)) {
          if (null == tokens[match[1]]) {
            throw 'Missing "' + match[1] + '" for ' + url;
          }
          url = url.replace(match[0], tokens[match[1]]);
        }

        return url;
      };
    };
  }
]);
