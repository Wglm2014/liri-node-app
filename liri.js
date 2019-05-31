//loading keys for spotify use
require("dotenv").config();
const keys = require("./keys");
//load npm packages
const Spotify = require("node-spotify-api");
const axios = require("axios");
const inquirer = require("inquirer");
const moment = require("moment");
//requier file system
const fs = require("fs");

//call main menu function
menu();

//functions definition
//display main menu
function menu() {
    //promt selection of what to search for
    inquirer.prompt([{
        type: "list",
        message: "Please select what you want to search:",
        choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says", "exit"],
        name: "search"
    }]).then(function (response) {
        //elaborate the question ask to the user
        let question = "Please enter the name of the ";
        switch (response.search) {
            case "concert-this":
                question += "Artist/Band: ";
                break;
            case "spotify-this-song":
                question += "Song: ";
                break;
            case "movie-this":
                question += "Movie: ";
                break;
            case "do-what-it-says":
                //if the user chose do what is says call the funcion to retrieve data from file
                readRandomTxt(response.search);
                break;
            default:
                // function ends if user chose exit
                return;
        }
        // call function to ask next question to the user
        nextQuestion(question, response.search);
    });
} // end of main menu

// prompt the band, song or  movie to be search
function nextQuestion(question, searchType) {
    inquirer.prompt([
        {
            type: "text",
            message: question,
            name: "answer"
        }]).then(function (response) {
            //calling specific function to search api
            decision(searchType, response.answer);
        });
}

//query bands api
function searchBands(searchType, artist) {
    console.log(artist);
    const url = `https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`
    axios.get(url).then(function (response) {
        //built data object key name of artist searched to store in log.txt file
        let data = `{"${searchType} ${artist}":[`;

        // cosonle all the events for the artist or band
        response.data.forEach(element => {
            // format date and time of event
            const dateOfEvent = moment(element.datetime).format('LLLL');
            // built
            data += `{"Name of Bands/Artists to Perform":"${element.lineup}",
                      "Venue name":["${element.venue.name}", "${element.venue.city}", "${element.venue.region}", "${element.venue.country}"],
                      "Date of event: "${dateOfEvent}"},`;

            console.log(`Name of Bands/Artists to Perform: ${element.lineup.join(", ")}`);
            console.log(`Venue name ${element.venue.name}, ${element.venue.city}, ${element.venue.region}, ${element.venue.country}`);
            console.log(`Date of event ${dateOfEvent}`)
            console.log("-----------------------------------------------------------------")
        });
        data = data.substr(0, data.length - 1);
        data += "]},";
        logData(data);
    }).catch(error => {
        console.log(error);
        continueMenu();
    });
}

//Searcg in spotify API
function searchSpotify(searchType, songToSearch) {
    const SPOTIFY = new Spotify({
        id: keys.spotify.idSpotify,
        secret: keys.spotify.secretSpotify
    });
    SPOTIFY
        .search({ type: "track", query: songToSearch })
        .then(function (response) {
            //artists, song's name, link of the song, name of album
            //data added is an array of objects
            let data = `{"${searchType} ${songToSearch}":[`
            response.tracks.items.forEach(element => {
                let artists = [];
                element.artists.forEach(singer => {
                    console.log(`Artists Name ${singer.name}`);
                    artists.push(singer.name);
                })

                console.log(`Song's Name: ${element.name}`)
                console.log(`Link of the Song: "${element.href}"`);
                console.log(`Name of Album: ${element.album.name}`);
                console.log("---------------------------------------------------")
                data += `{
                "artists":"${artists}";
                "Song's Name": "${element.name}",
                "Link of the Song":"${element.href}",
                "Name of Album":"${element.album.name}"
                },`;
            });
            data = data.substr(0, data.length - 1);
            data += "]},"
            logData(data);
        }).catch(err => {
            console.log(err);
            continueMenu();
        });
}
//query the movies api
function searchMovies(searchTypemovie, movie) {
    const url = `http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=trilogy`;
    axios.get(url).then(
        function (response) {
            let data = "";
            //console.log(response.data);
            if (response.data !== null) {

                console.log(`Movie Title: ${response.data.Title}`);
                console.log(`Year Release: ${response.data.Year}`);
                console.log(`Imdb Rating: ${response.data.imdbRating}`);
                //response.data.Ratings.filter("")
                let rott = "";
                if (Object.values(response.data.Ratings).length > 1) {
                    rott = Object.values(response.data.Ratings[1]).join(": ");

                } else {
                    rott = "Rotten tomatoes: not rated yet";
                }
                console.log(rott);
                console.log(`Country: ${response.data.Country}`);
                console.log(`Languages: ${response.data.Language}`);
                console.log(`Plot: ${response.data.Plot}`);
                console.log(`Main Cast: ${response.data.Actors}`);
                console.log(`------------------------------------------------------`);
                rott = rott.split(":");
                data = `{"${searchType} ${movie}":{
                "Movie Title": "${response.data.Title}"
                "Year Release": "${response.data.Year}",
                "Imdb Rating": "${response.data.imdbRating}",
                "${rott[0]}":"${rott[1]}",
                "Country": "${response.data.Country}",
                "Languages": "${response.data.Language}",
                "Plot": "${response.data.Plot}",
                "Main Cast": "${response.data.Actors}"
                },`
            } else {
                console.log("movie not found");
            }

            logData(data);
        }
    ).catch(err => {
        console.log(`Oh oh, something went wrong...${err}`);
        continueMenu();
    });
}

function readRandomTxt(searchType) {
    fs.readFile("ramdon.txt", "UTF8", function (error, data) {
        if (error) {
            console.log("error while reading file random.txt");
            return
        }
        console.log(data);
        const index = Math.floor(Math.random() * data.length)
        const sentence = data[index];
        const newSearchType = sentence.substr(0, sentence.indexOf(" ").trim());
        const newName = sentence.substr(sentence.indexOf(" "), sentence.length).trim();
        decision(newSearchType, newName);
    });

}

function decision(searchType, name) {
    //adding search if band, movie or song to ramdon file
    const newSearch = `,"${searchType} ${name}"`;
    fs.appendFile("ramdon.txt", newSearch, err => {
        if (err) {
            console.log(err);
        }
    });

    switch (searchType) {
        case "concert-this":
            searchBands(searchType, response.answer);
            break;
        case "spotify-this-song":
            searchSpotify(searchType, response.answer);
            break;
        case "movie-this":
            searchMovies(searchType, response.answer);
            break;
        default:
        // no fuctionality required by default
    }
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

function logData(data) {
    fs.appendFile("log.txt", data, err => {
        if (err) {
            console.log("error when trying to write on file");
        }
        continueMenu();
    });
}
