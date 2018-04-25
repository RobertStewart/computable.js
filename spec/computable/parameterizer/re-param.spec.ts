import * as ganache from 'ganache-cli'
import Web3 from 'web3'
// symlink? copy types to @types? TODO
import { Contract } from '../../../node_modules/web3/types.d'
import pJson from '../../../computable/build/contracts/Parameterizer.json'
import tJson from '../../../computable/build/contracts/EIP20.json'
import { getDefaults } from './helpers'
import { Addresses, Token } from '../../../src/constants'

// TODO use the web3 IProvider?
const provider:any = ganache.provider(),
  web3 = new Web3(provider)

let accounts:string[],
  eip20:Contract,
  parameterizer:Contract

describe('Parameterizer', () => {
  beforeEach(async () => {
    accounts = await web3.eth.getAccounts()

    eip20 = await new web3.eth.Contract(tJson.abi, undefined, { gasPrice: 100, gas: 4500000 })
      .deploy({ data: tJson.bytecode, arguments: [
        Token.supply,
        Token.name,
        Token.decimals,
        Token.symbol
      ]})
      .send({ from: accounts[0], gasPrice: 100, gas: 4500000 }) // NOTE watch the gas limit here

    eip20.setProvider(provider)
    const tokenAddress = eip20.options.address

    parameterizer = await new web3.eth.Contract(pJson.abi)
      .deploy({ data: pJson.bytecode, arguments: [
        tokenAddress,
        Addresses.Three, // TODO use deployed voting contract
        ...getDefaults()
      ]})
      .send({ from: accounts[0], gasPrice: 100, gas: 4500000 })

    parameterizer.setProvider(provider)
  })

  // describe('Expected failures', () => {
    // it('throws if called by non-owner', async () => {
      // try {
        // await validator.methods.addVote('foo').send({
          // from: accounts[1],
        // })

        // // this should never be run as we should throw above
        // expect(false).toBe(true)

      // } catch(e) {
        // expect(e).toBeTruthy()
      // }
    // })
  // })

  it('returns falsy for non-existant proposal', async () => {
    // const pid = await parameterizer.methods.proposeReparameterization('voteQuorum', 51).send({ from: accounts[0], gasPrice: 100, gas: 4500000 })
    const res = await parameterizer.methods.propExists(web3.utils.asciiToHex('foo')).call()
    expect(res).toBe(false)
  })
})
