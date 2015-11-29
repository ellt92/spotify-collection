var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/spotify_collection');

var albumSchema = mongoose.Schema({
    uri: String,
    name: String,
    images: Array,
    tracks: Object
});
var Album = mongoose.model('Album', albumSchema);

var userSchema = mongoose.Schema({
    username: String,
    email: String,
    password_hash: String,
    albums: Array,
    access_token: String,
});
var User = mongoose.model('User', userSchema);

// callback returns true if album is currently in DB
function add_album_to_db(album, callback) {
    Album.find({'uri':album.uri}, function(err, docs) {
        if (docs.length > 0) {
            callback(true);
        } else {
            var a = new Album({
                name: album.name,
                uri: album.uri,
                images: album.images,
                tracks: album.tracks
            });
            save_model_to_db(a, callback);
        }
    });
}

// callback returns album if available, returns null otherwise
function get_album(uri, callback) {
    Album.find({'uri':'spotify:album:'+uri}, function(err, docs) {
        if (docs.length > 0) {
            a = docs[0];
            callback(a);
        } else {
            callback(null);
        }
    });
}

// callback returns success if the access_token has been updated
function update_access_token(username, access_token, callback) {
    User.find({'username':username}, function(err, docs) {
        if (docs.length > 0) {
            user = docs[0];
            user.access_token = access_token;
            save_model_to_db(user, callback);
        } else {
            callback(false);
        }
    });
}

// callback returns token if user available, returns null otherwise
function get_user_access_token(username, callback) {
    User.find({'username':username}, function(err, docs) {
        if (docs.length > 0) {
            user = docs[0];
            callback(user.access_token);
        } else {
            callback(null);
        }
    });
}

function add_albums_to_user(username, albums, callback) {
    User.find({'username':username}, function(err, docs) {
        if (docs.length > 0) {
            user = docs[0];
            for(var i = 0; i < albums.length; i++) {
                if (user.albums.indexOf(albums[i]) == -1) {
                    user.albums.push(albums[i]);
                }
            }
            save_model_to_db(user, callback);
        } else {
            callback(false);
        }
    });
}

function get_user_albums(username, callback) {
    User.find({'username':username}, function(err, docs) {
        if (docs.length > 0) {
            user = docs[0];
            callback(user.albums);
        } else {
            callback(null);
        }
    });
}

function add_user(user_model, callback) {
    User.find({'username': user_model.username}, function(err, docs) {
        if (docs.length > 0) {
            callback(null);
        } else {
            var u = new User({
                username: user_model.username,
                email: user_model.email,
                password_hash: user_model.password_hash,
                albums: user_model.albums,
                access_token: user_model.access_token,
            });
            save_model_to_db(u, callback);
        }
    });
}

function save_model_to_db(model, callback) {
    model.save(function(err, model){
        if(err !== null) {
            callback(false);
        } else {
            callback(true);
        }
    });
}

module.exports = {
    get_album: get_album,
    add_user: add_user,
    update_access_token: update_access_token,
    get_user_access_token: get_user_access_token,
    get_user_albums: get_user_albums,
    add_albums_to_user: add_albums_to_user
};
