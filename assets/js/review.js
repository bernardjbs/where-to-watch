// Selectors
let movieTitle = $("#the_movie_title");
let movieDescription = $("#desc-disc");
let movieReleased = $("#desc-date");
let moviePoster = $("#title_image");
let numberOfStarsGiven = $("#rating_stars");
let numberOfReviews = $("#imdb_audience_review");
let positiveReviews = $("#imdb_good-reviews");
let negativeReviews = $("#imdb_bad-reviews");
let movieTopActors = $("#actorsNames");
let actorsLatestFilms = $("#latestFilms");
let actorsLatestCharacters = $("#filmtitle_character");
let whereToStream = $("#whereToStream");

// IMDB API
let IMDBurl = "https://imdb-api.com/en/API/";
let IMDBapiKey = "k_28w9m3nq";
// The Mobie DB API
let DBurl = "https://api.themoviedb.org/3/";
let DBapiKey = "4d8c1c5a92c9bffb2c1e6f66056e0a6c";
// WatchMode API
let WMurl = "https://api.watchmode.com/v1/title/";
let WMapiKey = "hN3l6ItA8skv6C4SKbRIC0QiLEl7NgjjSfAG5ch9";

// Get Movie ID from URL
let urlSearch = new URL(window.location.href);
let movieID = urlSearch.searchParams.get("id");

// Reload page with designed latest movie by actor on click
function LatestMovieReload(event)
{
    var id=$(event.target).attr("id");
   
    fetch(
        `${DBurl}movie/${id}/external_ids?api_key=${DBapiKey}`
      )
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
            document.location.replace(`./review.html?id=${data.imdb_id}`);
        });
}

const fetchAllData = () => {
  // Make IMDB Title Search "https://imdb-api.com/en/API/Title/k_e02kkg7y/tt1375666"
  fetch(`${IMDBurl}Title/${IMDBapiKey}/${movieID}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (imdbTitleData) {

      // Render direct variables from IMDB
      movieTitle.text(imdbTitleData.fullTitle);
      movieDescription.text(imdbTitleData.plot);
      movieReleased.text(imdbTitleData.releaseDate);
      if (!imdbTitleData.image) {
        moviePoster.attr("alt", "Movie Poster can't load");
      } else {
        moviePoster.attr("src", imdbTitleData.image);
        moviePoster.attr("alt", `Poster from ${imdbTitleData.fullTitle} Debut`);
      }
      // Format number of reviews to be more readable
      let reviewsFormat = function(num) {
        if (num >= 1000000) {
          return `${num.slice(0,1)}, ${num.slice(1,4)}, ${num.slice(4)}`;
        } else if (num >= 100000) {
          return `${num.slice(0,3)}, ${num.slice(3)}`;
        } else if (num >= 10000) {
          return `${num.slice(0,2)}, ${num.slice(2)}`;
        } else if (num >= 1000) {
          return `${num.slice(0,1)}, ${num.slice(1)}`;
        } else {
          return num;
        }
      }
      numberOfReviews.text(reviewsFormat(imdbTitleData.imDbRatingVotes));

      // Add Stars representing the rating average
      let ratingfigure;
      if (imdbTitleData.imDbRating > "8") {
        ratingfigure = 5;
      } else if (imdbTitleData.imDbRating > "6") {
        ratingfigure = 4;
      } else if (imdbTitleData.imDbRating > "4") {
        ratingfigure = 3;
      } else if (imdbTitleData.imDbRating > "2") {
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

      // Fetch reviews information from IMDB https://imdb-api.com/en/API/Reviews/k_e02kkg7y/tt1375666
      fetch(`${IMDBurl}Reviews/${IMDBapiKey}/${movieID}`)
        .then(function (response) {
          return response.json();
        })
        .then(function (reviewInfo) {
          let reviewsPassed = reviewInfo.items;
       
          // Sort review information based on how users rated the film
          reviewsPassed.sort(function (a, b) {
            if (isNaN(a.rate) || isNaN(b.rate)) {
              return a.rate > b.rate ? 1 : -1;
            }
            return a.rate - b.rate;
          });
          var result = $.grep(reviewsPassed, function (e) {
            return e.rate != "";
          });
          var badreview = result.slice(
            0,
            result.length > 2 ? 2 : result.length
          );
          var goodreview =
            result.length > 3
              ? result.slice(result.length - 3, result.length - 1)
              : badreview;

          // Render reviews for negative and positive
          badreview.forEach((review) => {
            negativeReviews.append(
              $(`<article class="review">`).append(
                $(
                  `<p><strong>Reviewer:</strong> ${review.username}, <strong>Rating</strong>: ${review.rate}/10</p><q>${review.title}</q>`
                )
              )
            );
          });
          goodreview.forEach((review) => {
            positiveReviews.append(
              $(`<article class="review">`).append(
                $(
                  `<p><strong>Reviewer:</strong> ${review.username}, <strong>Rating</strong>: ${review.rate}/10</p><q>${review.title}</q>`
                )
              )
            );
          });
        });

      // Use Main 3 Cast
      let passedCast = [
        imdbTitleData.actorList[0].id,
        imdbTitleData.actorList[1].id,
        imdbTitleData.actorList[2].id,
      ];
      passedCast.forEach((actor) => {

        // Fetch each actor from The Movie Database
        fetch(
          `${DBurl}find/${actor}?api_key=${DBapiKey}&language=en-US&external_source=imdb_id`
        )
          .then(function (response) {
            return response.json();
          })
          .then(function (actorData) {
            let pTag = $(`<p id="${actorData.person_results[0].id}">`);
            pTag.text(actorData.person_results[0].name);
            movieTopActors.append(pTag);

            let divTag = $(
              `<div class="sliderow" data-movies-hidden="true" id="${actorData.person_results[0].id}_movieList"></div>`
            );
            var phtag = $("<h3>")
                    
                    .text(`Latest Movies: Character Played`);
                    divTag.append(phtag);
            // Fetch movie credits by person
            fetch(
              `${DBurl}person/${actorData.person_results[0].id}/movie_credits?api_key=${DBapiKey}&language=en-US`
            )
              .then(function (response) {
                return response.json();
              })
              .then(function (movieCreds) {

                // Fetch latest three movies
                let passedArray = movieCreds.cast;

                let movieCredsObj = {
                  castID: actorData.person_results[0].id,
                  castName: actorData.person_results[0].name,
                  latestMovies: [],
                };

                for (let i = 0; i < passedArray.length; i++) {
                  if (passedArray[i].vote_count > 1000) {
                    let criteriaObj = {};
                    criteriaObj.character = passedArray[i].character;
                    criteriaObj.title = passedArray[i].title;
                    criteriaObj.release_date = passedArray[i].release_date;
                    criteriaObj.titleID = passedArray[i].id;
                    movieCredsObj.latestMovies.push(criteriaObj);
                  }
                }

                // Sort array into order by time released to get latest three movies
                movieCredsObj.latestMovies.sort(
                  (a, b) => new Date(b.release_date) - new Date(a.release_date)
                );

                // Get latest three movies
                movieCredsObj.latestMovies = movieCredsObj.latestMovies.slice(
                  0,
                  3
                );

                // Fetch id's for these three movies
                movieCredsObj.latestMovies.forEach((object) => {
                  
                  var ptag = $("<p>")
                    .attr("id", object.titleID)
                    .text(`${object.title}: ${object.character}`);

                  // Render each of the three latest movies and the played character
                  divTag.append(ptag);
                });

                // Add three latest movies into one div for this actor
                actorsLatestFilms.append(divTag);
                $(`.sliderow p`).on(
                    "click",LatestMovieReload);
                pTag.append(divTag);
                // Add listener to each actor to hide and show relevant movies
                $(`#${actorData.person_results[0].id}`).on(
                  "click",
                  function () {
                      
                    actorsLatestFilms
                      .children()
                      .attr("data-movies-hidden", "true");
                    let attr = $(
                      `#${actorData.person_results[0].id}_movieList`
                    ).attr("data-movies-hidden");
                    attr === "false"
                      ? $(`#${actorData.person_results[0].id}_movieList`).attr(
                          "data-movies-hidden",
                          "true"
                        )
                      : $(`#${actorData.person_results[0].id}_movieList`).attr(
                          "data-movies-hidden",
                          "false"
                        );
                  }
                );
              });
          });
      });

      // Fetch Streaming Info https://api.watchmode.com/v1/title/345534/sources/?apiKey=${WATCHMODE_apiKey}
      fetch(`${WMurl}${imdbTitleData.id}/sources/?apiKey=${WMapiKey}`)
        .then(function (response) {
          return response.json();
        })
        .then(function (streamData) {
          
            const d = new Date();
            const releasedate = new Date(imdbTitleData.releaseDate);
            let year = d.getFullYear();
         
            // If no sites sell the movie, suggest movie pending release from cinemas
            if(streamData.length==0&&releasedate.getFullYear()==year)
            {
                whereToStream.append(
                    $(
                      `<h5>On Theaters </h5>`
                    )
                  );
            }
            else{

           
          let streamServices = [];
          let IDvariable = 1567;
         
          streamData.forEach((element) => {
            let obj = {};

            if (!streamServices.some((e) => e.streamSvcName === element.name)) {
              /* vendors contains the element we're looking for */
              // Construct object from data variables
              obj.streamSvcID = element.source_id;
              obj.streamSvcName = element.name;
              obj.method = [element.type];
              streamServices.push(obj);
            } else {
              for (let i = 0; i < streamServices.length; i++) {
                if (!streamServices[i].method.some((o) => o === element.type)) {
                  streamServices[i].method.push(element.type);
                }
              }
            }
          });

          // render where to stream to page and how
          streamServices.forEach((streamSite) => {
            whereToStream.append(
              $(
                `<h5>${streamSite.streamSvcName}: <span id="${IDvariable}${streamSite.streamSvcID}"></span></h5>`
              )
            );
            let sentence = "";
            streamSite.method.forEach((method) => {
              if (method === "sub") {
                sentence += ` | Stream`;
              } else if (method === "buy") {
                sentence += ` | Buy`;
              } else if (method === "rent") {
                sentence += ` | Rent`;
              } else {
                sentence += `| ${method} `;
              }
            });
            $(`#${IDvariable}${streamSite.streamSvcID}`).text(sentence);
            IDvariable++;
          });
        }
        });
    
    });
};

// Initialise fetch on load
fetchAllData();
