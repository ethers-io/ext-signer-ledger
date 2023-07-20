import {
    AbstractSigner, assertArgument, getAccountPath, getAddress
} from "ethers";

import _Eth from "@ledgerhq/hw-app-eth";
const Eth: any = ("default" in _Eth) ? _Eth.default: _Eth;

import type {
    Provider, TypedDataDomain, TypedDataField, TransactionRequest
} from "ethers";


export class LedgerSigner extends AbstractSigner {
    #transport: Promise<any>;
    #path: string;

    constructor(transport: any, provider?: null | Provider, path?: string | number) {
        assertArgument(transport && (typeof(transport) == "object" || typeof(transport) == "function"), "invalid transport", "transport", transport);
        super(provider);

        // Dereference package imports that use the default export
        if ("default" in transport) { transport = transport.default; }

        // If the transport has not been created, create it
        if (typeof(transport.create) == "function") {
            transport = transport.create();
        }

        this.#transport = Promise.resolve(transport);
        this.#path = LedgerSigner.getPath(path);
    }

    get path(): string { return this.#path; }

    connect(provider?: null | Provider): LedgerSigner {
        return new LedgerSigner(this.#transport, provider);
    }

    getSigner(path?: string | number): LedgerSigner {
        return new LedgerSigner(this.#transport, this.provider, path);
    }

    async getAddress(): Promise<string> {
        try {
            const transport = await this.#transport;
            const obj = await (new (Eth as any)(transport)).getAddress(this.#path);
            return getAddress(obj.address);
        } catch (error: any) {
            if (error.statusCode === 27404) {
                const e: any = new Error("device is not running Ethereum App");
                e.ledgerError = error;
                throw e;
            }
            throw error;
        }
    }

    async signTransaction(tx: TransactionRequest): Promise<string> {
        throw new Error("Not implemented");
    }

    async signMessage(message: string | Uint8Array): Promise<string> {
        throw new Error("Not implemented");
    }

    async signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
        throw new Error("Not implemented");
    }

    static getPath(path?: string | number): string {
        if (path == null) { path = 0; }
        if (typeof(path) === "number") { return getAccountPath(path); }
        return path;
    }
}
