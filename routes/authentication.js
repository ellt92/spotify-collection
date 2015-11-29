var querystring = require('querystring');
var request = require('request'); // "Request" library¬

var client_id = '85d23501999b4f329b6c32ffbe19eef4'; // Your client id¬
var client_secret = 'e8e74d95f0df42df99c0e19f016ed8d0'; // Your client secret¬
var redirect_uri = 'http://localhost:9999/callback'; // Your redirect uri¬


module.exports = function(app) {
    app.get('/spotifylogin', function(req, res) {
        var state = 1234567890123456;
        var scope = 'user-read-private user-read-email user-library-read';
        res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
    });
    app.get('/callback', function(req, res) {

        var code = req.query.code || null;
        var state = req.query.state || null;

        if (state === null) {
            res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
        } else {
            var authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                    code: code,
                    redirect_uri: redirect_uri,
                    grant_type: 'authorization_code'
                },
                headers: {
                    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
                },
                json: true
            };
            request.post(authOptions, function(error, response, body) {
                if (!error && response.statusCode === 200) {
                    var access_token = body.access_token,
                    refresh_token = body.refresh_token;
                    res.redirect('/landing.html');
                } else {
                    res.redirect('/#' +
                        querystring.stringify({
                            error: 'invalid_token'
                        }));
                }
            });
        }
    });
};
