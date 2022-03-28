const IMDB_apiKey = ["k_y4wdrion", "k_ie3pfgw9", "k_o18qbud0", "k_tfp7sn7o", "k_51hudf0k", "k_zz238cmu"];
const TMBD_apiKey = "30584b857c462403f3b7916157ab32b7";
let IMBD_personIDs = [];
let API_index = 3;

let actorsEl = document.querySelector("#actors");
let actorsH3 = $("#main-cast");
let reviewContainerEl = $("#review-container");

// Constant object to get nested object from API
const getNestedObject = (nestedObj, pathArr) => {
    return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
}

function getParams() {
    // Get parameters from URL.
    const searchParamArr = document.location.search.split("&");
    // Get Movie ID 
    const movieID = searchParamArr[0].split("=").pop();
    return movieID;
}

function getApi(movieId) {
    // Title API url from IMDB 
    const IMDB_requestUrl_Title = `https://imdb-api.com/en/API/Title/${IMDB_apiKey[API_index]}/${movieId}/FullCast.Posters`


    // Fetch request to Title API from IMBD
    fetch(IMDB_requestUrl_Title)
        .then(response => {
            return response.json();
        })
        .then(response => {
            return getMovie(response);
        })
}



function getPersonTMDBid() {
    // Get Person details API url from TMBD
    const TMDB_requestUrl_Person = `https://api.themoviedb.org/3/find/nm1500155?api_key=${TMBD_apiKey}&language=en-US&external_source=imdb_id`
    fetch(TMDB_requestUrl_Person)
        .then(function (response) {
            return response.json();
        })
        .then(response => {
            //console.log("id: " + response.person_results[0].id);
            let id = response.person_results[0].id;
            return {
                tmdbId: id
            }
        });


}


function getMovie(response) {
    movie = {
        ...getCastNames(response),
        ...getPosterLink(response),
        ...getPersonTMDBid()
    }
    console.log("movie obj: " + JSON.stringify(movie));
}

function getPosterLink(response) {
    const nest_dataPoster = getNestedObject(response, ["posters", "posters"]);
    const posterImgLink = getNestedObject(nest_dataPoster, [0, "link"]);
    return {
        posterImgLink: posterImgLink
    }
}
function getCastNames(response) {
    const fullCast = getNestedObject(response, ["fullCast", "actors"]);
    let mainCast = [];
    const numberOfCast = 3;

    for (i = 0; i < numberOfCast; i++) {
        mainCast.push(getNestedObject(fullCast, [i, "name"]));
    }

    // for (let key in response) {
    //     console.log(key + ": ", response[key]);
    // }

    return {
        title: response.title,
        mainCast: mainCast
    }
}


//     // Fetch request to Title API from IMBD
//     fetch(IMDB_requestUrl_Title)
//         .then(function (response) {
//             return response.json();
//         })
//         .then(response => {
//             const nest_dataPoster = getNestedObject(response, ["posters", "posters"]);
//             const posterImgLink = getNestedObject(nest_dataPoster, [0, "link"]);
//             const fullCast = getNestedObject(response, ["fullCast", "actors"]);
//             let castName = "";
//             let mainCast = [];
//             const numberOfCast = 3;

//             for (i = 0; i < numberOfCast; i++) {
//                 mainCast.push(getNestedObject(fullCast, [i, "name"]));
//             }
//             // console.log("main cast: " + mainCast);
//             // for (let key in response) {
//             //     console.log(key + ": ", response[key]);
//             // }
//             return {
//                 title: response.title,
//                 posterImageUrl: posterImgLink,
//                 mainCast: mainCast
//             }
//         })
//         .then(movie => {
//             return getCastNames(movie);
//         })

// }

// function getCastNames(movie) {
//     console.log("movie: " + JSON.stringify(movie));
// }






getApi(getParams());