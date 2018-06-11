'use strict';

const app = {};
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
    async: true,
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
    async: true,
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

// $('#upload-form').on('submit', function (e) {
//   // e.preventDefault();
//   let token = document.cookie.replace(/token\=/i, '');
//   $.ajax({
//     type: 'POST',
//     url: `${ENV.apiURL}/upload`,
//     async: false,
//     headers: {
//       'Authorization': 'Bearer ' + token,
//     },
//   })
//     .then(data => console.log(data));

// });



app.initGuestView = () => {
  console.log('In guests');
  $('section').hide();
  $('#token').empty();
  $('#sign-in, #sign-up').show();
  $('#oauth').empty().append(`<a href="${ENV.apiURL}/login">Login With Auth0</a>`);
};

app.initSignedInView = (data) => {
  let token = document.cookie.replace(/token\=/i, '');
  console.log(data);
  $('#token').text(token);
  $('section').hide();
  $('#upload').show();
  $('#oauth').empty().append(`<a href="${ENV.apiURL}/logout">Logout</a>`);
  $('#upload-form').attr('action', `${ENV.apiURL}/upload`);
};


if (document.cookie && document.cookie.match(/token/i)) {
  let token = document.cookie.replace(/token\=/i, '');
  $.ajax({
    type: 'GET',
    url: `${ENV.apiURL}/signin`,
    async: false,
    headers: {
      'Authorization': 'Bearer ' + token,
    },
  })
    .then(profileID => {
      $.ajax({
        type: 'GET',
        url: `${ENV.apiURL}/api/v1/profiles/${profileID}`,
        async: true,
        header: {
          'Authorization': 'Bearer ' + token,
        },
      })
        .then(data => app.initSignedInView(data))
        .catch(error => console.log(error));
    })
    .catch(app.initGuestView()); 
} else {
  app.initGuestView();
}