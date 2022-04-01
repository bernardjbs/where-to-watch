const IMDB_apiKey = ["k_y4wdrion", "k_ie3pfgw9", "k_o18qbud0", "k_tfp7sn7o", "k_51hudf0k", "k_zz238cmu"];
const TMBD_apiKey = "4d8c1c5a92c9bffb2c1e6f66056e0a6c";
const WATCHMODE_apiKey = "hN3l6ItA8skv6C4SKbRIC0QiLEl7NgjjSfAG5ch9";
let API_index = 5;
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
    const IMDB_requestUrl_Title = `https://imdb-api.com/en/API/Title/k_12345678/${movieId}`

    // Get json data from IMDB/TITLE API
    const response_IMDB_TITLE = await fetch(IMDB_requestUrl_Title);
    const json_IMDB_TITLE = await response_IMDB_TITLE.json();

    const imdbMovieID = json_IMDB_TITLE.id;
    const IMDB_requestUrl_Ratings = `https://imdb-api.com/en/API/Ratings/k_12345678/${imdbMovieID}`

    // Get json data from IMDB/RATINGS API
    const response_IMDB_RATINGS = await fetch(IMDB_requestUrl_Ratings)
    const json_IMDB_RATINGS = await response_IMDB_RATINGS.json();

    // USER RATINGS API url from IMDB
    const IMDB_requestUrl_UserRatings = `https://imdb-api.com/en/API/UserRatings/k_12345678/${movieId}`
    // Get json data from IMDB/USER RATINGS API
    const response_IMDB_USERRATINGS = await fetch(IMDB_requestUrl_UserRatings);
    const json_IMDB_USERRATINGS = await response_IMDB_USERRATINGS.json();

    // REVIEWS API url from IMDB
    const REVIEWS_requestUrl_Reviews = `https://imdb-api.com/en/API/Reviews/k_12345678/${movieId}`
    // Get json data from IMDB/REVIEWS API 
    const response_IMDB_REVIEWS = await fetch(REVIEWS_requestUrl_Reviews);
    const json_IMDB_REVIEWS = await response_IMDB_REVIEWS.json();

    // if rating > 8, good review, get first 2 results
    
    // if rating < 5, bad review, get first 2 results


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
    const movieReviews = await getReviews(json_IMDB_REVIEWS);
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
        movieGoodReviews: movieReviews[0],
        movieBadReviews: movieReviews[1],
        streamServices: streamServices
    }
}

async function getMainCast(actorList) {
    let castArray = []
    let cast = [actorList[0].id, actorList[1].id, actorList[2].id];
    cast.forEach(actor => {

        // Fetch each actor from The Movie Database
        fetch(`https://api.themoviedb.org/3/find/${actor}?api_key=${TMBD_apiKey}&language=en-US&external_source=imdb_id`)
        .then(function(response) {
            return response.json();
        })
        .then(function(actorData) {

            // Fetch movie credits by person
            fetch(`https://api.themoviedb.org/3/person/${actorData.person_results[0].id}/movie_credits?api_key=${TMBD_apiKey}&language=en-US`)
            .then(function(response) {
                return response.json();
            })
            .then(function(movieCreds) {
                
                // Fetch latest three movies
                let passedArray = movieCreds.cast;
                let movieCredsArray = {
                    castID: actorData.person_results[0].id,
                    castName: actorData.person_results[0].name,
                    latestMovies: [],
                };
                
                for (let i = 0; i < passedArray.length; i++) {
                    let criteriaObj = {};
                    criteriaObj.title = passedArray[i].title;
                    criteriaObj.release_date = passedArray[i].release_date;
                    movieCredsArray.latestMovies.push(criteriaObj);
                }

                // Trying to sort array into order by time to get latest three
                movieCredsArray.latestMovies.sort((a, b) =>  new Date(b.release_date) - new Date(a.release_date));
                
                // Get latest three movies
                movieCredsArray.latestMovies = movieCredsArray.latestMovies.slice(0, 3);

                // Fetch id's for these three movies
                fetch(`https://api.themoviedb.org/3/person/${actorData.person_results[0].id}/external_ids?api_key=${TMBD_apiKey}&language=en-US`)
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {

                    movieCredsArray.latestMovies.forEach( object => {
                        object.imdb_id = data.imdb_id;
                    })
                    
                    castArray.push(movieCredsArray);
                })
            })
        })
    })
    
    return castArray;
}

async function getReviews(reviews) {
    let movieGoodReviews = [];
    let pos = 2;
    let movieBadReviews = [];
    let neg = 2;
    let reviewsPassed = reviews.items;

    reviewsPassed.forEach(review => {
        
        if (pos > 0) {
            if (review.rate > 8) {
                let reviewObj = {}
                reviewObj.reviewerName = review.username;
                reviewObj.reviewerComment = review.content;
                reviewObj.reviewerScore = review.rate;
                reviewObj.commentTitle = review.title;
                reviewObj.reviewerCommentUrl = review.userUrl;
                movieGoodReviews.push(reviewObj);
                pos--;
            }
        }
        if (pos === 0 && neg > 0) {
            if (review.rate < 5 && review.rate != undefined && review.rate != "") {
                let reviewObj = {}
                reviewObj.reviewerName = review.username;
                reviewObj.reviewerComment = review.content;
                reviewObj.reviewerScore = review.rate;
                reviewObj.commentTitle = review.title;
                reviewObj.reviewerCommentUrl = review.userUrl;
                movieBadReviews.push(reviewObj);
                neg--;
            }
        }
    })
    
    let movieReviewsArray = [movieGoodReviews, movieBadReviews];
    return movieReviewsArray;
}

async function getStreamServices(sources) {
    let streamServices = [];
    sources.forEach(element => {
        let obj = {};

        if (!streamServices.some(e => e.streamSvcName === element.name)) {
            /* vendors contains the element we're looking for */
            obj.streamSvcID = element.source_id;
            obj.streamSvcName = element.name;
            obj.method = [element.type === "sub" ? "stream" : element.type];
            streamServices.push(obj);
        } else {
            for (let i = 0; i < streamServices.length; i++) {
                if (!streamServices[i].method.some(o => o === element.type)) {
                    streamServices[i].method.push(element.type);
                }
            }
        }
    });
    return streamServices;
}

getMovieObject(getParams())
.then(Movie => {
    // renderMovies(Movie);
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

    console.log(object)
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
    let mainCastArray = object.mainCast; // array of objects
    addCastDefailts(mainCastArray);

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

                positiveReviews.append($(`<article class="review">`).append($(`<p>Reviewer: ${subReview.reviewerName}, Rating: ${subReview.reviewerScore}/10</p><q>${subReview.reviewerComment}</q>`)));

            } else {

                negativeReviews.append($(`<article class="review">`).append($(`<p>Reviewer: ${subReview.reviewerName}, Rating: ${subReview.reviewerScore}/10</p><q>${subReview.reviewerComment}</q>`)));

            }
        })
    })
}

// Add Cast Details
const addCastDefailts = (mainCastArray) => {
    // Render Cast Names
    mainCastArray.forEach(castMember => {
        let pTag = $(`<p id="${castMember.castID}">`);
        pTag.text(castMember.castName);
        movieTopActors.append(pTag);
        let divTag = $(`<div data-movies-hidden="true" id="${castMember.castID}_movieList"></div>`);

        castMember.latestMovies.forEach(movie => {

            divTag.append(`<p id="${movie.imdb_id}">${movie.title}</p>`);
            $(`#${movie.imdb_id}`).on('click', function() {

                document.location.replace(`./review.html?id=${movie.imdb_id}`);

            })
        })
        actorsLatestFilms.append(divTag);

        $(`#${castMember.castID}`).on('click', function() {
            let attr = $(`#${castMember.castID}_movieList`).attr('data-movies-hidden');
            attr === "false" ? 
            $(`#${castMember.castID}_movieList`).attr('data-movies-hidden', "true") : 
            $(`#${castMember.castID}_movieList`).attr('data-movies-hidden', "false");
        })
    })
}

// Add Streaming Details
const addStreamingDetails = (streamingInfo) => {
    streamingInfo.forEach(streamSite => {
            whereToStream.append($(`<h5>${streamSite.streamSvcName}: ${streamSite.method[0]}</h5>`));
    })
}
    
