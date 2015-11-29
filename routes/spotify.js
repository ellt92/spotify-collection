module.exports = function(app) {
    app.get('/mytracks', function(req, res) {
        get_user_track_list(function(returned_body) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(returned_body));
        });
    });
    app.get('/myalbums', function(req, res) {
        var access_token = req.query.access_token;
        get_album_list(function(result){
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        });
    });
    //TODO add_album_list_to_db doesn't exist, update with the new database methods
    app.get('/update_albums', function(req, res) {
        var access_token = req.query.access_token;
        get_album_list(function(album_list){
            add_album_list_to_db(access_token, album_list, function(){
                res.end('added everything');
            });
        });
    });
};
