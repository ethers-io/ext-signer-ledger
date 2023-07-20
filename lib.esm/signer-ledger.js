import { AbstractSigner, assertArgument, copyRequest, getAccountPath, getAddress, hexlify, resolveAddress, resolveProperties, Signature, Transaction, toUtf8Bytes } from "ethers";
//import { ledgerService } from "@ledgerhq/hw-app-eth"
import _Eth from "@ledgerhq/hw-app-eth";
const Eth = ("default" in _Eth) ? _Eth.default : _Eth;
export class LedgerSigner extends AbstractSigner {
    #transport;
    #path;
    constructor(transport, provider, path) {
        assertArgument(transport && (typeof (transport) == "object" || typeof (transport) == "function"), "invalid transport", "transport", transport);
        super(provider);
        // Dereference package imports that use the default export
        if ("default" in transport) {
            transport = transport.default;
        }
        // If the transport has not been created, create it
        if (typeof (transport.create) == "function") {
            transport = transport.create();
        }
        this.#transport = Promise.resolve(transport);
        this.#path = LedgerSigner.getPath(path);
    }
    get path() { return this.#path; }
    connect(provider) {
        return new LedgerSigner(this.#transport, provider);
    }
    getSigner(path) {
        return new LedgerSigner(this.#transport, this.provider, path);
    }
    async getAddress() {
        try {
            const transport = await this.#transport;
            const obj = await (new Eth(transport)).getAddress(this.#path);
            return getAddress(obj.address);
        }
        catch (error) {
            if (error.statusCode === 27404) {
                const e = new Error("device is not running Ethereum App");
                e.ledgerError = error;
                throw e;
            }
            throw error;
        }
    }
    async signTransaction(_tx) {
        try {
            // Replace any Addressable or ENS name with an address
            _tx = copyRequest(_tx);
            const { to, from } = await resolveProperties({
                to: (_tx.to ? resolveAddress(_tx.to, this.provider) : undefined),
                from: (_tx.from ? resolveAddress(_tx.from, this.provider) : undefined)
            });
            if (to != null) {
                _tx.to = to;
            }
            if (from != null) {
                _tx.from = from;
            }
            const tx = Transaction.from(_tx);
            const rawTx = tx.unsignedSerialized.substring(2);
            //const resolution = await ledgerService.resolveTransaction(rawTx);
            const resolution = {
                domains: [],
                plugin: [],
                externalPlugin: [],
                nfts: [],
                erc20Tokens: []
            };
            // Ask the Ledger to sign for us
            const transport = await this.#transport;
            const obj = await (new Eth(transport)).signTransaction(this.#path, rawTx, resolution);
            // Normalize the signature for Ethers
            obj.v = "0x" + obj.v;
            obj.r = "0x" + obj.r;
            obj.s = "0x" + obj.s;
            // Update the transaction with the signature
            tx.signature = obj;
            return tx.serialized;
        }
        catch (error) {
            throw error;
        }
    }
    async signMessage(message) {
        if (typeof (message) === "string") {
            message = toUtf8Bytes(message);
        }
        try {
            const transport = await this.#transport;
            const obj = await (new Eth(transport)).signPersonalMessage(this.#path, hexlify(message).substring(2));
            // Normalize the signature for Ethers
            obj.r = "0x" + obj.r;
            obj.s = "0x" + obj.s;
            // Serialize the signature
            return Signature.from(obj).serialized;
        }
        catch (error) {
            throw error;
        }
    }
    async signTypedData(domain, types, value) {
        throw new Error("Not implemented");
    }
    static getPath(path) {
        if (path == null) {
            path = 0;
        }
        if (typeof (path) === "number") {
            return getAccountPath(path);
        }
        return path;
    }
}
//# sourceMappingURL=signer-ledger.js.map