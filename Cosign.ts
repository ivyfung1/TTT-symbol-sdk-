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
const nodeUrl = 'http://api-01.ap-northeast-1.0.10.0.x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

// Cosginer (user) info
const privateKey = 'CCB2C677FE921BBBFB60EA60E270A2B6592B72C848F55F8885C39B95E97E00A6';
const account = Account.createFromPrivateKey(privateKey, networkType);

// Ready transaction for cosigning
const cosignAggregateBondedTransaction = (transaction: AggregateTransaction, account: Account): CosignatureSignedTransaction => {
    const cosignatureTransaction = CosignatureTransaction.create(transaction);
    return account.signCosignatureTransaction(cosignatureTransaction);
};

// replace with transaction hash to cosign
const transactionHash = '3183CA7CF5AE80C21AE1D565C13D663B728C09EF0A48F11F16D573403B2A9845';

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