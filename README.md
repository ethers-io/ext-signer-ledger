Ethers: LedgerSigner
====================

A **LedgerSigner** connects to a [Ledger Hardware Wallet](https://www.ledger.com)
over some transport, and allows all normal [Signer operations](https://docs.ethers.org/v6/api/providers/#Signer)
protected by the hardware wallet.


Installing
----------

When you use the **LedgerSigner**, you must also include the intended
transport, which provides a generic interface for the communication
channel to the Ledger Hardware Device.

Below are examples and notes on installing the necessary transports:

```shell
# Install the extension pacakge
/home/ricmoo> npm install @ethers-ext/signer-ledger

# Depending on your environment, install any of the
# relevant Transport(s) below:

# For use of a USB-based device in node
# - You must include "dom" in your TypeScript libs
# - On MacOD, only the current user may access the USB
/home/ricmoo> npm install @ledgerhq/hw-transport-node-hid

# For use of a BLE-based device in node
/home/ricmoo> npm install @ledgerhq/hw-transport-node-ble

# For use of USB-based device in a browser using the WebUSB API
/home/ricmoo> npm install @ledgerhq/hw-transport-webusb

# For use of USB-based device in a browser using the WebHID API
/home/ricmoo> npm install @ledgerhq/hw-transport-webhid

# For use of BLE-based device in a browser using the Web Bluetooth API
/home/ricmoo> npm install @ledgerhq/hw-transport-web-ble

# For testing purposes, a virtual device for mocking
/home/ricmoo> npm install @ledgerhq/hw-transport-mocker
```


Usage
-----

### `new LedgerSigner(transport, provider?, path?) => Signer`

Create a new LedgerSigner connected to a Ledger Hardware Wallet
via `transport` and optionally connected to the blockchain using
`provider`. The default path is the path for Account #0, otherwise
the logic for the LedgerSigner.getPath is used.

```javascript
import { LedgerSigner } from "@ethers-ext/signer-ledger";

// Import your relevant transport; see the above "Installing"
// section for the package name; for example, we'll use node-hid
import HIDTransport from "@ledgerhq/hw-transport-node-hid";

const signer = new LedgerSigner(HIDTransport, provider);
```

### `signer.getSigner(pathOrAccount?) => LedgerSigner`

Returns a new Signer with the same transport and provider, but
with using the `pathOrAccount`.

### `LedgerSigner.getPath(pathOrAccount?) => string`

Returns the HD path for `pathOrAccount`. If none is provided, the
default path (account #0) is returned, if a number is provided,
the HD path for that account is returned, otherwise a valid HD path
is expected (starting with `m/`).


Notes
-----

- Some platforms, such as [MetaMask](https://metamask.io) use a different derivation path for accounts. For those, you can use the Ethers [getIndexedAccount function](https://docs.ethers.org/v6/api/wallet/#getIndexedAccountPath).


License
-------

MIT License.
