# mkreact
CLI for installing and configuring a minimal, ready-to-dev React front-end

### in development - mvp
- [x] basic webpack installation
- [ ] webpack config
- [x] basic browserify installation
- [ ] browserify config
- [x] basic parcel installation
- [ ] parcel config
- [ ] basic rollup installation
- [ ] rollup config

### how to
1. install `mkreact`: `npm i -g mkreact`
2. run `mkreact <project-name>` from the parent directory you would like to install your project to.

    ```
    available arguments:
    --help: (used without project-name) display a list of arguments and flags
    --bundler: the bundler you would like to install, e.g. --bundler=parcel
    ```
    ```
    available flags:
    -c: (configure) configure your packages after installation
    -g: (git) initialize a git repository
    -s: (succinct) mute status output until installer finishes
    ```
