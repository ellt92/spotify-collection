var async = require('async');
var https = require("https");


var database = require('/services/database');
//TODO implement this method
function get_access_token() {
}

function get_user_track_list(cb) {
    var access_token = get_access_token();
    var all_tracks = [];
    var next = 'https://api.spotify.com/v1/me/tracks?offset=0&limit=50';
    async.whilst(
        function() {
            return next !== null;
        },
        function(callback) {
            var options = {
                hostname: 'api.spotify.com',
                path: next,
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            };
            var bodyChunks = [];
            var req = https.request(options, function(res) {
                res.on('data', function(d) {
                    bodyChunks.push(d);
                }).on('end', function() {
                    var bodyBuffer = Buffer.concat(bodyChunks);
                    var track_list = JSON.parse(bodyBuffer.toString('utf8'));
                    next = track_list.next;
                    all_tracks = all_tracks.concat(track_list.items);
                    callback();
                });
            });
            req.on("error", function(e){
                console.log("Got error: " + e);
            });
            req.end();
        },
        function() {
            return cb(all_tracks);
        }
    );
}

function get_albums_from_track_list(tracks, callback) {
    async.map(
        tracks,
        function(item, callback) {
            callback(null, item.track.album.id);
        },
        function(err, results) {
            callback(results);
        }
    );
}

function get_unique_albums(albums, callback) {
    var u_albums = [];
    async.filter(albums,
        function(item, callback) {
            if (u_albums.indexOf(item) == -1){
                u_albums.push(item);
                callback(true);
            } else {
                callback(false);
            }
        },
        function(results) {
            callback(results);
        }
    );
}

function get_album_list(callback) {
    var access_token = get_access_token();
    async.waterfall([
        function(callback) {
            get_user_track_list(access_token, function(tracks){
                callback(null, tracks);
            });
        },
        function(tracks, callback) {
            get_albums_from_track_list(tracks, function(albums){
                callback(null, albums);
            });
        },
        function(albums, callback) {
            get_unique_albums(albums, function(u_albums){
                callback(null, u_albums);
            });
        },
    ], function(err, result){
        callback(result);
    });
}

function get_album(access_token, album_id, callback) {
        var options = {
            hostname: 'api.spotify.com',
            path: "/v1/albums/" + album_id,
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };
        var bodyChunks = [];
        var req = https.request(options, function(res) {
            res.on('data', function(d) {
                bodyChunks.push(d);
            }).on('end', function() {
                var bodyBuffer = Buffer.concat(bodyChunks);
                var album_response = JSON.parse(bodyBuffer.toString('utf8'));
                callback(album_response);
            });
        });
        req.on("error", function(e){
            console.log("Got error: " + e);
        });
        req.end();
}
