import { AbstractSigner, assertArgument, getAccountPath, getAddress } from "ethers";
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
    async signTransaction(tx) {
        throw new Error("Not implemented");
    }
    async signMessage(message) {
        throw new Error("Not implemented");
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