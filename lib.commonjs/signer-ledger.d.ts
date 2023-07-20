import { AbstractSigner } from "ethers";
import type { Provider, TypedDataDomain, TypedDataField, TransactionRequest } from "ethers";
export declare class LedgerSigner extends AbstractSigner {
    #private;
    constructor(transport: any, provider?: null | Provider, path?: string | number);
    get path(): string;
    connect(provider?: null | Provider): LedgerSigner;
    getSigner(path?: string | number): LedgerSigner;
    getAddress(): Promise<string>;
    signTransaction(_tx: TransactionRequest): Promise<string>;
    signMessage(message: string | Uint8Array): Promise<string>;
    signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
    static getPath(path?: string | number): string;
}
