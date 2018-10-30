// console.log("howdy")

// UI element creation functions
// let elementFactory = (el, content, {id, clazz}, ...children) => {
//   let element = document.createElement(el)
//   element.innerHTML = content || null
//   children.forEach( child => {
//     element.appendChild(child)
//   })
//   element.setAttribute("id", id)
//   element.setAttribute("class", clazz)
//   return element
// }

// let foodList = document.querySelector("#foodlist")
// let localFood;

// // get the initial data from my API
// fetch("http://localhost:8088/food/")
//   .then( (foodData) => foodData.json()) //convert json to js
//   .then( (realData) => { // loop over the converted js array of objects to query 3rd-party API
//     realData.forEach( (food) => {
//       localFood = food
//       fetch(`https://world.openfoodfacts.org/api/v0/product/${food.barcode}.json`)
//       .then((apiFoodItem) => apiFoodItem.json())
//       .then((convertedFood) => { // create elements to insert into DOM
//         let fragment = document.createDocumentFragment()
//         // Make an h3 element
//         let title = elementFactory("h3", food.name, {
//           id: null,
//           class: "foodTitle"
//         })
//         // make a p element to contain the ingredients list
//         let ingredients = elementFactory("p", convertedFood.product.ingredients_text, {
//           id: null,
//           class: "foodIngredients"
//         })
//         // Make a list item component composed of the h3 and p elements
//         let foodListItem = elementFactory("li", null, {id: "foodItem", clazz: "foodItem"}, title, ingredients)

//         // Attach the list item to the fragment
//         fragment.appendChild(foodListItem)

//         // Insert food item into the DOM
//         foodList.appendChild(fragment)
//       })
//     })
//   })


// ====================The Promise.all way=========================

// UI element creation function. TODO: Kinda a clunky. Should refactor this
let elementFactory = (el, content, attributes, ...children) => {
  let element = document.createElement(el)
  element.innerHTML = content || null
  children.forEach(child => {
    element.appendChild(child)
  })
  for( attr in attributes ) {
    element.setAttribute(attr, attributes[attr])
  }
  return element
}

// Our Dom element to attach the list of foods to
let foodList = document.querySelector("#foodlist")

// will contain each of the items from our API
let localFood = []

// Will contain all the fetch http requests/responses to the food API
let apiPromises = []
// get the initial data from my API

function getFood() {
  fetch("http://localhost:8088/food/")
  .then((foodDataJson) => foodDataJson.json()) //convert json to js
  .then((foodData) => { // loop over the converted js array of objects to query 3rd-party API
    foodData.forEach((food) => {
      localFood.push(food)

      // Add each fetch to an array that we can pass to Promise.all
      apiPromises.push(fetch(`https://world.openfoodfacts.org/api/v0/product/${food.barcode}.json`).then((foodItem) => foodItem.json()))
    })
    // return all the fetch promises at once
    return Promise.all(apiPromises)
  })
  .then((resolvedPromisesArr) => { // All the fetch results in one array
    let fragment = document.createDocumentFragment()
    localFood.forEach((food, index) => {
      // Make an h3 element
      let title = elementFactory("h3", food.name, {
        id: null,
        class: "foodTitle"
      })
      // make a p element to contain the ingredients list
      let ingredients = elementFactory("p", resolvedPromisesArr[index].product.ingredients_text, {
        id: null,
        class: "foodIngredients"
      })
      // Make a list item component composed of the h3 and p elements
      let foodListItem = elementFactory("li", null, {
        id: "foodItem",
        class: "foodItem"
      }, title, ingredients)

      // Attach the new list item to the fragment
      fragment.appendChild(foodListItem)
    })
    // Insert the list items into the DOM as children of the ul in index.html
    foodList.appendChild(fragment)
  })
}
// getFood()

// *****************************************************************************************
// Extra example using user input and showing how to handle needing original data from API before making second call to API
// 1) Handles keyword search from user, like "batman"
// 2) API returns basic movie info, but we want more movie info, like the cast list
// 3) Loops through orignal results to grab a movie's id, then pings API again for detailed results
// 4) Appends details for each movie to the DOM
// *****************************************************************************************

// 2) Original call to OMDB
function getMovies(keyword) {
  return fetch(`http://www.omdbapi.com/?apikey=b3bd2b6a&s=${keyword}&type=movie`)
    .then(movies => movies.json())
    .then(movies => {
      console.log(movies)
      moviePromises = []
      movies.Search.forEach(movie => {
        moviePromises.push(
          getMovieDetails(movie.imdbID)
        )
      })
      return Promise.all(moviePromises)
    })
    .then(allMoviesDeets => {
      console.log("all movies deets", allMoviesDeets);
      return allMoviesDeets
    })
    .catch( error => console.log("Sumthin wint rong", error))
}

// 3) Secondary call to OMDB for movie details
function getMovieDetails(id) {
  return fetch(`http://www.omdbapi.com/?apikey=b3bd2b6a&i=${id}`)
    .then(movie => movie.json())
}

// 4) Add final results to DOM
function displayMovies(movies) {
  let movieList = document.querySelector("#movielist")
  let fragment = document.createDocumentFragment()
  movies.forEach((movie, index) => {
    // Make an h3 element
    let title = elementFactory("h3", movie.Title, {
      class: "movieTitle"
    })
    let poster = elementFactory("img", null, {
      class: "moviePoster",
      src: movie.Poster
    })
    // make a p element to contain the cast list
    let cast = elementFactory("p", `Cast: ${movie.Actors}`, {
      id: null,
      class: "movieCast"
    })
    // Make a list item component composed of the h3 and p elements
    let movieListItem = elementFactory("li", null, {
      id: "movieItem",
      class: "movieItem"
    }, title, poster, cast)

    // Attach the new list item to the fragment
    fragment.appendChild(movieListItem)
  })
  // Insert the list items into the DOM as children of the ul in index.html
  movieList.appendChild(fragment)
}


// 1) Handle the user's keyword search and append results to the DOM
document.querySelector("#movieBtn").addEventListener("click", () => {
  getMovies(document.querySelector("#movieSearch").value)
    .then(movies => displayMovies(movies))
})


// STUDENT CHALLENGE
// Handling adding a movie to movies collection
// 1) Add a btn for each movie
// 2) Give each btn the imdbId of the movie
// 3) When btn is clicked, grab its id and add it to db
// 4) Why not add other data from movie results? -- single source of truth!
// 5) We *can* add other data, like whether we have watched it or not, or how many times we've watched, whether we own the movie, etc. But data about the movie itself lives on the API servers. Duplicating data is to be avoided
// 6) Display your saved movies in the DOM

// With that in mind, an object we might POST to our db would look like this:
newMovie = {
  watched: false,
  own: true, // is this necessary if we also have the 'format' property? Nope. How? Well...
  format: "blu-ray", // if this was null, we could use that state to tell whether we own the movie or not.
  rating: 5,
  movie: "tt0372784" //And here's where we would store the data we need to display the movie later. One fetch to the API would give us everything else we need, without duplicating data
}

// PATCH vs PUT
// So, say we POSTed this to our db at some point, but wanted to update the 'rating' prop from 5 to 8.
// With a `PUT`, we would have to add the whole object to the request body:
// (Note that you don't include the resource's ID!)

// let updatedMovie = {
//   format: "blu-ray",
//   rating: 8,
//   movie: "tt0372784"
// }

// With a `PATCH` we would only send the updated key/value(s) in the request body:
// let updatedMovie = { rating: 8 }

// Then the fetch looks identical, other than the 'method' property in the options object
// fetch("url", { // Replace "url" with your API's URL/<the ID of the movie>
//   method: "PUT", //or "PATCH"
//   headers: {
//     "Content-Type": "application/json"
//   },
//   body: JSON.stringify(updatedMovie)
// })
