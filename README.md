# applesmc-fan-control
A program to control the fans of a MacBook Pro 2016 running Linux with a customized curve. Intended to use as a systemd service.

## Dependencies
- Node 16
- Yarn

## How to run
1. Clone the repository
2. Install dependencies with `yarn install`
3. Run program with `sudo yarn start`

## Setup as a systemd service
1. Build with `yarn build`, binary will be located in `dist/applesmc-fan-control`
2. In `applesmc-fan-control.service`, change the line containing `ExecStart` with the correct path of the compiled binary
3. Copy `applesmc-fan-control.service` to `/etc/systemd/system/`
4. Enable and start the service with `sudo systemctl enable --now applesmc-fan-control.service`
