require("dotenv").config();
var keys = require("./keys.js");
const Spotify = require("node-spotify-api");

const axios = require("axios");
const inquirer = require("inquirer");
function menu() {
    inquirer.prompt([{
        type: "list",
        message: "Please select what you want to search:",
        choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says", "exit"],
        name: "search"
    }]).then(function (response) {
        switch (response.search) {
            case "concert-this":
                break;
            case "spotify-this-song":
                break;
            case "movie-this":
                break;
            case "do-what-it-says":
                break;
            default:
                return;
        }

    });
}

//query the movies api
function searchMovies(movie) {
    const url = `http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=trilogy`;
    axios.get(url).then(
        function (response) {
            console.log(response);
        }
    );
}

//query bands api
function searchBands(artist) {
    const url = `https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`
    axios.get(url).then(function (response) {
        console.log(response);
    });
}

//Searcg in spotify API
function searchSpotify() {
    const type = "";
    const query = "";
    const SPOTIFY = new Spotify({
        id = spotify.key,
        secret = spotify.secret
    });

    SPOTIFY
        .search({ type: TYPE, query: QUERY })
        .then(function (response) {

        });
}
