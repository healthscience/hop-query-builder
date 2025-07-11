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
import util from 'util'

class HopQuerybuilder extends EventEmitter {

  constructor() {
    super()
    this.libComposer = new LibComposer()
    this.modulesStart = this.modulesGenesis()
  }

  /**
  * Prepare module contracts for different entry paths
  * @method queryPath
  *
  */
  queryPath = function (beebeeIN, publicLib, fileInfo) {
    let formSFquery = {}
    if (beebeeIN.action === 'blind') {
      formSFquery = this.blindPath(beebeeIN, publicLib, fileInfo)
    } else if (beebeeIN.action === 'library') {
      formSFquery = this.libraryPath()
    } else if (beebeeIN.action === 'future') {
      formSFquery = this.futurePath(beebeeIN, publicLib, fileInfo)
    }
    return formSFquery
  }

  /**
  * Prepare module contracts for different entry paths
  * @method blindPath
  *
  */
  blindPath = function (beebeeIN, publicLib, fileInfo) {
    // console.log(util.inspect(beebeeIN, {showHidden: false, depth: null}))
    let minStartlist = this.minModulesetup()
    // take the genesis and make new instances of the Module Contracts i.e. unique keys
    let tempModContracts = this.tempModuleContractsCreate(minStartlist, fileInfo)
    // extract data, compute and visualisation ref contracts
    let contractsPublic = this.splitMCfromRC(publicLib)
    // extract out observaation compute and charting ref contracts,  data more work required, need save data and then create new data packaging contract
    let extractedRefs = this.extractRefContractsPublicLib(beebeeIN.data.data.input.data, contractsPublic.reference, fileInfo)
    // need to make refContract question and data packaging (for blind question input from beebee Done above)
    // next assume joined so provide finalised structure for SF-ECS
    let tempRefContsSF = this.prepareSafeFlowStucture(tempModContracts, extractedRefs, fileInfo, beebeeIN)
    return tempRefContsSF
  }

  /**
  * library query builder
  * @method libraryPath
  *
  */
  libraryPath = function (path, action, data) {
    let libraryData = {}
    libraryData.data = 'contracts'
    libraryData.type = 'peerprivate'
    const segmentedRefContracts = this.libComposer.liveRefcontUtility.refcontractSperate(data)
    libraryData.referenceContracts = segmentedRefContracts
    // need to split for genesis and peer joined NXPs
    const nxpSplit = this.libComposer.liveRefcontUtility.experimentSplit(segmentedRefContracts.experiment)
    libraryData.splitExperiments = nxpSplit
    // look up modules for this experiments
    libraryData.networkExpModules = this.libComposer.liveRefcontUtility.expMatchModuleGenesis(libraryData.referenceContracts.module, nxpSplit.genesis)
    libraryData.networkPeerExpModules = this.libComposer.liveRefcontUtility.expMatchModuleJoined(libraryData.referenceContracts.module, nxpSplit.joined)
    return libraryData
  }

  /**
  * future model prediction query
  * @method futurePath
  *
  */
  futurePath = function (beebeeIN, publicLib, fileInfo) {
    // prepare SafeFlow  future query i.e. update type with compute contract updated
    let futureQuery = {}
    // need to replace past compute reference contract with the future linear regression ref. contract.
    let nxpKey = Object.keys(beebeeIN.data)
    // extract the compute contract and make prediction model e.g. linear regression
    let computeContract = {}
    for (let mod of beebeeIN.data[nxpKey[0]].modules) {
      if (mod.value.style === 'compute') {
        computeContract = mod
      }
    }
    let computeRefFuture = computeContract
    //  let refContractfuture = computeContract.value.info.compute[0].value
    let refCdetails = {}
    refCdetails.name = 'linear-regression',
    refCdetails.description = 'statistical prediction model',
    refCdetails.primary = 'yes',
    refCdetails.dtprefix = 'f-f491adb5f30b32f078d8dbc235b0e849265cca',
    refCdetails.code = 'simple-statistics',
    refCdetails.hash = 'gh-12121212112'
    computeRefFuture.value.info.compute[0].value.computational = refCdetails
    // update time range for future
    let futureDate = new Date()
    // Add five days to current date
    futureDate.setDate(futureDate.getDate() + 30)
    futureDate = futureDate.getTime()
    let controls = {  xaxis: '', yaxis: [ 'blind1234555554321' ], date: computeRefFuture.value.info.controls.date, rangedate: [ computeRefFuture.value.info.controls.date ], sourceTime: [ futureDate ] }
    computeRefFuture.value.info.controls = controls
    // prepare new compute reference contract
    computeRefFuture.key = '2233344455566'
    // computeRefFuture.value = computeRefFuture
    // replace past compute contract with future
    let updatedModules = []
    for (let mod of beebeeIN.data[nxpKey[0]].modules) {
      if (mod.value.type === 'compute') {
        updatedModules.push(computeRefFuture)
      } else {
        updatedModules.push(mod)
      }
    }
    let updateSF = {}
    updateSF.input = 'future'
    updateSF.exp = { key: nxpKey[0], value: {} }
    updateSF.entityUUID = beebeeIN.data[nxpKey[0]].shellID
    updateSF.modules = updatedModules
    updateSF.update = 'predict-future'
    futureQuery.exp = { key: nxpKey[0], value: {} }
    futureQuery.update = updateSF
    // futureQuery.modules = beebeeIN.data[nxpKey[0]].modules
    return futureQuery
  }

  /**
  * four min modules required to start NXP with
  * @method minModulesetup
  *
  */
  minModulesetup = function (beebeeIN, publicLib, fileInfo) {
    let ModulesMinrequired = ['question', 'packaging', 'compute', 'visualise']
    let minStartlist = []
    for (const mtype of ModulesMinrequired) {
      let match = this.modulesStart.data.filter(e => e.style === mtype)
      minStartlist.push(match[0])
    }
    return minStartlist
  }

  /**
  * accept query, start conversation process
  * @method queryInputs
  *
  */
  queryInputs = async function (contractBoth) {
    let safeFlowquery = {}
    if (contractBoth.action === 'tempmodule') {
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
      ECSbundle.exp.value.modules = moduleList
      ECSbundle.exp.value.space = { concept: 'mind' }
      // the modules expanded in an array
      ECSbundle.modules = prepareJoinStrucutre
      safeFlowquery.type = 'safeflow'
      safeFlowquery.reftype = 'ignore'
      safeFlowquery.action = 'networkexperiment'
      safeFlowquery.data = ECSbundle
    } else if (query.action === 'genesis') {
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
        let genesisRefContract = this.libComposer.experimentComposerGenesis(moduleGenesisList)
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
      if (mh.value.info.moduleinfo.name === 'question') {
        peerModules.question = mh.value.info.question
      } else if (mh.value.info.moduleinfo.name === 'packaging') {
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
      let moduleRefContract = this.libComposer.liveComposer.moduleComposer(peerModules, 'join')
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
      let joinRefContract = this.libComposer.liveComposer.experimentComposerJoin(moduleJoinedExpanded)
    }
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
    dataCNRLbundle.style = 'question'
    dataCNRLbundle.primary = 'genesis'
    dataCNRLbundle.description = 'Question for network experiment'
    dataCNRLbundle.concept = ''
    dataCNRLbundle.grid = []
    moduleContracts.push(dataCNRLbundle)
    // CNRL implementation contract e.g. from mobile phone sqlite table structure
    const dataCNRLbundle2 = {}
    dataCNRLbundle2.reftype = 'module'
    dataCNRLbundle2.style = 'packaging'
    dataCNRLbundle2.primary = 'genesis'
    dataCNRLbundle2.description = 'data source(s) for network experiment'
    dataCNRLbundle2.grid = []
    moduleContracts.push(dataCNRLbundle2)
    // CNRL implementation contract e.g. from mobile phone sqlite table structure
    /* const dataCNRLbundle3 = {}
    dataCNRLbundle3.reftype = 'module'
    dataCNRLbundle3.style = 'device'
    dataCNRLbundle3.primary = 'genesis'
    dataCNRLbundle3.concept = ''
    dataCNRLbundle3.grid = []
    moduleContracts.push(dataCNRLbundle3) */
    // CNRL implementation contract e.g. from mobile phone sqlite table structure
    /* const dataCNRLbundle4 = {}
    dataCNRLbundle4.reftype = 'module'
    dataCNRLbundle4.style = 'mobile'
    dataCNRLbundle4.primary = 'genesis'
    dataCNRLbundle4.concept = ''
    dataCNRLbundle4.grid = []
    moduleContracts.push(dataCNRLbundle4) */
    // module ref contract utility type
    const dataCNRLbundle6 = {}
    dataCNRLbundle6.reftype = 'module'
    dataCNRLbundle6.style = 'compute'
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
    dataCNRLbundle5.style = 'visualise'
    dataCNRLbundle5.primary = 'genesis'
    dataCNRLbundle5.grid = []
    moduleContracts.push(dataCNRLbundle5)
    // CNRL implementation contract e.g. from mobile phone sqlite table structure
    const dataCNRLbundle7 = {}
    dataCNRLbundle7.reftype = 'module'
    dataCNRLbundle7.style = 'education'
    dataCNRLbundle7.primary = 'genesis'
    dataCNRLbundle7.concept = ''
    dataCNRLbundle7.grid = []
    moduleContracts.push(dataCNRLbundle7)
    /* const dataCNRLbundle8 = {}
    dataCNRLbundle8.reftype = 'module'
    dataCNRLbundle8.style = 'lifestyle'
    dataCNRLbundle8.primary = 'genesis'
    dataCNRLbundle8.concet = ''
    dataCNRLbundle8.grid = []
    moduleContracts.push(dataCNRLbundle8) */
    /* const dataCNRLbundle9 = {}
    dataCNRLbundle9.reftype = 'module'
    dataCNRLbundle9.style = 'error'
    dataCNRLbundle9.primary = 'genesis'
    dataCNRLbundle9.concept = ''
    dataCNRLbundle9.grid = []
    moduleContracts.push(dataCNRLbundle9) */
    /* const dataCNRLbundle10 = {}
    dataCNRLbundle10.reftype = 'module'
    dataCNRLbundle10.style = 'control'
    dataCNRLbundle10.primary = 'genesis'
    dataCNRLbundle10.concept = ''
    dataCNRLbundle10.grid = []
    moduleContracts.push(dataCNRLbundle10) */
    const dataCNRLbundle11 = {}
    dataCNRLbundle11.reftype = 'module'
    dataCNRLbundle11.style = 'prescription'
    dataCNRLbundle11.primary = 'genesis'
    dataCNRLbundle11.concept = ''
    dataCNRLbundle11.grid = []
    moduleContracts.push(dataCNRLbundle11)
    /* const dataCNRLbundle12 = {}
    dataCNRLbundle12.reftype = 'module'
    dataCNRLbundle12.style = 'communication'
    dataCNRLbundle12.primary = 'genesis'
    dataCNRLbundle12.concept = ''
    dataCNRLbundle12.grid = []
    moduleContracts.push(dataCNRLbundle12) */
    // CNRL implementation contract e.g. from mobile phone sqlite table structure
    /* const dataCNRLbundle13 = {}
    dataCNRLbundle13.reftype = 'module'
    dataCNRLbundle13.style = 'idea'
    dataCNRLbundle13.primary = 'genesis'
    dataCNRLbundle13.concept = ''
    dataCNRLbundle13.grid = []
    moduleContracts.push(dataCNRLbundle13) */
    const dataCNRLbundle14 = {}
    dataCNRLbundle14.reftype = 'module'
    dataCNRLbundle14.style = 'rhino'
    dataCNRLbundle14.primary = 'genesis'
    dataCNRLbundle14.concept = ''
    dataCNRLbundle14.grid = []
    moduleContracts.push(dataCNRLbundle14)
    const dataCNRLbundle15 = {}
    dataCNRLbundle15.reftype = 'module'
    dataCNRLbundle15.style = 'pricing'
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
  tempModuleContractsCreate = function (gMods, file) {

    // create new temp modules for new experiment
    let modCount = 1
    let moduleHolder = []
    for (const mc of gMods) {
      // make question unique
      if (mc.style === 'question') {
        mc.description = mc.description + file
      }
      mc.value = mc.style
      const prepareModule = this.libComposer.liveComposer.moduleComposer(mc, '')
      let moduleContainer = {}
      moduleContainer.name = prepareModule.data.contract.style
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
      if (pubLib?.value?.refcontract === 'module') {
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
  * @method extractRefContractsPublicLib
  *
  */
  extractRefContractsPublicLib = function (computeContext, refContracts, fileName) {
    let refBuilds = []
    for (let rc of refContracts) {
      if (rc?.value?.refcontract === 'compute' && rc?.value?.computational.name === computeContext.compute) {
        refBuilds.push(rc)
      } else if (rc?.value?.refcontract === 'visualise' || rc?.value?.computational?.name === 'chart.js library') {
        refBuilds.push(rc)
      }
    }
    // need to build a custom data packaging ref contract
    const newPackagingMap = {}
    newPackagingMap.name = fileName
    newPackagingMap.description = fileName
    newPackagingMap.primary = 'true'
    newPackagingMap.api = 'json'
    newPackagingMap.path = 'json'
    newPackagingMap.apibase = ''
    newPackagingMap.apipath = ''
    newPackagingMap.filename = fileName + '.json'
    newPackagingMap.sqlitetablename = ''
    newPackagingMap.tablestructure = []
    newPackagingMap.tidy = {}
    newPackagingMap.category = {}
    newPackagingMap.devicesList = ''
    newPackagingMap.deviceColumns = ''
    newPackagingMap.devicequery = ''
    newPackagingMap.firmwarequery = ''
    newPackagingMap.deviceColumnID = ''
    // device peer input
    let deviceInfo = {}
    deviceInfo.id = fileName
    deviceInfo.device_name = fileName
    deviceInfo.device_manufacturer = ''
    deviceInfo.device_mac = fileName
    deviceInfo.device_type = 'blind'
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
    let packagingRef = this.libComposer.liveComposer.packagingRefLive.packagingBlindPrepare(newPackagingMap)
    const dtHASH = this.libComposer.liveComposer.cryptoLive.evidenceProof(packagingRef)
    let contractData = {}
    contractData.key = dtHASH
    contractData.value = packagingRef
    refBuilds.push(contractData)
    // need to create question as blind  done via module?
    let questionBlind = {}
    questionBlind.forum = ''
    questionBlind.text = fileName
    return refBuilds
  }

  /**
  * prepare blind query for SafeFlow
  * @method prepareSafeFlowStucture
  *
  */
  prepareSafeFlowStucture = function (moduleContracts, refContracts, fileInfo, LLMdata) {
     // console.log(util.inspect(refContracts, {showHidden: false, depth: null}))
    let safeFlowQuery = {}
    let modContracts = []
    let modKeys = []
    for (let mc of moduleContracts) {
      modKeys.push(mc.refcont)
    }
    // which settings from LLM?
    let visStyle = 'line' //LLMdata.data.data.visstyle[0].vis
    // form a joined contract, pass in module key only
    let formExpmoduleContract = this.libComposer.liveComposer.experimentComposerJoin(modKeys)
    safeFlowQuery.exp = {}
    safeFlowQuery.exp.key = formExpmoduleContract.data.hash
    safeFlowQuery.exp.value = formExpmoduleContract.data.contract
    // this needs to be save in Holepunch to update structure to keys
    // next need to add reference Contracts to Module Contracts in correct format
    let joinStructureMC = {}
    joinStructureMC.key = ''
    joinStructureMC.value = {info: {}, refcontract: 'module', style: 'packaging'}
    // info structure
    // let info = {}
    // e.g. info.data = { key  value }  change data for name of contracts (is this good decision???)
    // info.type = 'data
    // need to form joined modle contract with expaneded to include reference contract
    // structure needs to be modIn.type  modIn.data = temMC with refcontract embedded
    for (let tmc of moduleContracts) {
      let inputStructure = {}
      if(tmc.name === 'question') {
        inputStructure.style = 'question'
        let dataMCRC = {}
        dataMCRC.question = { forum: '', text: fileInfo }
        inputStructure.value = {}
        inputStructure.value.style = 'question'
        inputStructure.value.info = dataMCRC
       } else if(tmc.name === 'packaging') {
          let dataMCRC = {}
          let extractRC = refContracts.filter(e => e.value.refcontract === 'packaging')
          dataMCRC = extractRC[0] // data packaging contract
          inputStructure.style = 'packaging'
          inputStructure.value = {}
          inputStructure.value.style = 'packaging'
          inputStructure.value.info = dataMCRC
      } else if (tmc.name === 'compute') {
        let dataMCRC = {};
        let extractRC = refContracts.filter(e => 
          e.value.refcontract === 'compute' && 
          e.value.computational?.name ===  LLMdata.data.data.input.data.compute
        )
        // Create compute contract structure with type
        dataMCRC.computational = extractRC[0].value.computational
        dataMCRC.compute = 
          {
            key: extractRC[0].key,
            value: {
              refcontract: 'compute',
              concept: extractRC[0].value.concept,
              computational: {
                name: extractRC[0].value.computational.name,
                type: extractRC[0].value.computational.type,
                description: extractRC[0].value.computational.description,
                code: extractRC[0].value.computational.code,
                hash: extractRC[0].value.computational.hash,
                mode: extractRC[0].value.computational.mode
              }
            }
          }
        // Add settings and controls
        let currentQtime = new Date();
        const blindDate = currentQtime.getTime();
        dataMCRC.controls = {
          xaxis: '',
          yaxis: ['blind1234555554321'],
          date: blindDate,
          rangedate: [blindDate],
          category: ['none'],
          tidy: true
        };
        dataMCRC.settings = {
          devices: [],
          data: null,
          compute: '',
          visualise: visStyle,
          category: ['none'],
          timeperiod: '',
          xaxis: '',
          yaxis: ['blind1234555554321'],
          resolution: '',
          setTimeFormat: ''
        };
        
        inputStructure.style = 'compute';
        inputStructure.value = {};
        inputStructure.value.style = 'compute';
        inputStructure.value.info = dataMCRC;
      } else if (tmc.name === 'visualise') {
        let dataMCRC = {}
        let extractRC = refContracts.filter(e => e.value.refcontract === 'visualise')
        dataMCRC.visualise = extractRC[0] // vis ref contract
        // add default settings
        let settings = {
          devices: [],
          data: null,
          compute: '',
          visualise: visStyle,
          category: ['none'],
          timeperiod: '',
          xaxis: '',
          yaxis: ['blind1234555554321'],
          resolution: '',
          setTimeFormat: '',
          single: true,
          multidata: false
        }
        dataMCRC.settings = settings
        inputStructure.style = 'visualise'
        inputStructure.value = {}
        inputStructure.value.style = 'visualise'
        inputStructure.value.info = dataMCRC
      }
      const prepareModule = this.libComposer.liveComposer.moduleComposer(inputStructure, 'join')
      // need to format key value from hash and contract format
      let keyStructure = {}
      keyStructure.key = prepareModule.data.hash
      keyStructure.value = prepareModule.data.contract
      modContracts.push(keyStructure)
    }
    for (let modC of modContracts) {
      modKeys.push(modC.key)
    }
    // console.log(util.inspect(modContracts, {showHidden: false, depth: null}))
    // SafeFow Structure
    safeFlowQuery.modules = modContracts
    safeFlowQuery.reftype = 'ignore'
    safeFlowQuery.type = 'safeflow'
    return safeFlowQuery
  }

}

export default HopQuerybuilder