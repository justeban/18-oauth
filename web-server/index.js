'use strict';

const express = require('express');
const app = express();

app.use(express.static('./public'));

app.listen(PORT, () => {
  console.log('Web Server up on port', process.env.PORT);
});