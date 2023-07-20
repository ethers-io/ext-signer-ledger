import { InfuraProvider } from "ethers";
import BluetoothTransport from "@ledgerhq/hw-transport-node-hid";
import { LedgerSigner } from "./signer-ledger.js";
(async function () {
    const provider = new InfuraProvider();
    const transport = BluetoothTransport; //.default.create();
    const signer = new LedgerSigner(transport, provider);
    console.log(await signer.getAddress());
    console.log(await signer.signTransaction({ to: signer, type: 2, chainId: 42 }));
    //console.log(await signer.signMessage("Hello World"));
})();
//# sourceMappingURL=test.js.map