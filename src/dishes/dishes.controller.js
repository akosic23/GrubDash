const { privateDecrypt } = require("crypto");
const { NONAME } = require("dns");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//middleware
function dishExists(req, res, next) {
    const {dishId} = req.params
    const foundDish = dishes.find((dish) => dish.id === dishId)
    if (foundDish){
        res.locals.dish = foundDish
        return next();
    }
    next({
        status: 404,
        message: `Dish id does not exist: ${dishId}.`
    })
}
function dishHasName(req, res, next){
    const {data: {name} = {}} = req.body
    if(!name || name === ""){
        next({
            status: 400,
            message: 'A name is required.'
        })
    }
    return next();
}

function dishHasDescription(req, res, next){
    const {data: {description} = {}} = req.body
    if(!description || description === ""){
        next({
            status: 400,
            message: 'A description is required.'
        })
    }
    return next();
}

function dishHasPrice(req, res, next){
    const {data: {price} = {}} = req.body
    if(!price || price <= 0){
        next({
            status: 400,
            message: 'A price must be a number greater than 0.'
        })
    }
    return next();
}

function priceIsNum(req, res, next){
    const {data: {price} = {}} = req.body
    if(Number.isInteger(price)){
        return next();
    }
    next({
        status: 400,
        message: 'The price must be a number.'
    })
}

function dishHasImgUrl(req, res, next){
    const {data: {image_url} = {}} = req.body
    if(!image_url || image_url === ""){
        next({
            status: 400,
            message: 'An image_url is required.'
        })
    }
    return next();
}

function dishIdMatches(req, res, next){
    const {dishId} = req.params
    const {data: {id} = {}} = req.body
    if(dishId === id || !id){
        return next();
    }
    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}.`
    })
}

//https methods
function create(req, res, next) {
    const { data: {name, description, price, image_url} = {} } = req.body
    const newId = new nextId();
    const newDish = {
        id: newId,
        name: name,
        description: description,
        price: price,
        image_url: image_url,
    }
    dishes.push(newDish)
    res.status(201).json({data: newDish})
}

function read(req, res, next) {
    const {dishId} = req.params
    if(dishId){
        const found = dishes.find((dish) => dishId === dish.id)
        res.json({data: found})
    }
}

function list(req, res, next) {
    res.json({data: dishes})
}

function update(req, res, next) {
    const dish = res.locals.dish
    const originalName = dish.name
    const originalDescription = dish.description
    const originalPrice = dish.price
    const originalImgUrl = dish.image_url
    const {data: {name, description, price, image_url} = {} } = req.body
    if(originalName !== name){
        dish.name = name
    }
    if(originalDescription !== description){
        dish.description = description
    }
    if(originalPrice !== price){
        dish.price = price
    }
    if(originalImgUrl !== image_url){
        dish.image_url = image_url
    }
    res.json({data: dish})
}

module.exports = {
    list,
    read: [dishExists, read],
    create: [
        dishHasName, 
        dishHasDescription, 
        dishHasPrice, 
        priceIsNum,
        dishHasImgUrl, 
        create
    ],
    update: [
        dishExists, 
        dishHasName, 
        dishHasDescription, 
        dishHasPrice, 
        priceIsNum,
        dishHasImgUrl, 
        dishIdMatches,
        update]
}