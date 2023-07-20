import { InfuraProvider, Transaction, verifyMessage, verifyTypedData } from "ethers";
import BluetoothTransport from "@ledgerhq/hw-transport-node-hid";
import { LedgerSigner } from "./signer-ledger.js";
(async function () {
    const provider = new InfuraProvider();
    const transport = BluetoothTransport; //.default.create();
    const signer = new LedgerSigner(transport, provider);
    const address = await signer.getAddress();
    console.log("ADDRESS", address);
    {
        const result = await signer.signTransaction({ to: signer, type: 2, chainId: 42 });
        const tx = Transaction.from(result);
        console.log("SIGN TX", result, tx.from);
    }
    {
        const message = "Hello World";
        const result = await signer.signMessage(message);
        console.log("SIGN MSG", result, verifyMessage(message, result));
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
        console.log("SIGN DATA", result, verifyTypedData(domain, types, value, result));
    }
})();
//# sourceMappingURL=test.js.map