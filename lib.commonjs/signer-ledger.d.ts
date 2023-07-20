import { AbstractSigner } from "ethers";
import type { Provider, TypedDataDomain, TypedDataField, TransactionRequest } from "ethers";
/**
 *  A **LedgerSigner** provides access to a Ledger Hardware Wallet
 *  as an Ethers Signer.
 */
export declare class LedgerSigner extends AbstractSigner {
    #private;
    /**
     *  Create a new **LedgerSigner** connected to the device over the
     *  %%transport%% and optionally connected to the blockchain via
     *  %%provider%%. The %%path%% follows the same logic as
     *  [[LedgerSigner_getPath]], defaulting to the default HD path of
     *  ``m/44'/60'/0'/0/0``.
     */
    constructor(transport: any, provider?: null | Provider, path?: string | number);
    /**
     *  The HD path for this account
     */
    get path(): string;
    connect(provider?: null | Provider): LedgerSigner;
    /**
     *  Returns a new LedgerSigner connected via the same transport
     *  and provider, but using the account at the HD %%path%%.
     */
    getSigner(path?: string | number): LedgerSigner;
    getAddress(): Promise<string>;
    signTransaction(_tx: TransactionRequest): Promise<string>;
    signMessage(message: string | Uint8Array): Promise<string>;
    signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
    /**
     *  Returns the HD %%path%%. If unspecified, returns the default
     *  path (i.e. ``m/44'/60'/0'/0/0``), if a ``number``, the path
     *  is for that account using the BIP-44 standard, otherwise %%path%%
     *  is returned directly.
     */
    static getPath(path?: string | number): string;
}
