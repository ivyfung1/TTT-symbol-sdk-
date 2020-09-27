import {filter, map, mergeMap} from 'rxjs/operators';
import { Account,
    Address, 
    AggregateTransaction,
    CosignatureSignedTransaction,
    CosignatureTransaction,
    NetworkType,
    RepositoryFactoryHttp,
    Transaction,
    TransactionGroup} from 'symbol-sdk';

// Network information
const networkType = NetworkType.TEST_NET;
const nodeUrl = 'http://xym66940.allnodes.me:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

// Cosginer info
const privateKey = '1B47C3B875D63225E16DC3429DE5D62F8EA76724D8B2C3FE5A14A8A2C82EE17E';
const account = Account.createFromPrivateKey(privateKey, networkType);

// Ready transaction for cosigning
const cosignAggregateBondedTransaction = (transaction: AggregateTransaction, account: Account): CosignatureSignedTransaction => {
    const cosignatureTransaction = CosignatureTransaction.create(transaction);
    return account.signCosignatureTransaction(cosignatureTransaction);
};

// replace with transaction hash to cosign
const transactionHash = '3F6A14B888C241341ED3B6DD063342871C2712098CB08058130E1629227FD17E';

const accountHttp = repositoryFactory.createAccountRepository();
        
transactionHttp
    .getTransaction(transactionHash, TransactionGroup.Partial)
    .pipe(
        map((transaction) => cosignAggregateBondedTransaction(transaction as AggregateTransaction, account)),
        mergeMap((cosignatureSignedTransaction) =>
            transactionHttp.announceAggregateBondedCosignature(cosignatureSignedTransaction)),
    )
    .subscribe((announcedTransaction) => console.log(announcedTransaction),
        (err) => console.error(err)); 