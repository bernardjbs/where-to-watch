const IMDB_apiKey = ["k_y4wdrion", "k_ie3pfgw9", "k_o18qbud0", "k_tfp7sn7o", "k_51hudf0k", "k_zz238cmu"];
const TMBD_apiKey = "30584b857c462403f3b7916157ab32b7";
const WATCHMODE_apiKey = "lnAhE3QwqgGUHY6EJyquVyNpJB5zelnG4Fc8RRIH";
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

    const imdbMovieID = json_IMDB_TITLE.id;
    const IMDB_requestUrl_Ratings = `https://imdb-api.com/en/API/Ratings/${IMDB_apiKey[API_index]}/${imdbMovieID}`

    // Get json data from IMDB/RATINGS API
    const response_IMDB_RATINGS = await fetch(IMDB_requestUrl_Ratings)
    const json_IMDB_RATINGS = await response_IMDB_RATINGS.json();

    // USER RATINGS API url from IMDB
    const IMDB_requestUrl_UserRatings = `https://imdb-api.com/en/API/UserRatings/${IMDB_apiKey[API_index]}/${movieId}`
    // Get json data from IMDB/USER RATINGS API
    const response_IMDB_USERRATINGS = await fetch(IMDB_requestUrl_UserRatings);
    const json_IMDB_USERRATINGS = await response_IMDB_USERRATINGS.json();

    // SOURCES API url from WATCHMODE
    const WATCHMODE_requestUrl_Sources = `https://api.watchmode.com/v1/title/345534/sources/?apiKey=${WATCHMODE_apiKey}`;
    // Get json data from WATCHMODE/SOURCES API
    const response_WATCHMODE_SOURCES = await fetch(WATCHMODE_requestUrl_Sources);
    const json_WATCHMODE_SOURCES = await response_WATCHMODE_SOURCES.json();

    const movieImdbRating = json_IMDB_RATINGS.imDb;
    const movieTitle = json_IMDB_TITLE.title;
    const movieDescription = json_IMDB_TITLE.plot;
    const movieReleaseDate = json_IMDB_TITLE.releaseDate;
    const movieGenres = json_IMDB_TITLE.genres;
    const movieCertificate = json_IMDB_TITLE.contentRating;
    const movieImage = json_IMDB_TITLE.image;
    const mainCast = await getMainCast(json_IMDB_TITLE.actorList);
    const movieAudienceReview = json_IMDB_USERRATINGS.totalRatingVotes;
    const streamServices = await getStreamServices(json_WATCHMODE_SOURCES);

    return {
        imdbMovieID: imdbMovieID,
        movieImdbRating: movieImdbRating,
        movieTitle: movieTitle,
        movieDescription: movieDescription,
        movieReleaseDate: movieReleaseDate,
        movieGenres: movieGenres,
        movieCertificate: movieCertificate,
        movieImage: movieImage,
        mainCast: mainCast,
        movieAudienceReview: movieAudienceReview,
        streamServices: streamServices
    }
}

async function getMainCast(actorList) {
    let mainCastArr = [];
    let mainCastObj = {};
    for (i = 0; i < numberOfCast; i++) {
        const imdbCastID = actorList[i].id;
        const TMDB_requestUrl_Find = `https://api.themoviedb.org/3/find/${imdbCastID}?api_key=${TMBD_apiKey}&language=en-US&external_source=imdb_id`
        // Get json data from TMDB/FIND API
        const response_TMDB_FIND = await fetch(TMDB_requestUrl_Find);
        const json_TMDB_FIND = await response_TMDB_FIND.json();
        const tmdbCastID = json_TMDB_FIND.person_results[0].id;

        mainCastObj = {
            imdbCastID: imdbCastID,
            tmbdCastID: tmdbCastID,
            castName: actorList[i].name
        }
        mainCastArr.push(mainCastObj);

        const TMDB_requestUrl_Person_MovCredits = `https://api.themoviedb.org/3/person/${tmdbCastID}/movie_credits?api_key=${TMBD_apiKey}`;
        const response_TMDB_PERSON_MovCredits = await fetch(TMDB_requestUrl_Person_MovCredits);
        const json_TMDB_PERSON_MovCredits = await response_TMDB_PERSON_MovCredits.json();
        // for (let key in json_TMDB_PERSON_MovCredits) {
        //     console.log(key + ": ", json_TMDB_PERSON_MovCredits[key]);
        // }

        // TODO: FIX SORTING ARRAY BY DATE
        // let releaseDateArr = JSON.stringify(json_TMDB_PERSON_MovCredits.cast);
        // let latestMoviesSorted = []
        // latestMoviesSorted = latestMoviesSorted.sort((a,b) => new Date(b.release_date) - new Date(a.release_date));
        // console.log("the release date: " + latestMoviesSorted);
    }
    return mainCastArr;
}

async function getStreamServices(sources) {
    let streamServicesArr = [];
    let streamServicesObj = {};
    let sourceLen = sources.length;
    for (i = 0; i < sourceLen; i++) {
        streamServicesObj = {
            streamSvcID: sources[i].source_id,
            streamSvcName: sources[i].name
        }
        streamServicesArr.push(streamServicesObj);
    }
    return streamServicesArr;
}

getMovieObject(getParams())
    .then(Movie => {
        for (let key in Movie) {
            console.log(key + ": ", Movie[key]);
        }
    });


