// edge case - shepard's pie
// make a random recipe show on start
// DOM the strArea


let info

document.querySelector('#search').addEventListener('click', getSearch)

// Fetch Categories
fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list')
  .then(res => res.json()) // parse response as JSON
  .then(data => {
  console.log(data)
  console.log(data.meals[0].strCategory)

  data.meals.forEach(cat => {
    document.querySelector('#category').innerHTML += `<option value='${cat.strCategory}'>${cat.strCategory}</option>`
  });

  document.querySelector('#category-select').addEventListener('click', getCategory) 
  })

  .catch(err => {
      console.log(`error ${err}`)
  });


function getSearch(){
  init()
  const inputVal = document.querySelector('input').value
  const url = 'https://www.themealdb.com/api/json/v1/1/search.php?s='+inputVal

   fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log(data)
        console.log(data.meals)
        
        info = data

        let meals = []

        for (meal of Object.entries(data.meals)){
          const li = document.createElement('li')
          li.innerHTML = `<button class="meals" value='${meal[1].strMeal}'>${meal[1].strMeal}</button>`
          document.querySelector('.choices').appendChild(li).addEventListener('click', getRecipe.bind(event, meal[1]))     
        }

        console.log(meals)
        console.log(info)
        
      })
        .catch(err => {
          console.log(`error ${err}`)
      });
}

function getCategory(){
  init()
  const category = document.querySelector('#category').value
  console.log(category)
  
  fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c='+category)
  .then(res => res.json()) // parse response as JSON
  .then(data => {
    for (meal of Object.entries(data.meals)){
      const li = document.createElement('li')
      li.innerHTML = `<button class="meals" value='${meal[1].strMeal}'>${meal[1].strMeal}</button>`
      document.querySelector('.choices').appendChild(li).addEventListener('click', getMeal.bind(event, meal[1]))     
    }

  })

  .catch(err => {
      console.log(`error ${err}`)
  });
}


function getMeal(mealID){
  console.log(mealID)

  fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+mealID.idMeal)
  .then(res => res.json()) // parse response as JSON
  .then(data => {
   info = data
   console.log(info)
   getRecipe(info.meals[0])
  })
  .catch(err => {
      console.log(`error ${err}`)
  });

}


function getRecipe(mealInfo){
        init()
        
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

        // Enter recipe information into the DOM
        document.querySelector('#add-favorite').innerHTML = `<button id="add-favorite">Add Recipe to my Favorites!</button>`
        ingredients.forEach(ingredient => {
          document.querySelector('.ingredients').innerHTML += `<li>${ingredient}</li>`
        });
        measurements.forEach((measurement, idx) => {
          if (measurement === " "  && idx <= ingredients.length - 1) document.querySelector('.measurements').innerHTML += `<li>-</li>`
          document.querySelector('.measurements').innerHTML += `<li>${measurement}</li>`
        })
        document.querySelector('h2').innerText = mealInfo.strMeal
        document.querySelector('#area').innerText = `Region: ${mealInfo.strArea}`
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
        console.log(mealInfo.strSource)


}

function init(){
  document.querySelector('ul').innerHTML = ''
  document.querySelector('.ingredients').innerHTML = ''
  document.querySelector('.measurements').innerHTML = ''
  document.querySelector('h2').innerText = ''
  document.querySelector('#instructions').innerText = ''
  document.querySelector('img').src = ''
  document.querySelector('#video').innerHTML = ''
  document.querySelector('#source').innerHTML = ''
  document.querySelector('#area').innerHTML = ''
}