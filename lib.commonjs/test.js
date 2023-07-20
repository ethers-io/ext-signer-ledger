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
    console.log(await signer.getAddress());
    console.log(await signer.signTransaction({ to: signer, type: 2, chainId: 42 }));
    //console.log(await signer.signMessage("Hello World"));
})();
//# sourceMappingURL=test.js.map