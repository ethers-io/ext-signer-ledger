"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const hw_transport_node_hid_1 = tslib_1.__importDefault(require("@ledgerhq/hw-transport-node-hid"));
const signer_ledger_js_1 = require("./signer-ledger.js");
(async function () {
    const provider = new ethers_1.InfuraProvider();
    const transport = hw_transport_node_hid_1.default; //.default.create();
    const signer = new signer_ledger_js_1.LedgerSigner(transport, provider);
    const address = await signer.getAddress();
    console.log("ADDRESS", address);
    {
        const result = await signer.signTransaction({ to: signer, type: 2, chainId: 42 });
        const tx = ethers_1.Transaction.from(result);
        console.log("SIGN TX", result, tx.from);
    }
    {
        const message = "Hello World";
        const result = await signer.signMessage(message);
        console.log("SIGN MSG", result, (0, ethers_1.verifyMessage)(message, result));
    }
    {
        const domain = {
            chainId: 69,
            name: "Da Domain",
            verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
            version: "1"
        };
        const types = {
            Test: [
                { name: "contents", type: "string" }
            ]
        };
        const value = { contents: "Hello, Bob!" };
        const result = await signer.signTypedData(domain, types, value);
        console.log("SIGN DATA", result, (0, ethers_1.verifyTypedData)(domain, types, value, result));
    }
})();
//# sourceMappingURL=test.js.map