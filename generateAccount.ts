import {Account, NetworkType} from 'symbol-sdk';


/* start block 01 */
const account = Account.generateNewAccount(NetworkType.TEST_NET);
console.log('Your new account address is:', account.address.pretty(),
   'and its private key', account.privateKey);
/* end block 01 */

