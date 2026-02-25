import { describe, it, expect, beforeEach, vi } from 'vitest'
import HopQuerybuilder from '../src/index.js'

describe('HopQuerybuilder ECS/Pipeline Tests', () => {
  let hqb

  beforeEach(() => {
    hqb = new HopQuerybuilder()
  })

  describe('Blind Query Path', () => {
    it('should create a SafeFlow-ECS query with 24h segmentation', () => {
      const computeIN = { action: 'blind', compute: 'linear-regression' }
      const publicLib = [
        { key: 'rc1', value: { refcontract: 'compute', computational: { name: 'linear-regression' } } },
        { key: 'rc2', value: { refcontract: 'visualise' } }
      ]
      const fileInfo = 'test-data'

      // Mocking internal methods that rely on LibComposer for simplicity in this draft
      hqb.tempModuleContractsCreate = vi.fn().mockReturnValue([
        { name: 'question', refcont: 'q1' },
        { name: 'packaging', refcont: 'p1' },
        { name: 'compute', refcont: 'c1' },
        { name: 'visualise', refcont: 'v1' }
      ])
      
      hqb.libComposer.liveComposer.experimentComposerJoin = vi.fn().mockReturnValue({
        data: { hash: 'exp-hash', contract: {} }
      })

      hqb.libComposer.liveComposer.moduleComposer = vi.fn((input) => ({
        data: { hash: `hash-${input.style}`, contract: input }
      }))

      hqb.libComposer.liveComposer.packagingRefLive.packagingBlindPrepare = vi.fn().mockReturnValue({})
      hqb.libComposer.liveComposer.cryptoLive.evidenceProof = vi.fn().mockReturnValue('dt-hash')

      const result = hqb.blindPath(computeIN, publicLib, fileInfo)

      expect(result.type).toBe('safeflow')
      expect(result.ecs).toBe(true)
      
      // Check for 24h segmentation in compute module
      const computeMod = result.modules.find(m => m.value.style === 'compute')
      expect(computeMod.value.info.controls.segmentation).toBe('24h')
      expect(computeMod.value.info.settings.timeperiod).toBe('24h')
      
      // Check for ECS Component mapping
      expect(computeMod.value.component).toBe('ComputeContractComponent')
      const packagingMod = result.modules.find(m => m.value.style === 'packaging')
      expect(packagingMod.value.component).toBe('DataRequestComponent')
    })
  })

  describe('Normal HOPquery (queryInputs)', () => {
    it('should prepare join structure for network experiments', async () => {
      const contractBoth = {
        action: 'tempmodule',
        data: {
          modules: [
            { value: { info: { moduleinfo: { name: 'question' }, question: { text: 'test' } } } },
            { value: { info: { moduleinfo: { name: 'packaging' } } } },
            { value: { info: { moduleinfo: { name: 'compute' }, refcont: 'rc', option: {} } } },
            { value: { info: { moduleinfo: { name: 'visualise' }, refcont: 'rv', option: {} } } }
          ]
        }
      }

      hqb.libComposer.liveComposer.moduleComposer = vi.fn().mockReturnValue({
        data: { hash: 'mod-hash', contract: {} }
      })

      const result = await hqb.queryInputs(contractBoth)

      expect(result.type).toBe('safeflow')
      expect(result.action).toBe('networkexperiment')
      expect(result.data.modules).toHaveLength(4)
    })
  })
})
