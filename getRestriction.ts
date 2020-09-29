import {Address, MosaicId, RepositoryFactoryHttp} from 'symbol-sdk';

/* start block 01 */
// replace with address
const rawAddress = 'TCHBDE-NCLKEB-ILBPWP-3JPB2X-NY64OE-7PYHHE-32I';
const address = Address.createFromRawAddress(rawAddress);
// replace with mosaic id
const mosaicIdHex = '634a8ac3fc2b65b3';
const mosaicId = new MosaicId(mosaicIdHex);
// replace with node endpoint
const nodeUrl = 'http://api-01.us-east-1.096x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const restrictionHttp = repositoryFactory.createRestrictionMosaicRepository();

restrictionHttp.getMosaicAddressRestriction(mosaicId, address)
    .subscribe((mosaicAddressRestrictions) => {
        if (mosaicAddressRestrictions.restrictions.size > 0) {
            mosaicAddressRestrictions.restrictions.forEach((value: string, key: string) => {
                console.log('\n', key, value);
            });
        } else {
            console.log('\n The address does not have mosaic address restrictions assigned.');
        }
    }, (err) => console.log(err));