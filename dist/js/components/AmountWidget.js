import {settings, select} from '../settings.js';

class AmountWidget{
  constructor(element){
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();

    console.log('AmountWidget:', thisWidget);
    console.log('constructor arguments:', element);
  }
    
  getElements(element){ // Wyszukuje elementy widgetu
    const thisWidget = this;
    
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){ // Pośrednik - ma regulować ilość produktów i nie pozwolić na wpisywanie dowolnej ilości lub dodanie zbyt dużej lub za małej ilości produktu
    const thisWidget = this;

    const newValue = parseInt(value); // parseInt konwertuje zapis do danej liczby
    console.log(newValue);

    /* TODO: Add validation */
    if(thisWidget.value !== newValue && !isNaN(newValue)){ 

      if(newValue>=settings.amountWidget.defaultMin)

        if(newValue<=settings.amountWidget.defaultMax)

          thisWidget.value = newValue;
    } 
      
    thisWidget.announce();

    thisWidget.input.value = thisWidget.value;
    console.log('setValue:', newValue);
      
  }

  initActions(){
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();

      thisWidget.setValue(thisWidget.value -1);
    });

    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();

      thisWidget.setValue(thisWidget.value +1);
    });
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;