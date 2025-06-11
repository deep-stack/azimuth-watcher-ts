# Generate Azimuth Watchers

* Clone the original Azimuth repo for required contracts:

  ```bash
  git clone git@github.com:urbit/azimuth.git

  # Install dependencies
  npm install

  # Contracts are located in the contracts folder
  ```

* Setup `cerc-io/watcher-ts` repo:

  ```bash
  git clone git@github.com:cerc-io/watcher-ts.git

  # Install dependencies and build packages
  yarn install && yarn build
  ```

* Create a folder to place all the generated watchers in:

  ```bash
  mkdir -p azimuth-watcher-ts/packages
  ```

* In `watcher-ts/packages/codegen`, create a `config.yaml` file with required codegen config for generating the watcher for a contract

  For example, for `Azimuth` contract:

  ```yaml
  # Contracts to watch (required).
  contracts:
      # Contract name.
    - name: Azimuth
      # Contract file path or an url.
      path: /home/user/azimuth/contracts/Azimuth.sol
      # Contract kind
      kind: Azimuth

  # Output folder path (logs output using `stdout` if not provided).
  outputFolder: /home/user/azimuth-watcher-ts/packages/azimuth-watcher

  # Code generation mode [eth_call | storage | all | none] (default: none).
  mode: eth_call

  # Kind of watcher [lazy | active] (default: active).
  kind: active

  # Watcher server port (default: 3008).
  port: 3001

  # Solc version to use (optional)
  # If not defined, uses solc version listed in dependencies
  solc: v0.4.24+commit.e67f0147

  # Flatten the input contract file(s) [true | false] (default: true).
  flatten: true
  ```

  Note: Create `.sol` files with the contract code from Etherscan for [`ConditionalStarRelease`](https://etherscan.io/address/0x8C241098C3D3498Fe1261421633FD57986D74AeA#code), [`DelegatedSending`](https://etherscan.io/address/0xf6b461fe1ad4bd2ce25b23fe0aff2ac19b3dfa76#code), [`Ecliptic`](https://etherscan.io/address/ecliptic.eth#code) and [`LinearStarRelease`](https://etherscan.io/address/0x86cd9cd0992F04231751E3761De45cEceA5d1801#code) contracts and use the file path for `contracts.path`

* Run codegen command to generate the watcher:

  ```bash
  # In watcher-ts/packages/codegen
  yarn codegen --config-file ./config.yaml
  ```

* Update `contracts`, `outputFolder` and `port` fields in the config and re-run the codegen command for all other contracts

* Setup the parent folder `/home/user/azimuth-watcher-ts` where all the generated watchers are placed as a monorepo

* The [gateway GQL server](packages/gateway-server) can be used to proxy queries to their respective watchers
