'use strict'
import { timeStamp } from 'console'
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
  }

  /**
  * Prepare module contracts for different entry paths
  * @method queryPath
  *
  */
  queryPath = function (beebeeIN, publicLib, fileInfo) {
    console.log('HQB---wich path for Module Contracts to follow')
    // console.log(this.modulesStart)
    // console.log(beebeeIN)
    // console.log(publicLib)
    let formSFquery = {}
    if (beebeeIN.action === 'blind') {
      formSFquery = this.blindPath(beebeeIN, publicLib, fileInfo)
    } else if (beebeeIN.action === 'library') {
      formSFquery = this.libraryPath()
    }
    return formSFquery
  }

  /**
  * Prepare module contracts for different entry paths
  * @method pathModules
  *
  */
  blindPath = function (beebeeIN, publicLib, fileInfo) {
    console.log('HQB====start build blind to contracts')
    // Reduce Genesis Module Contracts for question, data, compute, visualisation
    let ModulesMinrequired = ['question', 'data', 'compute', 'visualise']
    let minStartlist = []
    for (const mtype of ModulesMinrequired) {
      let match = this.modulesStart.data.filter(e => e.type === mtype)
      minStartlist.push(match[0])
    }
    // take the genesis and make new instances of the Module Contracts i.e. unique keys
    let tempModContracts = this.tempModuleContractsCreate(minStartlist)
    // extract data, compute and visualisation ref contracts
    let contractsPublic = this.splitMCfromRC(publicLib)
    // extract out observaation compute and charing ref contracts,  data more work required, need save data and then create new data packaging contract
    let extractedRefs = this.extractRefContractsPublicLib(contractsPublic.reference, fileInfo)
    console.log('ref contract matched')
    console.log(extractedRefs)
    // need to make refContract question and data packaging (for blind question input from beebee Done above)
    // next assume joined so provide finalised structure for SF-ECS
    let tempRefContsSF = this.prepareSafeFlowStucture(extractedRefs)
    return tempRefContsSF
  }

  /**
  * accept query, start conversation process
  * @method queryInputs
  *
  */
  queryInputs = async function (contractBoth) {
    console.log('HQB--Qinputs')
    let safeFlowquery = {}
    if (contractBoth.action === 'tempmodule') {
      console.log('tempmodule---PATH')
      // create new temp JOIN modules from network
      let prepareJoinStrucutre = this.joinStructurePrep(contractBoth.data)
      // make list of Module Contract in array
      let moduleList = []
      for (let mod of prepareJoinStrucutre) {
        moduleList.push(mod.key)
      }
      let ECSbundle = {}
      // npx contract UUID-temp  see structure at https://design.penpot.app/#/view/e8b3498a-41f9-8006-8001-7af986efdd68?page-id=279589f6-a428-8012-8001-fee517df51ef&section=interactions&index=0
      // array of expanded modules
      // structure NXP to send to HOP
      ECSbundle.exp = { key: '1bbeba0fe1723c75447e41a94126d654760537b6', value: {}}
      ECSbundle.exp.value.refcontract = "experiment"
      ECSbundle.exp.value.computational = {}
      ECSbundle.exp.value.concept = { state: 'joined' }
      ECSbundle.exp.value.modules = moduleList // ['a0b4dca6b4d141868f82b73fbabd23cbd880c588', '47a7292b0115fc1f35f3d3da6342ab19abbd14b4', '6b1847cbff292f5b85fbb02d7b52a1474e7c57b1', '123456789']
      ECSbundle.exp.value.space = { concept: 'mind' }
      // the modules expanded in an array
      ECSbundle.modules = prepareJoinStrucutre
      safeFlowquery.type = 'safeflow'
      safeFlowquery.reftype = 'ignore'
      safeFlowquery.action = 'networkexperiment'
      safeFlowquery.data = ECSbundle
    } else if (query.action === 'genesis') {
      console.log('HQB--geneiss start')
      let moduleGenesisList = []
      let moduleGenesisExpanded = []
      let newModCount = message.data.length
      for (let mh of message.data) {
        const moduleRefContract = this.liveComposer.moduleComposer(mh, '')
        // const moduleRefContractReady = JSON.stringify(moduleRefContract)
        const savedFeedback = await this.liveHolepunch.BeeData.savePubliclibrary(moduleRefContract)
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
        let genesisRefContract = this.liveComposer.experimentComposerGenesis(moduleGenesisList)
        // double check they are created
        const savedFeedback = await this.liveHolepunch.BeeData.savePubliclibrary(genesisRefContract)
        savedFeedback.expanded = moduleGenesisExpanded
      }
    } else if (contractBoth.action === 'update') {

    }
    return safeFlowquery
  }

  /**
  * adjust structure for library composer
  * @method joinStructurePrep
  *
  */
  joinStructurePrep = function (contracts) {
    let newModCount = 4
    let moduleJoinedExpanded = []
    let peerModules = {}
    for (let mh of contracts.modules) {
      // prepare new modules for this peer  ledger
      console.log('module Genesis')
      console.log(mh)
      if (mh.value.info.moduleinfo.name === 'question') {
        peerModules.type = 'question'
        peerModules.question = mh.value.info.question
      } else if (mh.value.info.moduleinfo.name === 'data') {
        console.log('datamatch')
        console.log(mh.value.info)
        peerModules.type = 'data'
        peerModules.data = mh.value.info
      } else if (mh.value.info.moduleinfo.name === 'compute') {
        peerModules.type = 'compute'
        peerModules.compute = mh.value.info.refcont
        peerModules.controls = mh.value.info.option // mh.data.options.compute
        peerModules.settings = mh.value.info.option // mh.data.options.visualise
        } else if (mh.value.info.moduleinfo.name === 'visualise') {
        peerModules.type = 'visualise'
        peerModules.visualise = mh.value.info.refcont
        peerModules.settings = mh.value.info.option // mh.data.options.visualise
      }
      let moduleRefContract = this.liveComposer.liveComposer.moduleComposer(peerModules, 'join')
      // key value structure
      let modFormat = {}
      modFormat.key = moduleRefContract.data.hash
      modFormat.value = moduleRefContract.data.contract
      moduleJoinedExpanded.push(modFormat)
      newModCount--
    }
    // check all modules are present and create peers network refcont joined
    if (newModCount === 0) {
      // aggregate all modules into exeriment contract
      // double check they are created
      let joinRefContract = this.liveComposer.liveComposer.experimentComposerJoin(moduleJoinedExpanded)
      console.log('temp holding NXP Module Contract')
      console.log(joinRefContract)
    }
    // manually create Module Contracts
    // question
    // ref contract
    /* let qRC = {}
    qRC.forum = ''
    qRC.text = 'Bitcoin 2017 price'
    let questionMC = {}
    questionMC.key = 'd0497a14581692e3e82c8f559e42e0a8231ca0e2'
    questionMC.value = {}
    questionMC.value.info = {}
    questionMC.value.info.question = qRC
    questionMC.value.info.type = 'question'
    questionMC.value.refcontract = 'module'
    questionMC.value.type = 'question'
    moduleJoinedExpanded.push(questionMC)
    // data packaging
    let dataMC = {}
    // ref contract to embedd
    let dRC = {}
    dRC.forum = ''
    dRC.text = ''
    dataMC.key = '82cd27bab9ac3ed4db3b7964a1f387ba0cb34a30'
    dataMC.value = {}
    dataMC.value.info = {}
    dataMC.value.info.data = dRC
    dataMC.value.info.type = 'data'
    dataMC.value.refcontract = 'module'
    dataMC.value.type = 'data'
    moduleJoinedExpanded.push(dataMC)
    // compute
    let comuputeMC = {}
    moduleJoinedExpanded.push(computeMC)
    // visualise
    let visMC = {}
    moduleJoinedExpanded.push(visMC) */
    return moduleJoinedExpanded
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

  /**
  * Module Contract Available to network
  * @method tempModuleContractsCreate
  *
  */
  tempModuleContractsCreate = function (gMods) { 
    // create new temp modules for new experiment
    let modCount = 1
    let moduleHolder = []
    for (const mc of gMods) {
      const prepareModule = this.liveComposer.liveComposer.moduleComposer(mc, '')
      let moduleContainer = {}
      moduleContainer.name = prepareModule.data.contract.concept.type
      moduleContainer.id = modCount
      moduleContainer.refcont = prepareModule.data.hash
      moduleHolder.push(moduleContainer)
      modCount++
    }
    return moduleHolder
  }

  /**
  * Module Contract Available to network
  * @method splitMCfromRC
  *
  */
  splitMCfromRC = function (publicLib) {
    // split into Module Contracts and Reference Contracts
    let modContracts = []
    let refContracts = []
    for (let pubLib of publicLib) {
      if (pubLib?.value.refcontract === 'module') {
        modContracts.push(pubLib)
      } else {
        refContracts.push(pubLib)
      }
    }
    let contractList = {}
    contractList.modules = modContracts
    contractList.reference = refContracts
    return contractList
  }

  /**
  * Build blind reference contracts
  * @method rextractRefContractsPublicLib
  *
  */
  extractRefContractsPublicLib = function (refContracts, fileName) {
    let refBuilds = []
    for (let rc of refContracts) {
      if (rc.value.refcontract === 'compute' && rc.value.computational.name === 'observation') {
        refBuilds.push(rc)
      } else if (rc.value.refcontract === 'visualise' && rc.value.computational.name === 'chart.js library') {
        refBuilds.push(rc)
      }
      /* else if (rc.value.refcontract === 'packaging') {
        console.log('reccc')
        console.log(rc)
        console.log(rc.value)
        refBuilds.push(rc)
      } */
    }
    // need to build a custom data packaging ref contract
    const newPackagingMap = {}
    newPackagingMap.name = fileName
    newPackagingMap.description = fileName
    newPackagingMap.primary = 'true'
    newPackagingMap.api = 'json'
    newPackagingMap.apibase = ''
    newPackagingMap.apipath = ''
    newPackagingMap.filename = fileName + '.json'
    newPackagingMap.sqlitetablename = ''
    newPackagingMap.tablestructure = []
    newPackagingMap.tidy = {}
    newPackagingMap.category = {}
    let deviceInfo = {}
    deviceInfo.id = ''
    deviceInfo.device_name = ''
    deviceInfo.device_manufacturer = ''
    deviceInfo.device_mac = ''
    deviceInfo.device_type = ''
    deviceInfo.device_model = '' 
    deviceInfo.query = ''
    deviceInfo.location_lat = 0
    deviceInfo.location_long = 0
    deviceInfo.firmware = ''
    deviceInfo.mobileapp = ''
    newPackagingMap.device = deviceInfo
    // need to match info to reference data types
    newPackagingMap.apicolumns = {}
    newPackagingMap.apicolHolder = {}
    let packagingRef = this.liveComposer.liveComposer.packagingRefLive.packagingPrepare(newPackagingMap)
    refBuilds.push(packagingRef.data)
    // need to create question as blind  done via module?
    let questionBlind = {}
    questionBlind.forum = ''
    questionBlind.text = fileName
    refBuilds.push(questionBlind)
    return refBuilds
  }


  /**
  * prepare blind query for SafeFlow
  * @method prepareSafeFlowStucture
  *
  */
  prepareSafeFlowStucture = function (refContracts) {
    console.log('start SF structure')
    console.log(refContracts)
    let tempRefConts = {}
      /*
    for (let refC of refContracts) {
      // console.log('refstrcuture qestion')
      // console.log(refC)
      if (refC.value.refcontract === 'compute') {
        // console.log('ref compute')
        // console.log(refC)
        tempRefConts.compute = refC
      } else if (refC.value.refcontract === 'visualise') {
        // console.log('ref vis')
        // console.log(refC)
        tempRefConts.visualise = refC
      } else if(refC.value.refcontract === 'question') {
        // console.log('question')
        // console.log(refC)
        tempRefConts.question = refC
      } else if(refC.value.refcontract === 'packaging') {
        // console.log('data')
        // console.log(refC)
        tempRefConts.data = refC
      }
    } */
    tempRefConts.question = {}
    tempRefConts.question.key = '123456789'
    tempRefConts.question.value = { forum: '', text: 'blind' }
    let holderData = {}
    holderData.modules = modContracts
    holderData.refcontracts = tempRefConts
    let MCandRC = {}
    MCandRC.action = 'tempmodule'
    MCandRC.data = holderData
    let tempMods = this.queryInputs(MCandRC)
    console.log('HQB--safeflow ready query')
    console.log(tempMods)
    console.log(tempMods.data.exp.value)
  }

}

export default HopQuerybuilder