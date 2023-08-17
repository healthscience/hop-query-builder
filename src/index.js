'use strict'
/**
*  HOP query builder library
*
*
* @class HopQuerybuilder
* @package    HOP-query-builder
* @copyright  Copyright (c) 2023 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import EventEmitter from 'events'

class HopQuerybuilder extends EventEmitter {

  constructor() {
    super()
  }

  /**
  * accept query, start conversation process
  * @method queryInputs
  *
  */
  queryInputs = function (query) {
    console.log('query')
    console.log(query)    
  }

}

export default HopQuerybuilder