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
    // Call render function
    renderMovies(Movie);
});

// Selectors
let movieTitle = $("#the_movie_title")
let movieDescription = $("#desc-disc")
let movieReleased = $("#desc-date")
let moviePoster = $("#title_image")
let numberOfStarsGiven = $("#rating_stars")
let numberOfReviews = $("#imdb_audience_review")
let positiveReviews = $("#imdb_good-reviews")
let negativeReviews = $("#imdb_bad-reviews")
let movieTopActors = $("#actorsNames")
let actorsLatestFilms = $("#latestFilms")
let whereToStream = $("#whereToStream")
    
    const renderMovies = (object) => {
    
        // Render Title Details
        let title = object.movieTitle;
        let description = object.movieDescription;
        let releaseDate = object.movieReleaseDate;
        let movieImage = object.movieImage;
        addTitleDetails(title, description, releaseDate, movieImage);
    
        // Render review details
        let rating = object.movieImdbRating;
        let nOfReviews = object.movieAudienceReview;
        let audienceGoodReviews = object.movieGoodReviews; // array of objects
        let audienceBadReviews = object.movieBadReviews; // array of objects
        addReviewDetails(rating, nOfReviews, audienceGoodReviews, audienceBadReviews);
    
        // Render cast and latest movies
        let mainCast = object.mainCast; // array of objects
        addCastDefailts(mainCast);
    
        // Render streaming services section
        let streamingInfo = object.streamServices; // array of objects
        addStreamingDetails(streamingInfo);
    
    }
    
    // Add Title Details
    const addTitleDetails = (title, description, releaseDate, movieImage) => {
    
        movieTitle.text(title);
        movieDescription.text(description);
        movieReleased.text(releaseDate);
        moviePoster.attr('src', movieImage);
    
    }
    
    // Add Review Details
    const addReviewDetails = (rating, nOfReviews, audienceGoodReviews, audienceBadReviews) => {
        
        // Add stars
        let ratingfigure;
        if (rating > '8') {
            ratingfigure = 5;
        } else if (rating > '6') {
            ratingfigure = 4;
        } else if (rating > '4') {
            ratingfigure = 3;
        } else if (rating > '2') {
            ratingfigure = 2;
        } else {
            ratingfigure = 1;
        }
        
        for (let i = 0; i < 5; i++) {
    
            if (ratingfigure > 0) {
                numberOfStarsGiven.append($(`<span class="fa fa-star checked">`));
            } else {
                numberOfStarsGiven.append($(`<span class="fa fa-star">`));
            }
            
            ratingfigure--;
        }
    
        // Add number of reviews
        numberOfReviews.text(nOfReviews);
    
        // Add review information
        let reviewsArray = [audienceGoodReviews, audienceBadReviews]
    
        reviewsArray.forEach(review => {
            review.forEach(subReview => {
    
                if (subReview.reviewerScore > 5) {
    
                    positiveReviews.append($(`<article class="review">`).append($(`<p>${subReview.reviewerName}: ${subReview.reviewerScore}/10</p><q>${subReview.reviewerComment}</q>`)));
    
                } else {
    
                    negativeReviews.append($(`<article class="review">`).append($(`<p>${subReview.reviewerName}: ${subReview.reviewerScore}/10</p><q>${subReview.reviewerComment}</q>`)));
    
                }
            })
        })
    }
    
    // Add Cast Details
    const addCastDefailts = (mainCast) => {
    
        // Render Cast Names
        mainCast.forEach(castMember => {
            let pTag = $(`<p id="${castMember.imdbCastID}">`);
            pTag.text(castMember.castName);
            movieTopActors.append(pTag);
            let divTag = $(`<div data-hidden="true" id="${castMember.imdbCastID}_movieList"></div>`);
    
            castMember.latestMovies.forEach(movie => {
    
                divTag.append(`<p id="${movie.imdbMovieID}">${movie.movieTitle}</p>`);
                $(`#${movie.imdbMovieID}`).on('click', function() {
    
                    document.location.replace(`./review.html?id=${movie.imdbMovieID}`);
    
                })
            })
    
            actorsLatestFilms.append(divTag);
    
            $(`#${castMember.imdbCastID}`).on('click', function() {
                let attr = $(`#${castMember.imdbCastID}_movieList`).attr('data-hidden');
                attr === "false" ? 
                $(`#${castMember.imdbCastID}_movieList`).attr('data-hidden', "true") : 
                $(`#${castMember.imdbCastID}_movieList`).attr('data-hidden', "false");
            })
        })
    }
    
    // Add Streaming Details
    const addStreamingDetails = (streamingInfo) => {
    
        streamingInfo.forEach(streamSite => {
            whereToStream.append($(`<h5>${streamSite.streamSvcName}</h5>`));
        })
    }
    
