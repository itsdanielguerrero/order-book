/*
* Author - Daniel Guerrero / https://github.com/itsdanielguerrero
* Date - 09/2019 - 10/2019
*/

//This function will get me the orders that match in quantity exactly
function getQuantityMatching (matchingOrders, incomingOrder){
  return matchingOrders.filter ( (currentItem) => { //returns a array with orders that have equal quantity
    const {quantity} = currentItem
    return quantity === incomingOrder.quantity
  }) 
}

//This function will handle the case where the order matches in quantity exactly
function handleQuantityMatch (quantityMatch, existingBook) {
  if(quantityMatch.length > 0) {
    for (var i = 0; i < existingBook.length; i++){
      if (existingBook[i].quantity === quantityMatch[0].quantity){
        existingBook.splice(i, 1) //remove the matching order from existing book
        i = existingBook.length
      }
    }
    return existingBook
  }
}

//This function will handle the case where the quanity of matchingOrder is greater than incomingOrders
function getQuantityGreaterThan (matchingOrders, incomingOrder){
  return matchingOrders.filter ( (currentItem) => { //returns a array with orders that have quantity greater than icomingOrders
    const {quantity} = currentItem
    return quantity > incomingOrder.quantity
  })
}

//This function will handle the case where there is a remainder
function handleGreaterThan (quantityGreater, existingBook, incomingOrder) {
  if(quantityGreater.length > 0) {
    for (var i = 0; i < existingBook.length; i++){
      if (existingBook[i].quantity === quantityGreater[0].quantity){
        existingBook[i].quantity = existingBook[i].quantity - incomingOrder.quantity
        i = existingBook.length
      }
    }
    return existingBook
  }
}

//This funstion will handle the case where the quanity of incomingOrder is less than matchingOrder
function partialFulfillment (matchingOrders, incomingOrder){
  return matchingOrders.filter ( (currentItem) => { //returns a array with orders that have 
    const {quantity} = currentItem
    return quantity < incomingOrder.quantity
  })
}

//This function will handle the case where we can partially fulfill Order
function handlePartialFulfillment (quantityLess, existingBook, incomingOrder) {
  if(quantityLess.length > 0) {
    for (var i = 0; i < existingBook.length; i++){
      if (existingBook[i].quantity === quantityLess[0].quantity){
        incomingOrder.quantity = incomingOrder.quantity - existingBook[i].quantity
        existingBook.splice(i,1)
        existingBook.push(incomingOrder)
        i = existingBook.length
      }
    }
    return existingBook
  }
}

//This function gets order that might can work for a beneficial mismatch fullfillment
function getBenefitMatches (existingBook, incomingOrder){
  return existingBook.filter((currentItem) => {
    const {type, quantity, price} = currentItem
    return type !== incomingOrder.type && price > incomingOrder.price 
        && price >= incomingOrder.price + 100 && quantity === incomingOrder.quantity
  })
}

//This function will handle a mismatch order that is beneficial for both parties
function letsMakeADeal (benefitMatch, existingBook) {
  if(benefitMatch.length > 0) {
    for (var i = 0; i < existingBook.length; i++){
      if (existingBook[i].quantity === benefitMatch[0].quantity){
        existingBook.splice(i, 1)
        i = existingBook.length
      }
    }
    return existingBook
  } 
}

//This function gets order that match in price but do not match in type
function getMatchingOrders (existingBook, incomingOrder) {
  return existingBook.filter( (currentItem) => {
    const {type, price} = currentItem
    return type !== incomingOrder.type && price === incomingOrder.price
  }) 
}

//Main Function
function reconcileOrder(existingBook, incomingOrder) {
  //get orders from existingBook that match in price and correspond in type
  let matchingOrders = getMatchingOrders(existingBook, incomingOrder)
  let benefitMatch = getBenefitMatches(existingBook, incomingOrder) //get orders that might for mismatch case
  if (matchingOrders.length === 0 && benefitMatch.length === 0){ //if both are empty arrays then add incoming order
    return existingBook.concat(incomingOrder)
  } 

  // if there are orders that work for the mismatch case.
  if(benefitMatch.length > 0){ //case : handle a mismatch that is beneficial for both parties 
    return letsMakeADeal(benefitMatch, existingBook)
  }
  
  //get matching orders from existingBook that have quantities that are equal
  let quantityMatch = getQuantityMatching (matchingOrders, incomingOrder)
  if (quantityMatch.length > 0){ //case : where the quantities match exactly
    return handleQuantityMatch (quantityMatch, existingBook)
  } 
  
  //get matching orders from existingBook that have quantities that are greater than
  let quantityGreater = getQuantityGreaterThan (matchingOrders, incomingOrder)
  if (quantityGreater.length > 0) {//case : where we can fulfill incomingOrder but there is a remainder
    return handleGreaterThan (quantityGreater, existingBook, incomingOrder)
  } 
  
  //get matching orders from existingBook that have quantities that are less than
  let quantityLess = partialFulfillment (matchingOrders, incomingOrder)
  if (quantityLess.length > 0) { //case : where we can only partially fulfill incomingOrder
    return handlePartialFulfillment(quantityLess, existingBook, incomingOrder)
  }
}

module.exports = reconcileOrder
