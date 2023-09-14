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
import LibComposer from 'librarycomposer'

class HopQuerybuilder extends EventEmitter {

  constructor() {
    super()
    console.log('HQB--live')
    this.liveComposer = new LibComposer()
    this.modulesStart = this.modulesGenesis()
    // this.queryInputs(this.modulesStart)
  }

  /**
  * accept query, start conversation process
  * @method queryInputs
  *
  */
  queryInputs = function (query) {
    console.log('HQB--Qinputs')
    console.log(query)
    let safeFlowquery = {}
    if (query.action === 'tempmodule') {
      // create new temp modules from network
      console.log('HQB--temp mod list start')
      console.log(query)
      let ECSbundle = {}
      // npx contract UUID-temp  see structure at https://design.penpot.app/#/view/e8b3498a-41f9-8006-8001-7af986efdd68?page-id=279589f6-a428-8012-8001-fee517df51ef&section=interactions&index=0
      // array of expanded modules
      // structure NXP to send to HOP
      let message = {}
      message.type = 'safeflow'
      message.reftype = 'ignore'
      message.action = 'networkexperiment'
      message.data = ECSbundle
      // console.log('OUTmesssage+++++++++OUT+FIRST++++++')
      // console.log(message)

    } else if (query.action === 'genesis') {
      console.log('HQB--geneiss start')
      console.log(message.data)
      let moduleGenesisList = []
      let moduleGenesisExpanded = []
      let newModCount = message.data.length
      for (let mh of message.data) {
        const moduleRefContract = this.liveComposer.liveComposer.moduleComposer(mh, '')
        // const moduleRefContractReady = JSON.stringify(moduleRefContract)
        // const savedFeedback = await this.liveHolepunch.BeeData.savePubliclibrary(moduleRefContract)
        moduleGenesisList.push(savedFeedback.key)
        // stand key value format or query and get back ref contract double check TODO
        let moduleContract = {}
        moduleContract.key = savedFeedback.key
        moduleContract.value = savedFeedback.contract
        moduleGenesisExpanded.push(moduleContract) // .contract)
        newModCount--
      }
      if (newModCount === 0) {
        // aggregate all modules into exeriment contract
        let genesisRefContract = this.liveComposer.liveComposer.experimentComposerGenesis(moduleGenesisList)
        // double check they are created
        // const savedFeedback = await this.liveHolepunch.BeeData.savePubliclibrary(genesisRefContract)
        // savedFeedback.expanded = moduleGenesisExpanded
      }
    } else if (query.action === 'update') {

    }
    safeFlowquery = query
    return safeFlowquery
  }

  /**
  * Prepare minimum modules
  * @method minModules
  *
  */
  minModules = function (beebeeIN, genesisMods) {
    console.log('HQB---minModule')
    console.log(beebeeIN)
    // console.log(genesisMods)
    // get temp contract keys for question, data, compute, visualisation
    let ModulesMinrequired = ['question', 'data', 'compute', 'visualise']
    let minStartlist = []
    for (const mtype of ModulesMinrequired) {
      let match = this.modulesStart.data.filter(e => e.type === mtype)
      minStartlist.push(match)
    }
    // form modinfo structure for SF-ECS
    let question = {}
    for (let mod of minStartlist) {
      // console.log('mode')
      // console.log(mod)
      if (mod[0].type === 'question') {
        // console.log('question')
        // console.log(mod)
        question = mod[0]
      }
    }
    // need to make refContract question and data packaging
    // let makeRefContract = this.()
    let tempGenRefs = {}
    for (let refC of genesisMods) {
      // console.log('ref-publiclib')
      // console.log(refC.value)
      if (refC.value.refcontract === 'compute') {
        // console.log('ref compute')
        // console.log(refC)
        tempGenRefs.compute = refC
      } else if (refC.value.refcontract === 'visualise') {
        // console.log('ref vis')
        // console.log(refC)
        tempGenRefs.visualise = refC
      } else if(refC.value.refcontract === 'question') {
        // console.log('question')
        // console.log(refC)
        tempGenRefs.question = refC
      } else if(refC.value.refcontract === 'packaging') {
        // console.log('data')
        // console.log(refC)
        tempGenRefs.data = refC
      }
    }
    tempGenRefs.question = {}
    tempGenRefs.question.key = '123456789'
    tempGenRefs.question.value = question
    console.log('tempGenesis- structure ready>>>')
    console.log(tempGenRefs)
    let minModulesList = {}
    minModulesList.action = 'tempmodule'
    minModulesList.data = tempGenRefs
    let tempMods = this.queryInputs(minModulesList)
    console.log('HQB--safeflow ready query')
    console.log(tempMods)
    return tempMods
  }

  /**
  * Module Contract Available to network
  * @method modulesGenesis
  *
  */
  modulesGenesis = function () {  
    const moduleContracts = []
    const dataCNRLbundle = {}
    // CNRL implementation contract e.g. from mobile phone sqlite table structure
    dataCNRLbundle.reftype = 'module'
    dataCNRLbundle.type = 'question'
    dataCNRLbundle.primary = 'genesis'
    dataCNRLbundle.description = 'Question for network experiment'
    dataCNRLbundle.concept = ''
    dataCNRLbundle.grid = []
    moduleContracts.push(dataCNRLbundle)
    // CNRL implementation contract e.g. from mobile phone sqlite table structure
    const dataCNRLbundle2 = {}
    dataCNRLbundle2.reftype = 'module'
    dataCNRLbundle2.type = 'data'
    dataCNRLbundle2.primary = 'genesis'
    dataCNRLbundle2.description = 'data source(s) for network experiment'
    dataCNRLbundle2.grid = []
    moduleContracts.push(dataCNRLbundle2)
    // CNRL implementation contract e.g. from mobile phone sqlite table structure
    /* const dataCNRLbundle3 = {}
    dataCNRLbundle3.reftype = 'module'
    dataCNRLbundle3.type = 'device'
    dataCNRLbundle3.primary = 'genesis'
    dataCNRLbundle3.concept = ''
    dataCNRLbundle3.grid = []
    moduleContracts.push(dataCNRLbundle3) */
    // CNRL implementation contract e.g. from mobile phone sqlite table structure
    /* const dataCNRLbundle4 = {}
    dataCNRLbundle4.reftype = 'module'
    dataCNRLbundle4.type = 'mobile'
    dataCNRLbundle4.primary = 'genesis'
    dataCNRLbundle4.concept = ''
    dataCNRLbundle4.grid = []
    moduleContracts.push(dataCNRLbundle4) */
    // module ref contract utility type
    const dataCNRLbundle6 = {}
    dataCNRLbundle6.reftype = 'module'
    dataCNRLbundle6.type = 'compute'
    dataCNRLbundle6.primary = 'genesis'
    dataCNRLbundle6.concept = ''
    dataCNRLbundle6.grid = []
    dataCNRLbundle6.dtcompute = []
    dataCNRLbundle6.dtresult = []
    dataCNRLbundle6.category = []
    dataCNRLbundle6.compute = ''
    dataCNRLbundle6.controlpanel = []
    dataCNRLbundle6.automation = false
    dataCNRLbundle6.time = { realtime: 0, timeseg: [], startperiod: '' }
    moduleContracts.push(dataCNRLbundle6)
    // CNRL implementation contract e.g. from mobile phone sqlite table structure
    const dataCNRLbundle5 = {}
    dataCNRLbundle5.reftype = 'module'
    dataCNRLbundle5.type = 'visualise'
    dataCNRLbundle5.primary = 'genesis'
    dataCNRLbundle5.grid = []
    moduleContracts.push(dataCNRLbundle5)
    // CNRL implementation contract e.g. from mobile phone sqlite table structure
    const dataCNRLbundle7 = {}
    dataCNRLbundle7.reftype = 'module'
    dataCNRLbundle7.type = 'education'
    dataCNRLbundle7.primary = 'genesis'
    dataCNRLbundle7.concept = ''
    dataCNRLbundle7.grid = []
    moduleContracts.push(dataCNRLbundle7)
    /* const dataCNRLbundle8 = {}
    dataCNRLbundle8.reftype = 'module'
    dataCNRLbundle8.type = 'lifestyle'
    dataCNRLbundle8.primary = 'genesis'
    dataCNRLbundle8.concet = ''
    dataCNRLbundle8.grid = []
    moduleContracts.push(dataCNRLbundle8) */
    /* const dataCNRLbundle9 = {}
    dataCNRLbundle9.reftype = 'module'
    dataCNRLbundle9.type = 'error'
    dataCNRLbundle9.primary = 'genesis'
    dataCNRLbundle9.concept = ''
    dataCNRLbundle9.grid = []
    moduleContracts.push(dataCNRLbundle9) */
    /* const dataCNRLbundle10 = {}
    dataCNRLbundle10.reftype = 'module'
    dataCNRLbundle10.type = 'control'
    dataCNRLbundle10.primary = 'genesis'
    dataCNRLbundle10.concept = ''
    dataCNRLbundle10.grid = []
    moduleContracts.push(dataCNRLbundle10) */
    const dataCNRLbundle11 = {}
    dataCNRLbundle11.reftype = 'module'
    dataCNRLbundle11.type = 'prescription'
    dataCNRLbundle11.primary = 'genesis'
    dataCNRLbundle11.concept = ''
    dataCNRLbundle11.grid = []
    moduleContracts.push(dataCNRLbundle11)
    /* const dataCNRLbundle12 = {}
    dataCNRLbundle12.reftype = 'module'
    dataCNRLbundle12.type = 'communication'
    dataCNRLbundle12.primary = 'genesis'
    dataCNRLbundle12.concept = ''
    dataCNRLbundle12.grid = []
    moduleContracts.push(dataCNRLbundle12) */
    // CNRL implementation contract e.g. from mobile phone sqlite table structure
    /* const dataCNRLbundle13 = {}
    dataCNRLbundle13.reftype = 'module'
    dataCNRLbundle13.type = 'idea'
    dataCNRLbundle13.primary = 'genesis'
    dataCNRLbundle13.concept = ''
    dataCNRLbundle13.grid = []
    moduleContracts.push(dataCNRLbundle13) */
    const dataCNRLbundle14 = {}
    dataCNRLbundle14.reftype = 'module'
    dataCNRLbundle14.type = 'rhino'
    dataCNRLbundle14.primary = 'genesis'
    dataCNRLbundle14.concept = ''
    dataCNRLbundle14.grid = []
    moduleContracts.push(dataCNRLbundle14)
    const dataCNRLbundle15 = {}
    dataCNRLbundle15.reftype = 'module'
    dataCNRLbundle15.type = 'pricing'
    dataCNRLbundle15.primary = 'genesis'
    dataCNRLbundle15.concept = ''
    dataCNRLbundle15.grid = []
    moduleContracts.push(dataCNRLbundle15)

    let genesisModules = {}
    genesisModules.action = 'tempmodule'
    genesisModules.data = moduleContracts
    return genesisModules
  }

}

export default HopQuerybuilder