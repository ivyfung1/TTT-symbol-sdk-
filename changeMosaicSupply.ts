import {
    Account,
   // AggregateTransaction,
    Deadline,
 //   MosaicDefinitionTransaction,
 //   MosaicFlags,
    MosaicId,
    MosaicSupplyChangeAction,
    MosaicSupplyChangeTransaction,
    NetworkType,
    RepositoryFactoryHttp,
    UInt64,
} from 'symbol-sdk';

// Network type
const networkType = NetworkType.TEST_NET;
// Creator account (RegalTheater) information
const privateKey = '3B860705880E2DF40F1577EBBF7A28926F5C0FF8D094722E6AB6582933866990'; 
const account = Account.createFromPrivateKey(privateKey, networkType);

// Mosaic ID and the amount to be changed 
const mosaic = '6F66185651DB4CD4';
const divisibility = 0;
const delta = 100;

// Defining mosaic initial supply
const mosaicSupplyChangeTransaction = MosaicSupplyChangeTransaction.create(
    Deadline.create(),
    new MosaicId(mosaic),
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(delta * Math.pow(10, divisibility)), // in absolute number
    networkType,
    UInt64.fromUint(2000000));

// Signing transaction
const networkGenerationHash = '6C1B92391CCB41C96478471C2634C111D9E989DECD66130C0430B5B8D20117CD';
const signedTransaction = account.sign(mosaicSupplyChangeTransaction, networkGenerationHash);
console.log('Payload:', signedTransaction.payload);
console.log('Transaction Hash:', signedTransaction.hash);

// Announcing transaction and and error tracking
const nodeUrl = 'http://api-01.ap-northeast-1.0.10.0.x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

transactionHttp
    .announce(signedTransaction)
    .subscribe((x) => console.log(x), (err) => console.error(err));

    
