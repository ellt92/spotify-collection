var express = require('express'); // Express web server framework¬
var app = express();

require('./routes/authentication')(app);
require('./routes/spotify')(app);

console.log('Listening on 9999');
app.listen(9999);
