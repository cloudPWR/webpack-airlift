/**
 * Some helper function for handling the AIRLIFT API
 * @author Nathan Horter <nate@cloudpwr.com>
 * @year 2015
 * @copyright cloudPWR
 */
(function ( airliftapi, $, undefined )
{
  /**
   * The id of the account to use when making queries to the API
   * @param {string}
   */
  airliftapi.account_id;

  /**
   * A random value submitted with the form data to prevent duplicate submissions
   * @param {string}
   */
  airliftapi.form_nonce;

  /**
   * The url parameters for the request
   * @param {object}
   */
  airliftapi.url_params = {};

  /**
   * Generates a nonce value to use with non-idempotent requests
   * @return {string}
   * @link https://www.thepolyglotdeveloper.com/2015/03/create-a-random-nonce-string-using-javascript/
   */
  airliftapi.getFormNonce = function ()
  {
    var nonce = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < 6; i++) {
      nonce += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return nonce;
  }

  /**
   * Updates the passed url with the paging and order parameters
   * @param {string} url The url to update
   * @return {string}
   */
  airliftapi.getPagingOrderUrl = function (url)
  {
    var amp = '?';
    if (url.indexOf('?') > -1) {
      amp = '&';
    }
    url += amp + airliftapi.getPagingHash();
    url += '&' + airliftapi.getOrderHash();
    return url;
  }

  /**
   * Gets the paging hash from the url
   * @return {string}
   */
  airliftapi.getPagingHash = function ()
  {
    var paging_hash = '';
    var page = airliftapi.getPage();
    paging_hash += 'page='+page;
    var page_size = airliftapi.getPageSize();
    paging_hash += '&page_size='+page_size;
    return paging_hash;
  }

  /**
   * Gets the page number from the url
   * @return {string}
   */
  airliftapi.getPage = function ()
  {
    var page = 1;
    var hash = window.location.hash
    if (hash.indexOf('page=') > -1) {
      var page_location = hash.indexOf('page=');
      var page_location_match = hash.match('page=[0-9]+');
      page = hash.substring(page_location+5, page_location_match[0].length+page_location);
    }
    return page;
  }

  /**
   * Gets the page size from the url
   * @return {string}
   */
  airliftapi.getPageSize = function ()
  {
    var page_size = 25
    var hash = window.location.hash
    if (hash.indexOf('page_size=') > -1) {
      var page_size_location = hash.indexOf('page_size=');
      var page_size_location_match = hash.match('page_size=[0-9]+');
      page_size = hash.substring(page_size_location+10, page_size_location_match[0].length+page_size_location);
    }
    return page_size;
  }

  /**
   * Gets the order by hash from the url
   * @return {string}
   */
  airliftapi.getOrderHash = function ()
  {
    var amp = '';
    var order_hash = '';
    var order_by = airliftapi.getOrderBy();
    if (order_by !== false && order_by !== 'none') {
      order_hash += 'order_by='+order_by;
      amp = '&';
    }
    var order_dir = airliftapi.getOrderDir();
    if (order_dir !== false) {
      order_hash += amp + 'order_dir='+order_dir;
    }
    return order_hash;
  }

  /**
   * Gets the order by from the url
   * @return {string}
   */
  airliftapi.getOrderBy = function ()
  {
    var hash = window.location.hash
    var order_by = false;
    if (hash.indexOf('order_by=') > -1) {
      var order_by = hash.indexOf('order_by=');
      var order_by_match = hash.match('order_by=[A-z]+');
      order_by = hash.substring(order_by+9, order_by_match[0].length+order_by);
    }
    return order_by;
  }

  /**
   * Gets the order direction from the url
   * @return {string}
   */
  airliftapi.getOrderDir = function ()
  {
    var hash = window.location.hash
    var order_dir = false;
    if (hash.indexOf('order_dir=') > -1) {
      var order_dir = hash.indexOf('order_dir=');
      var order_dir_match = hash.match('order_dir=[A-z]+');
      order_dir = hash.substring(order_dir+10, order_dir_match[0].length+order_dir);
    }
    return order_dir;
  }

  /**
   * Updates the pager based on the passed result data
   * @var {array} data The result data
   */
  airliftapi.updatePager = function (data)
  {
    if ($('#pager') == 'undefined') {
      return;
    }

    var result_count = data['meta']['count'];
    var page = data['meta']['page']
    var page_size = data['meta']['page_size']

    var page_count = Math.ceil(result_count/page_size);

    $('#pager ul li').remove();
    if (page_count > 1) {
      var order_hash = airliftapi.getOrderHash();
      var lower_limit = 1;
      if (page - 3 > 1) {
        lower_limit = page - 3;
      }
      var upper_limit = page_count;
      if (page + 3 < page_count)
      {
        upper_limit = page + 3;
      }

      if (lower_limit > 1) {
        $('#pager ul').append('<li><a href="#page=1&page_size='+page_size+order_hash+'"><<</a>');
      }
      for (var page_number = lower_limit; page_number <= upper_limit; page_number++) {
        if (page_number == page) {
          $('#pager ul').append(
            '<li class="active">'+
            '<a href="#page='+page_number+'&page_size='+page_size+order_hash+'">'+
            page_number+
            '</a>'
          );
        } else {
          $('#pager ul').append(
            '<li>'+
            '<a href="#page='+page_number+'&page_size='+page_size+order_hash+'">'+
            page_number+
            '</a>'
          );
        }
      }
      if (upper_limit < page_count) {
        $('#pager ul').append('<li><a href="#page='+page_count+'&page_size='+page_size+order_hash+'">>></a>');
      }
    } else {
      $('#pager ul').append(
        '<li class="active">'+
        '<a href="#page=1&page_size=1">1</a>'
      );
    }
    $('#pager').show();
  }

  /**
   * Returns the new order direction and order by to use in links
   * @return {object}
   */
  airliftapi.newOrder = function ()
  {
    var order_by = airliftapi.getOrderBy();
    var order_dir = airliftapi.getOrderDir();
    var new_order_dir = 'asc';
    var new_order_icon = 'fa-sort';
    if (order_dir == 'asc') {
      new_order_dir = 'desc';
      new_order_icon = 'fa-sort-asc';
    } else if (order_dir == 'desc') {
      new_order_dir = '';
      new_order_icon = 'fa-sort-desc';
    }
    return {'by':order_by, 'dir':new_order_dir, 'icon':new_order_icon};
  }

  /**
   * Parses an object id from the browser url
   * @return {array | nulled}
   */
  airliftapi.parseObjectId = function()
  {
    var search = /([a-z0-9\-]{36})\/?([A-z]+)?\/?(([a-z0-9\-]{36}))?/g;
    var id_match = search.exec(window.location);
    return id_match;
  }

  /**
   * Finds an object id in the application page url
   * @return {string | nulled}
   */
  airliftapi.getObjectId = function()
  {
    var id_match = airliftapi.parseObjectId();
    if (id_match != null &&
      id_match[1] != null
    ) {
      return id_match[1];
    }
    return;
  }

  /**
   * Finds the type of the child object
   * @return {string | nulled}
   */
  airliftapi.getChildObjectType = function ()
  {
    var id_match = airliftapi.parseObjectId();
    if (id_match != null &&
      id_match[2] != null
    ) {
      return id_match[2];
    }
    return;
  }

  /**
   * Finds an child id in the application page url
   * @return {string | nulled}
   */
  airliftapi.getChildId = function()
  {
    var id_match = airliftapi.parseObjectId();
    if (id_match != null &&
      id_match[3] != null
    ) {
      return id_match[3];
    }
    return;
  }

  /**
   * Searches the passed object type using the passed array of search values
   * on the AIRLIFT API.
   * Returns an array of search results
   * @param {string} object The name of the API object to search for
   * @param {object} search_array An associative array of search values to use
   *     to make the query: keys will be used as api query keys and values as values.
   * @param {function} results_callback A callback function to call with the api
   *     results
   * @param {object} callback_options An associative array of options to pass to the callback
   * @param {string} order_by The field to order by
   * @param {integer} page The page to use when calling the api
   * @param {array} parent_data The data from the parent's call
   * @return {array}
   */
  airliftapi.search = function (
    object,
    search_array,
    results_callback,
    callback_options,
    order_by,
    order_dir,
    page,
    exact,
    all_results
  ) {
    if (typeof object == 'undefined') {
      return [];
    }
    if (typeof search_array != 'object') {
      return [];
    }
    if (typeof order_dir == 'undefined') {
      order_dir = 'asc';
    }
    if (typeof page == 'undefined') {
      page = 1;
    }
    if (typeof parent_data == 'undefined') {
      parent_data = [];
    }
    if (typeof all_results == 'undefined') {
      all_results = true;
    }
    if (typeof exact == 'undefined') {
      exact = false;
    }
    var url = getSearchUrl(object, page, search_array, order_by, order_dir, exact);
    var response = $.Deferred();
    $.get(url)
      .done(function(data) {
        var result_count = data['meta']['count'];
        var page = data['meta']['page']
        var page_size = data['meta']['page_size']
        var page_count = Math.ceil(result_count/page_size);

        var results = {result:[], meta:data['meta']};
        results['result'] = results['result'].concat(escapeObjects(data['result']));

        var requests = [];
        if (all_results) {
          for (next_page = page + 1; next_page <= page_count; next_page++) {
            var url = getSearchUrl(object, next_page, search_array, order_by, order_dir, exact);
            var this_request = $.get(url)
              .done(function(next_data) {
                results['result'] = results['result'].concat(escapeObjects(next_data['result']))
              });
            requests.push(this_request);
          }
        }
        $.when.apply($, requests).done(function() {
          if (typeof results_callback == 'function') {
            results_callback(callback_options, results['result']);
          }
          response.resolve(results);
          airliftapi.updatePager(data);
        });
      })
      .fail(function( result ) {
        if (result.status == 401) {
          window.location = '/login';
          return;
        }
        if (typeof result.responseJSON != 'undefined') {
          var error_message = result.responseJSON.message;
          $('#error_box').html(
            '<div class="alert alert-danger">'+
            '<button type="button" class="close" data-dismiss="alert">&times;</button>'+
            'Error: ' + error_message +
            '</div>');
          $('#error_box').show();
        }
        response.reject();
      });
    return response;
  }

  /**
   * Searches the report endpoint using the passed array of search values
   * on the AIRLIFT API.
   * Returns an array of search results
   * @param {object} search_array An associative array of search values to use
   *     to make the query: keys will be used as api query keys and values as values.
   * @return {array}
   */
  airliftapi.reportSearch = function (
    search_array,
    all_results
  ) {
    if (typeof all_results == 'undefined') {
      all_results = false;
    }

    var page = 0
    var page_size = 10
    var url = getReportSearchUrl('reports', search_array, page, page_size);
    var response = $.Deferred();
    $.get(url)
      .done(function(data) {
        var result_count = data['hits']['total'];
        var page_count = Math.ceil(result_count/page_size);

        var results = {hits:{hits:[]}};
        results['hits']['hits'] = results['hits']['hits'].concat(data['hits']['hits']);
        results['hits']['max_score'] = data['hits']['max_score'];

        var requests = [];
        if (all_results) {
          for (next_page = page + 1; next_page < page_count; next_page++) {
            var url = getReportSearchUrl('reports', search_array, next_page, page_size);
            var this_request = $.get(url)
              .done(function(next_data) {
                results['hits']['hits'] = results['hits']['hits'].concat(data['hits']['hits']);
              });
            requests.push(this_request);
          }
        }
        $.when.apply($, requests).done(function() {
          if (typeof results_callback == 'function') {
            results_callback(callback_options, results['result']);
          }
          response.resolve(results);
        });
      })
      .fail(function( result ) {
        if (result.status == 401) {
          window.location = '/login';
          return;
        }
        if (typeof result.responseJSON != 'undefined') {
          var error_message = result.responseJSON.message;
          $('#error_box').html(
            '<div class="alert alert-danger">'+
            '<button type="button" class="close" data-dismiss="alert">&times;</button>'+
            'Error: ' + error_message +
            '</div>');
          $('#error_box').show();
        }
        response.reject();
      });
    return response;
  }

  function getSearchUrl(object, page, search_array, order_by, order_dir, exact)
  {
    var url = '/api/accounts/'+airliftapi.account_id+'/'+object+'?page='+page;
    $.each(search_array, function(search_key, search_value) {
      if (typeof search_key == 'undefined' ||
        search_key == '' ||
        typeof search_value == 'undefined'
      ) {
        return;
      }
      if (typeof search_value === 'string' ||
        search_value instanceof String
      ) {
        var search_values = []
        search_value.replace(/"([^"]*)"|'([^']*)'|(\S+)/g,
          function(g0,g1,g2,g3){
            search_values.push(g1 || g2 || g3 || '');
          });
        $.each(search_values, function(index, clean_value) {
          if (clean_value == '') {
            return;
          }
          if (!exact && search_key.indexOf('uuid') == -1) {
            clean_value = '%'+clean_value+'%';
          }
          url += '&' + search_key+'='+encodeURIComponent(clean_value);
        });
      } else {
        url += '&' + search_key+'='+encodeURIComponent(search_value.toString());
      }
    });
    if (typeof order_by != 'undefined') {
      url += '&order_by='+order_by+'&order_dir='+order_dir;
    }
    return url;
  }

  function getReportSearchUrl(object, search_array, page, page_size)
  {
    var url = '/api/accounts/'+airliftapi.account_id+'/'+object+'?from=' + ( page * page_size ) + '&size=' + page_size;
    $.each(search_array, function(search_key, search_value) {
      if (typeof search_key == 'undefined' ||
        search_key == '' ||
        typeof search_value == 'undefined'
      ) {
        return;
      }
      url += '&' + search_key+'='+encodeURIComponent(search_value);
    });
    return url;
  }

  /**
   * Sorts the passed fields according to their field order
   * @param {array} fields The array of fields to sort
   * @return {array}
   */
  airliftapi.sortFields = function(fields)
  {
    fields.sort(function (a, b) {
      if (typeof a['order'] == 'undefined' ||
        typeof b['order'] == 'undefined'
      ) {
        return 0;
      }
      if (parseInt(a['order']) > parseInt(b['order'])) {
        return 1;
      }
      if (parseInt(a['order']) < parseInt(b['order'])) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });
    return fields;
  }

  /**
   * Submits the passed object, POSTing or PUTting as necessary.
   * @param {string} object_name The api name of the object
   * @param {object} object The object to submit
   * @param {string|null} object_id The id of the object to submit
   * @param {string} csrftoken The csrf token to use to submit the object
   * @param {function} success_callback A callback function to call on success.
   * @param {function} failure_callback A callback function to call on failure.
   */
  airliftapi.submitObject = function(
    object_name,
    object,
    csrftoken,
    success_callback,
    success_callback_options,
    failure_callback,
    failure_callback_options
  ) {
    if (typeof success_callback_options == 'undefined') {
      success_callback_options = {};
    }
    if (typeof failure_callback_options == 'undefined') {
      failure_callback_options = {};
    }
    if (!airliftapi.form_nonce) {
      airliftapi.form_nonce = airliftapi.getFormNonce();
    }

    var action = 'POST';
    var url = '/api/accounts/'+airliftapi.account_id+'/'+object_name;
    if (typeof object['uuid'] != 'undefined') {
      action = 'PUT';
      url = url + '/' + object['uuid'];
    }

    var post_value = {
      'csrftoken' : csrftoken,
      'form_nonce' : airliftapi.form_nonce,
      'data' : JSON.stringify(object)
    }

    var submit = $.ajax({
      type: action,
      url: url,
      data: post_value,
      success: function(data, text_status, request){
        airliftapi.form_nonce = airliftapi.getFormNonce();
        if (typeof success_callback == 'function') {
          success_callback(
            data,
            text_status,
            request,
            success_callback_options
          );
        }
      },
    })
      .done(function( post_result ) {})
      .fail(function( post_result ) {
        if (post_result.status == 401) {
          window.location = '/login';
          return;
        }
        // The api returns 409 on dupulicate requests, we should ignore these
        if (post_result.status == 409) {
          return;
        }
        if (typeof post_result.responseJSON != 'undefined') {
          $('#error_box').html(
            '<div class="alert alert-danger">'+
            '<button type="button" class="close" data-dismiss="alert">&times;</button>'+
            'Error: '+post_result.responseJSON.message+'</div>'
          );
          $('#error_box').show();
          $("html, body").animate({ scrollTop: 0 }, "slow");
        }
        airliftapi.form_nonce = airliftapi.getFormNonce();
        if (typeof failure_callback != 'undefined') {
          failure_callback(
            post_result,
            failure_callback_options
          );
        }
      });
    return submit;
  }

  /**
   * Deletes the passed object,
   * @param {string} object_name The api name of the object
   * @param {string} object_id The id of the object to submit
   * @param {string} csrftoken The csrf token to use to submit the object
   */
  airliftapi.deleteObject = function(
    object_name,
    object_id,
    csrftoken
  ) {
    var result = $.Deferred();
    if (typeof object_name == 'undefined') {
      return result.reject();
    }
    if (typeof object_id == 'undefined') {
      return result.reject();
    }
    if (typeof csrftoken == 'undefined') {
      return result.reject();
    }

    var delete_value = {
      'csrftoken' : csrftoken,
      'form_nonce' : airliftapi.form_nonce,
    }

    var url = '/api/accounts/'+airliftapi.account_id+'/'+object_name+'/'+object_id;
    return $.ajax({
      type: 'DELETE',
      url: url,
      data: delete_value,
    })
      .done(function( post_result ) {})
      .fail(function( post_result ) {
        if (post_result.status == 401) {
          window.location = '/login';
          return;
        }
        // The api returns 409 on dupulicate requests, we should ignore these
        if (post_result.status == 409) {
          return;
        }
        $('#error_box').html(
          '<div class="alert alert-danger">'+
          '<button type="button" class="close" data-dismiss="alert">&times;</button>'+
          'Error: '+post_result.responseJSON.message+'</div>'
        );
        $('#error_box').show();
        $("html, body").animate({ scrollTop: 0 }, "slow");
        airliftapi.form_nonce = airliftapi.getFormNonce();
      });
  }

  /**
   * Encodes data from the API
   * @param {string} output The output value to encode
   * @return {string}
   */
  airliftapi.encodeHTMLOutput = function(output)
  {
    var encoded_output = output;
    if (typeof encoded_output !== "undefined" &&
      typeof encoded_output.replace !== "undefined"
    ) {
      encoded_output = encoded_output.replace(/&/g, '&amp;');
      encoded_output = encoded_output.replace(/</g, '&lt;');
      encoded_output = encoded_output.replace(/>/g, '&gt;');
      encoded_output = encoded_output.replace(/"/g, '&quot;');
      encoded_output = encoded_output.replace(/'/g, '&#x27;');
      encoded_output = encoded_output.replace(/\//g, '&#x2F;');
    }
    return encoded_output;
  }

  /**
   * Decode encoded data
   * THIS HAS SECURITY IMPLICATIONS!!! USE WITH CAUTION!!!
   * @param {string} output The output value to decode
   * @return {string}
   */
  airliftapi.decodeHTMLOutput = function(output)
  {
    var encoded_output = output;
    if (typeof encoded_output !== "undefined" &&
      typeof encoded_output.replace !== "undefined"
    ) {
      encoded_output = encoded_output.replace(/&#x2F;/g, '/');
      encoded_output = encoded_output.replace(/&#x27;/g, '\'');
      encoded_output = encoded_output.replace(/&quot;/g, '"');
      encoded_output = encoded_output.replace(/&gt;/g, '>');
      encoded_output = encoded_output.replace(/&lt;/g, '<');
      encoded_output = encoded_output.replace(/&amp;/g, '&');
    }
    return encoded_output;
  }

  /**
   * Escapes the passed objects and returns the escaped values
   * @param {object} object The objects to escape
   * @return {object}
   */
  function escapeObjects(objects)
  {
    if (objects == null) {
      return null
    }
    if (typeof objects !== 'object') {
      return airliftapi.encodeHTMLOutput(objects);
    }

    for(property in objects) {
      if (!objects.hasOwnProperty(property)) {
        continue;
      }
      if (typeof objects[property] == 'object') {
        objects[property] = escapeObjects(objects[property]);
        continue;
      }
      objects[property] = airliftapi.encodeHTMLOutput(objects[property]);
    }
    return objects;
  }

}( window.airliftapi = window.airliftapi || {}, jQuery ));

// http://stackoverflow.com/a/2880929
(window.onpopstate = function () {
  var match,
      pl     = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      query  = window.location.search.substring(1),
      html_escape = function (s) { return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;') };

  airliftapi.url_params = {};
  while (match = search.exec(query))
    airliftapi.url_params[decode(match[1])] = html_escape(decode(match[2]));
})();
