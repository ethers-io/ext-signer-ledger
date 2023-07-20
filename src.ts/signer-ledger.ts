import {
    AbstractSigner, assertArgument, copyRequest, getAccountPath,
    getAddress, resolveAddress, resolveProperties, Transaction
} from "ethers";

//import { ledgerService } from "@ledgerhq/hw-app-eth"

import _Eth from "@ledgerhq/hw-app-eth";
const Eth: any = ("default" in _Eth) ? _Eth.default: _Eth;

import type {
    Provider, TypedDataDomain, TypedDataField, TransactionRequest,
    TransactionLike
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

    async signTransaction(_tx: TransactionRequest): Promise<string> {
        try {

            // Replace any Addressable or ENS name with an address
            _tx = copyRequest(_tx);
            const { to, from } = await resolveProperties({
                to: (_tx.to ? resolveAddress(_tx.to, this.provider): undefined),
                from: (_tx.from ? resolveAddress(_tx.from, this.provider): undefined)
            });

            if (to != null) { _tx.to = to; }
            if (from != null) { _tx.from = from; }

            const transport = await this.#transport;

            const tx = Transaction.from(<TransactionLike<string>>_tx);
            const rawTx = tx.unsignedSerialized.substring(2);

            //const resolution = await ledgerService.resolveTransaction(rawTx);
            const resolution = {
                domains: [ ],
                plugin: [ ],
                externalPlugin: [ ],
                nfts: [ ],
                erc20Tokens: [ ]
            };
            const obj = await (new (Eth as any)(transport)).signTransaction(this.#path, rawTx, resolution);
            console.log("OBJ", obj)
            tx.signature = {
              v: `0x${ obj.v }`,
              r: `0x${ obj.r }`,
              s: `0x${ obj.s }`,
            };
            return tx.serialized;
        } catch (error: any) {
            throw error;
        }
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
