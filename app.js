// declaring the buttons
const cartBtn = document.querySelector('.cart-btn');

const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');

//regarding the cart 
const cartItems = document.querySelector('.cart-items')
const cartItem = document.querySelector('.cart-item');
const cartContent = document.querySelector('.cart-content');
const cartTotal = document.querySelector('.cart-total');

const productDom = document.querySelector('.product-center');
let buttonDom = document.querySelectorAll('.bag-btn');


// cart

let cart = [];

//getting the products 
class Products {

    async getProducts() {
        try {
            let result = await fetch('products.json');
            let data = await result.json();
            let products = data.items.map(x => {
                const { title, price, } = x.fields;
                const { id } = x.sys;
                const image = x.fields.image.fields.file.url;
                return {
                    title,
                    price,
                    id,
                    image
                }
            })
            return products;

        } catch (error) {
            console.log(error);
        }


    }
}

// display products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach((product) => {
            result += `
                 <article class="product">
                  <div class="img-container">
                     <img src=${product.image} alt=" product" class="product-img">
                     <button class="bag-btn" data-id=${product.id}>
                         <i class="fas fa-shopping-cart">
                             add to bag
                         </i>
                     </button>
 
                 </div>
 
                 <h3> ${product.title}</h3>
                 <h4> $ ${product.price}</h4>
             </article>
            `
        })

        productDom.innerHTML = result;


    }

    getBagButtons() {
        // buttons are the array of the object          
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonDom = buttons;

        buttons.forEach(button => {
            let id = button.dataset.id;
            let isItemInCart = cart.find(item => item.id === id);
            if (isItemInCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener('click', (e) => {


                e.target.innerText = "In Cart";
                e.target.disabled = true;

                let cartItem = {...Storage.getProduct(id), amount: 1 }
                    //add product from products
                cart = [...cart, cartItem];
                //save cart in the local storage
                Storage.saveCart(cart);
                //set cart values
                this.setCartValue(cart);
                //display cart items
                this.addCartItem(cart);
                //show the cart
                this.showCartItem();




            })



        })



    }

    setCartValue(cart) {
            let tempTotal = 0;
            let itemsTotal = 0;

            cart.forEach((item) => {

                tempTotal += item.price * item.amount;
                itemsTotal += item.amount;

            })

            cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
            cartItems.innerText = itemsTotal;



        }
        // this was adding to the html parent element only not to the storage
    addCartSingleItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
          <img src="${item.image}" alt="product"/>
          <div>
             <h4>${item.title}</h4>
             <h5>${item.price}</h5>
             <span class="remove-item" data-id=${item.id}>remove</span>
          </div>
            
          <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
          </div>
        `;

        cartContent.appendChild(div)


    }

    addCartItem(items) {
        let alreadyAvailableIDs = [];
        document.querySelectorAll('.remove-item').forEach(item => {
                alreadyAvailableIDs.push(item.dataset.id);
            })
            // this logic for adding the cart items 
        items.forEach((item) => {
            if (!alreadyAvailableIDs.includes(item.id)) {
                this.addCartSingleItem(item)
            }

        })

    }

    showCartItem() {
        cartOverlay.classList.add('transparentBcg');
        cartDom.classList.add('showCart')

    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg')
        cartDom.classList.remove('showCart');
    }


    cartLogic() {
        // this method is to be used as an event handler so 
        // what ever we are providing this means it refers to the object which we  
        // are assingign this method as an event handler 

        clearCartBtn.addEventListener('click', () => {
            this.clearCart()
        })

        // this event is to be used as an event bubbling so there are different  if condition are there in which 
        // like one for increment and antoher for decrement .....

        cartContent.addEventListener('click', (event) => {

            // here this logic is to be used for removing the items 
            if (event.target.classList.contains('remove-item')) {

                let removeItem = event.target;
                let id = removeItem.dataset.id;
                // this logic is to remove item from the local storage    
                this.removeItem(id);
                // this logic is to removi DomElement  from the DomConten
                while (cartContent.children.length > 0) {
                    cartContent.removeChild(cartContent.children[0]);
                }
                //

                // this logic is to add the DomElement
                cart.forEach(item => this.addCartSingleItem(item))

            }
            // this logic is to be used to increase the quantity of the items
            if (event.target.classList.contains('fa-chevron-up')) {
                let addItem = event.target;
                let id = addItem.dataset.id;

                let tempItemFromTheCart = cart.find(item => item.id === id);
                tempItemFromTheCart.amount += 1;
                // now we update to the local storage 
                Storage.saveCart(tempItemFromTheCart);
                // after i.e i have to update the total amout 
                this.setCartValue(cart)


                // finally updating the  Ui value by traversing or ...       
                // selecting the class   

                /**
             ===> refrer to this  ==> ==> ==>   <i class="fas fa-chevron-up" data-id=${item.id}></i>
                                                <p class="item-amount">${item.amount}</p>
                                                <i class="fas fa-chevron-down" data-id=${item.id}></i>
                 
                                                      */


                addItem.nextElementSibling.innerText = tempItemFromTheCart.amount;




            }
            // this logic is to be used to decrease the quantitiy of the items
            if (event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;

                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;

                if (tempItem.amount > 0) {
                    // indeirectly updating the cart values in the local storage..
                    Storage.saveCart(cart)
                        // after updating from the local storage then updating to the total values, number of items
                    this.setCartValue(cart);
                    // finally updadting the total number of items

                    /**
                     * 
                     *          <i></i>
                                <p></p>
                                <i></i><----------[loweAmount]
                     * 
                     */
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;


                } else {
                    /*
                        <div class="cart-item">
                        <img>
                         <div> 
                           <h4>item.title</h4>
                           <h5>item.price</h5>
                           <span> </span>
                         </div>
                         <div>
                                <i></i>
                                <p></p>
                                <i></i><----------[loweAmount]
                         </div>   

                            
                    */

                    // removing the child element from the dom
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    // after removing from the dom lets remove the item from the cart also
                    this.removeItem(id);

                }


            }




        })



    }

    clearCart() {
        let cartIDs = cart.map(item => item.id);
        // below method is to be removing from the localMemory
        cartIDs.forEach(singleCartID => {
            this.removeItem(singleCartID);

        });

        // now we are removing from the html 

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();


    }

    removeItem(cartId) {
        cart = cart.filter(item => item.id !== cartId);
        //  note above we are indirectly assinging to the new array for the cart variables
        //   but we are not removing the value from the local storage
        // instead i.e we are appendig the new value for the same key 

        Storage.saveCart(cart);
        this.setCartValue(cart);
        let button = this.getSingleButton(cartId)
        button.disabled = false;
        button.innerHTML = `
            <i class="fas fa-shopping-cart"> add to bag <i> `;





    }

    getSingleButton(id) {
        return buttonDom.find(button => button.dataset.id === id)
    }


}

// local Storage
class Storage {
    // saving this data to the client browser
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    static saveCart(cartitems) {
        localStorage.setItem('cartitem', JSON.stringify(cartitems));
    }

    static getCart() {
        return localStorage.getItem('cartitem') ?
            JSON.parse(localStorage.getItem('cartitem')) : []
    }

}

// setting the event Listner

window.addEventListener('DOMContentLoaded', () => {

    const ui = new UI();
    // the below code is better tu put in the seperate method 
    let dataFromtheCart = Storage.getCart();
    // if there is only one item in the cart with bulk of quantity then the error is showing 
    // i.e why like above code is written 
    if (typeof dataFromtheCart === "object") { cart.push(dataFromtheCart) } else { cart = dataFromtheCart }

    console.log(cart)
    ui.addCartItem(cart)
    ui.setCartValue(cart);
    ui.showCartItem();
    cartBtn.addEventListener('click', ui.showCartItem);
    closeCartBtn.addEventListener('click', ui.hideCart);

    // until this 


    const product = new Products();
    product.getProducts().then(data => {
        ui.displayProducts(data);
        Storage.saveProducts(data);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();

    })









})