import * as fs from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import * as meow from 'meow';

const cli = meow(
  `Usage
$ npm run build -- <options>

Options
--publish, -p  Publish the packages to npm

Examples
$ npm run build -- --publish true
`,
  {
    flags: {
      publish: {
        type: 'boolean',
        alias: 'p'
      }
    }
  }
);

const Confirm = require('prompt-confirm');
const template = require('lodash.template');

const publish = () => {
  console.log(execSync('npm publish'));
};

const build = (hook = () => {}) => {
  const Packages = ['ga', 'clusterize', 'webpack', 'parser'];
  const PackagesDir = join(process.cwd(), 'packages');
  const config = JSON.parse(fs.readFileSync(join('config.json')).toString());

  for (const p of Packages) {
    const path = join(PackagesDir, p);
    console.log(execSync(`cd ${path} && rm -rf dist && webpack`).toString());
    const packageJsonPath = join(path, 'package.json');
    const packageJson = fs.readFileSync(packageJsonPath).toString();
    fs.writeFileSync(join(path, 'dist', p, 'package.json'), template(packageJson)(config));

    hook();
  }
};

if (cli.flags.publish) {
  new Confirm('Are you sure you want to publish the packages?').ask(
    (answer: any) => (answer ? build(publish) : void 0)
  );
} else {
  build();
}
