// Create multiple classes:  Store, Item, Category, Producer, etc.
//      StoreService:  Store Service -- to send a HttpRequest via AJAX

// Manage the DOM: to Clear out the app DIV every time.

class Store {
    constructor(name) {
        this.name = name;
        this.items = [];
    }
    addItem(name, price, company) {
        this.items.push(new Item(name, price, company));
    }
} // end of Store class

class Item {
    constructor(name, price, company) {
        this.name = name;
        this.price = price;
        this.company = company;
    }
}  // end of Item class


class Company {
    constructor (name, street, city, state, phone) {
        this.name = name;
        this.street = street;
        this.city = city;
        this.state = state;
        this.phone = phone;
    }
}

// class ItemService {
//     static itemUrl =  'https://crudcrud.com/api/467446f2b41f4ea58e1a553fd9faaf72/items';
//     static createItem(item) {
//         console.log(this.url);
//         return $.ajax({
//             url: this.itemUrl,
//             dataType: 'json',
//             contentType: 'application/json',
//             data: JSON.stringify(item),
//             type: 'POST',
//             headers: {'Accept': 'application/json',
//                       'Content-Type': 'application/json'}
//             //headers: {'Origin': 'http://127.0.0.1:8080', 'Accept' : 'application/json'}
//         });
//         //return $.post(this.url, store);   
//     }

//      // GET ONE by id
//      static getItem(name) {
//         return $.get(this.url + `/name: ${name}`);
//     }
// }


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
            dataType: 'json',
            async: false,
            cache: false,
            contentType: 'application/json',
            data: JSON.stringify({
                "name" : store.name,
                "items" : store.items}),
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
            .done(() => {
                return StoreService.getAllStores();
            })
            .then((stores) => this.render(stores));       
    } // end of deleteStore()

    // static createItem(item) {
    //     console.log(`Creating an item named: ${item.name}!`);
    //     ItemService.createItem(item)
    //     .then(() => {
    //         return StoreService.getAllStores();
    //     })
    //     .then((stores) => this.render(stores));
    // }
    
    static addItem(id) {
        for (let store of this.stores) {
        //for (let i = 0; i < this.stores.length; i++) {
            //const store = this.stores[i];
            if (store._id == id) {
                store.items.push(new Item($(`#${store._id}-item-name`).val(), $(`#${store._id}-item-price`).val(), $(`#${store._id}-item-company`).val()));
                StoreService.updateStore(store)
                    .done(() => {
                        return StoreService.getAllStores();
                    })
                    .done(stores => this.render(stores));
                    //.fail(function() {console.log('addItem update failed!')});
                // console.log(`New item added to store ${store.name}`);
            } // end of if store match is found
        } // end of for-loop through stores
    } // end of addItem()


    static deleteItem(storeId, itemName) {
        //for (let store of this.stores) {
        for (let i = 0; i < this.stores.length; i++) {
            const store = this.stores[i];
            if (store._id == storeId) {
                // this is the right store!!  Now look for the item with itemId
                for (let i = 0; i < store.items.length; i++) {
                    // There is no stored ID, so we need to look by NAME
                    const item = store.items[i];
                    if (item.name == itemName) {
                        //this is the right item, within the right store!
                        store.items.splice(i, 1);
                        StoreService.updateStore(store)
                            .done(() => {
                                console.log("Update fired");
                                return StoreService.getAllStores();
                            })
                            .done(stores => this.render(stores));
                            // .then((stores) => {
                            //     console.log("Render pending...");
                            //     this.render(stores);
                            // })
                            //.fail(function() {console.log('deleteItem update failed!')});
                        // console.log(`Deleting item:  ${itemName} from store: ${store.name}`);
                    } // end of if correct item check
                } // end of items for-loop within stores for-loop
            } // end of if correct store check
        } // end of stores for-loop
    } // end of deleteItem() 

    static render(stores) {
        this.stores = stores;
        $('#app').empty();
        console.log('Emptied the DOM #app');

        //for (let i = 0; i < stores.length; i++) {
        // const store = stores[i];
        for (let store of stores) {
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
                                    <input type="text" id="${store._id}-item-name" class="form-control" placeholder="Item Name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${store._id}-item-price" class="form-control" placeholder="Item Price">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${store._id}-item-company" class="form-control" placeholder="Name of Company">
                                </div>
                            </div>
                            <button id="${store._id}-new-item" onclick="DOMManager.addItem('${store._id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
            );

              
                    // find the store._id for this element, 
                //       and then find the card body for that store, via the "_id"
                //      and append each item to the store!!
            // for (let i = 0; i < store.items.length; i++) {
            //     const item = store.items[i];   
            for (let item of store.items) {  
                $(`#${store._id}`).find('.card-body').append(
                    `<p>
                        <span id="name-${item.name}"><strong>Item Name: </strong> ${item.name}</span>
                        <span id="price-${item.name}"><strong>Item Price: </strong> ${item.price}</span>
                        <span id="company-${item.name}"><strong>Company: </strong> ${item.company}</span>
                        <button class="btn btn-success" onclick="DOMManager.deleteItem('${store._id}', '${item.name}')">Delete</button>
                    `
                );
            } // end of for-loop to append items to the store.
        } // end of for-loop for each store.
    } // end of render()
} // end of DOMManager();


$('#create-new-store').on('click', () => {
    console.log("New Store!");
    DOMManager.createStore($('#new-store-name').val());
    $('#new-store-name').val(' ');
});

DOMManager.getAllStores();


