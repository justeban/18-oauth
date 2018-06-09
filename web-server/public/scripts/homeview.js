'use strict';

const ENV = {};

ENV.isProduction = window.location.protocol === 'https:';
ENV.productionApiUrl = 'https://salty-reef-53948.herokuapp.com';
ENV.developmentApiUrl = 'http://localhost:3000';
ENV.apiURL = ENV.isProduction ? ENV.productionApiUrl : ENV.developmentApiUrl;

let token = '';

$('#money').hide();

$('#money').on('click', function (e) {
  e.preventDefault();
  console.log('Sending Token', token);
  $.ajax({
    type: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
    },
    url: `${ENV.apiURL}/api/v1/users`,
    async: false,
    success: function (data) {
      $('#cash').text(data);
    },
  });
});

$('#signup').on('submit', function (e) {
  let username = $(this).find('[name=username]').val();
  let password = $(this).find('[name=password]').val();
  let postData = { username, password };

  e.preventDefault();
  $.ajax({
    type: 'POST',
    url: `${ENV.apiURL}/signup`,
    async: false,
    data: postData,
    success: function (data) {
      token = data;
      $('#money').show();
      $('#token').text(token);
    },
  });
});

$('#signin').on('submit', function (e) {
  e.preventDefault();
  let username = $(this).find('[name=username]').val();
  let password = $(this).find('[name=password]').val();
  let authstring = btoa(`${username}:${password}`);
  $.ajax({
    type: 'GET',
    url: `${ENV.apiURL}/signin`,
    async: false,
    headers: {
      'Authorization': 'Basic ' + authstring,
    },
    success: function (data) {
      token = data;
      $('#money').show();
      $('#token').text(token);
    },
  });
});

$('#oauth').append(`<a href="${ENV.apiURL}/login">Login With Auth0</a>`);