// check out https://api2.bigoven.com/ - apparently 500k+ recipes
// check out https://developer.yummly.com/documentation.html 
// edge cases - [x]shepard's pie 
//            - [x]Chocolate Gateau 
//            - [ ]Bread and Butter Pudding - doesn't show ingredient descriptions?
//            - [ ]Massaman Beef curry
//            - [ ]Rigatoni with fennel sausage sauce
//                - Need to make the output flex to fit descriptions,maybe use a table
// maybe make three random recipes/thumbnail-images show up with the option of selecting one
// allow search by ingredient ??? - maybe...
// clean up DOM
//          
//          - Highlight the ingredient if there is a description (line 175)

let allIngredients

///////////////////
// EVENT LISTENERS
document.querySelector('#search').addEventListener('click', getSearch)
document.querySelector('#show-favorites').addEventListener('click', showFavorites)
document.querySelector('#clear-favorites').addEventListener('click', clearFavorites)
document.querySelector('.ingredient-description').addEventListener('click', clearDescription)

//////////////////
// INITIAL FETCHES
// Fetch Random Recipe
fetch('https://www.themealdb.com/api/json/v1/1/random.php')
  .then(res => res.json()) // parse response as JSON
  .then(data => {
    fetchMeal(Number(data.meals[0].idMeal))
  })
  .catch(err => {
      console.log(`error ${err}`)
  });

// Fetch Categories
fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list')
  .then(res => res.json()) // parse response as JSON
  .then(data => {
  data.meals.forEach(cat => {
    document.querySelector('#category').innerHTML += `<option value='${cat.strCategory}'>${cat.strCategory}</option>`
  });
  document.querySelector('#category-select').addEventListener('click', getCategory) 
  })
  .catch(err => {
      console.log(`error ${err}`)
  });

// Fetch Regions
fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list')
  .then(res => res.json()) // parse response as JSON
  .then(data => {
  data.meals.forEach(area => {
    document.querySelector('#region').innerHTML += `<option value='${area.strArea}'>${area.strArea}</option>`
  });
  document.querySelector('#region-select').addEventListener('click', getRegion) 
  })
  .catch(err => {
      console.log(`error ${err}`)
  });

// Fetch All Ingredients
fetch('https://www.themealdb.com/api/json/v1/1/list.php?i=list')
.then(res => res.json()) // parse response as JSON
.then(data => {
  console.log(data.meals)
  allIngredients = data.meals
})
.catch(err => {
    console.log(`error ${err}`)
});  

////////////////////
// SEARCH FUNCTIONS
function getSearch(){
  init()
  const inputVal = document.querySelector('input').value
  const url = 'https://www.themealdb.com/api/json/v1/1/search.php?s='+inputVal

   fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        for (meal of Object.entries(data.meals)){
          const li = document.createElement('li')
          li.innerHTML = `<button class="meals" value='${meal[1].strMeal}'>${meal[1].strMeal}</button>`
          document.querySelector('.selections').appendChild(li).addEventListener('click', getRecipe.bind(event, meal[1]))     
        }
      })
        .catch(err => {
          console.log(`error ${err}`)
      });
}

function getCategory(){
  init()
  const category = document.querySelector('#category').value
  
  fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c='+category)
  .then(res => res.json()) // parse response as JSON
  .then(data => {
    for (meal of Object.entries(data.meals)){
      const li = document.createElement('li')
      li.innerHTML = `<button class="meals" value='${meal[1].strMeal}'>${meal[1].strMeal}</button>`
      document.querySelector('.selections').appendChild(li).addEventListener('click', fetchMeal.bind(event, meal[1].idMeal))     
    }
  })
  .catch(err => {
      console.log(`error ${err}`)
  });
}

function getRegion(){
  init()
  const region = document.querySelector('#region').value

  fetch('https://www.themealdb.com/api/json/v1/1/filter.php?a='+region)
  .then(res => res.json()) // parse response as JSON
  .then(data => {
    console.log(data)
    for (meal of Object.entries(data.meals)){
      const li = document.createElement('li')
      li.innerHTML = `<button class="meals" value='${meal[1].strMeal}'>${meal[1].strMeal}</button>`
      document.querySelector('.selections').appendChild(li).addEventListener('click', fetchMeal.bind(event, meal[1].idMeal))  
    }
  })
  .catch(err => {
      console.log(`error ${err}`)
  });
}

function fetchMeal(mealID){
  fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+mealID)
  .then(res => res.json()) // parse response as JSON
  .then(data => {
   getRecipe(data.meals[0])
  })
  .catch(err => {
      console.log(`error ${err}`)
  });
}

//////////////////////////////////
// Print Details of Recipe to DOM
function getRecipe(mealInfo){
  init()

  document.querySelector('#name').classList.remove('hidden')
  document.querySelector('#add-favorite').classList.remove('hidden')
  document.querySelector('.ingredients-container').classList.remove('hidden')
  document.querySelector('.instructions').classList.remove('hidden')

  // Parse ingredients/measurements
  let ingredients = []
  let measurements = []

  for (const [key, value] of Object.entries(mealInfo)){
    if(key.includes('strIngredient')) ingredients.push(value)          
  }
  for (const [key, value] of Object.entries(mealInfo)){
    if(key.includes('strMeasure')) measurements.push(value)
  }

  ingredients = ingredients.filter(z => z !== ' ')
  ingredients = ingredients.filter(x => x !== '')
  ingredients = ingredients.filter(y => y !== null)
  measurements = measurements.filter(q => q !== null)
  measurements.forEach((measurement, idx) => {
    if (measurement === " "  && idx <= ingredients.length - 1) measurements[idx] = '-'
  })

  // DOM manipulation
  document.querySelector('#add-favorite').innerHTML = `<button id="add-favorite-button">Add Recipe to my Favorites!</button>`
 
  ingredients.forEach((ingredient,idx) => {
    const tr = document.createElement('tr')
    const td = document.createElement('td')
    const tdM = document.createElement('td')
    td.textContent = ingredient
    tdM.textContent = measurements[idx]
    tr.setAttribute('id', `ingredient${idx}`)
    td.setAttribute('class', 'ingredients')
    tdM.setAttribute('class', 'measurements')
    document.querySelector(`#ingredients`).appendChild(tr)
    document.querySelector(`#ingredient${idx}`).appendChild(td).addEventListener('click', getIngredientDescription.bind(event, ingredient))
    document.querySelector(`#ingredient${idx}`).appendChild(tdM)
  })

  /////////////////////
  //  Trying to highlight the text if ingredient has strDescription - not working
  //        - document.querySelector('.ingredients').classList.add('highlight')
  // for(let y = 0; y < ingredients.length; y++){
  //   const li = document.createElement('li')
  //   li.innerText = ingredients[y]
  //   document.querySelector('.ingredients').appendChild(li).addEventListener('click', getIngredientDescription.bind(event, ingredients[y]))
  //   for (let j = 0; j < allIngredients.length; j++){ 
  //     if (allIngredients[j].strIngredient === ingredients[y]){
  //       if (allIngredients[j].strDescription !== null){
  //         document.querySelector(li).classList.add('highlight')       
  //       }
  //     }
  //   }
  // } 

  document.querySelector('#name').innerText = mealInfo.strMeal
  document.querySelector('#area').innerText = `Cuisine: ${mealInfo.strArea}`
  document.querySelector('#instructions').innerText = mealInfo.strInstructions
  document.querySelector('img').src = mealInfo.strMealThumb
  if (mealInfo.strSource !== ''){
    document.querySelector('#source').href = mealInfo.strSource
    document.querySelector('#source').textContent = "Link to recipe's source"
  }
  if (mealInfo.strYoutube !== ''){
    document.querySelector('#video').href = mealInfo.strYoutube
    document.querySelector('#video').textContent = "Link to recipe's Youtube video"
  }
  document.querySelector('#add-favorite-button').addEventListener('click', addFavorite.bind(event, mealInfo))
}
// Print Ingredient Description to DOM
function getIngredientDescription(ingredient){
  document.querySelector('.ingredient-description').classList.remove('hidden')
   
  for (let i = 0; i < allIngredients.length; i++){  
    console.log('how many times ')    
    if (allIngredients[i].strIngredient === ingredient){
      if (allIngredients[i].strDescription !== null) {
        document.querySelector('.ingredient-description').innerText = allIngredients[i].strDescription
      }else {
        document.querySelector('.ingredient-description').innerText = 'No description available for this ingredient.'
      }
      break
    }
  }
}
function clearDescription(){
  document.querySelector('.ingredient-description').classList.add('hidden')
}
///////////////////////
// FAVORITES FUNCTIONS
function addFavorite(mealInfo){
  console.log(mealInfo)
  localStorage.setItem(mealInfo.idMeal, mealInfo.strMeal)  
}

function showFavorites(){
  init()
  let mealIDs = []
  let faves = []
  
  for (key in localStorage){
    if (!isNaN(key)) mealIDs.push(Number(key))
  }
  for (var i = 0; i < localStorage.length; i++){
    faves.push(localStorage.getItem(localStorage.key(i)))
  }
  // DOM manipulation
  faves.forEach((element, idx) => {
    const tr = document.createElement('tr')
    tr.setAttribute("id", `faves${idx}`)
    document.querySelector('.selections').appendChild(tr)

    const fave = document.createElement('td')
    fave.innerHTML = `<button class="meals" value='${element}'>${element}</button>`
    document.querySelector(`#faves${idx}`).appendChild(fave).addEventListener('click', fetchMeal.bind(event, mealIDs[idx]))

    const remove = document.createElement('td')
    remove.innerHTML = `<button class="remove-favorite">Remove</button>`
    document.querySelector(`#faves${idx}`).appendChild(remove).addEventListener('click', removeFavorite.bind(event, mealIDs[idx]))
  })
}

function clearFavorites(){
  const c = confirm("You are about to clear out all of your favorites, are you sure?")
  if (c === false) return
  else{
    localStorage.clear()
    init()
  }
}

function removeFavorite(item){
  console.log('remove')
  localStorage.removeItem(String(item))
  showFavorites()
}
/////////////
// Clear DOM
function init(){
  document.querySelector('#name').classList.add('hidden')
  document.querySelector('#add-favorite').classList.add('hidden')
  document.querySelector('.ingredients-container').classList.add('hidden')
  document.querySelector('.instructions').classList.add('hidden')
  // document.querySelector('ul').innerHTML = ''
  document.querySelector('#ingredients').innerHTML = ''
  // document.querySelector('.measurements').innerHTML = ''
  document.querySelector('#name').innerText = ''
  document.querySelector('#instructions').innerText = ''
  document.querySelector('img').src = ''
  document.querySelector('#video').innerHTML = ''
  document.querySelector('#source').innerHTML = ''
  document.querySelector('#area').innerHTML = ''
  document.querySelector('.selections').innerHTML = ''
  document.querySelector('.ingredient-description').innerHTML = ''
  // document.querySelector('.choices').innerHTML = ''
  // document.querySelector('.remove').innerHTML = ''
}