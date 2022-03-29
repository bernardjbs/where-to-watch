const IMDB_apiKey = ["k_y4wdrion", "k_ie3pfgw9", "k_o18qbud0", "k_tfp7sn7o", "k_51hudf0k", "k_zz238cmu"];
const TMBD_apiKey = "30584b857c462403f3b7916157ab32b7";
let IMBD_personIDs = [];
let API_index = 1;


let actorsEl = document.querySelector("#actors");
let actorsH3 = $("#main-cast");
let reviewContainerEl = $("#review-container");

// Constant object to get nested object from API
const getNestedObject = (nestedObj, pathArr) => {
    return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
}

function getParams() {
    urlSearch = new URL(window.location.href);
    let movieID = urlSearch.searchParams.get("id");
    return movieID;
}

function getMovieObject(movieId) {
    // Title API url from IMDB 
    const IMDB_requestUrl_Title = `https://imdb-api.com/en/API/Title/${IMDB_apiKey[API_index]}/${movieId}/FullCast.Posters`


    // Fetch request to Title API from IMBD
    fetch(IMDB_requestUrl_Title)
        .then(response => {
            return response.json();
        })
        .then(IMDB_title_data => {
            return getMovie_IMDB_TITLE(IMDB_title_data);
        })
        .then(Movie => {
            // console.log("Movie in getApi 01: " + JSON.stringify(movie));
            return getApi_TMDB(Movie);
        })
}

function getApi_TMDB(Movie) {

    for(i=0; i<Movie.mainCast.length; i++) {
        console.log("Main cast len: " + Movie.mainCast[i]);
    }

    // URL for TMDB FIND API
    const TMDB_requestUrl_Person = `https://api.themoviedb.org/3/find/nm1500155?api_key=${TMBD_apiKey}&language=en-US&external_source=imdb_id`

    // Fetch request to Find API from TMDB
    fetch(TMDB_requestUrl_Person)
        .then(function (response) {
            return response.json();
        })
        .then(data => {

            for (let key in data) {
                console.log(key + ": ", data[key]);
            }

            //Get the tmdb person id and set it to the movie object
            let id = data.person_results[0].id;
            Movie.tmdbId = id;
            return Movie;
        })
        .then(Movie => {
            console.log("The latest Movie Obj: " + JSON.stringify(Movie));
        })
}

function getMovie_IMDB_TITLE(IMDB_title_data) {
    Movie = {
        imdbMovieID: IMDB_title_data.id,
        movieDescription: IMDB_title_data.plot,
        movieReleaseDate: IMDB_title_data.releaseDate,
        movieGenres: IMDB_title_data.genres,
        movieCertificate: IMDB_title_data.contentRating,
        ...getCastNames(IMDB_title_data),
        ...getPosterLink(IMDB_title_data),
    }
    return Movie;
}

function getPosterLink(IMDB_title_data) {
    const nest_dataPoster = getNestedObject(IMDB_title_data, ["posters", "posters"]);
    const posterImgLink = getNestedObject(nest_dataPoster, [0, "link"]);
    return {
        movieImage: posterImgLink
    }
}
function getCastNames(IMDB_title_data) {
    const fullCast = getNestedObject(IMDB_title_data, ["fullCast", "actors"]);
    let mainCastArr = [];
    let mainCastObj = {};
    const numberOfCast = 3;

    for (i = 0; i < numberOfCast; i++) {
        mainCastObj = {
            imdbCastID: getNestedObject(fullCast, [i, "id"]), 
            castName: getNestedObject(fullCast, [i, "name"])
        }
        mainCastArr.push(mainCastObj);
    }

    // for (let key in IMDB_title_data) {
    //     console.log(key + ": ", IMDB_title_data[key]);
    // }

    return {
        movieTitle: IMDB_title_data.title,
        mainCast: mainCastArr
    }
}

getMovieObject(getParams());

//MOVIE OBJECT
// let Movie = {
//     imdbMovieID: string,
//     tmdbMovieID: number,
//     movieTitle: string,
//     movieDescription: string,
//     movieReleaseDate: Date,
//     movieGenres: string,
//     movieCertificate: string, // "PG", "G", "PG-13"
//     movieImage: string,
//     mainCast: [{imdbCastID: number,
//                 tmbdCastID: number,
//                 castName: string,
//                 latestMovies: [{imdbMovieID: number,
//                                 tmbdMovieID: number,
//                                 movieTitle: string
//                             }]
//     }],
//     movieImdbRating: string, ///{lang?}/API/Ratings/{apiKey}/{id} --> imDb
//     movieAudienceReview: number, //{lang?}/API/UserRatings/{apiKey}/{id} --> .totalRatingVotes
//     movieGoodReviews: [{
//         reviewerName: string, //{lang?}/API/Reviews/{apiKey}/{id} --> username
//         reviewerScore: number, //{lang?}/API/Reviews/{apiKey}/{id} --> rate
//         reviewerComment: string //{lang?}/API/Reviews/{apiKey}/{id} --> title
//     }],
//     movieBadReviews: [{
//         reviewerName: string,
//         reviewerScore: number,
//         reviewerComment: string
//     }],
//     streamServices: [{
//         streamSvcID: number,
//         streamSvcName: string
//     }]
// }