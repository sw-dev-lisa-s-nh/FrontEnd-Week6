'use strict';
class Store {
    constructor(name) {
        this.name = name;
        this.products = [];
    }
    // addProduct(name, price, company) {
    //     this.products.push(new Product(name, price, company));
    // }
} 

class Product {
    constructor(name, price, company) {
        this.name = name;
        this.price = price;
        this.company = company;
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
        return $.ajax({
            url : `${this.url}/${store._id}`,
            cache: false,
            dataType: 'json',
            data: JSON.stringify({"name" : store.name,"products" : store.products}),
            contentType: 'application/json',
            type: 'PUT'
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
        console.log("DOMManager.getAllStores()");
        StoreService.getAllStores().then(stores => this.render(stores));
    }

    static createStore(name) {
        console.log(`Creating a store named: ${name}!`);
        StoreService.createStore(new Store(name))
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
        for (let store of this.stores) {
            if (store._id == id) {
                store.products.push(new Product($(`#${store._id}-product-name`).val(), $(`#${store._id}-product-price`).val(), $(`#${store._id}-product-company`).val()));
                StoreService.updateStore(store)
                    .then(() => {
                        return StoreService.getAllStores();
                    })
                    .done(stores => this.render(stores));
            } // end of if store match is found
        } // end of for-loop through stores
    } // end of addProduct()

    static deleteProduct(storeId, productName) {
        for (let store of this.stores) {
            if (store._id == storeId) {
                for (let i = 0; i < store.products.length; i++) {
                    const product = store.products[i];
                    if (product.name == productName) {
                        store.products.splice(i, 1);
                        StoreService.updateStore(store)
                            .then(() => {
                                return StoreService.getAllStores();
                            })
                            .done(stores => this.render(stores));                        
                    } // end of if correct product check
                } // end of products for-loop within stores for-loop
            } // end of if correct store check
        } // end of stores for-loop
    } // end of deleteProduct() 

    static render(stores) {
        this.stores = stores;
        $('#app').empty();
        console.log('Emptied the DOM #app');
        for (let store of stores) {
            console.log(`In store loop:  ${store.name}`);
            $('#app').prepend(
                `
                <br><div id="${store._id}" class="card">
                    <div class="card-header">
                        <h2>${store.name}</h2>
                        <button class="btn btn-success" onclick="DOMManager.deleteStore('${store._id}')">Delete Store</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${store._id}-product-name" class="form-control" placeholder="Product Name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${store._id}-product-price" class="form-control" placeholder="Product Price">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${store._id}-product-company" class="form-control" placeholder="Name of Company">
                                </div>
                            </div>
                            <button id="${store._id}-new-product" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
            );
            //document.getElementById(`${store._id}-new-product`).setEvent = DOMManager.addProduct(`${store._id}`);
            $(`#${store._id}-new-product`).on('click', () => {
                console.log("New Product!");
                DOMManager.addProduct(`${store._id}`);
            });            
            // How do I check if this doesn't have any products??
            if (store.products == null) {
                console.log(`Product list for store: ${store.name} is empty!`);
            } else {
                for (let product of store.products) {  
                    console.log(`In product loop:  ${product.name}`);
                    $(`#${store._id}`).find('.card-body').append(
                        `<p>
                            <span id="name-${product.name}"><strong>product Name: </strong> ${product.name}</span>
                            <span id="price-${product.name}"><strong>product Price: </strong> ${product.price}</span>
                            <span id="company-${product.name}"><strong>Company: </strong> ${product.company}</span>
                            <button id="${store._id}-${product.name}-delete-product" class="btn btn-success">Delete</button>
                        `
                    );
                    $(`#${store._id}-${product.name}-delete-product`).on('click', () => {
                        console.log("Delete Product!");
                        DOMManager.deleteProduct(`${store._id}`, `${product.name}`);
                    });          
                } // end of for-loop to append products to the store.
            } // end of if-else empty product list for store
        } // end of for-loop for each store.
    } // end of render()
} // end of DOMManager();


$('#create-new-store').on('click', () => {
    console.log("New Store!");
    DOMManager.createStore($('#new-store-name').val());
    $('#new-store-name').val(' ');
});

DOMManager.getAllStores();

