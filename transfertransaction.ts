import {
    Account,
    Address,
    Deadline,
    NetworkType,
    PlainMessage,
    RepositoryFactoryHttp,
    TransferTransaction,
    UInt64,
} from 'symbol-sdk';

// Recipient address (news)
const rawAddress = 'TC43VW-NY734J-TNQARX-K63VBB-C4FYSA-KG425W-CKI'; //public key: 180FABD5EC7C35910DFB617388401382EDA114AA4B47C5436E83913961D9413E private key: EF7DD84B0F54E972EFFE91E7255DE19CB57A20E1DABC818F9D67A3087E545CC6
const recipientAddress = Address.createFromRawAddress(rawAddress);
// Network type
const networkType = NetworkType.TEST_NET;

const transferTransaction = TransferTransaction.create(
    Deadline.create(),
    recipientAddress,
    [],
    PlainMessage.create('This is a plain message.'),
    networkType,
    UInt64.fromUint(2000000));

// Sender (user) private key
const privateKey = 'CCB2C677FE921BBBFB60EA60E270A2B6592B72C848F55F8885C39B95E97E00A6'; // Address: TBHHBY-LLQYJM-OMUXXD-VSMJJS-YMXP5B-SOREDR-XOY  Public Key: 58EA0EC771E4D32A6C47677B0A63FAD2D01430549D3B7790D9C8E3203DC47BC1
const account = Account.createFromPrivateKey(privateKey, networkType);

// Signing transaction
const networkGenerationHash = '6C1B92391CCB41C96478471C2634C111D9E989DECD66130C0430B5B8D20117CD';
const signedTransaction = account.sign(transferTransaction, networkGenerationHash);
console.log('Payload:', signedTransaction.payload);
console.log('Transaction Hash:', signedTransaction.hash);

// Announcing transaction and and error tracking
const nodeUrl = 'http://api-01.ap-northeast-1.0.10.0.x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

transactionHttp
    .announce(signedTransaction)
    .subscribe((x) => console.log(x), (err) => console.error(err));

// (abc) address: TDSGG4-NJQPET-367KVE-6ZTYE7-TSCZ7P-TE7ORV-4WQ public key: 2E89DF99AB5AAE5E9F56B86F49C8C7DE80E97A5B494CFFD1BF7E46E2D5DED5CF, private key: 14523D4ACB53FB9C108C196593C0730C852EC9A3CE4D4E292485B61ED1A860CF

// (abc2) private key 0E1F0B56CBDCB4EB456D39C769A156C5BABCB9030CF47827A60BEB78A692228A public key PublicAccount {
//  publicKey: '60FAE3A39D580BB5118686569D159E3F2B991504D3ED0A304C3B7DA5FCCD0353',
//  address: Address {
//    address: 'TCDRGMQZGGY6IYHGFTYBCHXS75XXJJ6MUNVOYNI',

// (extra) TAFSKK-4EBA4A-GEBOLM-A5CLJJ-O7SJHS-ZB5SVF-HLI  private key: 256CBF3BBD62E8991BE84ED1F58012239B5B9BEF2E36FCEC18323F3838DCA67A
