const IMDB_apiKey = ["k_y4wdrion", "k_ie3pfgw9", "k_o18qbud0", "k_tfp7sn7o", "k_51hudf0k", "k_zz238cmu"];
const TMBD_apiKey = "30584b857c462403f3b7916157ab32b7";
let IMBD_personIDs = [];
let API_index = 4;
const numberOfCast = 3; // number of main cast to be filled in mainCast array from the Movie object

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

async function getMovieObject(movieId) {
    // TITLE API url from IMDB 
    const IMDB_requestUrl_Title = `https://imdb-api.com/en/API/Title/${IMDB_apiKey[API_index]}/${movieId}`

    // Get json data from IMDB/TITLE API
    const response_IMDB_TITLE = await fetch(IMDB_requestUrl_Title);
    const json_IMDB_TITLE = await response_IMDB_TITLE.json();

    // for (let key in json_IMDB_TITLE) {
    //     console.log(key + ": ", json_IMDB_TITLE[key]);
    // }

    const imdbMovieID = json_IMDB_TITLE.id;
    const IMDB_requestUrl_Ratings = `https://imdb-api.com/en/API/Ratings/${IMDB_apiKey[API_index]}/${imdbMovieID}`

    // Get json data from IMDB/RATINGS API
    const response_IMDB_RATINGS = await fetch(IMDB_requestUrl_Ratings)
    const json_IMDB_RATINGS = await response_IMDB_RATINGS.json();


    const movieImdbRating = json_IMDB_RATINGS.imDb;
    const movieTitle = json_IMDB_TITLE.title;
    const movieDescription = json_IMDB_TITLE.title;
    const movieReleaseDate = json_IMDB_TITLE.releaseDate;
    const movieGenres = json_IMDB_TITLE.genres;
    const movieCertificate = json_IMDB_TITLE.contentRating;
    const movieImage = json_IMDB_TITLE.image;
    let mainCast = await getMainCast(json_IMDB_TITLE.actorList);

    return {
        imdbMovieID: imdbMovieID,
        movieImdbRating: movieImdbRating,
        movieTitle: movieTitle,
        movieDescription: movieDescription,
        movieReleaseDate: movieReleaseDate,
        movieGenres: movieGenres,
        movieCertificate: movieCertificate,
        movieImage: movieImage,
        mainCast: mainCast
    }
}

async function getMainCast(actorList) {
    let mainCastArr = [];
    let mainCastObj = {};
    for (i = 0; i < numberOfCast; i++) {
        const imdbCastID = actorList[i].id;
        TMDB_requestUrl_Find = `https://api.themoviedb.org/3/find/${imdbCastID}?api_key=${TMBD_apiKey}&language=en-US&external_source=imdb_id`
        // Get json data from TMDB/FIND API
        const response_TMDB_FIND = await fetch(TMDB_requestUrl_Find);
        const json_TMDB_FIND = await response_TMDB_FIND.json();

        // console.log("TMDB request json: " + JSON.stringify(json_TMDB_FIND));
        for (let key in json_TMDB_FIND) {
            console.log(key + ": ", json_TMDB_FIND[key]);
        }
        mainCastObj = {
            imdbCastID: imdbCastID,
            tmbdCastID: json_TMDB_FIND.person_results[0].id,
            castName: actorList[i].name
        }
        mainCastArr.push(mainCastObj);
    }
    return mainCastArr;
}

getMovieObject(getParams()).then(Movie => {
    for (let key in Movie) {
        console.log(key + ": ", Movie[key]);
    }
});
