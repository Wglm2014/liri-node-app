require("dotenv").config();
const keys = require("./keys");
const Spotify = require("node-spotify-api");
const axios = require("axios");
const inquirer = require("inquirer");
const fs = require("fs");
const moment = require("moment");

//calling menu first time
menu();

//display main menu
function menu() {
    inquirer.prompt([{
        type: "list",
        message: "Please select what you want to search:",
        choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says", "exit"],
        name: "search"
    }]).then(function (response) {
        let question = "Please enter the name of the ";
        switch (response.search) {
            case "concert-this":
                question += "Artist/Band: ";
                nextQuestion(question, "band");
                break;
            case "spotify-this-song":
                question += "Song: ";
                nextQuestion(question, "song");
                break;
            case "movie-this":
                question += "Movie: ";
                nextQuestion(question, "movie");
                break;
            case "do-what-it-says":
                readRandomTxt();
                break;
            default:
                return;
        }
    });
} // end of main menu

// prompt the band, song or  movie to be search
function nextQuestion(question, menu) {
    inquirer.prompt([
        {
            type: "text",
            message: question,
            name: "answer"
        }]).then(function (response) {
            //the switch-case from the function menu sends the value 
            //to call the function that will search the specific API
            switch (menu) {
                case "band":
                    searchBands(response.answer);
                    break;
                case "song":
                    searchSpotify(response.answer);
                    break;
                case "movie":
                    searchMovies(response.answer);
                    break;
                default:
            }
        });
}

//query bands api
function searchBands(artist) {
    console.log(artist);
    const url = `https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`
    axios.get(url).then(function (response) {
        // name of the band, venue location, date of event
        response.data.forEach(element => {
            console.log(`Name of Bands/Artists to Perform: ${element.lineup.join(", ")}`);
            console.log(`Venue name ${element.venue.name}, ${element.venue.city}, ${element.venue.region}, ${element.venue.country}`);
            const dateOfEvent = moment(element.datetime).format('LLLL');
            console.log(`Date of event ${dateOfEvent}`)
            console.log("-----------------------------------------------------------------")
        });

        continueMenu();
    }).catch(function (error) {
        console.log(error);
    });
}

//Searcg in spotify API
function searchSpotify(songToSearch) {
    const SPOTIFY = new Spotify({
        id: keys.spotify.idSpotify,
        secret: keys.spotify.secretSpotify
    });
    SPOTIFY
        .search({ type: "track", query: songToSearch })
        .then(function (response) {
            //artists, song's name, link of the song, name of album
            console.log(response.tracks.items.length);
            response.tracks.items.forEach(element => {

                element.artists.forEach(singer => { console.log(`Artists Name ${singer.name}`); })

                console.log(`Song's Name: ${element.name}`)
                console.log(`Link of the Song: "${element.href}"`);
                console.log(`Name of Album: ${element.album.name}`);
                console.log("---------------------------------------------------")
            });
            continueMenu();
        });
}
//query the movies api
function searchMovies(movie) {
    const url = `http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=trilogy`;
    axios.get(url).then(
        function (response) {
            if (response.data == null) {
                console.log(`Movie Title: ${response.data.Title}`);
                console.log(`Year Release: ${response.data.Year}`);
                console.log(`Imdb Rating: ${response.data.imdbRating}`);
                //response.data.Ratings.filter("")
                if (Object.values(response.data.Ratings).length > 1) {
                    console.log(Object.values(response.data.Ratings[1]).join(": "));
                } else {
                    console.log("Rotten tomatoes: not rated yet");
                }
                console.log(`Country: ${response.data.Country}`);
                console.log(`Languages: ${response.data.Language}`);
                console.log(`Plot: ${response.data.Plot}`);
                console.log(`Main Cast: ${response.data.Actors}`);
                console.log(`------------------------------------------------------`)
            } else {
                console.log("movie not found");
            }

            continueMenu();
        }
    ).catch(function (error) {
        console.log(`Oh oh, something went wrong...${error}`);
        continueMenu();
    });
}

function readRandomTxt() {
    fs.readFile("ramdon.txt", "UTF8", function (error, data) {
        if (error) {
            console.log("error while reading file random.txt");
            return
        }
        console.log(data);
        searchBands(data);
    });

}

function continueMenu() {
    inquirer.prompt({
        type: "confirm",
        name: "continue",
        message: "Back to Main Menu?"
    }).then(function (response) {
        if (response.continue) {
            menu();
        } else {
            console.log("good by");
            return;
        }
    });
}
