import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id; 
    thisProduct.data = data; 

    thisProduct.renderInMenu(); // uruchomiennie danej funkcji po utworzeniu instancji
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    console.log('new Product', thisProduct);
  }
 
  renderInMenu(){ // metoda do do tworzenia produktów na stornie
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);  
    //console.log(generatedHTML);

    /* create element using utils.createElementFromHtml */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML); 

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu); 

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){ // metoda pozwalająca na wyszukanie konkretnych elementów DOM
    const thisProduct = this;
    
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;
  
    /* find the clickable trigger (the element that should react to clicking) */
    // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); - Stała, która stała się zbędna po wstawieniu getElements po zmianie w następnym wierszu.
      
    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function(event) {
        
      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      console.log('activeProduct:', activeProduct);

      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if(activeProduct && activeProduct != thisProduct.element){ // activeProduct 2x użyty aby pokryć null - wpisanie activeProduct && null też działa i to chyba wynika z clickableTrigger
          
        activeProduct.classList.remove('active');
      }
  
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');
    });
  }
  
  initOrderForm(){
    const thisProduct = this;
    console.log(this.initAccordion);

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
      
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
      
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });

  }
  
  processOrder(){
    const thisProduct = this;
    console.log('processOrder:', thisProduct);

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    console.log('formData', formData);
      
    // set price to default price
    let price = thisProduct.data.price;
    //console.log(price);
      
    // for every category (param)...
    for(let paramId in thisProduct.data.params){
        
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      console.log(paramId, param);
        
      // for every option in this category
      for(let optionId in param.options){
          
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        console.log(optionId, option);
          
        // check if there is param with a name of paramId in formData and if it includes optionId
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId); 
        if(optionSelected){
            
          // check if the option is not default
          if(!option.default){
              
            // add option price to price variable
            price += option.price;
          }
            
          // check if the option is default
        } else if(option.default){
            
          // reduce price variable
          price -= option.price;
        }
          
        // Wybór i zmiana składników -> widoczna zmiana przy wybieraniu
        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId); 
        console.log('Image:', optionImage);

        if(optionImage) {
          if (optionSelected){
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          }

          else{
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    thisProduct.priceSingle = price;
      
    // multiply price by amount
    price *= thisProduct.amountWidget.value;
      
    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;
    console.log('Update price:', price);
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    // app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
    };

    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;
    
    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};
    
    // for very category (param)
    for(let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];
    
      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {
        label: param.label,
        options: {}
      };
    
      // for every option in this category
      for(let optionId in param.options){
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
    
        if(optionSelected) {
          // option is selected!
          params[paramId].options[optionId] = option.label;
        }
      }
    }
    
    return params;
  }

}

export default Product;