'use strict';

// This is a Store Inventory System.  
//          A Store can be added with the location.  
//          and a list for the products that are found.
// The List of products will be completed by adding a product with the form.
class Store {
    constructor(name, city, state) {
        this.name = name;
        this.city = city;
        this.state = state;
        this.products = [];
    }
    addProduct(name, price, company, quantity) {
        this.products.push(new Product(name, price, company, quantity));
    }
} 

class Product {
    constructor(name, price, company, quantity) {
        this.name = name;
        this.price = price;
        this.company = company;
        this.quantity = quantity;
    }
}  

class StoreService {
    static url =  "https://crudcrud.com/api/467446f2b41f4ea58e1a553fd9faaf72/stores";

    //CRUD Operations 
    //      These all need to return what is returned, because we are
    //      going to be calling these from somewhere else, and whereever
    //      we call them from needs to use the promise that is returned.

    // GET ALL
    static getAllStores() {
        return $.get(this.url);
    }

    // GET ONE by id
    static getStore(id) {
        return $.get(this.url + `/${id}`);
    }

    // POST store, where 
    //              store is an instance of the Store class!
    static createStore(store) {
        return $.ajax({
            url: this.url,
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(store),
            type: 'POST'
        });
    }

    // UPDATE store, where
    //              store is an instance of the Store class!
    static updateStore(store) {
        return fetch(  `${this.url}/${store._id}`, {
            method: 'PUT',
            headers : new Headers ({
                    'Content-Type': 'application/json'
            }),      
            body: JSON.stringify({"name" : store.name, "city" : store.city, "state" : store.state, "products" : store.products}),
        });
    }


    // DELETE ONE by id
    static deleteStore(id) {
        return $.ajax({
            url:  `${this.url}/${id}`,
            type: 'DELETE'
        });
    }
} // end of StoreService class


class DOMManager {
    static stores;

    static getAllStores() {
        StoreService.getAllStores().then(stores => this.render(stores));
    }

    static createStore(name,city,state) {
        console.log(`Creating a store named: ${name}!`);
        StoreService.createStore(new Store(name,city,state))
            .then(() => {
                return StoreService.getAllStores();
            })
            .then((stores) => this.render(stores));
    } // end of createStore()

    static deleteStore(id) {
        console.log(`Deleting a store!`);
        StoreService.deleteStore(id)
            .then(() => {
                return StoreService.getAllStores();
            })
            .then((stores) => this.render(stores));       
    } // end of deleteStore()

    static addProduct(id) {
        for (const store of this.stores) {
            if (store._id == id) {
                store.products.push(new Product($(`#${store._id}-product-name`).val(), $(`#${store._id}-product-price`).val(), $(`#${store._id}-product-company`).val(), $(`#${store._id}-product-quantity`).val()));
                console.log('Adding product:' + $(`#${store._id}-product-name`).val());
                StoreService.updateStore(store)
                    .then(() => {
                        return DOMManager.getAllStores();
                    });
            } // end of if store match is found
        } // end of for-loop through stores
    } // end of addProduct()

    static deleteProduct(storeId, productName) {
        for (const store of this.stores) {
            if (store._id == storeId) {
                for (let i = 0; i < store.products.length; i++) {
                    const product = store.products[i];
                    if (product.name == productName) {
                        store.products.splice(i, 1);
                        console.log('Deleting product: ' + productName);
                        StoreService.updateStore(store)
                            .then(() => {
                                return DOMManager.getAllStores();
                            });                     
                    } // end of if correct product check
                } // end of products for-loop within stores for-loop
            } // end of if correct store check
        } // end of stores for-loop
    } // end of deleteProduct() 

    static decrementProduct(storeId, productName) {
        for (const store of this.stores) {
            if (store._id == storeId) {
                for (let i = 0; i < store.products.length; i++) {
                    const product = store.products[i];
                    if (product.name == productName) {
                        if (store.products[i].quantity == 0) {
                            console.log(`No product: ${store.products[i].name} out of stock!`)
                        } else {
                            store.products[i].quantity -= 1;
                            console.log('Decremented ' + productName + ' quantity.  New total: ' + `${store.products[i].quantity}`);
                            StoreService.updateStore(store)
                                .then(() => {
                                    return DOMManager.getAllStores();
                                });       
                        } // end of if-else loop              
                    } // end of if correct product check
                } // end of products for-loop within stores for-loop
            } // end of if correct store check
        } // end of stores for-loop
    } // end of decrementProduct() 

    static incrementProduct(storeId, productName) {
        for (const store of this.stores) {
            if (store._id == storeId) {
                for (let i = 0; i < store.products.length; i++) {
                    const product = store.products[i];
                    if (product.name == productName) { 
                        store.products[i].quantity++;
                        console.log('Incremented ' + productName + ' quantity.  New total: ' + `${store.products[i].quantity}`);
                        StoreService.updateStore(store)
                            .then(() => {
                                return DOMManager.getAllStores();
                            });       
                    } // end of if correct product check
                } // end of products for-loop within stores for-loop
            } // end of if correct store check
        } // end of stores for-loop
    } // end of incrementProduct() 

    static render(stores) {
        this.stores = stores;
        $('#app').empty();
        //console.log('Emptied the DOM #app');
        for (let store of stores) {
            //console.log(`In store loop:  ${store.name}`);
            $('#app').prepend(
                `
                <br><div id="${store._id}" class="card border border-success">
                    <div class="card-header">
                        <h2>${store.name}</h2>
                        <h6>Located in ${store.city}, ${store.state}</h6>
                        <button class="btn btn-danger" onclick="DOMManager.deleteStore('${store._id}')">Delete Store</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm center">
                                    <input type="text" id="${store._id}-product-name" class="form-control" placeholder="Product Name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${store._id}-product-price" class="form-control" placeholder="Product Price">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${store._id}-product-company" class="form-control" placeholder="Name of Company">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${store._id}-product-quantity" class="form-control" placeholder="Quantity in Stock">
                                </div>
                            </div>
                            <br>
                            <button id="${store._id}-new-product" onclick="DOMManager.addProduct('${store._id}')" class="btn btn-primary form-control">Add Product</button>
                        </div>
                    </div>
                </div><br>`
            );      
            if (store.products == null) {
                console.log(`Product list for store: ${store.name} is empty!`);
            } else {
                $(`#${store._id}`).find('.card-body').append(`<br>`);
                for (const product of store.products) {  
                    //console.log(`In product loop:  ${product.name}`);
                    $(`#${store._id}`).find('.card-body').append(
                        `<p>
                            <span id="name-${product.name}"><strong>Product Name: </strong> ${product.name}</span>
                            <span id="price-${product.name}"><strong>&nbsp;Product Price: </strong> ${product.price}</span><br>
                            <span id="company-${product.name}"><strong>&nbsp;&nbsp;&nbsp;Company: </strong> ${product.company}</span>
                            <span id="quantity-${product.name}"><strong>&nbsp;Quantity: </strong> ${product.quantity}&nbsp;&nbsp;</span>
                            <button id="${store._id}-${product.name}-increment-product-quantity" onclick="DOMManager.incrementProduct('${store._id}', '${product.name}')"  class="btn btn-success">Increment Quantity</button>
                            <button id="${store._id}-${product.name}-decrement-product-quantity" onclick="DOMManager.decrementProduct('${store._id}', '${product.name}')"  class="btn btn-warning">Decrement Quantity</button>
                            <button id="${store._id}-${product.name}-delete-product" onclick="DOMManager.deleteProduct('${store._id}', '${product.name}')"  class="btn btn-danger">Delete Product</button>&nbsp;&nbsp;
                            `
                    );   
                } // end of for-loop to append products to the store.
            } // end of if-else empty product list for store
        } // end of for-loop for each store.
    } // end of render()
} // end of DOMManager();


$('#create-new-store').on('click', () => {
    console.log("New Store!");
    DOMManager.createStore($('#new-store-name').val(), $('#new-store-city').val(), $('#new-store-state').val());
    $('#new-store-name').val('');
    $('#new-store-city').val('');
    $('#new-store-state').val('');
});

DOMManager.getAllStores();

