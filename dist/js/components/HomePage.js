import {select, templates} from '../settings.js';
import utils from '../utils.js';

class HomePage{
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
  }

  render(){
    const thisHome = this;
    
    const generatedHTML = templates.homePage();                                         /* generate HTML based on template */
    thisHome.element = utils.createDOMFromHTML(generatedHTML);                          /* create element using utils.createElementFromHTML */
    const homeContainer = document.querySelector(select.containerOf.homePage);          /* find menu container */
    homeContainer.appendChild(thisHome.element);                                        /* add element to menu */

    thisHome.dom = {
      wrapper: this.element,
    };
  }
}

export default HomePage;