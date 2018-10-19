console.log("howdy")

// UI element creation functions
let elementFactory = (el, content, {id, clazz}, ...children) => {
  let element = document.createElement(el)
  element.innerHTML = content || null
  children.forEach( child => {
    element.appendChild(child)
  })
  element.setAttribute("id", id)
  element.setAttribute("class", clazz)
  return element
}

let foodList = document.querySelector("#foodlist")
let localFood;

// get the initial data from my API
fetch("http://localhost:8088/food/")
  .then( (foodData) => foodData.json()) //convert json to js
  .then( (realData) => { // loop over the converted js array of objects to query 3rd-party API
    realData.forEach( (food) => {
      localFood = food
      fetch(`https://world.openfoodfacts.org/api/v0/product/${food.barcode}.json`)
      .then((apiFoodItem) => apiFoodItem.json())
      .then((convertedFood) => { // create elements to insert into DOM
        let fragment = document.createDocumentFragment()
        // Make an h3 element
        let title = elementFactory("h3", food.name, {
          id: null,
          class: "foodTitle"
        })
        // make a p element to contain the ingredients list
        let ingredients = elementFactory("p", convertedFood.product.ingredients_text, {
          id: null,
          class: "foodIngredients"
        })
        // Make a list item component composed of the h3 and p elements
        let foodListItem = elementFactory("li", null, {id: "foodItem", clazz: "foodItem"}, title, ingredients)

        // Attach the list item to the fragment
        fragment.appendChild(foodListItem)

        // Insert food item into the DOM
        foodList.appendChild(fragment)
      })
    })
  })


// ====================The Promise.all way=========================

// UI element creation function. TODO: Kinda a clunky. Should refactor this
let elementFactory = (el, content, {id, clazz}, ...children) => {
  let element = document.createElement(el)
  element.innerHTML = content || null
  children.forEach(child => {
    element.appendChild(child)
  })
  element.setAttribute("id", id)
  element.setAttribute("class", clazz)
  return element
}

// Our Dom element to attach the list of foods to
let foodList = document.querySelector("#foodlist")

// will contain each of the items from our API
let localFood = []

// Will contain all the fetch http requests/responses to the food API
let apiPromises = []
// get the initial data from my API
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
        clazz: "foodItem"
      }, title, ingredients)

      // Attach the new list item to the fragment
      fragment.appendChild(foodListItem)
    })
    // Insert the list items into the DOM as children of the ul in index.html
    foodList.appendChild(fragment)
  })
