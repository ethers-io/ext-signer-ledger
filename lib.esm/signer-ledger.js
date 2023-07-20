import { AbstractSigner, assertArgument, copyRequest, getAccountPath, getAddress, hexlify, resolveAddress, resolveProperties, Signature, Transaction, toUtf8Bytes, TypedDataEncoder } from "ethers";
//import { ledgerService } from "@ledgerhq/hw-app-eth"
import _Eth from "@ledgerhq/hw-app-eth";
const Eth = ("default" in _Eth) ? _Eth.default : _Eth;
/**
 *  A **LedgerSigner** provides access to a Ledger Hardware Wallet
 *  as an Ethers Signer.
 */
export class LedgerSigner extends AbstractSigner {
    // A Promise that resolves to a created transport
    #transport;
    // The HD path
    #path;
    /**
     *  Create a new **LedgerSigner** connected to the device over the
     *  %%transport%% and optionally connected to the blockchain via
     *  %%provider%%. The %%path%% follows the same logic as
     *  [[LedgerSigner_getPath]], defaulting to the default HD path of
     *  ``m/44'/60'/0'/0/0``.
     */
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
    /**
     *  The HD path for this account
     */
    get path() { return this.#path; }
    connect(provider) {
        return new LedgerSigner(this.#transport, provider);
    }
    /**
     *  Returns a new LedgerSigner connected via the same transport
     *  and provider, but using the account at the HD %%path%%.
     */
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
        // Populate any ENS names
        const populated = await TypedDataEncoder.resolveNames(domain, types, value, async (name) => {
            return (await resolveAddress(name, this.provider));
        });
        try {
            const transport = await this.#transport;
            const eth = new Eth(transport);
            const payload = TypedDataEncoder.getPayload(populated.domain, types, populated.value);
            let obj;
            try {
                // Try signing the EIP-712 message
                obj = await eth.signEIP712Message(this.#path, payload);
            }
            catch (error) {
                if (!error || error.statusCode !== 27904) {
                    throw error;
                }
                // Older device; fallback onto signing raw hashes
                const domainHash = TypedDataEncoder.hashDomain(domain);
                const valueHash = TypedDataEncoder.from(types).hash(value);
                ;
                try {
                    obj = await eth.signEIP712HashedMessage(this.#path, domainHash.substring(2), valueHash.substring(2));
                }
                catch (error) {
                    throw error;
                }
            }
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
    /**
     *  Returns the HD %%path%%. If unspecified, returns the default
     *  path (i.e. ``m/44'/60'/0'/0/0``), if a ``number``, the path
     *  is for that account using the BIP-44 standard, otherwise %%path%%
     *  is returned directly.
     */
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